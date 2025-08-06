import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import serialHandler from '../utils/SerialHandler';

const StudyMode = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [motorDirection, setMotorDirection] = useState('STOP');
  const [serialOutput, setSerialOutput] = useState([]);
  const [activeSubModule, setActiveSubModule] = useState(0);

  useEffect(() => {
    // Set up serial response handler
    serialHandler.onResponse('ALL', (response) => {
      setSerialOutput(prev => [...prev.slice(-10), response]); // Keep last 10 responses
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
          <h3>� System Components</h3>
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
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>🎯 Stepper Motors for Precision Control</h3>
          <p>
            Stepper motors provide precise angular positioning without feedback sensors. 
            They're ideal for applications requiring accurate positioning and repeatability.
          </p>
          
          <div style={{ 
            background: '#fff3e0', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #ff9800'
          }}>
            <h4>🔄 Why Stepper for Pendulum?</h4>
            <ul>
              <li><strong>Precise Positioning:</strong> Exact angular control</li>
              <li><strong>No Encoder Needed:</strong> Open-loop positioning</li>
              <li><strong>High Torque at Low Speed:</strong> Good for balancing</li>
              <li><strong>Repeatability:</strong> Consistent positioning</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>⚡ Stepper Motor Types</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
              <h4>🔩 Bipolar Stepper</h4>
              <p>4-wire configuration, higher torque, requires H-bridge driver</p>
              <div className="pin-diagram">
{`NEMA 17 Bipolar:
Coil A+  ─┐
Coil A-  ─┼─ Phase A
Coil B+  ─┼─ Phase B  
Coil B-  ─┘`}
              </div>
            </div>
            <div style={{ background: '#f3e5f5', padding: '1rem', borderRadius: '8px' }}>
              <h4>🔄 Unipolar Stepper</h4>
              <p>5/6-wire configuration, easier to drive, lower torque</p>
              <div className="pin-diagram">
{`28BYJ-48 Unipolar:
Phase A   ─┐
Common    ─┼─ Center tap
Phase B   ─┘`}
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>🔌 Stepper Driver Connections</h3>
          <div className="pin-diagram">
{`A4988 Driver → Arduino Mega:
STEP → Pin 3  (Step pulse)
DIR  → Pin 4  (Direction)  
EN   → Pin 5  (Enable)

A4988 → NEMA 17 Stepper:
1A   → Coil A+
1B   → Coil A-
2A   → Coil B+
2B   → Coil B-

Power:
VDD  → Arduino 5V
GND  → Arduino GND
VMOT → 12V Supply
GND  → Supply GND`}
          </div>
        </div>

        <div className="section">
          <h3>💻 Stepper Control Code</h3>
          <SyntaxHighlighter 
            language="cpp" 
            style={vscDarkPlus}
            customStyle={{
              fontSize: '0.85rem',
              lineHeight: '1.4',
              borderRadius: '8px'
            }}
          >
{`// Stepper Motor Control for Pendulum
#include <AccelStepper.h>

// Pin definitions
#define STEP_PIN 3
#define DIR_PIN  4
#define EN_PIN   5

// Create stepper object
AccelStepper stepper(AccelStepper::DRIVER, STEP_PIN, DIR_PIN);

void setup() {
  Serial.begin(9600);
  
  // Configure stepper
  stepper.setMaxSpeed(1000);    // Steps per second
  stepper.setAcceleration(500); // Steps per second²
  
  // Enable driver
  pinMode(EN_PIN, OUTPUT);
  digitalWrite(EN_PIN, LOW);    // Enable driver
  
  Serial.println("Stepper Ready!");
}

void loop() {
  // Move to angle (in steps)
  if (Serial.available()) {
    int angle = Serial.parseInt();
    int steps = angle * 200 / 360; // Convert to steps
    stepper.moveTo(steps);
  }
  
  stepper.run(); // Must be called continuously
}`}
          </SyntaxHighlighter>
        </div>

        <div className="section">
          <h3>📐 Step Calculations</h3>
          <div className="pin-diagram">
{`Step Resolution Calculations:
NEMA 17: 200 steps/revolution (1.8°/step)
With 1/16 microstepping: 3200 steps/revolution

For pendulum angle control:
Steps per degree = 3200 / 360 = 8.89 steps/°

Example movements:
 90° → 800 steps
180° → 1600 steps  
360° → 3200 steps`}
          </div>
        </div>
      </div>
    );
  };

  const renderEncodersContent = () => {
    return (
      <div className="study-sidebar">
        <div className="section">
          <h3>📡 Rotary Encoders for Feedback</h3>
          <p>
            Rotary encoders provide essential position and velocity feedback for control systems. 
            They convert rotational motion into digital signals for precise measurement.
          </p>
          
          <div style={{ 
            background: '#e8f5e8', 
            padding: '1rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            borderLeft: '4px solid #4CAF50'
          }}>
            <h4>📊 Why Encoders are Critical</h4>
            <ul>
              <li><strong>Position Feedback:</strong> Know exact pendulum angle</li>
              <li><strong>Velocity Calculation:</strong> Compute angular velocity</li>
              <li><strong>Closed-loop Control:</strong> Enable feedback control</li>
              <li><strong>High Resolution:</strong> Precise measurements</li>
            </ul>
          </div>
        </div>

        <div className="section">
          <h3>🔄 Encoder Types</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
              <h4>📈 Incremental Encoder</h4>
              <p>Provides relative position through pulse counting</p>
              <ul>
                <li>A/B quadrature outputs</li>
                <li>Common: 1024 PPR</li>
                <li>Requires initialization</li>
              </ul>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '8px' }}>
              <h4>🎯 Absolute Encoder</h4>
              <p>Provides absolute position at power-on</p>
              <ul>
                <li>Digital/Analog output</li>
                <li>No initialization needed</li>
                <li>More expensive</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>🔌 Encoder Wiring (Incremental)</h3>
          <div className="pin-diagram">
{`Rotary Encoder → Arduino Mega:
VCC     → 5V
GND     → GND  
Channel A → Pin A2 (Interrupt 0)
Channel B → Pin A3 (Interrupt 1)
Index (Z) → Pin A4 (Optional)

Signal Characteristics:
• 5V TTL logic levels
• Quadrature phase relationship
• A leads B for clockwise rotation
• B leads A for counter-clockwise`}
          </div>
        </div>

        <div className="section">
          <h3>💻 Encoder Reading Code</h3>
          <SyntaxHighlighter 
            language="cpp" 
            style={vscDarkPlus}
            customStyle={{
              fontSize: '0.85rem',
              lineHeight: '1.4',
              borderRadius: '8px'
            }}
          >
{`// Rotary Encoder Reading with Interrupts
#define ENCODER_A A2
#define ENCODER_B A3

volatile long encoderCount = 0;
volatile int lastEncoded = 0;

void setup() {
  Serial.begin(9600);
  
  // Set encoder pins as inputs with pullups
  pinMode(ENCODER_A, INPUT_PULLUP);
  pinMode(ENCODER_B, INPUT_PULLUP);
  
  // Attach interrupts
  attachInterrupt(digitalPinToInterrupt(ENCODER_A), 
                  updateEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(ENCODER_B), 
                  updateEncoder, CHANGE);
                  
  Serial.println("Encoder Ready!");
}

void loop() {
  // Calculate angle (1024 PPR encoder)
  float angle = (encoderCount * 360.0) / 1024.0;
  
  Serial.print("Angle: ");
  Serial.print(angle, 2);
  Serial.println("°");
  
  delay(100);
}

void updateEncoder() {
  int MSB = digitalRead(ENCODER_A);
  int LSB = digitalRead(ENCODER_B);
  
  int encoded = (MSB << 1) | LSB;
  int sum = (lastEncoded << 2) | encoded;
  
  if(sum == 0b1101 || sum == 0b0100 || 
     sum == 0b0010 || sum == 0b1011) {
    encoderCount++;
  }
  if(sum == 0b1110 || sum == 0b0111 || 
     sum == 0b0001 || sum == 0b1000) {
    encoderCount--;
  }
  
  lastEncoded = encoded;
}`}
          </SyntaxHighlighter>
        </div>

        <div className="section">
          <h3>📐 Resolution Calculations</h3>
          <div className="pin-diagram">
{`Encoder Resolution Examples:
1024 PPR Encoder:
• 1024 pulses per revolution
• 360° ÷ 1024 = 0.35°/pulse
• High precision for pendulum

2048 PPR Encoder:
• 2048 pulses per revolution  
• 360° ÷ 2048 = 0.176°/pulse
• Ultra-high precision

Velocity Calculation:
ω = (Δθ / Δt) where:
ω = angular velocity (rad/s)
Δθ = change in angle
Δt = time interval`}
          </div>
        </div>
      </div>
    );
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
      case 'hardware-design':
        return renderHardwareDesignContent();
      default:
        return renderDCMotorContent();
    }
  };

  const renderControls = () => {
    // Only show controls for DC motor sub-module
    if (subModules[activeSubModule].id !== 'dc-motor') {
      return (
        <div className="study-content">
          <div className="section">
            <h3>� Learning Module: {subModules[activeSubModule].title}</h3>
            <div style={{
              background: '#f8f9fa',
              padding: '2rem',
              borderRadius: '10px',
              textAlign: 'center',
              border: '2px dashed #dee2e6'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {subModules[activeSubModule].icon}
              </div>
              <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                {subModules[activeSubModule].description}
              </p>
              {activeSubModule !== 1 && (
                <div style={{ 
                  marginTop: '2rem', 
                  padding: '1rem', 
                  background: '#e3f2fd', 
                  borderRadius: '8px' 
                }}>
                  <p style={{ margin: 0, color: '#1976d2' }}>
                    💡 <strong>Interactive controls are available in the DC Motor module</strong>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="study-content">
        <div className="section">
          <h3>�🔌 Board Connection</h3>
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
              ⚠️ <strong>Updated Pin Configuration:</strong> IN1→Pin 8, IN2→Pin 7, ENA→Pin 9
            </div>
          </div>
        </div>

        <div className="section">
          <h3>🎛️ Motor Controls</h3>
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
            <li>Upload the updated MotorTest sketch to Arduino Mega</li>
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
