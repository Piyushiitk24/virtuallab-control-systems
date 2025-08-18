import React, { useState, useEffect, useRef } from 'react';
import './RotaryEncoder.css';

// Custom hook for encoder simulation
const useEncoderSimulation = () => {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [acceleration, setAcceleration] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isRotating, setIsRotating] = useState(false);
  const [pulseA, setPulseA] = useState(false);
  const [pulseB, setPulseB] = useState(false);
  const [indexPulse, setIndexPulse] = useState(false);
  
  const lastPositionRef = useRef(0);
  const lastVelocityRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRotating) {
        const now = Date.now();
        const dt = (now - lastTimeRef.current) / 1000;
        
        setPosition(prev => {
          const newPos = prev + velocity * dt * direction;
          
          // Generate quadrature signals
          const pulseCount = Math.floor(Math.abs(newPos * 4)); // 4 pulses per encoder tick
          setPulseA(Math.floor(pulseCount / 2) % 2 === 0);
          setPulseB((Math.floor(pulseCount / 2) + (direction > 0 ? 1 : 0)) % 2 === 0);
          
          // Index pulse once per revolution
          setIndexPulse(Math.floor(Math.abs(newPos)) % 600 < 2); // Assuming 600 PPR encoder
          
          return newPos;
        });
        
        // Calculate acceleration
        const newAccel = (velocity - lastVelocityRef.current) / dt;
        setAcceleration(newAccel);
        
        lastVelocityRef.current = velocity;
        lastTimeRef.current = now;
      }
    }, 16); // ~60 FPS
    
    return () => clearInterval(interval);
  }, [isRotating, velocity, direction]);
  
  return {
    position,
    velocity,
    acceleration,
    direction,
    isRotating,
    pulseA,
    pulseB,
    indexPulse,
    setPosition,
    setVelocity,
    setDirection,
    setIsRotating
  };
};

const RotaryEncoder = () => {
  const {
    position,
    velocity,
    acceleration,
    direction,
    isRotating,
    pulseA,
    pulseB,
    indexPulse,
    setPosition,
    setVelocity,
    setDirection,
    setIsRotating
  } = useEncoderSimulation();
  
  const [encoderType, setEncoderType] = useState('incremental'); // incremental, absolute
  const [resolution, setResolution] = useState(600); // PPR (Pulses Per Revolution)
  const [quadratureMode, setQuadratureMode] = useState('x4'); // x1, x2, x4
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [calibrationOffset, setCalibrationOffset] = useState(0);
  const [showWaveforms, setShowWaveforms] = useState(true);
  const [measurementMode, setMeasurementMode] = useState('position'); // position, velocity, frequency
  
  const canvasRef = useRef(null);
  const waveformData = useRef({ a: [], b: [], index: [], time: [] });
  
  // Calculate derived values
  const angle = ((position + calibrationOffset) % 1) * 360;
  const rpm = (velocity * 60) / resolution;
  const frequency = Math.abs(velocity * resolution);
  const quadratureCount = position * (quadratureMode === 'x4' ? 4 : quadratureMode === 'x2' ? 2 : 1);
  
  // Add noise to signals if enabled
  const noisyPulseA = noiseLevel > 0 ? pulseA && (Math.random() > noiseLevel / 100) : pulseA;
  const noisyPulseB = noiseLevel > 0 ? pulseB && (Math.random() > noiseLevel / 100) : pulseB;
  
  // Waveform generation
  useEffect(() => {
    if (showWaveforms) {
      const now = Date.now();
      waveformData.current.time.push(now);
      waveformData.current.a.push(noisyPulseA ? 1 : 0);
      waveformData.current.b.push(noisyPulseB ? 1 : 0);
      waveformData.current.index.push(indexPulse ? 1 : 0);
      
      // Keep only last 200 points
      if (waveformData.current.time.length > 200) {
        waveformData.current.time.shift();
        waveformData.current.a.shift();
        waveformData.current.b.shift();
        waveformData.current.index.shift();
      }
      
      drawWaveforms();
    }
  }, [noisyPulseA, noisyPulseB, indexPulse, showWaveforms]);
  
  const drawWaveforms = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    const drawSignal = (data, color, yOffset) => {
      if (data.length < 2) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      for (let i = 0; i < data.length; i++) {
        const x = (i / data.length) * width;
        const y = yOffset + (data[i] * 30);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    };
    
    // Draw Channel A
    drawSignal(waveformData.current.a, '#00FF00', 60);
    
    // Draw Channel B
    drawSignal(waveformData.current.b, '#0080FF', 120);
    
    // Draw Index
    drawSignal(waveformData.current.index, '#FF8000', 180);
    
    // Draw labels
    ctx.fillStyle = '#FFD700';
    ctx.font = '14px Arial';
    ctx.fillText('Channel A', 10, 50);
    ctx.fillText('Channel B', 10, 110);
    ctx.fillText('Index', 10, 170);
  };
  
  const handleCalibrate = () => {
    setPosition(0);
    setCalibrationOffset(0);
  };
  
  const handleSetZero = () => {
    setCalibrationOffset(-position);
  };
  
  const simulateRotation = (targetVel) => {
    setVelocity(targetVel);
    setIsRotating(targetVel !== 0);
  };
  
  return (
    <div className="rotary-encoder">
      <div className="encoder-header">
        <h2>Rotary Encoder Analysis</h2>
        <div className="encoder-status">
          <span className={`status-indicator ${isRotating ? 'rotating' : 'stationary'}`}>
            {isRotating ? 'ROTATING' : 'STATIONARY'}
          </span>
          <span className="position-display">
            Position: {position.toFixed(3)} rev ({angle.toFixed(1)}°)
          </span>
        </div>
      </div>
      
      <div className="encoder-layout">
        {/* Visual Encoder Representation */}
        <div className="encoder-visual">
          <div className="encoder-disk">
            <div 
              className="encoder-pattern"
              style={{ 
                transform: `rotate(${angle}deg)`,
                transition: isRotating ? 'none' : 'transform 0.3s ease'
              }}
            >
              {/* Generate encoder pattern */}
              {Array.from({ length: resolution / 10 }, (_, i) => (
                <div
                  key={i}
                  className="encoder-line"
                  style={{
                    transform: `rotate(${(i * 360) / (resolution / 10)}deg)`,
                  }}
                />
              ))}
              <div className="index-mark" />
            </div>
            
            {/* Photodetectors */}
            <div className="photodetector detector-a" data-active={noisyPulseA}>
              <span>A</span>
            </div>
            <div className="photodetector detector-b" data-active={noisyPulseB}>
              <span>B</span>
            </div>
            <div className="photodetector detector-index" data-active={indexPulse}>
              <span>I</span>
            </div>
          </div>
          
          <div className="encoder-readings">
            <div className="reading-group">
              <label>Position:</label>
              <span>{position.toFixed(6)} rev</span>
            </div>
            <div className="reading-group">
              <label>Angle:</label>
              <span>{angle.toFixed(2)}°</span>
            </div>
            <div className="reading-group">
              <label>Velocity:</label>
              <span>{velocity.toFixed(3)} rev/s</span>
            </div>
            <div className="reading-group">
              <label>RPM:</label>
              <span>{rpm.toFixed(1)}</span>
            </div>
            <div className="reading-group">
              <label>Acceleration:</label>
              <span>{acceleration.toFixed(2)} rev/s²</span>
            </div>
            <div className="reading-group">
              <label>Frequency:</label>
              <span>{frequency.toFixed(1)} Hz</span>
            </div>
          </div>
        </div>
        
        {/* Control Panel */}
        <div className="control-section">
          {/* Encoder Configuration */}
          <div className="control-panel">
            <h3>Encoder Configuration</h3>
            <div className="control-group">
              <label>Encoder Type:</label>
              <select 
                value={encoderType} 
                onChange={(e) => setEncoderType(e.target.value)}
              >
                <option value="incremental">Incremental</option>
                <option value="absolute">Absolute</option>
              </select>
            </div>
            <div className="control-group">
              <label>Resolution (PPR):</label>
              <select 
                value={resolution} 
                onChange={(e) => setResolution(Number(e.target.value))}
              >
                <option value={100}>100</option>
                <option value={200}>200</option>
                <option value={360}>360</option>
                <option value={600}>600</option>
                <option value={1000}>1000</option>
                <option value={2000}>2000</option>
                <option value={4000}>4000</option>
              </select>
            </div>
            <div className="control-group">
              <label>Quadrature Mode:</label>
              <select 
                value={quadratureMode} 
                onChange={(e) => setQuadratureMode(e.target.value)}
              >
                <option value="x1">X1 (A only)</option>
                <option value="x2">X2 (A and B)</option>
                <option value="x4">X4 (Full quadrature)</option>
              </select>
            </div>
            <div className="control-group">
              <label>Effective Resolution:</label>
              <span>{resolution * (quadratureMode === 'x4' ? 4 : quadratureMode === 'x2' ? 2 : 1)} counts/rev</span>
            </div>
          </div>
          
          {/* Motion Control */}
          <div className="control-panel">
            <h3>Motion Simulation</h3>
            <div className="control-group">
              <label>Target Velocity (rev/s):</label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={velocity}
                onChange={(e) => simulateRotation(Number(e.target.value))}
              />
              <span>{velocity.toFixed(1)}</span>
            </div>
            <div className="control-group">
              <label>Direction:</label>
              <select 
                value={direction} 
                onChange={(e) => setDirection(Number(e.target.value))}
              >
                <option value={1}>Clockwise</option>
                <option value={-1}>Counter-clockwise</option>
              </select>
            </div>
            <div className="button-group">
              <button onClick={() => simulateRotation(0)}>Stop</button>
              <button onClick={() => simulateRotation(1 * direction)}>Slow</button>
              <button onClick={() => simulateRotation(5 * direction)}>Fast</button>
            </div>
          </div>
          
          {/* Signal Quality */}
          <div className="control-panel">
            <h3>Signal Quality</h3>
            <div className="control-group">
              <label>Noise Level (%):</label>
              <input
                type="range"
                min="0"
                max="20"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(Number(e.target.value))}
              />
              <span>{noiseLevel}%</span>
            </div>
            <div className="signal-indicators">
              <div className={`signal-led ${noisyPulseA ? 'active' : ''}`}>
                <span>A</span>
              </div>
              <div className={`signal-led ${noisyPulseB ? 'active' : ''}`}>
                <span>B</span>
              </div>
              <div className={`signal-led ${indexPulse ? 'active' : ''}`}>
                <span>I</span>
              </div>
            </div>
          </div>
          
          {/* Calibration */}
          <div className="control-panel">
            <h3>Calibration</h3>
            <div className="control-group">
              <label>Offset (rev):</label>
              <input
                type="number"
                step="0.001"
                value={calibrationOffset}
                onChange={(e) => setCalibrationOffset(Number(e.target.value))}
              />
            </div>
            <div className="button-group">
              <button onClick={handleCalibrate}>Home</button>
              <button onClick={handleSetZero}>Set Zero</button>
            </div>
          </div>
          
          {/* Measurement Mode */}
          <div className="control-panel">
            <h3>Measurement</h3>
            <div className="control-group">
              <label>Mode:</label>
              <select 
                value={measurementMode} 
                onChange={(e) => setMeasurementMode(e.target.value)}
              >
                <option value="position">Position</option>
                <option value="velocity">Velocity</option>
                <option value="frequency">Frequency</option>
              </select>
            </div>
            <div className="measurement-display">
              {measurementMode === 'position' && (
                <div className="large-reading">
                  {position.toFixed(6)} <span>rev</span>
                </div>
              )}
              {measurementMode === 'velocity' && (
                <div className="large-reading">
                  {velocity.toFixed(3)} <span>rev/s</span>
                </div>
              )}
              {measurementMode === 'frequency' && (
                <div className="large-reading">
                  {frequency.toFixed(1)} <span>Hz</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Waveform Display */}
      <div className="waveform-section">
        <div className="waveform-header">
          <h3>Signal Waveforms</h3>
          <label>
            <input
              type="checkbox"
              checked={showWaveforms}
              onChange={(e) => setShowWaveforms(e.target.checked)}
            />
            Show Waveforms
          </label>
        </div>
        {showWaveforms && (
          <canvas
            ref={canvasRef}
            width={800}
            height={220}
            className="waveform-canvas"
          />
        )}
      </div>
      
      {/* Quadrature Decoding Info */}
      <div className="decoding-info">
        <h3>Quadrature Decoding</h3>
        <div className="decoding-display">
          <div className="state-table">
            <div className="state-header">
              <span>A</span>
              <span>B</span>
              <span>Direction</span>
              <span>Count</span>
            </div>
            <div className={`state-row ${noisyPulseA && !noisyPulseB ? 'current' : ''}`}>
              <span>1</span>
              <span>0</span>
              <span>CW</span>
              <span>+1</span>
            </div>
            <div className={`state-row ${noisyPulseA && noisyPulseB ? 'current' : ''}`}>
              <span>1</span>
              <span>1</span>
              <span>CW</span>
              <span>+1</span>
            </div>
            <div className={`state-row ${!noisyPulseA && noisyPulseB ? 'current' : ''}`}>
              <span>0</span>
              <span>1</span>
              <span>CW</span>
              <span>+1</span>
            </div>
            <div className={`state-row ${!noisyPulseA && !noisyPulseB ? 'current' : ''}`}>
              <span>0</span>
              <span>0</span>
              <span>CW</span>
              <span>+1</span>
            </div>
          </div>
          <div className="count-display">
            <label>Quadrature Count:</label>
            <span className="count-value">{Math.floor(quadratureCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotaryEncoder;