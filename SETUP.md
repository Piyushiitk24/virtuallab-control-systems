# Setup Guide - Control System Experiment UI

## 📋 Quick Setup Checklist

### ✅ Prerequisites
- [ ] Google Chrome 89+ installed
- [ ] Arduino IDE 1.8.x or 2.x installed
- [ ] Node.js 14+ and npm installed
- [ ] Git installed

### ✅ Hardware Assembly
- [ ] Arduino Mega 2560 connected via USB
- [ ] L298N motor driver wired correctly
- [ ] DC motor connected to L298N outputs
- [ ] Rotary encoder connected (for experiment mode)
- [ ] 12V power supply connected

### ✅ Software Setup
- [ ] Project cloned/downloaded
- [ ] Dependencies installed (`npm install`)
- [ ] Arduino sketch uploaded
- [ ] Development server running (`npm start`)

---

## 🔧 Detailed Setup Instructions

### 1. Hardware Preparation

#### Required Components
```
Essential Hardware:
├── Arduino Mega 2560
├── L298N Motor Driver Module  
├── DC Geared Motor (12V, 2A max)
├── Rotary Encoder (1024 PPR recommended)
├── 12V Power Supply (3A minimum)
├── Jumper Wires (Male-Male, Male-Female)
├── Breadboard (optional)
└── USB Cable (Arduino to Computer)

Pendulum Assembly:
├── Aluminum rod (0.3m length)
├── Mass (0.1kg weight at end)
├── Arm attachment (0.2m length)
└── Mounting hardware
```

#### Wiring Diagram
```
Arduino Mega → L298N Motor Driver:
Pin 6  → IN1  (Direction Control 1)
Pin 7  → IN2  (Direction Control 2)  
Pin 9  → ENA  (PWM Speed Control)
GND    → GND  (Common Ground)

L298N → DC Motor:
OUT1   → Motor Terminal 1
OUT2   → Motor Terminal 2

L298N → Power Supply:
+12V   → Positive Terminal
GND    → Negative Terminal

Arduino Mega → Rotary Encoder (Experiment Mode):
Pin A2 → Channel A
Pin A3 → Channel B
+5V    → VCC
GND    → GND
```

### 2. Software Installation

#### Step 1: Install Node.js and npm
```bash
# Check if already installed
node --version
npm --version

# If not installed, download from: https://nodejs.org/
```

#### Step 2: Clone and Setup Project
```bash
# Clone or download project
git clone <repository-url>
cd control-system-ui

# Install frontend dependencies
cd frontend
npm install

# Return to project root
cd ..
```

#### Step 3: Arduino IDE Setup
```bash
# Install Arduino IDE from: https://arduino.cc/downloads
# Install required libraries:
# - TimerOne library (for PendulumControl sketch)
```

### 3. Arduino Firmware Upload

#### For Study Mode (Basic Motor Control):
1. Open Arduino IDE
2. Load `arduino/MotorTest/MotorTest.ino`
3. Select Board: "Arduino Mega or Mega 2560"
4. Select correct COM port
5. Click Upload
6. Verify "READY" message in Serial Monitor

#### For Experiment Mode (Advanced PID Control):
1. Open Arduino IDE  
2. Load `arduino/PendulumControl/PendulumControl.ino`
3. Install TimerOne library if prompted
4. Select Board: "Arduino Mega or Mega 2560"
5. Select correct COM port
6. Click Upload
7. Verify "READY" and "PID Controller initialized" in Serial Monitor

### 4. Web Application Launch

```bash
# Navigate to frontend directory
cd frontend

# Start development server
npm start

# Application should open at http://localhost:3000
# If not, manually open Chrome and navigate to the URL
```

---

## 🧪 Testing Procedures

### Pre-Flight Checks
1. **Power Supply**: Verify 12V, 3A supply connected and powered
2. **Arduino Connection**: Check USB cable and driver installation
3. **Wiring**: Double-check all connections match the diagram
4. **Browser**: Confirm Chrome 89+ is being used

### Study Mode Test
1. Upload `MotorTest.ino` to Arduino
2. Navigate to Study Mode from home page
3. Click "Connect Arduino" 
4. Test speed slider (0-255 range)
5. Test direction buttons (Forward/Reverse/Stop)
6. Verify serial output in the monitor

### Experiment Mode Test
1. Upload `PendulumControl.ino` to Arduino
2. Complete hardware assembly with pendulum
3. Navigate to Experiment Mode from home page
4. Click "Connect Arduino"
5. Verify all pin checks show green (OK status)
6. Set PID parameters (start with defaults)
7. Click "Start Balancing"
8. Observe real-time angle plot

---

## 🐛 Troubleshooting Guide

### Connection Issues

**"Web Serial API not supported"**
```
Solution: Use Google Chrome 89+ or Microsoft Edge 89+
Firefox and Safari do not support Web Serial API
```

**"No Arduino detected"**
```
Check List:
□ USB cable connected securely
□ Arduino driver installed correctly  
□ Correct COM port selected in Arduino IDE
□ Arduino not in use by another application
□ Try different USB port or cable
```

**"Permission denied"**
```
Solution: 
- Grant serial port permission when prompted
- Restart browser if permission was previously denied
- On Windows: Check COM port is not in use
```

### Hardware Issues

**"Pin test failed"**
```
Troubleshooting:
□ Verify wiring matches diagram exactly
□ Check for loose connections
□ Test continuity with multimeter
□ Ensure Arduino sketch uploaded correctly
□ Check for short circuits
```

**"Motor not responding"**
```
Check List:
□ 12V power supply connected and switched on
□ L298N power LED illuminated
□ Motor connections secure
□ PWM value > 0 (check speed slider)
□ Direction pins set correctly
```

**"Encoder not working"**
```
Solutions:
□ Verify encoder power (5V) connected
□ Check encoder signal wires (A2, A3)
□ Ensure encoder is mechanically coupled
□ Test encoder with multimeter (should see voltage changes)
```

### Software Issues

**"Compilation errors"**
```
Arduino IDE Issues:
□ Install TimerOne library (Tools > Library Manager)
□ Select correct board (Arduino Mega 2560)
□ Check for syntax errors in sketch
□ Update Arduino IDE to latest version
```

**"React app not starting"**
```
Frontend Issues:
□ Run 'npm install' in frontend directory
□ Check Node.js version (14+ required)
□ Clear npm cache: 'npm cache clean --force'
□ Delete node_modules and reinstall
```

**"Chart not updating"**
```
Data Visualization:
□ Check browser console for JavaScript errors
□ Verify Arduino is sending data (Serial Monitor)
□ Refresh browser page
□ Check serial communication is active
```

---

## 📚 Educational Usage Guide

### For Students
1. **Start with Study Mode**: Learn basic motor control concepts
2. **Understand the Code**: Review Arduino sketches and React components  
3. **Experiment Safely**: Always verify connections before powering on
4. **Document Results**: Take screenshots of successful experiments

### For Educators  
1. **Pre-class Setup**: Test all hardware setups beforehand
2. **Safety Brief**: Review electrical safety and proper handling
3. **Learning Objectives**: Define clear goals for each exercise
4. **Assessment**: Use the built-in testing features for evaluation

### Curriculum Integration
- **Control Theory**: PID controllers, feedback systems
- **Programming**: Arduino C++, JavaScript/React
- **Electronics**: Motor drivers, PWM, encoders  
- **Mechanical**: Pendulum dynamics, system modeling

---

## 🔮 Advanced Features

### Custom PID Tuning
```cpp
// Modify these values in PendulumControl.ino
float kp = 100.0;  // Proportional gain
float ki = 10.0;   // Integral gain  
float kd = 1.0;    // Derivative gain
```

### Data Logging
```javascript
// Enable data export in ExperimentMode.js
// Add CSV export functionality for analysis
```

### Multiple Modules
```javascript
// Expand modules array in HomePage.js
// Add new control system experiments
```

---

## 📞 Support and Resources

### Getting Help
- **Documentation**: README.md files in each directory
- **Code Comments**: Extensive inline documentation
- **Serial Monitor**: Use for debugging Arduino communication
- **Browser Console**: Check for JavaScript errors

### Learning Resources
- **Control Theory**: Modern Control Systems by Dorf & Bishop
- **Arduino Programming**: Arduino Programming Language Reference
- **Web Serial API**: MDN Web Serial API Documentation
- **React.js**: Official React documentation

### Community
- **GitHub Issues**: Report bugs and request features
- **Arduino Forums**: Hardware and firmware questions
- **Stack Overflow**: Programming and technical questions

---

**Happy Experimenting! 🚀🔬⚖️**
