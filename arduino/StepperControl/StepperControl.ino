/*
  Stepper Motor Control Sketch for A4988 Driver
  
  This sketch demonstrates precise stepper motor control using the A4988 driver.
  It receives serial commands to control stepper position, speed, and direction.
  
  Hardware Setup:
  - Arduino Mega 2560
  - A4988 Stepper Driver
  - NEMA 17 Stepper Motor (200 steps/revolution)
  
  Pin Connections:
  - STEP Pin 3  (Step pulse)
  - DIR  Pin 4  (Direction control)
  - EN   Pin 5  (Enable/Disable)
*/

#include <AccelStepper.h>

// Pin definitions
#define STEP_PIN 3
#define DIR_PIN  4
#define EN_PIN   5

// Create stepper object
AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

// Variables
long currentPosition = 0;
int currentSpeed = 500;
String inputString = "";
boolean stringComplete = false;

void setup() {
  Serial.begin(9600);
  
  // Configure stepper
  stepper.setMaxSpeed(2000);     // Steps per second
  stepper.setAcceleration(1000); // Steps per second²
  stepper.setSpeed(500);         // Default speed
  
  // Enable driver (LOW = enabled)
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW);
  
  Serial.println("Stepper Motor Controller Ready!");
  Serial.println("Commands: HANDSHAKE, STEPPER_MOVE_XXX, STEPPER_SPEED_XXX, STEPPER_STOP, STEPPER_HOME");
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
  
  // Run stepper motor
  stepper.run();
  
  // Update position
  if (currentPosition != stepper.currentPosition()) {
    currentPosition = stepper.currentPosition();
    Serial.print("STEPPER_POS:");
    Serial.println(currentPosition);
  }
  
  // Check if movement is complete
  if (stepper.distanceToGo() == 0 && stepper.isRunning()) {
    Serial.println("STEPPER_STOPPED");
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

void processCommand(String command) {
  command.trim();
  
  if (command == "HANDSHAKE") {
    Serial.println("OK");
  }
  else if (command.startsWith("STEPPER_MOVE_")) {
    long steps = command.substring(13).toInt();
    stepper.move(steps);
    Serial.println("OK");
  }
  else if (command.startsWith("STEPPER_SPEED_")) {
    int speed = command.substring(14).toInt();
    speed = constrain(speed, 50, 2000);
    currentSpeed = speed;
    stepper.setMaxSpeed(speed);
    stepper.setSpeed(speed);
    Serial.println("OK");
  }
  else if (command == "STEPPER_STOP") {
    stepper.stop();
    Serial.println("OK");
  }
  else if (command == "STEPPER_HOME") {
    stepper.setCurrentPosition(0);
    currentPosition = 0;
    Serial.println("OK");
  }
  else {
    Serial.println("ERROR");
  }
}
