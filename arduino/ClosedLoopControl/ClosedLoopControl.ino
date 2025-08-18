/*
  Closed-Loop DC Motor Control with Encoder Feedback
  
  This sketch implements a PID controller for precise DC motor speed control
  using encoder feedback. It compares simulated vs actual performance.
  
  Hardware Setup:
  - Arduino Mega 2560
  - L298N Motor Driver
  - 12V 600RPM Geared DC Motor
  - Pro-Range 600 PPR 2-Phase Incremental Optical Rotary Encoder
  
  Pin Connections:
  DC Motor Control:
  - IN1 (Pin 8), IN2 (Pin 7), ENA (Pin 9)
  
  Encoder Input:
  - Phase A (Pin 2), Phase B (Pin 3)
  - VCC (5V), GND, Shield (GND)
*/

// Motor Control Pins
const int IN1 = 8;
const int IN2 = 7;
const int ENA = 9;

// Encoder Pins (Interrupt capable)
const int ENCODER_A = 2;
const int ENCODER_B = 3;

// Encoder Variables
volatile long encoderCount = 0;
volatile int lastEncoded = 0;
const int PPR = 600;
const int TRANSITIONS_PER_REV = 2400; // 600 PPR × 4 (quadrature)

// Speed Calculation Variables
long lastEncoderCount = 0;
unsigned long lastSpeedTime = 0;
float currentRPM = 0;
float targetRPM = 0;

// PID Controller Variables
float kp = 1.0;    // Proportional gain
float ki = 0.1;    // Integral gain
float kd = 0.05;   // Derivative gain

float pidOutput = 0;
float errorSum = 0;
float lastError = 0;
unsigned long lastPIDTime = 0;

// Control Variables
bool closedLoopActive = false;
int motorPWM = 0;
String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  
  // Motor pins
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  
  // Encoder pins with pull-ups
  pinMode(ENCODER_A, INPUT_PULLUP);
  pinMode(ENCODER_B, INPUT_PULLUP);
  
  // Attach encoder interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B), updateEncoder, CHANGE);
  
  // Initialize motor stopped
  setMotorOutput(0);
  
  lastSpeedTime = millis();
  lastPIDTime = millis();
  
  Serial.println("Closed-Loop DC Motor Controller Ready!");
  Serial.println("Commands: HANDSHAKE, START_CLOSED_LOOP, STOP_CLOSED_LOOP, SET_TARGET_XXX, SET_PID_XXX_XXX_XXX");
}

void loop() {
  unsigned long currentTime = millis();
  
  // Process serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Update speed calculation every 100ms
  if (currentTime - lastSpeedTime >= 100) {
    calculateSpeed(currentTime);
    lastSpeedTime = currentTime;
  }
  
  // Run PID controller every 50ms
  if (closedLoopActive && (currentTime - lastPIDTime >= 50)) {
    runPIDController(currentTime);
    lastPIDTime = currentTime;
  }
  
  // Send status every 100ms
  if (currentTime % 100 == 0) {
    sendStatus();
    delay(1); // Prevent multiple sends per millisecond
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\n') {
      stringComplete = true;
    } else {
      inputString += inChar;
    }
  }
}

void updateEncoder() {
  // Quadrature decoding
  int MSB = digitalRead(ENCODER_A);
  int LSB = digitalRead(ENCODER_B);
  int encoded = (MSB << 1) | LSB;
  int sum = (lastEncoded << 2) | encoded;
  
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderCount++;
  }
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderCount--;
  }
  
  lastEncoded = encoded;
}

void calculateSpeed(unsigned long currentTime) {
  long deltaCount = encoderCount - lastEncoderCount;
  float deltaTime = (currentTime - lastSpeedTime) / 1000.0; // Convert to seconds
  
  if (deltaTime > 0) {
    // Calculate RPM from encoder transitions
    float transitionsPerSecond = deltaCount / deltaTime;
    currentRPM = (transitionsPerSecond / TRANSITIONS_PER_REV) * 60.0;
  }
  
  lastEncoderCount = encoderCount;
}

void runPIDController(unsigned long currentTime) {
  // Calculate error
  float error = targetRPM - currentRPM;
  
  // Calculate time delta
  float deltaTime = (currentTime - lastPIDTime) / 1000.0; // Convert to seconds
  
  // Proportional term
  float proportional = kp * error;
  
  // Integral term (with windup protection)
  errorSum += error * deltaTime;
  errorSum = constrain(errorSum, -1000, 1000); // Prevent windup
  float integral = ki * errorSum;
  
  // Derivative term
  float derivative = 0;
  if (deltaTime > 0) {
    derivative = kd * (error - lastError) / deltaTime;
  }
  
  // Calculate PID output
  pidOutput = proportional + integral + derivative;
  
  // Convert to motor PWM (0-255)
  int newPWM = (int)constrain(abs(pidOutput), 0, 255);
  
  // Determine direction based on error
  if (abs(error) > 5) { // Dead zone to prevent oscillation
    if (pidOutput > 0) {
      setMotorOutput(newPWM); // Forward
    } else {
      setMotorOutput(-newPWM); // Reverse
    }
  } else {
    setMotorOutput(0); // Stop in dead zone
  }
  
  lastError = error;
}

void setMotorOutput(int pwm) {
  motorPWM = pwm;
  
  if (pwm > 0) {
    // Forward direction
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, constrain(pwm, 0, 255));
  } else if (pwm < 0) {
    // Reverse direction
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, constrain(abs(pwm), 0, 255));
  } else {
    // Stop
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 0);
  }
}

void sendStatus() {
  Serial.print("STATUS:");
  Serial.print(currentRPM, 2);
  Serial.print(",");
  Serial.print(targetRPM, 2);
  Serial.print(",");
  Serial.print(motorPWM);
  Serial.print(",");
  Serial.print(encoderCount);
  Serial.print(",");
  Serial.print(closedLoopActive ? 1 : 0);
  Serial.print(",");
  Serial.print(pidOutput, 2);
  Serial.println();
}

void processCommand(String command) {
  command.trim();
  
  if (command == "HANDSHAKE") {
    Serial.println("OK");
  }
  else if (command == "START_CLOSED_LOOP") {
    closedLoopActive = true;
    errorSum = 0; // Reset integral term
    lastError = 0;
    Serial.println("OK: Closed-loop started");
  }
  else if (command == "STOP_CLOSED_LOOP") {
    closedLoopActive = false;
    setMotorOutput(0);
    Serial.println("OK: Closed-loop stopped");
  }
  else if (command.startsWith("SET_TARGET_")) {
    float newTarget = command.substring(11).toFloat();
    targetRPM = constrain(newTarget, -600, 600); // Limit to motor specs
    Serial.println("OK: Target set");
  }
  else if (command.startsWith("SET_PID_")) {
    // Format: SET_PID_1.0_0.1_0.05
    int firstUnderscore = command.indexOf('_', 8);
    int secondUnderscore = command.indexOf('_', firstUnderscore + 1);
    
    if (firstUnderscore > 0 && secondUnderscore > 0) {
      kp = command.substring(8, firstUnderscore).toFloat();
      ki = command.substring(firstUnderscore + 1, secondUnderscore).toFloat();
      kd = command.substring(secondUnderscore + 1).toFloat();
      
      // Reset PID state when parameters change
      errorSum = 0;
      lastError = 0;
      
      Serial.println("OK: PID parameters updated");
    } else {
      Serial.println("ERROR: Invalid PID format");
    }
  }
  else if (command == "GET_STATUS") {
    sendStatus();
  }
  else if (command == "RESET_ENCODER") {
    encoderCount = 0;
    lastEncoderCount = 0;
    Serial.println("OK: Encoder reset");
  }
  else {
    Serial.println("ERROR: Unknown command");
  }
}