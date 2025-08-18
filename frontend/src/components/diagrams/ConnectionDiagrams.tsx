import React from 'react';
import DiagramWrapper from './DiagramWrapper';
import { DiagramNode, DiagramEdge } from './types';

// Arduino UNO Pin Connection Diagram
export const ArduinoPinDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Arduino UNO
    {
      id: 'arduino',
      type: 'default',
      position: { x: 200, y: 100 },
      data: {
        type: 'arduino',
        label: 'Arduino UNO',
        voltage: '5V',
        current: '40mA',
        description: 'Main microcontroller board',
        pins: [
          'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8',
          'A0', 'A1', 'A2', 'A3', 'A4', 'A5',
          'VIN', '5V', '3.3V', 'GND'
        ]
      }
    },
    
    // Digital Pins
    {
      id: 'pin-d2',
      type: 'default',
      position: { x: 50, y: 50 },
      data: {
        type: 'component',
        label: 'D2',
        description: 'Digital Pin 2'
      }
    },
    {
      id: 'pin-d3',
      type: 'default',
      position: { x: 50, y: 80 },
      data: {
        type: 'component',
        label: 'D3 (PWM)',
        description: 'Digital Pin 3 (PWM Capable)'
      }
    },
    {
      id: 'pin-d4',
      type: 'default',
      position: { x: 50, y: 110 },
      data: {
        type: 'component',
        label: 'D4',
        description: 'Digital Pin 4'
      }
    },
    {
      id: 'pin-d5',
      type: 'default',
      position: { x: 50, y: 140 },
      data: {
        type: 'component',
        label: 'D5 (PWM)',
        description: 'Digital Pin 5 (PWM Capable)'
      }
    },
    {
      id: 'pin-d6',
      type: 'default',
      position: { x: 50, y: 170 },
      data: {
        type: 'component',
        label: 'D6 (PWM)',
        description: 'Digital Pin 6 (PWM Capable)'
      }
    },
    {
      id: 'pin-d7',
      type: 'default',
      position: { x: 50, y: 200 },
      data: {
        type: 'component',
        label: 'D7',
        description: 'Digital Pin 7'
      }
    },
    {
      id: 'pin-d8',
      type: 'default',
      position: { x: 50, y: 230 },
      data: {
        type: 'component',
        label: 'D8',
        description: 'Digital Pin 8'
      }
    },
    
    // Analog Pins
    {
      id: 'pin-a0',
      type: 'default',
      position: { x: 350, y: 50 },
      data: {
        type: 'component',
        label: 'A0',
        description: 'Analog Pin 0'
      }
    },
    {
      id: 'pin-a1',
      type: 'default',
      position: { x: 350, y: 80 },
      data: {
        type: 'component',
        label: 'A1',
        description: 'Analog Pin 1'
      }
    },
    {
      id: 'pin-a2',
      type: 'default',
      position: { x: 350, y: 110 },
      data: {
        type: 'component',
        label: 'A2',
        description: 'Analog Pin 2'
      }
    },
    {
      id: 'pin-a3',
      type: 'default',
      position: { x: 350, y: 140 },
      data: {
        type: 'component',
        label: 'A3',
        description: 'Analog Pin 3'
      }
    },
    {
      id: 'pin-a4',
      type: 'default',
      position: { x: 350, y: 170 },
      data: {
        type: 'component',
        label: 'A4 (SDA)',
        description: 'Analog Pin 4 / I2C Data'
      }
    },
    {
      id: 'pin-a5',
      type: 'default',
      position: { x: 350, y: 200 },
      data: {
        type: 'component',
        label: 'A5 (SCL)',
        description: 'Analog Pin 5 / I2C Clock'
      }
    },
    
    // Power Pins
    {
      id: 'pin-vin',
      type: 'default',
      position: { x: 150, y: 30 },
      data: {
        type: 'power',
        label: 'VIN',
        voltage: '7-12V',
        description: 'External Power Input'
      }
    },
    {
      id: 'pin-5v',
      type: 'default',
      position: { x: 200, y: 30 },
      data: {
        type: 'power',
        label: '5V',
        voltage: '5V',
        description: '5V Power Output'
      }
    },
    {
      id: 'pin-3v3',
      type: 'default',
      position: { x: 250, y: 30 },
      data: {
        type: 'power',
        label: '3.3V',
        voltage: '3.3V',
        description: '3.3V Power Output'
      }
    },
    {
      id: 'pin-gnd',
      type: 'default',
      position: { x: 200, y: 270 },
      data: {
        type: 'component',
        label: 'GND',
        description: 'Ground Connection'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Connect digital pins to Arduino
    { id: 'e-d2', source: 'pin-d2', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d3', source: 'pin-d3', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d4', source: 'pin-d4', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d5', source: 'pin-d5', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d6', source: 'pin-d6', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d7', source: 'pin-d7', target: 'arduino', data: { type: 'signal' } },
    { id: 'e-d8', source: 'pin-d8', target: 'arduino', data: { type: 'signal' } },
    
    // Connect analog pins to Arduino
    { id: 'e-a0', source: 'arduino', target: 'pin-a0', data: { type: 'signal' } },
    { id: 'e-a1', source: 'arduino', target: 'pin-a1', data: { type: 'signal' } },
    { id: 'e-a2', source: 'arduino', target: 'pin-a2', data: { type: 'signal' } },
    { id: 'e-a3', source: 'arduino', target: 'pin-a3', data: { type: 'signal' } },
    { id: 'e-a4', source: 'arduino', target: 'pin-a4', data: { type: 'signal' } },
    { id: 'e-a5', source: 'arduino', target: 'pin-a5', data: { type: 'signal' } },
    
    // Connect power pins to Arduino
    { id: 'e-vin', source: 'pin-vin', target: 'arduino', data: { type: 'power' } },
    { id: 'e-5v', source: 'arduino', target: 'pin-5v', data: { type: 'power' } },
    { id: 'e-3v3', source: 'arduino', target: 'pin-3v3', data: { type: 'power' } },
    { id: 'e-gnd', source: 'arduino', target: 'pin-gnd', data: { type: 'electrical' } }
  ];

  return (
    <DiagramWrapper
      title="Arduino UNO Pin Configuration"
      nodes={nodes}
      edges={edges}
      height="400px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};

// L298N Motor Driver Connection Diagram
export const L298NConnectionDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Arduino
    {
      id: 'arduino',
      type: 'default',
      position: { x: 50, y: 100 },
      data: {
        type: 'arduino',
        label: 'Arduino UNO',
        voltage: '5V',
        description: 'Microcontroller'
      }
    },
    
    // L298N Motor Driver
    {
      id: 'l298n',
      type: 'default',
      position: { x: 250, y: 100 },
      data: {
        type: 'driver',
        label: 'L298N',
        voltage: '5V-35V',
        current: '2A',
        description: 'Dual H-Bridge Motor Driver'
      }
    },
    
    // DC Motors
    {
      id: 'motor1',
      type: 'default',
      position: { x: 450, y: 50 },
      data: {
        type: 'motor',
        label: 'Motor A',
        voltage: '12V',
        current: '1.5A',
        description: 'DC Motor A'
      }
    },
    {
      id: 'motor2',
      type: 'default',
      position: { x: 450, y: 150 },
      data: {
        type: 'motor',
        label: 'Motor B',
        voltage: '12V',
        current: '1.5A',
        description: 'DC Motor B'
      }
    },
    
    // Power Supply
    {
      id: 'power',
      type: 'default',
      position: { x: 250, y: 20 },
      data: {
        type: 'power',
        label: '12V Supply',
        voltage: '12V',
        current: '3A',
        description: 'External Power Supply'
      }
    },
    
    // Ground
    {
      id: 'gnd',
      type: 'default',
      position: { x: 250, y: 220 },
      data: {
        type: 'component',
        label: 'GND',
        description: 'Common Ground'
      }
    },
    
    // Control Pins
    {
      id: 'in1',
      type: 'default',
      position: { x: 150, y: 50 },
      data: {
        type: 'component',
        label: 'IN1',
        description: 'Motor A Direction 1'
      }
    },
    {
      id: 'in2',
      type: 'default',
      position: { x: 150, y: 80 },
      data: {
        type: 'component',
        label: 'IN2',
        description: 'Motor A Direction 2'
      }
    },
    {
      id: 'ena',
      type: 'default',
      position: { x: 150, y: 110 },
      data: {
        type: 'component',
        label: 'ENA',
        description: 'Motor A Enable (PWM)'
      }
    },
    {
      id: 'in3',
      type: 'default',
      position: { x: 150, y: 140 },
      data: {
        type: 'component',
        label: 'IN3',
        description: 'Motor B Direction 1'
      }
    },
    {
      id: 'in4',
      type: 'default',
      position: { x: 150, y: 170 },
      data: {
        type: 'component',
        label: 'IN4',
        description: 'Motor B Direction 2'
      }
    },
    {
      id: 'enb',
      type: 'default',
      position: { x: 150, y: 200 },
      data: {
        type: 'component',
        label: 'ENB',
        description: 'Motor B Enable (PWM)'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Arduino to L298N control connections
    { id: 'e-arduino-in1', source: 'arduino', target: 'in1', data: { type: 'signal', signal: 'D2' } },
    { id: 'e-arduino-in2', source: 'arduino', target: 'in2', data: { type: 'signal', signal: 'D3' } },
    { id: 'e-arduino-ena', source: 'arduino', target: 'ena', data: { type: 'signal', signal: 'D5 (PWM)' } },
    { id: 'e-arduino-in3', source: 'arduino', target: 'in3', data: { type: 'signal', signal: 'D4' } },
    { id: 'e-arduino-in4', source: 'arduino', target: 'in4', data: { type: 'signal', signal: 'D6' } },
    { id: 'e-arduino-enb', source: 'arduino', target: 'enb', data: { type: 'signal', signal: 'D7 (PWM)' } },
    
    // Control pins to L298N
    { id: 'e-in1-l298n', source: 'in1', target: 'l298n', data: { type: 'signal' } },
    { id: 'e-in2-l298n', source: 'in2', target: 'l298n', data: { type: 'signal' } },
    { id: 'e-ena-l298n', source: 'ena', target: 'l298n', data: { type: 'signal' } },
    { id: 'e-in3-l298n', source: 'in3', target: 'l298n', data: { type: 'signal' } },
    { id: 'e-in4-l298n', source: 'in4', target: 'l298n', data: { type: 'signal' } },
    { id: 'e-enb-l298n', source: 'enb', target: 'l298n', data: { type: 'signal' } },
    
    // L298N to motors
    { id: 'e-l298n-motor1', source: 'l298n', target: 'motor1', data: { type: 'power', signal: 'Motor A+/A-' } },
    { id: 'e-l298n-motor2', source: 'l298n', target: 'motor2', data: { type: 'power', signal: 'Motor B+/B-' } },
    
    // Power connections
    { id: 'e-power-l298n', source: 'power', target: 'l298n', data: { type: 'power', signal: 'VCC (12V)' } },
    { id: 'e-l298n-gnd', source: 'l298n', target: 'gnd', data: { type: 'electrical' } },
    { id: 'e-arduino-gnd', source: 'arduino', target: 'gnd', data: { type: 'electrical' } }
  ];

  return (
    <DiagramWrapper
      title="L298N Motor Driver Connections"
      nodes={nodes}
      edges={edges}
      height="400px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};

// Encoder Connection Diagram
export const EncoderConnectionDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Arduino
    {
      id: 'arduino',
      type: 'default',
      position: { x: 100, y: 150 },
      data: {
        type: 'arduino',
        label: 'Arduino UNO',
        voltage: '5V',
        description: 'Microcontroller'
      }
    },
    
    // Rotary Encoder
    {
      id: 'encoder',
      type: 'default',
      position: { x: 350, y: 150 },
      data: {
        type: 'encoder',
        label: 'Rotary Encoder',
        voltage: '5V',
        resolution: '600 PPR',
        description: 'Quadrature Encoder'
      }
    },
    
    // Encoder Pins
    {
      id: 'vcc',
      type: 'default',
      position: { x: 300, y: 50 },
      data: {
        type: 'component',
        label: 'VCC',
        voltage: '5V',
        description: 'Power Supply'
      }
    },
    {
      id: 'gnd',
      type: 'default',
      position: { x: 300, y: 250 },
      data: {
        type: 'component',
        label: 'GND',
        description: 'Ground'
      }
    },
    {
      id: 'ch-a',
      type: 'default',
      position: { x: 450, y: 100 },
      data: {
        type: 'component',
        label: 'Channel A',
        description: 'Quadrature Signal A'
      }
    },
    {
      id: 'ch-b',
      type: 'default',
      position: { x: 450, y: 130 },
      data: {
        type: 'component',
        label: 'Channel B',
        description: 'Quadrature Signal B'
      }
    },
    {
      id: 'index',
      type: 'default',
      position: { x: 450, y: 200 },
      data: {
        type: 'component',
        label: 'Index',
        description: 'Index Pulse (Optional)'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Power connections
    { id: 'e-arduino-vcc', source: 'arduino', target: 'vcc', data: { type: 'power', signal: '5V' } },
    { id: 'e-vcc-encoder', source: 'vcc', target: 'encoder', data: { type: 'power' } },
    { id: 'e-encoder-gnd', source: 'encoder', target: 'gnd', data: { type: 'electrical' } },
    { id: 'e-arduino-gnd', source: 'arduino', target: 'gnd', data: { type: 'electrical' } },
    
    // Signal connections
    { id: 'e-encoder-cha', source: 'encoder', target: 'ch-a', data: { type: 'signal' } },
    { id: 'e-encoder-chb', source: 'encoder', target: 'ch-b', data: { type: 'signal' } },
    { id: 'e-encoder-index', source: 'encoder', target: 'index', data: { type: 'signal' } },
    
    // Arduino connections
    { id: 'e-cha-arduino', source: 'ch-a', target: 'arduino', data: { type: 'signal', signal: 'D2 (INT0)' } },
    { id: 'e-chb-arduino', source: 'ch-b', target: 'arduino', data: { type: 'signal', signal: 'D3 (INT1)' } },
    { id: 'e-index-arduino', source: 'index', target: 'arduino', data: { type: 'signal', signal: 'D4' } }
  ];

  return (
    <DiagramWrapper
      title="Rotary Encoder Connections"
      nodes={nodes}
      edges={edges}
      height="350px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};