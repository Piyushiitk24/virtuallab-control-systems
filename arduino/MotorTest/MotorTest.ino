/*
  Motor Test Sketch for L298N Driver - Updated for User's Setup
  
  This sketch demonstrates basic motor control using the L298N driver module.
  It receives serial commands to control motor speed and direction.
  
  Your DC Motor Specifications:
  - 12V 600RPM Geared DC Motor
  - Operating Voltage: 6–18V DC (nominal: 12V)
  - Rated Speed: 600RPM at 12V
  - Stall Torque: Around 4kgcm (up to 15kgcm)
  - No-Load Current: ~100mA; Load current: up to 1.9A
  - Gearbox: Metal construction for durability
  - Shaft: 6mm diameter, 29–30mm length
  - Weight: 250–320g
  
  Hardware Setup:
  - Arduino Mega 2560
  - L298N Motor Driver
  - DC Geared Motor
  
  Pin Connections (Updated):
  - IN1: Pin 8 (Direction control 1)
  - IN2: Pin 7 (Direction control 2)
  - ENA: Pin 9 (PWM speed control)
  
  Power Connections:
  - L298N VCC → 12V Power Supply +
  - L298N GND → Power Supply - AND Arduino GND
  - Jumper: REMOVED (as specified)
  - Motor → OUT1, OUT2
  
  Serial Commands:
  - HANDSHAKE: Establish communication
  - TEST_PIN_X: Test pin X functionality
  - SET_SPEED_XXX: Set motor speed (0-255)
  - SET_DIRECTION_FORWARD: Set forward direction
  - SET_DIRECTION_REVERSE: Set reverse direction
  - SET_DIRECTION_STOP: Stop motor
  
  Author: Control Systems Lab
  Date: 2025
*/

// Motor control pins - Updated for your setup
const int IN1 = 8;    // Direction pin 1 (was 6)
const int IN2 = 7;    // Direction pin 2 (unchanged)
const int ENA = 9;    // Enable pin (PWM for speed control, unchanged)

// Variables
int motorSpeed = 0;
String inputString = "";
boolean stringComplete = false;

void setup() {
  // Initialize serial communication at 9600 baud
  Serial.begin(9600);
  
  // Set motor control pins as outputs
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  
  // Initialize motor in stopped state
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  // Send ready message
  Serial.println("READY");
  Serial.println("Motor Test Firmware v1.0 - Updated Pin Configuration");
  Serial.println("12V 600RPM Geared DC Motor Controller");
  Serial.println("Pin Configuration: IN1=8, IN2=7, ENA=9");
  Serial.println("Commands: HANDSHAKE, TEST_PIN_X, SET_SPEED_XXX, SET_DIRECTION_XXX");
  
  // Small delay to ensure Arduino is fully initialized
  delay(1000);
}

void loop() {
  // Check for incoming serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Small delay to prevent overwhelming the system
  delay(10);
}

// Serial event handler - called when data is available
void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    
    // Check for end of line
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
  command.toUpperCase(); // Make command case-insensitive
  
  Serial.print("Received: ");
  Serial.println(command);
  
  // Handle different commands
  if (command == "HANDSHAKE") {
    handleHandshake();
  }
  else if (command.startsWith("TEST_PIN_")) {
    handlePinTest(command);
  }
  else if (command.startsWith("SET_SPEED_")) {
    handleSpeedSet(command);
  }
  else if (command == "SET_DIRECTION_FORWARD") {
    handleDirectionForward();
  }
  else if (command == "SET_DIRECTION_REVERSE") {
    handleDirectionReverse();
  }
  else if (command == "SET_DIRECTION_STOP") {
    handleDirectionStop();
  }
  else if (command == "GET_STATUS") {
    handleGetStatus();
  }
  else {
    Serial.println("ERROR: Unknown command");
  }
}

// Handle handshake command
void handleHandshake() {
  Serial.println("OK");
  Serial.println("Arduino Mega connected and ready");
}

// Handle pin testing commands
void handlePinTest(String command) {
  String pinStr = command.substring(9); // Remove "TEST_PIN_"
  
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
    testAnalogPin(A2, "Encoder A");
  }
  else if (pinStr == "A3") {
    testAnalogPin(A3, "Encoder B");
  }
  else {
    Serial.println("ERROR: Invalid pin for testing");
  }
}

// Test digital pin functionality
void testDigitalPin(int pin, String pinName) {
  pinMode(pin, OUTPUT);
  
  // Test digital output
  digitalWrite(pin, HIGH);
  delay(100);
  digitalWrite(pin, LOW);
  delay(100);
  
  Serial.print("OK: Pin ");
  Serial.print(pin);
  Serial.print(" (");
  Serial.print(pinName);
  Serial.println(") test passed");
}

// Test PWM pin functionality
void testPWMPin(int pin, String pinName) {
  pinMode(pin, OUTPUT);
  
  // Test PWM output
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

// Test analog pin functionality
void testAnalogPin(int pin, String pinName) {
  pinMode(pin, INPUT);
  
  // Read analog value
  int value = analogRead(pin);
  
  Serial.print("OK: Pin ");
  Serial.print(pin);
  Serial.print(" (");
  Serial.print(pinName);
  Serial.print(") reads ");
  Serial.println(value);
}

// Handle speed setting command
void handleSpeedSet(String command) {
  String speedStr = command.substring(10); // Remove "SET_SPEED_"
  int speed = speedStr.toInt();
  
  // Validate speed range
  if (speed < 0 || speed > 255) {
    Serial.println("ERROR: Speed must be between 0 and 255");
    return;
  }
  
  motorSpeed = speed;
  analogWrite(ENA, speed);
  
  Serial.print("OK: Motor speed set to ");
  Serial.println(speed);
}

// Handle forward direction command
void handleDirectionForward() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  
  Serial.println("OK: Motor direction set to FORWARD");
}

// Handle reverse direction command
void handleDirectionReverse() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  
  Serial.println("OK: Motor direction set to REVERSE");
}

// Handle stop command
void handleDirectionStop() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  
  Serial.println("OK: Motor stopped");
}

// Handle status request
void handleGetStatus() {
  Serial.println("STATUS: Motor Test Mode");
  Serial.print("Speed: ");
  Serial.println(motorSpeed);
  
  // Check direction
  bool in1State = digitalRead(IN1);
  bool in2State = digitalRead(IN2);
  
  if (in1State && !in2State) {
    Serial.println("Direction: FORWARD");
  } else if (!in1State && in2State) {
    Serial.println("Direction: REVERSE");
  } else {
    Serial.println("Direction: STOP");
  }
  
  Serial.println("All systems ready");
}
