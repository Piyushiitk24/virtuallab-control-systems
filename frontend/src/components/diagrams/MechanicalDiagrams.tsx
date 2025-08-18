import React from 'react';
import DiagramWrapper from './DiagramWrapper';
import { DiagramNode, DiagramEdge } from './types';

// Inverted Pendulum Mechanical Assembly
export const PendulumAssemblyDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Base Platform
    {
      id: 'base',
      type: 'default',
      position: { x: 200, y: 300 },
      data: {
        type: 'pendulum',
        label: 'Base Platform',
        dimensions: '200mm x 150mm',
        material: 'Aluminum',
        weight: '0.5kg',
        description: 'Stable base platform'
      }
    },
    
    // Motor Mount
    {
      id: 'motor-mount',
      type: 'default',
      position: { x: 150, y: 250 },
      data: {
        type: 'motor',
        label: 'Motor Mount',
        dimensions: '50mm x 50mm',
        material: 'Steel',
        description: 'Motor mounting bracket'
      }
    },
    
    // DC Motor
    {
      id: 'dc-motor',
      type: 'default',
      position: { x: 150, y: 200 },
      data: {
        type: 'motor',
        label: 'DC Motor',
        dimensions: 'Ø30mm x 70mm',
        weight: '0.2kg',
        description: 'Geared DC motor'
      }
    },
    
    // Motor Shaft
    {
      id: 'motor-shaft',
      type: 'default',
      position: { x: 150, y: 150 },
      data: {
        type: 'coupling',
        label: 'Motor Shaft',
        dimensions: 'Ø6mm x 30mm',
        material: 'Steel',
        description: 'Motor output shaft'
      }
    },
    
    // Coupling
    {
      id: 'coupling',
      type: 'default',
      position: { x: 200, y: 150 },
      data: {
        type: 'coupling',
        label: 'Flexible Coupling',
        dimensions: 'Ø20mm x 25mm',
        material: 'Aluminum',
        description: 'Shaft coupling'
      }
    },
    
    // Pendulum Shaft
    {
      id: 'pendulum-shaft',
      type: 'default',
      position: { x: 250, y: 150 },
      data: {
        type: 'arm',
        label: 'Pendulum Shaft',
        dimensions: 'Ø8mm x 350mm',
        material: 'Steel',
        weight: '0.15kg',
        description: 'Main pendulum rod'
      }
    },
    
    // Upper Bearing
    {
      id: 'bearing-upper',
      type: 'default',
      position: { x: 250, y: 200 },
      data: {
        type: 'bearing',
        label: 'Upper Bearing',
        dimensions: 'Ø8mm bore',
        material: 'Steel',
        description: 'Ball bearing support'
      }
    },
    
    // Lower Bearing
    {
      id: 'bearing-lower',
      type: 'default',
      position: { x: 250, y: 250 },
      data: {
        type: 'bearing',
        label: 'Lower Bearing',
        dimensions: 'Ø8mm bore',
        material: 'Steel',
        description: 'Ball bearing support'
      }
    },
    
    // Pendulum Mass
    {
      id: 'pendulum-mass',
      type: 'default',
      position: { x: 250, y: 50 },
      data: {
        type: 'mass',
        label: 'Pendulum Mass',
        dimensions: '40mm x 40mm x 10mm',
        material: 'Steel',
        weight: '0.3kg',
        description: 'Concentrated mass at top'
      }
    },
    
    // Encoder Mount
    {
      id: 'encoder-mount',
      type: 'default',
      position: { x: 350, y: 200 },
      data: {
        type: 'motor',
        label: 'Encoder Mount',
        dimensions: '40mm x 40mm',
        material: 'Aluminum',
        description: 'Encoder mounting bracket'
      }
    },
    
    // Rotary Encoder
    {
      id: 'encoder',
      type: 'default',
      position: { x: 350, y: 150 },
      data: {
        type: 'motor',
        label: 'Rotary Encoder',
        dimensions: 'Ø38mm x 20mm',
        weight: '0.05kg',
        description: 'Position feedback sensor'
      }
    },
    
    // Encoder Shaft
    {
      id: 'encoder-shaft',
      type: 'default',
      position: { x: 300, y: 150 },
      data: {
        type: 'coupling',
        label: 'Encoder Coupling',
        dimensions: 'Ø6mm',
        material: 'Steel',
        description: 'Encoder shaft connection'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Mechanical connections
    { id: 'e-base-motor-mount', source: 'base', target: 'motor-mount', data: { type: 'mechanical' } },
    { id: 'e-motor-mount-motor', source: 'motor-mount', target: 'dc-motor', data: { type: 'mechanical' } },
    { id: 'e-motor-shaft', source: 'dc-motor', target: 'motor-shaft', data: { type: 'mechanical' } },
    { id: 'e-shaft-coupling', source: 'motor-shaft', target: 'coupling', data: { type: 'mechanical' } },
    { id: 'e-coupling-pendulum', source: 'coupling', target: 'pendulum-shaft', data: { type: 'mechanical' } },
    
    // Bearing connections
    { id: 'e-upper-bearing', source: 'pendulum-shaft', target: 'bearing-upper', data: { type: 'mechanical' } },
    { id: 'e-lower-bearing', source: 'pendulum-shaft', target: 'bearing-lower', data: { type: 'mechanical' } },
    { id: 'e-bearing-upper-base', source: 'bearing-upper', target: 'base', data: { type: 'mechanical' } },
    { id: 'e-bearing-lower-base', source: 'bearing-lower', target: 'base', data: { type: 'mechanical' } },
    
    // Pendulum mass connection
    { id: 'e-shaft-mass', source: 'pendulum-shaft', target: 'pendulum-mass', data: { type: 'mechanical' } },
    
    // Encoder connections
    { id: 'e-base-encoder-mount', source: 'base', target: 'encoder-mount', data: { type: 'mechanical' } },
    { id: 'e-encoder-mount-encoder', source: 'encoder-mount', target: 'encoder', data: { type: 'mechanical' } },
    { id: 'e-encoder-coupling', source: 'encoder', target: 'encoder-shaft', data: { type: 'mechanical' } },
    { id: 'e-encoder-shaft-pendulum', source: 'encoder-shaft', target: 'pendulum-shaft', data: { type: 'mechanical' } }
  ];

  return (
    <DiagramWrapper
      title="Inverted Pendulum Mechanical Assembly"
      nodes={nodes}
      edges={edges}
      height="400px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};

// Ball and Beam Assembly
export const BallBeamAssemblyDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Base
    {
      id: 'base',
      type: 'default',
      position: { x: 200, y: 300 },
      data: {
        type: 'pendulum',
        label: 'Base Frame',
        dimensions: '300mm x 200mm',
        material: 'Aluminum',
        weight: '1.0kg',
        description: 'Support structure'
      }
    },
    
    // Servo Motor
    {
      id: 'servo',
      type: 'default',
      position: { x: 100, y: 200 },
      data: {
        type: 'motor',
        label: 'Servo Motor',
        dimensions: '40mm x 20mm x 38mm',
        weight: '0.05kg',
        description: 'Position control actuator'
      }
    },
    
    // Servo Horn
    {
      id: 'servo-horn',
      type: 'default',
      position: { x: 150, y: 180 },
      data: {
        type: 'coupling',
        label: 'Servo Horn',
        dimensions: '25mm diameter',
        material: 'Plastic',
        description: 'Servo output attachment'
      }
    },
    
    // Linkage Rod
    {
      id: 'linkage',
      type: 'default',
      position: { x: 200, y: 160 },
      data: {
        type: 'arm',
        label: 'Linkage Rod',
        dimensions: '100mm x 5mm',
        material: 'Carbon fiber',
        weight: '0.02kg',
        description: 'Connection linkage'
      }
    },
    
    // Beam Pivot
    {
      id: 'pivot',
      type: 'default',
      position: { x: 250, y: 140 },
      data: {
        type: 'bearing',
        label: 'Beam Pivot',
        dimensions: 'Ø5mm bore',
        material: 'Steel',
        description: 'Pivot point bearing'
      }
    },
    
    // Beam
    {
      id: 'beam',
      type: 'default',
      position: { x: 350, y: 120 },
      data: {
        type: 'arm',
        label: 'Beam',
        dimensions: '600mm x 20mm x 5mm',
        material: 'Aluminum',
        weight: '0.2kg',
        description: 'Ball track beam'
      }
    },
    
    // Ball
    {
      id: 'ball',
      type: 'default',
      position: { x: 400, y: 100 },
      data: {
        type: 'mass',
        label: 'Steel Ball',
        dimensions: 'Ø20mm',
        material: 'Steel',
        weight: '0.03kg',
        description: 'Rolling ball'
      }
    },
    
    // Position Sensor
    {
      id: 'sensor',
      type: 'default',
      position: { x: 450, y: 80 },
      data: {
        type: 'motor',
        label: 'Position Sensor',
        dimensions: '30mm x 15mm',
        weight: '0.01kg',
        description: 'Ball position detection'
      }
    },
    
    // Sensor Mount
    {
      id: 'sensor-mount',
      type: 'default',
      position: { x: 450, y: 140 },
      data: {
        type: 'motor',
        label: 'Sensor Mount',
        dimensions: '40mm x 30mm',
        material: 'Plastic',
        description: 'Sensor mounting bracket'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Mechanical assembly
    { id: 'e-base-servo', source: 'base', target: 'servo', data: { type: 'mechanical' } },
    { id: 'e-servo-horn', source: 'servo', target: 'servo-horn', data: { type: 'mechanical' } },
    { id: 'e-horn-linkage', source: 'servo-horn', target: 'linkage', data: { type: 'mechanical' } },
    { id: 'e-linkage-pivot', source: 'linkage', target: 'pivot', data: { type: 'mechanical' } },
    { id: 'e-pivot-beam', source: 'pivot', target: 'beam', data: { type: 'mechanical' } },
    { id: 'e-base-pivot', source: 'base', target: 'pivot', data: { type: 'mechanical' } },
    
    // Ball on beam
    { id: 'e-beam-ball', source: 'beam', target: 'ball', data: { type: 'mechanical' } },
    
    // Sensor mounting
    { id: 'e-beam-sensor-mount', source: 'beam', target: 'sensor-mount', data: { type: 'mechanical' } },
    { id: 'e-sensor-mount-sensor', source: 'sensor-mount', target: 'sensor', data: { type: 'mechanical' } }
  ];

  return (
    <DiagramWrapper
      title="Ball and Beam Mechanical Assembly"
      nodes={nodes}
      edges={edges}
      height="400px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};

// DC Motor Internal Structure
export const DCMotorStructureDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    // Motor Housing
    {
      id: 'housing',
      type: 'default',
      position: { x: 200, y: 150 },
      data: {
        type: 'motor',
        label: 'Motor Housing',
        dimensions: 'Ø30mm x 70mm',
        material: 'Steel',
        description: 'Protective casing'
      }
    },
    
    // Permanent Magnets
    {
      id: 'magnets',
      type: 'default',
      position: { x: 150, y: 100 },
      data: {
        type: 'motor',
        label: 'Permanent Magnets',
        dimensions: '4 poles',
        material: 'Neodymium',
        description: 'Stationary magnetic field'
      }
    },
    
    // Rotor/Armature
    {
      id: 'rotor',
      type: 'default',
      position: { x: 200, y: 100 },
      data: {
        type: 'motor',
        label: 'Rotor/Armature',
        dimensions: 'Ø15mm x 40mm',
        material: 'Copper windings',
        description: 'Rotating electromagnet'
      }
    },
    
    // Commutator
    {
      id: 'commutator',
      type: 'default',
      position: { x: 250, y: 100 },
      data: {
        type: 'motor',
        label: 'Commutator',
        dimensions: 'Ø12mm',
        material: 'Copper segments',
        description: 'Current switching'
      }
    },
    
    // Carbon Brushes
    {
      id: 'brushes',
      type: 'default',
      position: { x: 280, y: 130 },
      data: {
        type: 'motor',
        label: 'Carbon Brushes',
        dimensions: '3mm x 8mm',
        material: 'Carbon',
        description: 'Electrical contact'
      }
    },
    
    // Front Bearing
    {
      id: 'bearing-front',
      type: 'default',
      position: { x: 150, y: 150 },
      data: {
        type: 'bearing',
        label: 'Front Bearing',
        dimensions: 'Ø6mm bore',
        material: 'Steel',
        description: 'Shaft support'
      }
    },
    
    // Rear Bearing
    {
      id: 'bearing-rear',
      type: 'default',
      position: { x: 250, y: 150 },
      data: {
        type: 'bearing',
        label: 'Rear Bearing',
        dimensions: 'Ø6mm bore',
        material: 'Steel',
        description: 'Shaft support'
      }
    },
    
    // Output Shaft
    {
      id: 'shaft',
      type: 'default',
      position: { x: 120, y: 100 },
      data: {
        type: 'coupling',
        label: 'Output Shaft',
        dimensions: 'Ø6mm x 15mm',
        material: 'Steel',
        description: 'Power transmission'
      }
    },
    
    // Terminal Block
    {
      id: 'terminals',
      type: 'default',
      position: { x: 300, y: 180 },
      data: {
        type: 'motor',
        label: 'Terminals',
        dimensions: '2 pins',
        material: 'Brass',
        description: 'Power connection'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    // Internal connections
    { id: 'e-housing-magnets', source: 'housing', target: 'magnets', data: { type: 'mechanical' } },
    { id: 'e-housing-rotor', source: 'housing', target: 'rotor', data: { type: 'mechanical' } },
    { id: 'e-rotor-commutator', source: 'rotor', target: 'commutator', data: { type: 'mechanical' } },
    { id: 'e-commutator-brushes', source: 'commutator', target: 'brushes', data: { type: 'electrical' } },
    
    // Bearing support
    { id: 'e-housing-bearing-front', source: 'housing', target: 'bearing-front', data: { type: 'mechanical' } },
    { id: 'e-housing-bearing-rear', source: 'housing', target: 'bearing-rear', data: { type: 'mechanical' } },
    { id: 'e-rotor-bearing-front', source: 'rotor', target: 'bearing-front', data: { type: 'mechanical' } },
    { id: 'e-rotor-bearing-rear', source: 'rotor', target: 'bearing-rear', data: { type: 'mechanical' } },
    
    // Shaft connection
    { id: 'e-rotor-shaft', source: 'rotor', target: 'shaft', data: { type: 'mechanical' } },
    
    // Electrical connections
    { id: 'e-brushes-terminals', source: 'brushes', target: 'terminals', data: { type: 'electrical' } }
  ];

  return (
    <DiagramWrapper
      title="DC Motor Internal Structure"
      nodes={nodes}
      edges={edges}
      height="350px"
      showMiniMap={true}
      showControls={true}
      interactive={false}
    />
  );
};