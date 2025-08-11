/*
  Rotary Encoder Reading Sketch for Pro-Range 600 PPR Encoder
  
  This sketch reads data from a quadrature optical rotary encoder and calculates:
  - Pulse count (with quadrature decoding)
  - Angular position in degrees
  - Angular velocity in degrees/second
  - RPM (Rotations per minute)
  
  Your Encoder Specifications:
  - Pro-Range 600 PPR 2-Phase Incremental Optical Rotary Encoder
  - Quadrature output (600 PPR → 2400 transitions per revolution)
  - Wire Colors: White(A), Green(B), Red(VCC), Black(GND), Gold(Shield)
*/

// Encoder pins (must use interrupt pins)
#define ENCODER_A 2    // White wire - Phase A
#define ENCODER_B 3    // Green wire - Phase B

// Variables for encoder
volatile long encoderCount = 0;
volatile int lastEncoded = 0;
long lastCount = 0;
unsigned long lastTime = 0;
float currentAngle = 0;
float currentVelocity = 0;
float currentRPM = 0;

// Encoder specifications
const int PPR = 600;                    // Pulses per revolution
const int TRANSITIONS_PER_REV = 2400;  // Quadrature transitions (600 × 4)
const float DEGREES_PER_TRANSITION = 360.0 / TRANSITIONS_PER_REV;

String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  
  // Set encoder pins as inputs with internal pull-ups
  pinMode(ENCODER_A, INPUT_PULLUP);
  pinMode(ENCODER_B, INPUT_PULLUP);
  
  // Attach interrupts for quadrature decoding
  attachInterrupt(digitalPinToInterrupt(ENCODER_A), updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B), updateEncoder, CHANGE);
  
  lastTime = millis();
  
  Serial.println("Pro-Range 600 PPR Rotary Encoder Ready!");
  Serial.println("Commands: HANDSHAKE, ENCODER_RESET, ENCODER_CALIBRATE");
  Serial.println("Output Format: ENCODER:count,angle,velocity,rpm");
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Calculate and send encoder data every 100ms
  unsigned long currentTime = millis();
  if (currentTime - lastTime >= 100) {
    calculateEncoderData(currentTime);
    sendEncoderData();
    lastTime = currentTime;
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
  // Read current state of both channels
  int MSB = digitalRead(ENCODER_A); // Most Significant Bit
  int LSB = digitalRead(ENCODER_B); // Least Significant Bit
  
  // Convert to single number
  int encoded = (MSB << 1) | LSB;
  
  // Create sum with previous encoded value
  int sum = (lastEncoded << 2) | encoded;
  
  // Quadrature decoding logic
  if (sum == 0b1101 || sum == 0b0100 || sum == 0b0010 || sum == 0b1011) {
    encoderCount++;
  }
  if (sum == 0b1110 || sum == 0b0111 || sum == 0b0001 || sum == 0b1000) {
    encoderCount--;
  }
  
  lastEncoded = encoded;
}

void calculateEncoderData(unsigned long currentTime) {
  // Calculate angle in degrees
  currentAngle = (float)encoderCount * DEGREES_PER_TRANSITION;
  
  // Calculate velocity (degrees/second)
  long deltaCount = encoderCount - lastCount;
  float deltaTime = (currentTime - lastTime) / 1000.0; // Convert to seconds
  
  if (deltaTime > 0) {
    currentVelocity = (deltaCount * DEGREES_PER_TRANSITION) / deltaTime;
    currentRPM = (currentVelocity / 360.0) * 60.0; // Convert to RPM
  }
  
  lastCount = encoderCount;
}

void sendEncoderData() {
  Serial.print("ENCODER:");
  Serial.print(encoderCount);
  Serial.print(",");
  Serial.print(currentAngle, 2);
  Serial.print(",");
  Serial.print(currentVelocity, 2);
  Serial.print(",");
  Serial.println(currentRPM, 2);
}

void processCommand(String command) {
  command.trim();
  
  if (command == "HANDSHAKE") {
    Serial.println("OK");
  }
  else if (command == "ENCODER_RESET") {
    encoderCount = 0;
    lastCount = 0;
    currentAngle = 0;
    currentVelocity = 0;
    currentRPM = 0;
    Serial.println("OK: Encoder reset");
  }
  else if (command == "ENCODER_CALIBRATE") {
    // Reset and start fresh calibration
    encoderCount = 0;
    lastCount = 0;
    lastTime = millis();
    Serial.println("OK: Encoder calibrated");
  }
  else {
    Serial.println("ERROR");
  }
}
