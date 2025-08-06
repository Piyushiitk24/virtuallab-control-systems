/*
  Pendulum Control Sketch with PID Controller
  
  This sketch implements a PID controller for balancing an inverted pendulum
  using a rotary encoder for angle feedback and L298N motor driver for control.
  
  Hardware Setup:
  - Arduino Mega 2560
  - L298N Motor Driver
  - DC Geared Motor with encoder
  - Rotary Encoder for pendulum angle
  
  Pin Connections:
  - IN1: Pin 6 (Direction control 1)
  - IN2: Pin 7 (Direction control 2)
  - ENA: Pin 9 (PWM speed control)
  - Encoder A: Pin A2 (Interrupt capable)
  - Encoder B: Pin A3 (Interrupt capable)
  
  Serial Commands:
  - HANDSHAKE: Establish communication
  - TEST_PIN_X: Test pin X functionality
  - SET_SPEED_XXX: Set motor speed (0-255)
  - SET_PID_KP_KI_KD: Set PID parameters
  - START_BALANCE: Begin automatic balancing
  - STOP_BALANCE: Stop balancing mode
  - GET_ANGLE: Request current angle
  - GET_STATUS: Request system status
  
  Author: Control Systems Lab
  Date: 2025
*/

#include <TimerOne.h>

// Motor control pins - Updated for user's setup
const int IN1 = 8;    // Direction pin 1 (was 6)
const int IN2 = 7;    // Direction pin 2 (unchanged)
const int ENA = 9;    // Enable pin (PWM for speed control, unchanged)

// Encoder pins
const int ENCODER_A = A2;  // Encoder channel A
const int ENCODER_B = A3;  // Encoder channel B

// System constants
const float PENDULUM_LENGTH = 0.3;   // Pendulum length in meters
const float PENDULUM_MASS = 0.1;     // Pendulum mass in kg
const float ARM_LENGTH = 0.2;        // Arm length in meters
const int ENCODER_RESOLUTION = 1024; // Encoder pulses per revolution

// PID controller variables
float kp = 100.0;  // Proportional gain
float ki = 10.0;   // Integral gain
float kd = 1.0;    // Derivative gain

float setpoint = 0.0;      // Desired angle (upright position)
float currentAngle = 0.0;  // Current pendulum angle
float previousAngle = 0.0; // Previous angle for derivative calculation
float integral = 0.0;      // Integral term accumulator
float derivative = 0.0;    // Derivative term
float pidOutput = 0.0;     // PID controller output

// Encoder variables
volatile long encoderCount = 0;
volatile int lastEncoded = 0;

// Control variables
bool balancingMode = false;
int motorSpeed = 0;
String inputString = "";
boolean stringComplete = false;

// Timing variables
unsigned long previousTime = 0;
const unsigned long CONTROL_INTERVAL = 10; // 100Hz control loop

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Set motor control pins as outputs
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  
  // Set encoder pins as inputs with pullups
  pinMode(ENCODER_A, INPUT_PULLUP);
  pinMode(ENCODER_B, INPUT_PULLUP);
  
  // Initialize motor in stopped state
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  // Setup encoder interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B), updateEncoder, CHANGE);
  
  // Initialize timer for control loop
  Timer1.initialize(CONTROL_INTERVAL * 1000); // Convert to microseconds
  Timer1.attachInterrupt(controlLoop);
  
  // Send ready message
  Serial.println("READY");
  Serial.println("Pendulum Control Firmware v1.0");
  Serial.println("PID Controller initialized");
  
  delay(1000);
}

void loop() {
  // Handle serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Send periodic data if in balancing mode
  if (balancingMode) {
    static unsigned long lastDataSend = 0;
    if (millis() - lastDataSend >= 100) { // Send data at 10Hz
      sendAngleData();
      lastDataSend = millis();
    }
  }
  
  delay(10);
}

// Encoder interrupt service routine
void updateEncoder() {
  int MSB = digitalRead(ENCODER_A); // Most significant bit
  int LSB = digitalRead(ENCODER_B); // Least significant bit
  
  int encoded = (MSB << 1) | LSB; // Convert to single number
  int sum = (lastEncoded << 2) | encoded; // Add it to previous encoded value
  
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderCount++;
  }
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderCount--;
  }
  
  lastEncoded = encoded; // Store this value for next time
}

// Timer interrupt for control loop
void controlLoop() {
  if (balancingMode) {
    // Calculate current angle from encoder
    currentAngle = (float)encoderCount * 360.0 / ENCODER_RESOLUTION;
    
    // Normalize angle to -180 to +180 degrees
    while (currentAngle > 180.0) currentAngle -= 360.0;
    while (currentAngle < -180.0) currentAngle += 360.0;
    
    // Calculate PID terms
    float error = setpoint - currentAngle;
    integral += error * (CONTROL_INTERVAL / 1000.0);
    derivative = (currentAngle - previousAngle) / (CONTROL_INTERVAL / 1000.0);
    
    // Calculate PID output
    pidOutput = kp * error + ki * integral - kd * derivative;
    
    // Limit integral windup
    if (integral > 100.0) integral = 100.0;
    if (integral < -100.0) integral = -100.0;
    
    // Convert PID output to motor commands
    int motorCommand = constrain((int)pidOutput, -255, 255);
    setMotorFromPID(motorCommand);
    
    // Store current angle for next iteration
    previousAngle = currentAngle;
  }
}

// Set motor based on PID output
void setMotorFromPID(int command) {
  if (command > 0) {
    // Positive command - forward direction
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, abs(command));
  } else if (command < 0) {
    // Negative command - reverse direction
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    analogWrite(ENA, abs(command));
  } else {
    // Zero command - stop motor
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    analogWrite(ENA, 0);
  }
}

// Serial event handler
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    if (inChar == '\n' || inChar == '\r') {
      if (inputString.length() > 0) {
        stringComplete = true;
      }
    } else {
      inputString += inChar;
    }
  }
}

// Process incoming commands
void processCommand(String command) {
  command.trim();
  command.toUpperCase();
  
  Serial.print("Received: ");
  Serial.println(command);
  
  if (command == "HANDSHAKE") {
    handleHandshake();
  }
  else if (command.startsWith("TEST_PIN_")) {
    handlePinTest(command);
  }
  else if (command.startsWith("SET_SPEED_")) {
    handleSpeedSet(command);
  }
  else if (command.startsWith("SET_PID_")) {
    handlePIDSet(command);
  }
  else if (command == "START_BALANCE") {
    handleStartBalance();
  }
  else if (command == "STOP_BALANCE") {
    handleStopBalance();
  }
  else if (command == "GET_ANGLE") {
    handleGetAngle();
  }
  else if (command == "GET_STATUS") {
    handleGetStatus();
  }
  else {
    Serial.println("ERROR: Unknown command");
  }
}

// Handle handshake
void handleHandshake() {
  Serial.println("OK");
  Serial.println("Pendulum controller ready");
}

// Handle pin testing
void handlePinTest(String command) {
  String pinStr = command.substring(9);
  
  if (pinStr == "8") {
    testDigitalPin(8, "IN1");
  }
  else if (pinStr == "7") {
    testDigitalPin(7, "IN2");
  }
  else if (pinStr == "9") {
    testPWMPin(9, "ENA");
  }
  else if (pinStr == "A2") {
    testEncoderPin(A2, "Encoder A");
  }
  else if (pinStr == "A3") {
    testEncoderPin(A3, "Encoder B");
  }
  else {
    Serial.println("ERROR: Invalid pin for testing");
  }
}

// Test digital pin
void testDigitalPin(int pin, String pinName) {
  pinMode(pin, OUTPUT);
  digitalWrite(pin, HIGH);
  delay(100);
  digitalWrite(pin, LOW);
  
  Serial.print("OK: Pin ");
  Serial.print(pin);
  Serial.print(" (");
  Serial.print(pinName);
  Serial.println(") test passed");
}

// Test PWM pin
void testPWMPin(int pin, String pinName) {
  pinMode(pin, OUTPUT);
  for (int i = 0; i <= 255; i += 51) {
    analogWrite(pin, i);
    delay(50);
  }
  analogWrite(pin, 0);
  
  Serial.print("OK: Pin ");
  Serial.print(pin);
  Serial.print(" (");
  Serial.print(pinName);
  Serial.println(") PWM test passed");
}

// Test encoder pin
void testEncoderPin(int pin, String pinName) {
  pinMode(pin, INPUT_PULLUP);
  int value = digitalRead(pin);
  
  Serial.print("OK: Pin ");
  Serial.print(pin);
  Serial.print(" (");
  Serial.print(pinName);
  Serial.print(") reads ");
  Serial.println(value ? "HIGH" : "LOW");
}

// Handle speed setting (manual mode only)
void handleSpeedSet(String command) {
  if (balancingMode) {
    Serial.println("ERROR: Cannot set speed in balancing mode");
    return;
  }
  
  String speedStr = command.substring(10);
  int speed = speedStr.toInt();
  
  if (speed < 0 || speed > 255) {
    Serial.println("ERROR: Speed must be between 0 and 255");
    return;
  }
  
  motorSpeed = speed;
  analogWrite(ENA, speed);
  
  Serial.print("OK: Motor speed set to ");
  Serial.println(speed);
}

// Handle PID parameter setting
void handlePIDSet(String command) {
  // Parse SET_PID_KP_KI_KD command
  int firstUnderscore = command.indexOf('_', 8);
  int secondUnderscore = command.indexOf('_', firstUnderscore + 1);
  
  if (firstUnderscore == -1 || secondUnderscore == -1) {
    Serial.println("ERROR: Invalid PID format. Use SET_PID_KP_KI_KD");
    return;
  }
  
  float newKp = command.substring(8, firstUnderscore).toFloat();
  float newKi = command.substring(firstUnderscore + 1, secondUnderscore).toFloat();
  float newKd = command.substring(secondUnderscore + 1).toFloat();
  
  kp = newKp;
  ki = newKi;
  kd = newKd;
  
  Serial.print("OK: PID set to Kp=");
  Serial.print(kp);
  Serial.print(", Ki=");
  Serial.print(ki);
  Serial.print(", Kd=");
  Serial.println(kd);
}

// Handle start balancing
void handleStartBalance() {
  // Reset PID variables
  integral = 0.0;
  previousAngle = currentAngle;
  encoderCount = 0; // Reset encoder position
  
  balancingMode = true;
  
  Serial.println("OK: Balancing mode started");
  Serial.println("STATUS: PID controller active");
}

// Handle stop balancing
void handleStopBalance() {
  balancingMode = false;
  
  // Stop motor
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  Serial.println("OK: Balancing mode stopped");
}

// Handle get angle request
void handleGetAngle() {
  Serial.print("ANGLE:");
  Serial.println(currentAngle, 2);
}

// Handle get status request
void handleGetStatus() {
  Serial.println("STATUS: Pendulum Control System");
  Serial.print("Mode: ");
  Serial.println(balancingMode ? "BALANCING" : "MANUAL");
  Serial.print("Current Angle: ");
  Serial.print(currentAngle, 2);
  Serial.println(" degrees");
  Serial.print("PID Parameters - Kp:");
  Serial.print(kp);
  Serial.print(", Ki:");
  Serial.print(ki);
  Serial.print(", Kd:");
  Serial.println(kd);
  Serial.print("Encoder Count: ");
  Serial.println(encoderCount);
}

// Send angle data periodically
void sendAngleData() {
  Serial.print("ANGLE:");
  Serial.println(currentAngle, 2);
  Serial.print("CONTROL:");
  Serial.println(pidOutput, 2);
}
