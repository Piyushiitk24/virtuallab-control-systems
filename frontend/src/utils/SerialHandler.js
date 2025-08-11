class SerialHandler {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.isConnected = false;
    this.callbacks = new Map();
    this.readBuffer = '';
  }

  // Check if Web Serial API is supported
  isSupported() {
    return 'serial' in navigator;
  }

  // Connect to Arduino
  async connect() {
    try {
      if (!this.isSupported()) {
        throw new Error('Web Serial API not supported in this browser. Please use Chrome 89+ or Edge 89+.');
      }

      // Request port selection
      this.port = await navigator.serial.requestPort();
      
      // Open the port with Arduino standard settings
      await this.port.open({ 
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      // Set up reader and writer
      this.reader = this.port.readable.getReader();
      this.writer = this.port.writable.getWriter();
      this.isConnected = true;

      // Start reading data
      this.startReading();

      // Send handshake
      await this.sendCommand('HANDSHAKE');
      
      return true;
    } catch (error) {
      console.error('Serial connection error:', error);
      throw error;
    }
  }

  // Disconnect from Arduino
  async disconnect() {
    try {
      if (this.reader) {
        await this.reader.cancel();
        await this.reader.releaseLock();
        this.reader = null;
      }

      if (this.writer) {
        await this.writer.releaseLock();
        this.writer = null;
      }

      if (this.port) {
        await this.port.close();
        this.port = null;
      }

      this.isConnected = false;
      this.readBuffer = '';
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  // Send command to Arduino
  async sendCommand(command) {
    if (!this.isConnected || !this.writer) {
      throw new Error('Not connected to Arduino');
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command + '\n');
      await this.writer.write(data);
      console.log('Sent command:', command);
    } catch (error) {
      console.error('Send command error:', error);
      throw error;
    }
  }

  // Start reading data from Arduino
  async startReading() {
    try {
      while (this.reader && this.isConnected) {
        const { value, done } = await this.reader.read();
        
        if (done) {
          break;
        }

        // Decode the received data
        const decoder = new TextDecoder();
        const text = decoder.decode(value);
        this.readBuffer += text;

        // Process complete lines
        this.processBuffer();
      }
    } catch (error) {
      if (this.isConnected) {
        console.error('Read error:', error);
      }
    }
  }

  // Process the read buffer for complete messages
  processBuffer() {
    let lines = this.readBuffer.split('\n');
    
    // Keep the last incomplete line in buffer
    this.readBuffer = lines.pop() || '';
    
    // Process complete lines
    lines.forEach(line => {
      line = line.trim();
      if (line) {
        console.log('Received:', line);
        this.handleResponse(line);
      }
    });
  }

  // Handle responses from Arduino
  handleResponse(response) {
    // Trigger callbacks for specific response patterns
    this.callbacks.forEach((callback, pattern) => {
      if (response.includes(pattern) || pattern === 'ALL') {
        callback(response);
      }
    });
  }

  // Register callback for specific response patterns
  onResponse(pattern, callback) {
    this.callbacks.set(pattern, callback);
  }

  // Remove callback
  removeCallback(pattern) {
    this.callbacks.delete(pattern);
  }

  // Clear all callbacks
  clearCallbacks() {
    this.callbacks.clear();
  }

  // Get connection status
  getConnectionStatus() {
    return this.isConnected;
  }

  // Test specific pin
  async testPin(pinNumber) {
    await this.sendCommand(`TEST_PIN_${pinNumber}`);
  }

  // Set motor speed (0-255)
  async setMotorSpeed(speed) {
    const clampedSpeed = Math.max(0, Math.min(255, speed));
    await this.sendCommand(`SET_SPEED_${clampedSpeed.toString().padStart(3, '0')}`);
  }

  // Set motor direction
  async setMotorDirection(direction) {
    // direction: 'FORWARD', 'REVERSE', 'STOP'
    await this.sendCommand(`SET_DIRECTION_${direction}`);
  }

  // Get pendulum angle
  async getAngle() {
    await this.sendCommand('GET_ANGLE');
  }

  // Start pendulum balancing
  async startBalance() {
    await this.sendCommand('START_BALANCE');
  }

  // Stop pendulum balancing
  async stopBalance() {
    await this.sendCommand('STOP_BALANCE');
  }

  // Set PID parameters
  async setPIDParams(kp, ki, kd) {
    await this.sendCommand(`SET_PID_${kp}_${ki}_${kd}`);
  }

  // Request system status
  async getStatus() {
    await this.sendCommand('GET_STATUS');
  }

  // Stepper Motor Commands
  async stepperMove(steps) {
    await this.sendCommand(`STEPPER_MOVE_${steps}`);
  }

  async stepperSpeed(speed) {
    const clampedSpeed = Math.max(50, Math.min(2000, speed));
    await this.sendCommand(`STEPPER_SPEED_${clampedSpeed}`);
  }

  async stepperStop() {
    await this.sendCommand('STEPPER_STOP');
  }

  async stepperHome() {
    await this.sendCommand('STEPPER_HOME');
  }

  // Rotary Encoder Commands
  async encoderReset() {
    await this.sendCommand('ENCODER_RESET');
  }

  async encoderCalibrate() {
    await this.sendCommand('ENCODER_CALIBRATE');
  }
}

// Create a singleton instance
const serialHandler = new SerialHandler();

export default serialHandler;
