# 🧪 Plug-and-Play Testing Guide

**Quick Start for Your 12V 600RPM DC Motor Setup**

This guide will get you testing your control system in under 10 minutes!

## 🔌 Hardware Checklist

Before starting, ensure you have:
- ✅ Arduino Mega 2560 (connected via USB)
- ✅ L298N Motor Driver Module  
- ✅ 12V 600RPM DC Motor (your specs: 4-15kgcm torque, 100mA-1.9A)
- ✅ 12V Power Supply (2A recommended)
- ✅ Jumper wires
- ✅ Chrome or Edge browser (Web Serial API required)

## 🔧 Quick Wiring Setup

### L298N Motor Driver Connections
```
Arduino Mega → L298N
Pin 8      → IN1    (Direction Control 1)
Pin 7      → IN2    (Direction Control 2) 
Pin 9      → ENA    (Speed Control - PWM)
5V         → VCC    (Logic Power)
GND        → GND    (Ground)

Motor Connections:
12V DC Motor → OUT1 & OUT2 (on L298N)
12V Supply   → VIN (on L298N) - Red wire
12V Supply   → GND (on L298N) - Black wire
```

### Visual Wiring Check
```
Arduino Mega 2560
    [8] ──────── IN1 [L298N]
    [7] ──────── IN2 [L298N]  
    [9] ──────── ENA [L298N]
   [5V] ──────── VCC [L298N]
  [GND] ──────── GND [L298N]
                 
                  Motor
                   [M]
                    |
              OUT1  |  OUT2
               └────┴────┘
                 [L298N]
                    |
                [12V Supply]
```

## 🚀 Step-by-Step Testing

### Step 1: Software Setup (2 minutes)
```bash
# Navigate to project
cd control-system-ui/frontend

# Install dependencies (if not done)
npm install

# Start development server
npm start
```
✅ **Expected**: Browser opens to `http://localhost:3000`

### Step 2: Arduino Upload (3 minutes)
1. Open Arduino IDE
2. Open: `control-system-ui/arduino/MotorTest/MotorTest.ino`
3. Select: **Tools > Board > Arduino Mega 2560**
4. Select: **Tools > Port > [Your Arduino Port]**
5. Click: **Upload** button
6. ✅ **Expected**: "Done uploading" message

### Step 3: Hardware Connection Test (2 minutes)
1. Power on your 12V supply
2. Open the web app (localhost:3000)
3. Click: **"Rotary Inverted Pendulum"**
4. Click: **"Study Mode"**
5. Click: **"Connect to Arduino"** 
6. Select your Arduino port from dropdown
7. ✅ **Expected**: "Connected" status with green indicator

### Step 4: Motor Function Test (3 minutes)

#### Basic Movement Test
1. Navigate to **"DC Motor Basics"** section
2. Use the **Motor Speed Control** slider
3. Start with PWM value: **100** (≈235 RPM)
4. Click: **▶️ Forward** button
5. ✅ **Expected**: Motor rotates clockwise

#### Speed Verification Test
Test these speed points:
- **PWM 64** → **150 RPM** (25% speed)
- **PWM 127** → **300 RPM** (50% speed)  
- **PWM 191** → **450 RPM** (75% speed)
- **PWM 255** → **600 RPM** (100% speed)

#### Direction Test
1. Set PWM to **150**
2. Test all buttons:
   - **▶️ Forward** (clockwise rotation)
   - **◀️ Reverse** (counter-clockwise)
   - **⏹️ Stop** (motor stops)

## 📊 Live Monitoring Dashboard

Your enhanced control panel now shows:

### Real-Time Status Cards
- **🔄 Current Speed**: Live RPM calculation
- **⚡ Power Output**: Percentage of maximum power  
- **🔌 Est. Current**: Estimated current draw (100-1900mA range)

### Enhanced PWM Control
- **Large RPM Display**: Real-time speed feedback
- **PWM/RPM Dual Display**: Both values side-by-side
- **Improved Visual Feedback**: Color-coded status indicators

## ✅ Success Indicators

### ✅ Everything Working Properly
- **Connection**: Green "Connected" status
- **Motor Response**: Smooth speed changes with slider
- **Direction Control**: All three buttons (Forward/Reverse/Stop) work
- **Live Feedback**: RPM display updates in real-time
- **Current Draw**: Values between 100-1900mA depending on speed

### ❌ Troubleshooting Common Issues

#### "Port Not Found"
```bash
# Check Arduino connection
ls /dev/tty.usb*  # macOS
# OR check Arduino IDE Tools > Port menu
```
**Solution**: Reconnect USB cable, restart Arduino IDE

#### "Motor Not Moving"
**Check**:
- 12V power supply connected and ON
- Wiring matches diagram above  
- Arduino uploaded successfully
- Try higher PWM value (start with 150+)

#### "Wrong Direction"
**Solution**: Swap motor wires on OUT1/OUT2 terminals

#### "Jerky Movement"
**Possible causes**:
- Insufficient power supply current
- Loose connections
- PWM value too low (try 100+ minimum)

## 🎯 Advanced Testing (Optional)

### Motor Characteristic Testing
1. **No-Load Speed Test**: Run at full PWM (255) and verify ≈600 RPM
2. **Starting Torque Test**: Find minimum PWM where motor starts (usually 80-120)
3. **Load Response Test**: Add mechanical load and observe current increase

### Current Monitoring
- **Idle (PWM 0)**: ≈100mA (driver quiescent current)
- **Light Load (PWM 127)**: ≈1000mA 
- **Full Speed (PWM 255)**: ≈1900mA maximum

## 🔄 Next Steps: Experiment Mode

Once basic testing passes:

1. **Upload Pendulum Sketch**:
   - File: `arduino/PendulumControl/PendulumControl.ino`
   - This includes encoder support and PID control

2. **Add Rotary Encoder** (for pendulum angle measurement):
   - Channel A → Pin A2
   - Channel B → Pin A3

3. **Switch to Experiment Mode**:
   - Real-time plotting
   - Automated pin testing
   - PID pendulum balancing

## 📞 Support

If you encounter any issues:
1. Check all wiring connections
2. Verify Arduino sketch uploaded successfully  
3. Ensure 12V power supply is adequate (2A minimum)
4. Try different USB cable/port
5. Restart browser and try again

## 🎉 Success!

If your motor is responding to the web interface controls, congratulations! You now have a working control system platform ready for advanced experiments.

**Your 600RPM motor should be smoothly responding to PWM commands with live RPM feedback displayed in the enhanced UI.**

---

*Happy Testing! 🚀*
