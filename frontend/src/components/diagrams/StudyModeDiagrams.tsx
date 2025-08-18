import React from 'react';
import DiagramWrapper from './DiagramWrapper';
import { DiagramNode, DiagramEdge } from './types';

// System Components Overview Diagram
export const SystemComponentsDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Pendulum
    {
      id: 'pendulum',
      type: 'default',
      position: { x: 200, y: 50 },
      data: {
        type: 'pendulum',
        label: 'Pendulum',
        dimensions: '0.3m length',
        weight: '0.1kg',
        description: 'Inverted pendulum - main controlled element'
      }
    },
    
    // Rotating Arm
    {
      id: 'arm',
      type: 'default',
      position: { x: 200, y: 150 },
      data: {
        type: 'arm',
        label: 'Rotating Arm',
        dimensions: '0.2m radius',
        weight: '0.05kg',
        description: 'Actuated arm that moves the pendulum base'
      }
    },
    
    // DC Motor
    {
      id: 'motor',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        type: 'motor',
        label: 'DC Motor',
        voltage: '12V',
        current: '1.5A',
        description: '600RPM Geared DC Motor with encoder'
      }
    },
    
    // Encoder
    {
      id: 'encoder',
      type: 'default',
      position: { x: 300, y: 200 },
      data: {
        type: 'encoder',
        label: 'Rotary Encoder',
        voltage: '5V',
        resolution: '600 PPR',
        description: 'Position feedback sensor'
      }
    },
    
    // Arduino Controller
    {
      id: 'arduino',
      type: 'default',
      position: { x: 50, y: 100 },
      data: {
        type: 'arduino',
        label: 'Arduino Mega',
        voltage: '5V',
        description: 'Main control unit'
      }
    },
    
    // Motor Driver
    {
      id: 'driver',
      type: 'default',
      position: { x: 350, y: 100 },
      data: {
        type: 'driver',
        label: 'L298N Driver',
        voltage: '12V',
        current: '2A',
        description: 'Motor power amplifier'
      }
    },
    
    // Base Platform
    {
      id: 'base',
      type: 'default',
      position: { x: 200, y: 250 },
      data: {
        type: 'pendulum',
        label: 'Base Platform',
        dimensions: '200mm x 150mm',
        material: 'Aluminum',
        description: 'Stable mounting platform'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Mechanical connections
    { id: 'e-pendulum-arm', source: 'pendulum', target: 'arm', data: { type: 'mechanical' } },
    { id: 'e-arm-motor', source: 'arm', target: 'motor', data: { type: 'mechanical' } },
    { id: 'e-motor-base', source: 'motor', target: 'base', data: { type: 'mechanical' } },
    { id: 'e-encoder-arm', source: 'encoder', target: 'arm', data: { type: 'mechanical' } },
    { id: 'e-base-all', source: 'base', target: 'encoder', data: { type: 'mechanical' } },
    
    // Control connections
    { id: 'e-arduino-driver', source: 'arduino', target: 'driver', data: { type: 'signal' } },
    { id: 'e-driver-motor', source: 'driver', target: 'motor', data: { type: 'power' } },
    { id: 'e-encoder-arduino', source: 'encoder', target: 'arduino', data: { type: 'signal' } }
  ];

  return (
    <DiagramWrapper
      title="Inverted Pendulum System Components"
      nodes={nodes}
      edges={edges}
      height="350px"
      showMiniMap={false}
      showControls={false}
      interactive={false}
    />
  );
};

// Physics & Mathematics Diagram
export const PhysicsEquationDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Pendulum angle θ
    {
      id: 'theta',
      type: 'default',
      position: { x: 200, y: 50 },
      data: {
        type: 'pendulum',
        label: 'θ (theta)',
        description: 'Pendulum angle from vertical'
      }
    },
    
    // Arm angle φ
    {
      id: 'phi',
      type: 'default',
      position: { x: 200, y: 150 },
      data: {
        type: 'arm',
        label: 'φ (phi)',
        description: 'Arm rotation angle'
      }
    },
    
    // Gravitational force
    {
      id: 'gravity',
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        type: 'pendulum',
        label: 'mg',
        description: 'Gravitational force'
      }
    },
    
    // Motor torque
    {
      id: 'torque',
      type: 'default',
      position: { x: 300, y: 100 },
      data: {
        type: 'motor',
        label: 'τ (tau)',
        description: 'Motor applied torque'
      }
    },
    
    // Inertia
    {
      id: 'inertia',
      type: 'default',
      position: { x: 150, y: 200 },
      data: {
        type: 'pendulum',
        label: 'I = ml²',
        description: 'Moment of inertia'
      }
    },
    
    // Parameters
    {
      id: 'params',
      type: 'default',
      position: { x: 250, y: 200 },
      data: {
        type: 'component',
        label: 'Parameters',
        description: 'm=0.1kg, l=0.3m, r=0.2m'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Physical relationships
    { id: 'e-gravity-theta', source: 'gravity', target: 'theta', data: { type: 'mechanical' } },
    { id: 'e-torque-phi', source: 'torque', target: 'phi', data: { type: 'mechanical' } },
    { id: 'e-theta-phi', source: 'theta', target: 'phi', data: { type: 'mechanical' } },
    { id: 'e-inertia-theta', source: 'inertia', target: 'theta', data: { type: 'mechanical' } },
    { id: 'e-params-inertia', source: 'params', target: 'inertia', data: { type: 'data' } }
  ];

  return (
    <DiagramWrapper
      title="System Physics & Mathematics"
      nodes={nodes}
      edges={edges}
      height="300px"
      showMiniMap={false}
      showControls={false}
      interactive={false}
    />
  );
};

// Pin Connection Summary Diagram
export const PinConnectionSummaryDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Arduino
    {
      id: 'arduino',
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        type: 'arduino',
        label: 'Arduino Mega',
        voltage: '5V',
        pins: ['Pin 8', 'Pin 7', 'Pin 9', 'GND'],
        description: 'Main controller'
      }
    },
    
    // L298N
    {
      id: 'l298n',
      type: 'default',
      position: { x: 300, y: 100 },
      data: {
        type: 'driver',
        label: 'L298N Driver',
        voltage: '12V',
        current: '2A',
        description: 'Motor driver module'
      }
    },
    
    // DC Motor
    {
      id: 'motor',
      type: 'default',
      position: { x: 500, y: 100 },
      data: {
        type: 'motor',
        label: 'DC Motor',
        voltage: '12V',
        current: '1.9A',
        description: 'Geared DC motor'
      }
    },
    
    // 12V Power Supply
    {
      id: 'power',
      type: 'default',
      position: { x: 300, y: 50 },
      data: {
        type: 'power',
        label: '12V Supply',
        voltage: '12V',
        current: '3A',
        description: 'External power source'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Control signals
    { 
      id: 'e-pin8-in1', 
      source: 'arduino', 
      target: 'l298n', 
      data: { type: 'signal', signal: 'Pin 8 → IN1' },
      label: 'Direction 1' 
    },
    { 
      id: 'e-pin7-in2', 
      source: 'arduino', 
      target: 'l298n', 
      data: { type: 'signal', signal: 'Pin 7 → IN2' },
      label: 'Direction 2' 
    },
    { 
      id: 'e-pin9-ena', 
      source: 'arduino', 
      target: 'l298n', 
      data: { type: 'signal', signal: 'Pin 9 → ENA' },
      label: 'PWM Speed' 
    },
    
    // Power connections
    { 
      id: 'e-power-l298n', 
      source: 'power', 
      target: 'l298n', 
      data: { type: 'power', signal: '12V → VCC' } 
    },
    { 
      id: 'e-l298n-motor', 
      source: 'l298n', 
      target: 'motor', 
      data: { type: 'power', signal: 'OUT1/OUT2' } 
    }
  ];

  return (
    <DiagramWrapper
      title="Arduino → L298N → Motor Connections"
      nodes={nodes}
      edges={edges}
      height="250px"
      showMiniMap={false}
      showControls={false}
      interactive={false}
    />
  );
};