# 🔧 Hardware Guide

## **📋 Complete Parts List**

### **Core Components**

| Component | Specification | Quantity | Est. Cost | Purpose |
|-----------|---------------|----------|-----------|---------|
| **Arduino Mega 2560** | ATmega2560, 54 I/O pins | 1 | $25-35 | Main microcontroller |
| **L298N Motor Driver** | Dual H-Bridge, 2A per channel | 1 | $8-12 | Safe motor control |
| **DC Geared Motor** | 12V, 600RPM, 4-15kg⋅cm | 1 | $15-25 | Primary actuator |
| **Power Supply** | 12V, 2A minimum | 1 | $12-18 | System power |
| **Rotary Encoder** | 600 P/R, 5V compatible | 1 | $10-15 | Position feedback |

### **Connection Hardware**

| Component | Specification | Quantity | Purpose |
|-----------|---------------|----------|---------|
| **Jumper Wires** | Male-to-Male, 20cm | 20 | Connections |
| **Breadboard** | Half-size, 400 tie points | 1 | Prototyping |
| **USB Cable** | Type A to Type B | 1 | Arduino programming |
| **Terminal Blocks** | 2-pin, 5mm pitch | 4 | Secure connections |
| **Heat Shrink Tubing** | Assorted sizes | 1 pack | Wire protection |

### **Mechanical Components**

| Component | Specification | Quantity | Purpose |
|-----------|---------------|----------|---------|
| **Mounting Bracket** | Aluminum, motor compatible | 1 | Motor mounting |
| **Coupling** | 5mm to 6mm shaft | 1 | Encoder connection |
| **Fasteners** | M3 bolts and nuts | 10 | Assembly |
| **Base Plate** | Acrylic/wood, 200x300mm | 1 | Project base |

---

## **🛒 Sourcing Guide**

### **Recommended Suppliers**

#### **Arduino & Electronics**
- **Arduino Official** - Guaranteed authentic boards
- **Adafruit** - High-quality components, excellent documentation
- **SparkFun** - Educational focus, good tutorials
- **DigiKey/Mouser** - Professional components, bulk pricing

#### **Motors & Mechanical**
- **Pololu** - Precision motors and encoders
- **AndyMark** - Educational robotics components
- **McMaster-Carr** - Professional mechanical hardware
- **Local Suppliers** - Faster shipping, lower costs

#### **Budget Options**
- **Amazon** - Fast shipping, easy returns
- **AliExpress** - Lower costs, longer shipping
- **eBay** - Good for surplus/used components

### **Quality Considerations**

#### **⭐ Premium Choice (Recommended)**
- **Total Cost**: ~$120-150
- **Arduino Mega 2560 R3** (Official)
- **Pololu 25D Metal Gearmotor**
- **CUI Inc AMT102-V Encoder**
- **TI DRV8833 Motor Driver**

#### **💰 Budget Build**
- **Total Cost**: ~$60-80
- **Arduino Mega 2560 (Compatible)**
- **Generic DC Geared Motor**
- **Simple Optical Encoder**
- **L298N Motor Driver**

#### **🎓 Educational Kit**
- **Total Cost**: ~$90-110
- **Arduino Education Kit Components**
- **Documented motor specifications**
- **Pre-tested compatibility**

---

## **🔌 Wiring Diagrams**

### **Basic Motor Control Setup**

```
Arduino Mega 2560           L298N Motor Driver
                   
    Pin 8  ────────────────→ IN1
    Pin 7  ────────────────→ IN2  
    Pin 9  ────────────────→ ENA
    5V     ────────────────→ VCC
    GND    ────────────────→ GND
                           
                            OUT1 ──┐
                            OUT2 ──┼── DC Motor
                            
    12V+ ──────────────────→ VIN
    12V- ──────────────────→ GND
```

### **With Encoder Feedback**

```
Arduino Mega 2560           Rotary Encoder
                   
    Pin A2 ─────────────────→ Channel A
    Pin A3 ─────────────────→ Channel B  
    5V     ─────────────────→ VCC
    GND    ─────────────────→ GND
```

### **Complete System Diagram**

```
[12V Power Supply]
      │
      ├─→ [L298N Motor Driver] ─→ [DC Geared Motor]
      │                                    │
      │                               [Rotary Encoder]
      │                                    │
      └─→ [Arduino Mega 2560] ←──────────┘
              │
          [USB to Computer]
```

---

## **⚡ Power Requirements**

### **Power Budget Analysis**

| Component | Voltage | Current | Power |
|-----------|---------|---------|-------|
| **Arduino Mega** | 5V | 200mA | 1W |
| **L298N Logic** | 5V | 50mA | 0.25W |
| **Motor (No Load)** | 12V | 100mA | 1.2W |
| **Motor (Loaded)** | 12V | 1.5A | 18W |
| **Encoder** | 5V | 20mA | 0.1W |
| **Total Maximum** | - | - | **~20W** |

### **Power Supply Selection**

#### **Minimum Requirements**
- **Voltage**: 12V ±5%
- **Current**: 2A continuous
- **Regulation**: <5% ripple
- **Protection**: Over-current, short-circuit

#### **Recommended Specifications**
- **Wall Adapter**: 12V 3A switching supply
- **Lab Supply**: Variable 0-15V, 0-3A
- **Battery**: 12V sealed lead-acid, 7Ah minimum

---

## **🔧 Assembly Instructions**

### **Step 1: Base Assembly**
1. Mount Arduino Mega to base plate using standoffs
2. Position L298N motor driver nearby
3. Install motor mounting bracket
4. Ensure adequate ventilation around components

### **Step 2: Motor Installation**
1. Secure motor to mounting bracket
2. Align encoder coupling with motor shaft
3. Connect encoder to motor shaft (if using)
4. Verify smooth rotation without binding

### **Step 3: Electrical Connections**
1. **Power OFF** - Ensure all power is disconnected
2. Wire L298N motor driver according to pin diagram
3. Connect motor to OUT1 and OUT2 terminals
4. Wire encoder connections (if using)
5. Double-check all connections before applying power

### **Step 4: Testing**
1. Connect Arduino to computer via USB
2. Upload test sketch from Arduino IDE
3. Apply 12V power to motor driver
4. Test basic motor functions:
   - Forward rotation
   - Reverse rotation
   - Speed control
   - Emergency stop

---

## **⚠️ Safety Guidelines**

### **Electrical Safety**
- **Never work on live circuits**
- **Check polarity** before connecting power
- **Use fuses** in power supply lines
- **Inspect wires** for damage regularly

### **Mechanical Safety**
- **Secure all fasteners** to prevent loosening
- **Guard rotating parts** to prevent injury
- **Emergency stop** easily accessible
- **Stable mounting** to prevent tipping

### **Operational Safety**
- **Start with low speeds** when testing
- **Monitor current draw** during operation
- **Have fire extinguisher** nearby when developing
- **Never leave unattended** during initial testing

---

## **🔍 Troubleshooting**

### **Motor Not Responding**
1. Check 12V power supply connection
2. Verify Arduino sketch uploaded correctly
3. Test L298N enable pin (ENA) signal
4. Measure voltage at motor terminals

### **Erratic Motor Behavior**
1. Check for loose connections
2. Verify adequate power supply current rating
3. Add capacitors across motor terminals
4. Check for electromagnetic interference

### **Encoder Issues**
1. Verify 5V power to encoder
2. Check signal connections (A2, A3)
3. Test encoder wheel alignment
4. Verify encoder compatibility (5V logic)

### **Communication Problems**
1. Ensure correct COM port selected
2. Check USB cable connection
3. Verify baud rate (9600)
4. Close other applications using serial port

---

## **📈 Upgrades & Modifications**

### **Performance Upgrades**
- **Higher Resolution Encoder** - 1000+ P/R for finer control
- **Servo Motor** - Built-in position feedback
- **Stepper Motor** - Precise positioning without encoder
- **Current Sensing** - Monitor actual motor load

### **Safety Enhancements**
- **Current Limiting** - Protect against overcurrent
- **Emergency Stop Button** - Hardware-level shutdown
- **Fault Indicators** - LED status displays
- **Thermal Protection** - Temperature monitoring

### **Educational Extensions**
- **Multiple Motors** - Multi-axis control systems
- **Sensors** - Temperature, pressure, vibration
- **Communication** - Wireless control and monitoring
- **Data Logging** - Long-term performance analysis

---

**🎯 This hardware setup provides a robust foundation for control systems education and experimentation!**
