import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import serialHandler from '../utils/SerialHandler';
import SystemDiagram from './SystemDiagram';
import RealTimePlot from './RealTimePlot';
import StepperMotorControl from './StepperMotorControl';
import RotaryEncoder from './RotaryEncoder';

const StudyMode = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [motorDirection, setMotorDirection] = useState('STOP');
  const [serialOutput, setSerialOutput] = useState([]);
  const [activeSubModule, setActiveSubModule] = useState(0);
  
  // Stepper Motor State
  const [stepperPosition, setStepperPosition] = useState(0);
  const [stepperSpeed, setStepperSpeed] = useState(500);
  const [stepperDirection, setStepperDirection] = useState('CW');
  const [targetSteps, setTargetSteps] = useState(200);
  const [stepperRunning, setStepperRunning] = useState(false);
  
  // Rotary Encoder State
  const [encoderCount, setEncoderCount] = useState(0);
  const [encoderAngle, setEncoderAngle] = useState(0);
  const [encoderVelocity, setEncoderVelocity] = useState(0);
  const [encoderRPM, setEncoderRPM] = useState(0);
  const [lastEncoderTime, setLastEncoderTime] = useState(Date.now());
  const [encoderDirection, setEncoderDirection] = useState('STOPPED');

  // Simulation Comparison State
  const [referenceSpeed, setReferenceSpeed] = useState(300); // RPM
  const [simulatedSpeed, setSimulatedSpeed] = useState(0);
  const [actualSpeed, setActualSpeed] = useState(0);
  const [comparisonActive, setComparisonActive] = useState(false);
  const [plotData, setPlotData] = useState({
    time: [],
    reference: [],
    simulated: [],
    actual: []
  });
  const [simulationParams, setSimulationParams] = useState({
    kp: 1.0,
    ki: 0.1,
    kd: 0.05,
    motorInertia: 0.01,
    friction: 0.1
  });
  const [controllerState, setControllerState] = useState({
    errorSum: 0,
    lastError: 0,
    lastTime: Date.now()
  });

  useEffect(() => {
    // Set up serial response handler
    serialHandler.onResponse('ALL', (response) => {
      setSerialOutput(prev => [...prev.slice(-10), response]); // Keep last 10 responses
      
      // Handle stepper motor responses
      if (response.includes('STEPPER_POS:')) {
        const pos = parseInt(response.split(':')[1]);
        setStepperPosition(pos);
      }
      if (response.includes('STEPPER_STOPPED')) {
        setStepperRunning(false);
      }
      
      // Handle encoder responses
      if (response.includes('ENCODER:')) {
        const parts = response.split(':')[1].split(',');
        if (parts.length >= 4) {
          const count = parseInt(parts[0]);
          const angle = parseFloat(parts[1]);
          const velocity = parseFloat(parts[2]);
          const rpm = parseFloat(parts[3]);
          
          setEncoderCount(count);
          setEncoderAngle(angle);
          setEncoderVelocity(velocity);
          setEncoderRPM(rpm);
          setLastEncoderTime(Date.now());
          
          // Determine direction based on velocity
          if (Math.abs(velocity) < 0.1) {
            setEncoderDirection('STOPPED');
          } else if (velocity > 0) {
            setEncoderDirection('CLOCKWISE');
          } else {
            setEncoderDirection('COUNTER-CLOCKWISE');
          }
        }
      }
      
      // Handle closed-loop status responses
      if (response.includes('STATUS:')) {
        const parts = response.split(':')[1].split(',');
        if (parts.length >= 6) {
          const currentRPM = parseFloat(parts[0]);
          const targetRPM = parseFloat(parts[1]);
          const motorPWM = parseInt(parts[2]);
          const encoderCount = parseInt(parts[3]);
          const closedLoopActive = parseInt(parts[4]) === 1;
          const pidOutput = parseFloat(parts[5]);
          
          setActualSpeed(Math.abs(currentRPM)); // Use absolute value for speed
          // Update other states as needed for the comparison module
        }
      }
    });

    return () => {
      serialHandler.clearCallbacks();
    };
  }, []);

  const handleConnect = async () => {
    try {
      setConnectionStatus('connecting');
      await serialHandler.connect();
      setIsConnected(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      alert(`Connection failed: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    await serialHandler.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setSerialOutput([]);
  };

  const handleSpeedChange = async (speed) => {
    setMotorSpeed(speed);
    if (isConnected) {
      try {
        await serialHandler.setMotorSpeed(speed);
      } catch (error) {
        console.error('Failed to set speed:', error);
      }
    }
  };

  const handleDirectionChange = async (direction) => {
    setMotorDirection(direction);
    if (isConnected) {
      try {
        await serialHandler.setMotorDirection(direction);
      } catch (error) {
        console.error('Failed to set direction:', error);
      }
    }
  };

  // Stepper Motor Control Functions
  const handleStepperMove = async (steps) => {
    if (isConnected) {
      try {
        setStepperRunning(true);
        await serialHandler.sendCommand(`STEPPER_MOVE_${steps}`);
      } catch (error) {
        console.error('Failed to move stepper:', error);
      }
    }
  };

  const handleStepperSpeed = async (speed) => {
    setStepperSpeed(speed);
    if (isConnected) {
      try {
        await serialHandler.sendCommand(`STEPPER_SPEED_${speed}`);
      } catch (error) {
        console.error('Failed to set stepper speed:', error);
      }
    }
  };

  const handleStepperStop = async () => {
    if (isConnected) {
      try {
        setStepperRunning(false);
        await serialHandler.sendCommand('STEPPER_STOP');
      } catch (error) {
        console.error('Failed to stop stepper:', error);
      }
    }
  };

  const handleStepperHome = async () => {
    if (isConnected) {
      try {
        setStepperPosition(0);
        await serialHandler.sendCommand('STEPPER_HOME');
      } catch (error) {
        console.error('Failed to home stepper:', error);
      }
    }
  };

  // Rotary Encoder Functions
  const handleEncoderReset = async () => {
    if (isConnected) {
      try {
        setEncoderCount(0);
        setEncoderAngle(0);
        await serialHandler.sendCommand('ENCODER_RESET');
      } catch (error) {
        console.error('Failed to reset encoder:', error);
      }
    }
  };

  const handleEncoderCalibrate = async () => {
    if (isConnected) {
      try {
        await serialHandler.sendCommand('ENCODER_CALIBRATE');
      } catch (error) {
        console.error('Failed to calibrate encoder:', error);
      }
    }
  };

  // Simulation Comparison Functions
  const startSimulationComparison = async () => {
    if (isConnected) {
      try {
        setComparisonActive(true);
        // Reset plot data
        setPlotData({
          time: [],
          reference: [],
          simulated: [],
          actual: []
        });
        // Start hardware closed-loop
        await serialHandler.startClosedLoop();
        // Set target speed on hardware
        await serialHandler.setTargetSpeed(referenceSpeed);
        // Start simulation loop
        startSimulationLoop();
      } catch (error) {
        console.error('Failed to start comparison:', error);
      }
    }
  };

  const stopSimulationComparison = async () => {
    if (isConnected) {
      try {
        setComparisonActive(false);
        // Stop hardware closed-loop
        await serialHandler.stopClosedLoop();
        stopSimulationLoop();
      } catch (error) {
        console.error('Failed to stop comparison:', error);
      }
    }
  };

  const startSimulationLoop = () => {
    const interval = setInterval(() => {
      if (!comparisonActive) {
        clearInterval(interval);
        return;
      }
      updateSimulation();
    }, 100); // 10Hz update rate
  };

  const stopSimulationLoop = () => {
    // Intervals are cleared by the condition in startSimulationLoop
  };

  const updateSimulation = () => {
    const currentTime = Date.now();
    const deltaTime = (currentTime - controllerState.lastTime) / 1000; // Convert to seconds
    
    // PID Controller for simulation
    const error = referenceSpeed - simulatedSpeed;
    const newErrorSum = controllerState.errorSum + error * deltaTime;
    const errorDerivative = (error - controllerState.lastError) / deltaTime;
    
    // PID output
    const pidOutput = simulationParams.kp * error + 
                     simulationParams.ki * newErrorSum + 
                     simulationParams.kd * errorDerivative;
    
    // Simple motor dynamics simulation
    const motorAcceleration = (pidOutput - simulationParams.friction * simulatedSpeed) / simulationParams.motorInertia;
    const newSimulatedSpeed = simulatedSpeed + motorAcceleration * deltaTime;
    
    // Update simulation state
    setSimulatedSpeed(Math.max(0, Math.min(600, newSimulatedSpeed))); // Clamp to motor limits
    setControllerState({
      errorSum: Math.max(-1000, Math.min(1000, newErrorSum)), // Prevent windup
      lastError: error,
      lastTime: currentTime
    });
    
    // Update plot data
    setPlotData(prevData => {
      const timePoint = (currentTime - prevData.time[0] || currentTime) / 1000; // Relative time in seconds
      const maxPoints = 100; // Keep last 100 points (10 seconds at 10Hz)
      
      return {
        time: [...prevData.time.slice(-maxPoints + 1), timePoint],
        reference: [...prevData.reference.slice(-maxPoints + 1), referenceSpeed],
        simulated: [...prevData.simulated.slice(-maxPoints + 1), simulatedSpeed],
        actual: [...prevData.actual.slice(-maxPoints + 1), actualSpeed]
      };
    });
  };

  const handleReferenceSpeedChange = async (newSpeed) => {
    setReferenceSpeed(newSpeed);
    if (comparisonActive && isConnected) {
      try {
        await serialHandler.setTargetSpeed(newSpeed);
      } catch (error) {
        console.error('Failed to update target speed:', error);
      }
    }
  };

  const handlePIDParameterChange = async (param, value) => {
    const newParams = { ...simulationParams, [param]: value };
    setSimulationParams(newParams);
    if (comparisonActive && isConnected) {
      try {
        await serialHandler.setPIDParams(newParams.kp, newParams.ki, newParams.kd);
      } catch (error) {
        console.error('Failed to update PID parameters:', error);
      }
    }
  };

  const arduinoCode = `/*
  Motor Test Sketch for L298N Driver - Updated for Your Setup
  
  This sketch demonstrates basic motor control using the L298N driver module.
  It receives serial commands to control motor speed and direction.
  
  Your DC Motor Specifications:
  - 12V 600RPM Geared DC Motor
  - Operating Voltage: 6–18V DC (nominal: 12V)
  - Rated Speed: 600RPM at 12V
  - Stall Torque: Around 4kgcm (up to 15kgcm)
  - No-Load Current: ~100mA; Load current: up to 1.9A
*/

// Motor pins - Updated for your connections
const int IN1 = 8;    // Direction pin 1
const int IN2 = 7;    // Direction pin 2  
const int ENA = 9;    // Enable pin (PWM for speed control)

// Variables
int motorSpeed = 0;
String inputString = "";
boolean stringComplete = false;

void setup() {
  // Initialize serial communication
  Serial.begin(9600);
  
  // Set motor pins as outputs
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);
  
  // Initial state - motor stopped
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  
  Serial.println("Motor Test Ready!");
  Serial.println("12V 600RPM Geared DC Motor Controller");
  Serial.println("Commands: HANDSHAKE, SET_SPEED_XXX, SET_DIRECTION_XXX");
}

void loop() {
  // Check for serial commands
  if (stringComplete) {
    processCommand(inputString);
    inputString = "";
    stringComplete = false;
  }
}

void serialEvent() {
  while (Serial.available()) {
    char inChar = (char)Serial.read();
    if (inChar == '\\n') {
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
  else if (command.startsWith("SET_SPEED_")) {
    int speed = command.substring(10).toInt();
    speed = constrain(speed, 0, 255);
    motorSpeed = speed;
    analogWrite(ENA, speed);
    Serial.println("OK");
  }
  else if (command == "SET_DIRECTION_FORWARD") {
    digitalWrite(IN1, HIGH);
    digitalWrite(IN2, LOW);
    Serial.println("OK");
  }
  else if (command == "SET_DIRECTION_REVERSE") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, HIGH);
    Serial.println("OK");
  }
  else if (command == "SET_DIRECTION_STOP") {
    digitalWrite(IN1, LOW);
    digitalWrite(IN2, LOW);
    Serial.println("OK");
  }
  else {
    Serial.println("ERROR");
  }
}`;

  const stepperArduinoCode = `/*
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
    if (inChar == '\\n') {
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
}`;

  const encoderArduinoCode = `/*
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
    if (inChar == '\\n') {
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
}`;

  const closedLoopArduinoCode = `/*
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
    if (inChar == '\\n') {
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
}`;

  // Define sub-modules for the study mode
  const subModules = [
    {
      id: 'introduction',
      title: '🎯 What is Rotary Inverted Pendulum?',
      icon: '⚖️',
      description: 'Understanding the fundamentals'
    },
    {
      id: 'dc-motor',
      title: '⚙️ DC Motor Control with L298N',
      icon: '🔧',
      description: 'Hands-on motor control'
    },
    {
      id: 'stepper-motor',
      title: '🎯 Stepper Motor Control',
      icon: '⚡',
      description: 'Precise positioning systems'
    },
    {
      id: 'encoders',
      title: '📡 Rotary Encoders & Feedback',
      icon: '📊',
      description: 'Position and velocity sensing'
    },
    {
      id: 'simulation-comparison',
      title: '🔬 Simulation vs Hardware',
      icon: '⚖️',
      description: 'Real-time control system comparison'
    },
    {
      id: 'hardware-design',
      title: '🔩 Mechanical Design & CAD',
      icon: '🏗️',
      description: 'Hardware design principles'
    }
  ];

  const renderSubModuleSelector = () => {
    return (
      <div style={{
        background: '#f8f9fa',
        padding: '1rem',
        borderBottom: '2px solid #e9ecef',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap',
        marginBottom: '1rem'
      }}>
        {subModules.map((subModule, index) => (
          <button
            key={subModule.id}
            onClick={() => setActiveSubModule(index)}
            className={`btn ${activeSubModule === index ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              fontSize: '0.85rem',
              padding: '0.5rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>{subModule.icon}</span>
            <span>{subModule.title}</span>
          </button>
        ))}
      </div>
    );
  };

  const renderIntroductionContent = () => {
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>🎯 What is a Rotary Inverted Pendulum?</h3>
          <p>
            A rotary inverted pendulum is a classic control systems benchmark problem. It consists of a pendulum 
            attached to a rotating arm. The goal is to balance the pendulum in the upright (inverted) position 
            by controlling the rotation of the arm.
          </p>
          
          <div style={{ 
            background: '#e3f2fd', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #2196F3'
          }}>
            <h4>🎓 Why Study This System?</h4>
            <ul>
              <li><strong>Nonlinear Dynamics:</strong> Exhibits complex, unstable behavior</li>
              <li><strong>Control Theory:</strong> Perfect for testing PID, LQR, and modern control techniques</li>
              <li><strong>Real-world Applications:</strong> Similar to rocket control, Segway balancing, crane control</li>
              <li><strong>Educational Value:</strong> Combines theory with hands-on implementation</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>⚙️ System Components</h3>
          <div className="pin-diagram">
{`Physical Setup:
┌─────────────────────────────────┐
│     Pendulum (0.3m, 0.1kg)      │ ← Inverted pendulum
│            │                    │
│            │                    │
│       ●────┼────●               │ ← Rotating arm (0.2m)
│            │                    │
│         Motor                   │ ← DC/Stepper motor
│      (with encoder)             │
└─────────────────────────────────┘

Key Parameters:
• Pendulum Length: 0.3m
• Pendulum Mass: 0.1kg  
• Arm Length: 0.2m
• Motor: 12V 600RPM Geared DC`}
          </div>
        </div>

        <div className="section">
          <h3>⚖️ Physics & Mathematics</h3>
          <p>The system dynamics can be described by the equation of motion:</p>
          <div className="pin-diagram">
{`Equation of Motion:
(I + ml²)θ̈ = mgl sin(θ) + mlr cos(θ)φ̈

Where:
θ = pendulum angle from vertical
φ = arm rotation angle
I = pendulum moment of inertia
m = pendulum mass (0.1kg)
l = pendulum length (0.3m)
r = arm length (0.2m)
g = gravitational acceleration (9.81 m/s²)`}
          </div>
        </div>

        <div className="section">
          <h3>🎮 Control Challenges</h3>
          <ul>
            <li><strong>Unstable Equilibrium:</strong> Upright position is naturally unstable</li>
            <li><strong>Underactuated System:</strong> One motor controls two degrees of freedom</li>
            <li><strong>Nonlinear Behavior:</strong> Large angle motions exhibit complex dynamics</li>
            <li><strong>Coupling Effects:</strong> Arm and pendulum motions are interdependent</li>
          </ul>
        </div>

        <div className="section">
          <h3>🏗️ Control Strategies</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
              <h4>🎯 PID Control</h4>
              <p>Proportional-Integral-Derivative controller for basic stabilization</p>
            </div>
            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px' }}>
              <h4>📊 LQR Control</h4>
              <p>Linear Quadratic Regulator for optimal control performance</p>
            </div>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>🧠 Fuzzy Logic</h4>
              <p>Fuzzy logic controller for handling uncertainties</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDCMotorContent = () => {
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>⚙️ Your DC Motor Specifications</h3>
          <div style={{ 
            background: '#e8f5e8', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h4>📋 12V 600RPM Geared DC Motor</h4>
            <ul>
              <li><strong>Operating Voltage:</strong> 6–18V DC (nominal: 12V)</li>
              <li><strong>Rated Speed:</strong> 600RPM at 12V</li>
              <li><strong>Stall Torque:</strong> 4-15 kgcm</li>
              <li><strong>No-Load Current:</strong> ~100mA</li>
              <li><strong>Load Current:</strong> Up to 1.9A</li>
              <li><strong>Shaft:</strong> 6mm diameter, 29-30mm length</li>
              <li><strong>Weight:</strong> 250-320g</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>🔌 Your Pin Connections</h3>
          <div className="pin-diagram">
{`Arduino Mega → L298N Connections:
Pin 8  → IN1  (Direction control 1) ✓
Pin 7  → IN2  (Direction control 2) ✓
Pin 9  → ENA  (PWM speed control)   ✓

L298N → DC Motor:
OUT1   → Motor Terminal 1
OUT2   → Motor Terminal 2

Power Connections:
12V Supply → L298N VCC
12V Supply → L298N +12V
Arduino GND → L298N GND
Jumper: REMOVED (as specified)`}
          </div>
        </div>

        <div className="section">
          <h3>📝 Control Logic Table</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>IN1 (Pin 8)</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>IN2 (Pin 7)</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>ENA (Pin 9)</th>
                <th style={{ border: '1px solid #ccc', padding: '8px' }}>Motor Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>HIGH</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>LOW</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>PWM (0-255)</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Forward</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>LOW</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>HIGH</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>PWM (0-255)</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Reverse</td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>LOW</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>LOW</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Any</td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>Stop/Brake</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section">
          <h3>💻 Updated Arduino Code</h3>
          <p>Upload this sketch with your pin configuration:</p>
          <SyntaxHighlighter 
            language="cpp" 
            style={vscDarkPlus}
            customStyle={{
              fontSize: '0.85rem',
              lineHeight: '1.4',
              borderRadius: '8px'
            }}
          >
            {arduinoCode}
          </SyntaxHighlighter>
        </div>

        <div className="section">
          <h3>🔍 PWM Speed Control</h3>
          <p>Your motor's speed characteristics with PWM:</p>
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '1rem',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            lineHeight: '1.6',
            whiteSpace: 'pre'
          }}>
{`PWM Speed Mapping for 600RPM Motor:
PWM Value → Approximate Speed
   0      →    0 RPM (Stopped)
  64      →  150 RPM (25% speed)
 127      →  300 RPM (50% speed)
 191      →  450 RPM (75% speed)  
 255      →  600 RPM (Full speed)

Note: Actual speeds may vary with load`}
          </div>
        </div>
      </div>
    );
  };

  const renderStepperMotorContent = () => {
    return <StepperMotorControl />;
  };

  const renderEncodersContent = () => {
    return <RotaryEncoder />;
  };
          
  const renderHardwareDesignContent = () => {
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>🏗️ Mechanical Design Principles</h3>
          <p>
            Proper mechanical design is crucial for a stable and responsive pendulum system. 
            Every component affects the system's dynamics and control performance.
          </p>
          
          <div style={{ 
            background: '#f3e5f5', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #9c27b0'
          }}>
            <h4>🎯 Design Considerations</h4>
            <ul>
              <li><strong>Moment of Inertia:</strong> Affects system response</li>
              <li><strong>Center of Mass:</strong> Determines stability</li>
              <li><strong>Friction:</strong> Impacts control accuracy</li>
              <li><strong>Backlash:</strong> Reduces precision</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>📐 Critical Dimensions</h3>
          <div className="pin-diagram">
{`Pendulum Assembly Specifications:
┌─────────────────────────────────┐
│  ●  ← Mass (0.1kg)              │
│  │                              │
│  │  0.3m                        │
│  │                              │
│  ●──────● 0.2m                  │ ← Arm
│     │                           │
│   Motor                         │
└─────────────────────────────────┘

Key Parameters:
• Pendulum length: 300mm
• Arm length: 200mm
• Mass position: At pendulum tip
• Material: Aluminum rod (lightweight)`}
          </div>
        </div>

        <div className="section">
          <h3>🔩 Mechanical Components</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>⚖️ Pendulum Rod</h4>
              <ul>
                <li>Material: Aluminum tube (6mm OD, 4mm ID)</li>
                <li>Length: 300mm</li>
                <li>Weight: ~5g (lightweight for quick response)</li>
              </ul>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
              <h4>🏋️ End Mass</h4>
              <ul>
                <li>Weight: 100g (adjustable with washers)</li>
                <li>Position: Pendulum tip</li>
                <li>Shape: Compact to minimize air resistance</li>
              </ul>
            </div>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
              <h4>🔄 Rotating Arm</h4>
              <ul>
                <li>Material: Aluminum plate (3mm thick)</li>
                <li>Length: 200mm</li>
                <li>Mounting: Direct motor shaft coupling</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>🔧 CAD Design Process</h3>
          <ol>
            <li><strong>System Layout:</strong> Plan component arrangement</li>
            <li><strong>3D Modeling:</strong> Create parts in CAD software</li>
            <li><strong>Assembly:</strong> Check fit and clearances</li>
            <li><strong>Analysis:</strong> Calculate moments of inertia</li>
            <li><strong>Optimization:</strong> Refine for performance</li>
          </ol>
          
          <div style={{ 
            background: '#fff3e0', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0'
          }}>
            <h4>📐 CAD Software Options</h4>
            <ul>
              <li><strong>SolidWorks:</strong> Professional, extensive features</li>
              <li><strong>Fusion 360:</strong> Free for students, cloud-based</li>
              <li><strong>FreeCAD:</strong> Open source, fully free</li>
              <li><strong>Tinkercad:</strong> Simple, browser-based</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>⚖️ Physics Calculations</h3>
          <div className="pin-diagram">
{`Moment of Inertia Calculations:
For point mass at distance r:
I = mr²

For your pendulum:
I = (0.1 kg) × (0.3 m)² = 0.009 kg⋅m²

Center of Mass:
For uniform rod + end mass:
rcm = (mrod⋅lrod/2 + mend⋅lend) / (mrod + mend)

Natural Frequency:
f₀ = (1/2π) × √(mgl/I)
Where: m=0.1kg, g=9.81m/s², l=0.3m, I=0.009kg⋅m²`}
          </div>
        </div>

        <div className="section">
          <h3>🛠️ Manufacturing Considerations</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>🏭 Fabrication Methods</h4>
              <ul>
                <li>3D Printing (brackets, mounts)</li>
                <li>Laser cutting (aluminum plates)</li>
                <li>Machining (precision shafts)</li>
                <li>Off-the-shelf (rods, fasteners)</li>
              </ul>
            </div>
            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px' }}>
              <h4>📏 Tolerances</h4>
              <ul>
                <li>Shaft fits: ±0.1mm</li>
                <li>Bearing clearances: 0.05mm</li>
                <li>Length dimensions: ±1mm</li>
                <li>Angular alignment: ±1°</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSimulationComparisonContent = () => {
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>🔬 Simulation vs Hardware Comparison</h3>
          <p>
            This module enables real-time comparison between a simulated DC motor control system 
            and your actual hardware setup. You can observe how theoretical models compare to 
            real-world performance and understand the effects of various control parameters.
          </p>
          
          <div style={{ 
            background: '#e3f2fd', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #2196F3'
          }}>
            <h4>🎯 Educational Objectives</h4>
            <ul>
              <li><strong>Model Validation:</strong> Compare theoretical vs actual performance</li>
              <li><strong>Control Tuning:</strong> Understand PID parameter effects</li>
              <li><strong>System Identification:</strong> Characterize real motor dynamics</li>
              <li><strong>Performance Analysis:</strong> Evaluate settling time, overshoot, steady-state error</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>⚙️ System Components</h3>
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ color: '#1976d2', marginBottom: '1rem' }}>
              🔧 Hardware Setup (Arduino + L298N + DC Motor + Encoder)
            </h4>
            <SystemDiagram 
              referenceSpeed={referenceSpeed}
              simulatedSpeed={simulatedSpeed}
              actualSpeed={actualSpeed}
              simulationParams={simulationParams}
              comparisonActive={comparisonActive}
              diagramType="hardware"
            />
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <h4 style={{ color: '#9c27b0', marginBottom: '1rem' }}>
              🖥️ Simulation Model (Mathematical)
            </h4>
            <SystemDiagram 
              referenceSpeed={referenceSpeed}
              simulatedSpeed={simulatedSpeed}
              actualSpeed={actualSpeed}
              simulationParams={simulationParams}
              comparisonActive={comparisonActive}
              diagramType="simulation"
            />
          </div>
        </div>

        <div className="section">
          <h3>📐 Mathematical Models</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px' }}>
              <h4>🔄 DC Motor Transfer Function</h4>
              <p>First-order approximation:</p>
              <div style={{ fontFamily: 'monospace', background: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
                G(s) = K / (τs + 1)
              </div>
              <p>Where: K = steady-state gain, τ = time constant</p>
            </div>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>📊 PID Controller</h4>
              <p>Continuous-time PID:</p>
              <div style={{ fontFamily: 'monospace', background: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
                u(t) = Kp⋅e(t) + Ki⋅∫e(t)dt + Kd⋅de(t)/dt
              </div>
              <p>Where: e(t) = reference - actual speed</p>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
              <h4>⚡ Discrete Implementation</h4>
              <p>For digital control (Arduino):</p>
              <div style={{ fontFamily: 'monospace', background: '#fff', padding: '0.5rem', borderRadius: '4px' }}>
                u[k] = Kp⋅e[k] + Ki⋅Σe[k]⋅Δt + Kd⋅(e[k]-e[k-1])/Δt
              </div>
              <p>Sample time: Δt = 0.05s (20Hz)</p>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>📋 Complete Arduino Code</h3>
          <p>Upload this advanced closed-loop control sketch:</p>
          <SyntaxHighlighter 
            language="cpp" 
            style={vscDarkPlus}
            customStyle={{
              fontSize: '0.85rem',
              lineHeight: '1.4',
              borderRadius: '8px'
            }}
          >
            {closedLoopArduinoCode}
          </SyntaxHighlighter>
        </div>

        <div className="section">
          <h3>🎛️ Control Parameters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
              <h4>Kp (Proportional)</h4>
              <ul>
                <li>Controls response speed</li>
                <li>Higher Kp → faster response</li>
                <li>Too high → overshoot</li>
                <li>Typical range: 0.1 - 5.0</li>
              </ul>
            </div>
            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px' }}>
              <h4>Ki (Integral)</h4>
              <ul>
                <li>Eliminates steady-state error</li>
                <li>Higher Ki → faster error elimination</li>
                <li>Too high → oscillation</li>
                <li>Typical range: 0.01 - 1.0</li>
              </ul>
            </div>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>Kd (Derivative)</h4>
              <ul>
                <li>Reduces overshoot</li>
                <li>Predicts future error</li>
                <li>Too high → noise amplification</li>
                <li>Typical range: 0.001 - 0.1</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>📈 Performance Metrics</h3>
          <div style={{ 
            background: '#fff3cd', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #ffc107'
          }}>
            <h4>🎯 Key Performance Indicators</h4>
            <ul>
              <li><strong>Rise Time:</strong> Time to reach 90% of target value</li>
              <li><strong>Settling Time:</strong> Time to stay within ±2% of target</li>
              <li><strong>Overshoot:</strong> Maximum deviation above target (as %)</li>
              <li><strong>Steady-State Error:</strong> Final difference from target</li>
              <li><strong>Root Mean Square Error:</strong> Overall tracking performance</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>🔍 Troubleshooting Guide</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem' }}>
            <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '8px' }}>
              <h4>❌ System Oscillates</h4>
              <p><strong>Solution:</strong> Reduce Kp and Kd, slightly increase Ki</p>
            </div>
            <div style={{ background: '#e8f5e8', padding: '1rem', borderRadius: '8px' }}>
              <h4>🐌 Slow Response</h4>
              <p><strong>Solution:</strong> Increase Kp, check for mechanical friction</p>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
              <h4>📊 Steady-State Error</h4>
              <p><strong>Solution:</strong> Increase Ki, check encoder calibration</p>
            </div>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
              <h4>📈 Large Overshoot</h4>
              <p><strong>Solution:</strong> Reduce Kp, increase Kd</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const subModule = subModules[activeSubModule];
    
    switch(subModule.id) {
      case 'introduction':
        return renderIntroductionContent();
      case 'dc-motor':
        return renderDCMotorContent();
      case 'stepper-motor':
        return renderStepperMotorContent();
      case 'encoders':
        return renderEncodersContent();
      case 'simulation-comparison':
        return renderSimulationComparisonContent();
      case 'hardware-design':
        return renderHardwareDesignContent();
      default:
        return renderDCMotorContent();
    }
  };

  const renderControls = () => {
    const subModule = subModules[activeSubModule];
    
    // Show interactive controls for DC motor, stepper motor, encoder modules, and simulation comparison
    if (!['dc-motor', 'stepper-motor', 'encoders', 'simulation-comparison'].includes(subModule.id)) {
      return (
        <div className="study-content">
          <div className="section">
            <h3>📘 Learning Module: {subModule.title}</h3>
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {subModule.icon}
              </div>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                {subModule.description}
              </p>
              <div style={{ 
                marginTop: '2rem', 
                padding: '1rem', 
                background: '#e3f2fd', 
                borderRadius: '8px' 
              }}>
                <p style={{ margin: 0, color: '#1976d2' }}>
                  💡 <strong>Interactive controls available in DC Motor, Stepper Motor, and Rotary Encoder modules</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Common connection panel for all control modules
    const renderConnectionPanel = () => (
      <div className="section">
        <h3>🔌 Board Connection</h3>
        <div className="connection-panel">
          <div className="connection-status">
            <span 
              className={`status-indicator ${
                connectionStatus === 'connected' ? 'status-connected' :
                connectionStatus === 'connecting' ? 'status-connecting' :
                'status-disconnected'
              }`}
            ></span>
            <span>
              {connectionStatus === 'connected' ? 'Connected to Arduino' :
               connectionStatus === 'connecting' ? 'Connecting...' :
               'Not connected'}
            </span>
          </div>
          
          {!isConnected ? (
            <button 
              className="btn btn-primary"
              onClick={handleConnect}
              disabled={connectionStatus === 'connecting'}
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Arduino'}
            </button>
          ) : (
            <button 
              className="btn btn-danger"
              onClick={handleDisconnect}
            >
              Disconnect
            </button>
          )}
          
          <div style={{ 
            marginTop: '1rem', 
            padding: '0.75rem', 
            background: '#fff3cd', 
            borderRadius: '5px',
            fontSize: '0.9rem'
          }}>
            ⚠️ <strong>Pin Configuration:</strong> {
              subModule.id === 'dc-motor' ? 'IN1→Pin 8, IN2→Pin 7, ENA→Pin 9' :
              subModule.id === 'stepper-motor' ? 'STEP→Pin 3, DIR→Pin 4, EN→Pin 5' :
              'Phase A→Pin 2, Phase B→Pin 3, VCC→5V, GND→GND'
            }
          </div>
        </div>
      </div>
    );

    // DC Motor Controls
    if (subModule.id === 'dc-motor') {
      return (
        <div className="study-content">
          {renderConnectionPanel()}

          <div className="section">
            <h3>🎛️ DC Motor Controls</h3>
            <div className="control-section">
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #4CAF50',
                boxShadow: '0 4px 8px rgba(76, 175, 80, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '1.2em' }}>🏷️</span>
                  Your 12V 600RPM DC Motor - Live Status
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  fontSize: '0.95rem' 
                }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🔄 Current Speed
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {Math.round((motorSpeed / 255) * 600)} RPM
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      ⚡ Power Output
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f57c00' }}>
                      {Math.round((motorSpeed / 255) * 100)}%
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🔌 Est. Current
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#d32f2f' }}>
                      {Math.round(100 + (motorSpeed / 255) * 1800)} mA
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                  Motor Speed Control (PWM: 0-255)
                </label>
                <div className="slider-container" style={{ position: 'relative' }}>
                  <input
                    type="range"
                    min="0"
                    max="255"
                    value={motorSpeed}
                    onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                    className="slider"
                    disabled={!isConnected}
                    style={{ width: '100%', height: '8px' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      PWM: <span style={{ fontSize: '1.2rem', color: '#d32f2f' }}>{motorSpeed}</span>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Speed: <span style={{ fontSize: '1.2rem', color: '#2e7d32' }}>
                        {Math.round((motorSpeed / 255) * 600)} RPM
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label>Direction Control</label>
                <div className="direction-controls">
                  <button
                    className={`btn btn-small ${motorDirection === 'FORWARD' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleDirectionChange('FORWARD')}
                    disabled={!isConnected}
                  >
                    ▶️ Forward
                  </button>
                  <button
                    className={`btn btn-small ${motorDirection === 'STOP' ? 'btn-warning' : 'btn-secondary'}`}
                    onClick={() => handleDirectionChange('STOP')}
                    disabled={!isConnected}
                  >
                    ⏹️ Stop
                  </button>
                  <button
                    className={`btn btn-small ${motorDirection === 'REVERSE' ? 'btn-success' : 'btn-secondary'}`}
                    onClick={() => handleDirectionChange('REVERSE')}
                    disabled={!isConnected}
                  >
                    ◀️ Reverse
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📟 Serial Monitor</h3>
            <div style={{
              background: '#1e1e1e',
              color: '#00ff00',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #333'
            }}>
              {serialOutput.length === 0 ? (
                <div style={{ color: '#666' }}>Connect to Arduino to see serial output...</div>
              ) : (
                serialOutput.map((output, index) => (
                  <div key={index}>{output}</div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <h3>✅ Quick Test Checklist</h3>
            <ol>
              <li>Upload the MotorTest sketch to Arduino Mega</li>
              <li>Wire L298N: <strong>IN1→Pin 8, IN2→Pin 7, ENA→Pin 9</strong></li>
              <li>Connect 12V power supply to L298N (remove jumper)</li>
              <li>Click "Connect Arduino" above</li>
              <li>Use the speed slider to control motor speed (0-600 RPM)</li>
              <li>Test all direction buttons (Forward/Stop/Reverse)</li>
              <li>Monitor real-time RPM and current estimates</li>
            </ol>
          </div>
        </div>
      );
    }

    // Stepper Motor Controls
    if (subModule.id === 'stepper-motor') {
      return (
        <div className="study-content">
          {renderConnectionPanel()}

          <div className="section">
            <h3>🎯 Stepper Motor Controls</h3>
            <div className="control-section">
              <div style={{
                background: 'linear-gradient(135deg, #fff3e0 0%, #fff8e1 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #ff9800',
                boxShadow: '0 4px 8px rgba(255, 152, 0, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#e65100', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '1.2em' }}>⚡</span>
                  NEMA 17 Stepper Motor - Live Status
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  fontSize: '0.95rem' 
                }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 152, 0, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      📍 Position
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e65100' }}>
                      {stepperPosition} steps
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 152, 0, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🔄 Angle
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {((stepperPosition * 360) / 200).toFixed(1)}°
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 152, 0, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      ⚡ Status
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: stepperRunning ? '#f57c00' : '#2e7d32' }}>
                      {stepperRunning ? 'Moving' : 'Stopped'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                  Stepper Speed (Steps/Second: 50-2000)
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="50"
                    max="2000"
                    value={stepperSpeed}
                    onChange={(e) => handleStepperSpeed(parseInt(e.target.value))}
                    className="slider"
                    disabled={!isConnected}
                    style={{ width: '100%', height: '8px' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      Speed: <span style={{ fontSize: '1.2rem', color: '#e65100' }}>{stepperSpeed}</span> steps/sec
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
                      RPM: <span style={{ fontSize: '1.2rem', color: '#2e7d32' }}>
                        {Math.round((stepperSpeed * 60) / 200)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label>Position Control (Steps)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="number"
                    value={targetSteps}
                    onChange={(e) => setTargetSteps(parseInt(e.target.value) || 0)}
                    placeholder="Target steps"
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                      width: '150px'
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    onClick={() => handleStepperMove(targetSteps)}
                    disabled={!isConnected}
                  >
                    Move to Position
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>Quick Movement Controls</label>
                <div className="direction-controls">
                  <button
                    className="btn btn-small btn-info"
                    onClick={() => handleStepperMove(50)}
                    disabled={!isConnected}
                  >
                    ↻ +50 Steps (90°)
                  </button>
                  <button
                    className="btn btn-small btn-info"
                    onClick={() => handleStepperMove(-50)}
                    disabled={!isConnected}
                  >
                    ↺ -50 Steps (-90°)
                  </button>
                  <button
                    className="btn btn-small btn-warning"
                    onClick={handleStepperStop}
                    disabled={!isConnected}
                  >
                    ⏹️ Stop
                  </button>
                  <button
                    className="btn btn-small btn-secondary"
                    onClick={handleStepperHome}
                    disabled={!isConnected}
                  >
                    🏠 Home (0°)
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📟 Serial Monitor</h3>
            <div style={{
              background: '#1e1e1e',
              color: '#00ff00',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #333'
            }}>
              {serialOutput.length === 0 ? (
                <div style={{ color: '#666' }}>Connect to Arduino to see serial output...</div>
              ) : (
                serialOutput.map((output, index) => (
                  <div key={index}>{output}</div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <h3>✅ Stepper Setup Checklist</h3>
            <ol>
              <li>Upload the StepperControl sketch to Arduino Mega</li>
              <li>Wire A4988: <strong>STEP→Pin 3, DIR→Pin 4, EN→Pin 5</strong></li>
              <li>Connect NEMA 17 to A4988 motor outputs</li>
              <li>Connect 12V power supply to A4988 VMOT</li>
              <li>Install AccelStepper library in Arduino IDE</li>
              <li>Click "Connect Arduino" and test movements</li>
              <li>Verify position feedback and step accuracy</li>
            </ol>
          </div>
        </div>
      );
    }

    // Rotary Encoder Controls
    if (subModule.id === 'encoders') {
      return (
        <div className="study-content">
          {renderConnectionPanel()}

          <div className="section">
            <h3>📡 Rotary Encoder Monitor</h3>
            <div className="control-section">
              <div style={{
                background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #4CAF50',
                boxShadow: '0 4px 8px rgba(76, 175, 80, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#2e7d32', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '1.2em' }}>📊</span>
                  Pro-Range 600 PPR Encoder - Live Data
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  fontSize: '0.95rem' 
                }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      📊 Pulse Count
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {encoderCount}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🔄 Angle
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#e65100' }}>
                      {encoderAngle.toFixed(2)}°
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      ⚡ Velocity
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f57c00' }}>
                      {encoderVelocity.toFixed(1)} °/s
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🔄 RPM
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#9c27b0' }}>
                      {encoderRPM.toFixed(1)}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      ➡️ Direction
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#d32f2f' }}>
                      {encoderDirection}
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(76, 175, 80, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🎯 Resolution
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2' }}>
                      0.15° per count
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label>Encoder Controls</label>
                <div className="direction-controls">
                  <button
                    className="btn btn-small btn-warning"
                    onClick={handleEncoderReset}
                    disabled={!isConnected}
                  >
                    🔄 Reset Count
                  </button>
                  <button
                    className="btn btn-small btn-info"
                    onClick={handleEncoderCalibrate}
                    disabled={!isConnected}
                  >
                    📐 Calibrate
                  </button>
                </div>
              </div>

              <div style={{ 
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#e3f2fd',
                borderRadius: '8px',
                border: '1px solid #2196F3'
              }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1976d2' }}>
                  📏 Real-time Calculations
                </h4>
                <div style={{ fontSize: '0.9rem', color: '#424242' }}>
                  <p><strong>Angular Resolution:</strong> 360° ÷ 2400 = 0.15° per transition</p>
                  <p><strong>Current Revolution:</strong> {(encoderAngle / 360).toFixed(3)} revolutions</p>
                  <p><strong>Total Rotations:</strong> {Math.abs(Math.floor(encoderAngle / 360))} complete rotations</p>
                  <p><strong>Remaining Angle:</strong> {(Math.abs(encoderAngle) % 360).toFixed(2)}°</p>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📟 Serial Monitor</h3>
            <div style={{
              background: '#1e1e1e',
              color: '#00ff00',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #333'
            }}>
              {serialOutput.length === 0 ? (
                <div style={{ color: '#666' }}>Connect to Arduino to see serial output...</div>
              ) : (
                serialOutput.map((output, index) => (
                  <div key={index}>{output}</div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <h3>✅ Encoder Setup Checklist</h3>
            <ol>
              <li>Upload the EncoderReader sketch to Arduino Mega</li>
              <li>Wire encoder: <strong>Phase A→Pin 2, Phase B→Pin 3</strong></li>
              <li>Connect power: <strong>Red→5V, Black→GND, Gold→GND</strong></li>
              <li>Install 4.7kΩ pull-up resistors on both phases</li>
              <li>Click "Connect Arduino" to start monitoring</li>
              <li>Rotate encoder manually to test functionality</li>
              <li>Verify direction detection and pulse counting</li>
              <li>Test reset and calibration functions</li>
            </ol>
          </div>
        </div>
      );
    }

    // Simulation Comparison Controls
    if (subModule.id === 'simulation-comparison') {
      return (
        <div className="study-content">
          {renderConnectionPanel()}

          <div className="section">
            <h3>🔬 Real-time System Comparison</h3>
            <div className="control-section">
              <div style={{
                background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                padding: '1.5rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                border: '2px solid #2196F3',
                boxShadow: '0 4px 8px rgba(33, 150, 243, 0.1)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', color: '#1976d2', display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: '8px', fontSize: '1.2em' }}>⚖️</span>
                  Simulation vs Hardware - Live Status
                </h4>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '1rem',
                  fontSize: '0.95rem' 
                }}>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🎯 Reference Speed
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#d32f2f' }}>
                      {referenceSpeed} RPM
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      🖥️ Simulated Speed
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#9c27b0' }}>
                      {simulatedSpeed.toFixed(1)} RPM
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      ⚙️ Actual Speed
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#2e7d32' }}>
                      {actualSpeed.toFixed(1)} RPM
                    </div>
                  </div>
                  <div style={{ 
                    background: 'rgba(255,255,255,0.7)', 
                    padding: '0.75rem', 
                    borderRadius: '8px',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}>
                    <div style={{ color: '#1976d2', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      📊 Status
                    </div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: comparisonActive ? '#f57c00' : '#2e7d32' }}>
                      {comparisonActive ? 'Running' : 'Stopped'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#333' }}>
                  Reference Speed (RPM: 0-600)
                </label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="600"
                    value={referenceSpeed}
                    onChange={(e) => handleReferenceSpeedChange(parseInt(e.target.value))}
                    className="slider"
                    disabled={!isConnected}
                    style={{ width: '100%', height: '8px' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#f5f5f5',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#1976d2', fontSize: '1.2rem' }}>
                      Target: <span style={{ color: '#d32f2f' }}>{referenceSpeed} RPM</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="control-group">
                <label>System Control</label>
                <div className="direction-controls">
                  <button
                    className={`btn btn-small ${comparisonActive ? 'btn-warning' : 'btn-success'}`}
                    onClick={comparisonActive ? stopSimulationComparison : startSimulationComparison}
                    disabled={!isConnected}
                  >
                    {comparisonActive ? '⏹️ Stop Comparison' : '▶️ Start Comparison'}
                  </button>
                </div>
              </div>

              <div className="control-group">
                <label>PID Parameters (Simulation & Hardware)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Kp (Proportional)</label>
                    <input
                      type="number"
                      value={simulationParams.kp}
                      onChange={(e) => handlePIDParameterChange('kp', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="10"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Ki (Integral)</label>
                    <input
                      type="number"
                      value={simulationParams.ki}
                      onChange={(e) => handlePIDParameterChange('ki', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="1"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.9rem', color: '#666' }}>Kd (Derivative)</label>
                    <input
                      type="number"
                      value={simulationParams.kd}
                      onChange={(e) => handlePIDParameterChange('kd', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      max="1"
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section">
            <h3>📊 Real-time Comparison Plot</h3>
            <RealTimePlot 
              plotData={plotData}
              referenceSpeed={referenceSpeed}
              simulatedSpeed={simulatedSpeed}
              actualSpeed={actualSpeed}
              comparisonActive={comparisonActive}
            />
          </div>

          <div className="section">
            <h3>📟 Serial Monitor</h3>
            <div style={{
              background: '#1e1e1e',
              color: '#00ff00',
              padding: '1rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              height: '200px',
              overflowY: 'auto',
              border: '1px solid #333'
            }}>
              {serialOutput.length === 0 ? (
                <div style={{ color: '#666' }}>Connect to Arduino to see serial output...</div>
              ) : (
                serialOutput.map((output, index) => (
                  <div key={index}>{output}</div>
                ))
              )}
            </div>
          </div>

          <div className="section">
            <h3>✅ Comparison Setup Checklist</h3>
            <ol>
              <li>Upload the ClosedLoopControl sketch to Arduino Mega</li>
              <li>Wire DC Motor: <strong>IN1→Pin 8, IN2→Pin 7, ENA→Pin 9</strong></li>
              <li>Wire Encoder: <strong>Phase A→Pin 2, Phase B→Pin 3</strong></li>
              <li>Connect 12V power supply and encoder power (5V)</li>
              <li>Click "Connect Arduino" above</li>
              <li>Set desired reference speed (0-600 RPM)</li>
              <li>Adjust PID parameters as needed</li>
              <li>Click "Start Comparison" to begin real-time testing</li>
              <li>Observe simulation vs hardware performance</li>
            </ol>
          </div>
        </div>
      );
    }

    // Fallback (should not reach here)
    return null;
  };

  return (
    <div className="study-container">
      <div className="study-header" style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        background: 'white', 
        zIndex: 1000,
        padding: '1rem 2rem',
        borderBottom: '2px solid #e9ecef',
        display: 'flex',
        alignItems: 'center'
      }}>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <h2 className="study-title">Study Mode: {module.replace('-', ' ').toUpperCase()}</h2>
      </div>
      
      <div style={{ marginTop: '80px' }}>
        {renderSubModuleSelector()}
        <div style={{ display: 'flex', minHeight: 'calc(100vh - 140px)' }}>
          {renderContent()}
          {renderControls()}
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
