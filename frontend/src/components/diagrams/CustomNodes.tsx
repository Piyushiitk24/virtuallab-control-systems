import React from 'react';
import { Handle, Position } from 'reactflow';
import { ElectricalNodeData, MechanicalNodeData, ControlNodeData } from './types';

// Arduino Node Component
export const ArduinoNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`arduino-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '160px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff',
      position: 'relative'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        🔌 {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.pin && (
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          Pin {data.pin}
        </div>
      )}
      
      {/* Handles for connections */}
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #4CAF50' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #4CAF50' }} />
      <Handle type="source" position={Position.Top} style={{ background: '#fff', border: '2px solid #4CAF50' }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #4CAF50' }} />
    </div>
  );
};

// Motor Driver Node Component
export const MotorDriverNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`motor-driver-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        ⚡ {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.voltage && (
        <div style={{ fontSize: '0.8rem' }}>
          {data.voltage}
        </div>
      )}
      
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #2196F3' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #2196F3' }} />
      <Handle type="target" position={Position.Top} style={{ background: '#fff', border: '2px solid #2196F3' }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #2196F3' }} />
    </div>
  );
};

// DC Motor Node Component
export const DCMotorNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`dc-motor-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '120px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        ⚙️ {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.value && (
        <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {data.value} RPM
        </div>
      )}
      
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #FF5722' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #FF5722' }} />
    </div>
  );
};

// Encoder Node Component
export const EncoderNodeComponent = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`encoder-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #FF9800 0%, #FFA726 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        📡 {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.value && (
        <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
          {data.value}
        </div>
      )}
      
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #FF9800' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #FF9800' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #FF9800' }} />
    </div>
  );
};

// Power Supply Node Component
export const PowerSupplyNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`power-supply-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '120px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        🔋 {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.voltage && (
        <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
          {data.voltage}
        </div>
      )}
      
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #9C27B0' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #9C27B0' }} />
    </div>
  );
};

// Ground Node Component
export const GroundNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`ground-node ${selected ? 'selected' : ''}`} style={{
      background: 'linear-gradient(135deg, #424242 0%, #616161 100%)',
      color: 'white',
      padding: '10px 15px',
      borderRadius: '12px',
      minWidth: '80px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(66, 66, 66, 0.3)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
        ⏚ GND
      </div>
      
      <Handle type="target" position={Position.Top} style={{ background: '#fff', border: '2px solid #424242' }} />
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #424242' }} />
      <Handle type="target" position={Position.Right} style={{ background: '#fff', border: '2px solid #424242' }} />
    </div>
  );
};

// Mechanical Component Node
export const MechanicalNode = ({ data, selected }: { data: MechanicalNodeData; selected?: boolean }) => {
  const getBackgroundColor = () => {
    switch (data.type) {
      case 'pendulum': return 'linear-gradient(135deg, #8BC34A 0%, #9CCC65 100%)';
      case 'arm': return 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)';
      case 'mass': return 'linear-gradient(135deg, #795548 0%, #8D6E63 100%)';
      case 'motor': return 'linear-gradient(135deg, #FF5722 0%, #FF7043 100%)';
      case 'bearing': return 'linear-gradient(135deg, #607D8B 0%, #78909C 100%)';
      default: return 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)';
    }
  };

  const getIcon = () => {
    switch (data.type) {
      case 'pendulum': return '⚖️';
      case 'arm': return '↔️';
      case 'mass': return '🏋️';
      case 'motor': return '⚙️';
      case 'bearing': return '⭕';
      default: return '🔧';
    }
  };

  return (
    <div className={`mechanical-node ${selected ? 'selected' : ''}`} style={{
      background: getBackgroundColor(),
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      border: selected ? '3px solid #FFD700' : '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        {getIcon()} {data.label}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.description}
      </div>
      {data.dimensions && (
        <div style={{ fontSize: '0.8rem' }}>
          {data.dimensions}
        </div>
      )}
      
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #333' }} />
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #333' }} />
      <Handle type="target" position={Position.Top} style={{ background: '#fff', border: '2px solid #333' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #333' }} />
    </div>
  );
};

// Junction/Connection Point Node
export const JunctionNode = ({ data, selected }: { data: ElectricalNodeData; selected?: boolean }) => {
  return (
    <div className={`junction-node ${selected ? 'selected' : ''}`} style={{
      background: '#333',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      border: selected ? '3px solid #FFD700' : '2px solid #666',
      position: 'relative'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="target" position={Position.Left} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="target" position={Position.Right} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="source" position={Position.Top} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="source" position={Position.Left} style={{ background: '#333', border: 'none', opacity: 0 }} />
      <Handle type="source" position={Position.Right} style={{ background: '#333', border: 'none', opacity: 0 }} />
    </div>
  );
};