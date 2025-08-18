import React, { useState, useEffect, useRef } from 'react';
import './StepperMotorControl.css';

// Custom hook for stepper motor simulation
const useStepperSimulation = () => {
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [stepMode, setStepMode] = useState('full'); // full, half, micro
  const [direction, setDirection] = useState(1);
  
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (isRunning && Math.abs(position - targetPosition) > 0.1) {
      intervalRef.current = setInterval(() => {
        setPosition(prev => {
          const diff = targetPosition - prev;
          const step = Math.sign(diff) * Math.min(Math.abs(diff), speed / 10);
          return prev + step;
        });
      }, 50);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, targetPosition, position, speed]);
  
  return {
    position,
    speed,
    targetPosition,
    isRunning,
    stepMode,
    direction,
    setSpeed,
    setTargetPosition,
    setIsRunning,
    setStepMode,
    setDirection,
    setPosition
  };
};

const StepperMotorControl = () => {
  const {
    position,
    speed,
    targetPosition,
    isRunning,
    stepMode,
    direction,
    setSpeed,
    setTargetPosition,
    setIsRunning,
    setStepMode,
    setDirection,
    setPosition
  } = useStepperSimulation();
  
  const [controlMode, setControlMode] = useState('position'); // position, speed, sequence
  const [stepSequence, setStepSequence] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [microStepResolution, setMicroStepResolution] = useState(16);
  
  // Calculate stepper motor parameters
  const stepsPerRevolution = 200; // Typical NEMA 17
  const currentAngle = (position / stepsPerRevolution) * 360;
  const targetAngle = (targetPosition / stepsPerRevolution) * 360;
  const rpm = (speed * 60) / stepsPerRevolution;
  
  // Stepper sequence patterns
  const stepPatterns = {
    full: [
      [1, 0, 1, 0],
      [0, 1, 1, 0],
      [0, 1, 0, 1],
      [1, 0, 0, 1]
    ],
    half: [
      [1, 0, 0, 0],
      [1, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 1],
      [0, 0, 0, 1],
      [1, 0, 0, 1]
    ]
  };
  
  const handleEmergencyStop = () => {
    setIsRunning(false);
    setSpeed(0);
    setTargetPosition(position);
  };
  
  const handleHome = () => {
    setTargetPosition(0);
    setIsRunning(true);
  };
  
  const handleJog = (steps) => {
    setTargetPosition(position + steps);
    setIsRunning(true);
  };
  
  const addToSequence = () => {
    const newStep = {
      position: targetPosition,
      speed: speed,
      delay: 1000
    };
    setStepSequence([...stepSequence, newStep]);
  };
  
  const runSequence = () => {
    if (stepSequence.length === 0) return;
    
    setCurrentStep(0);
    let stepIndex = 0;
    
    const executeStep = () => {
      if (stepIndex >= stepSequence.length) {
        setCurrentStep(0);
        return;
      }
      
      const step = stepSequence[stepIndex];
      setTargetPosition(step.position);
      setSpeed(step.speed);
      setIsRunning(true);
      setCurrentStep(stepIndex);
      
      setTimeout(() => {
        stepIndex++;
        executeStep();
      }, step.delay);
    };
    
    executeStep();
  };
  
  return (
    <div className="stepper-motor-control">
      <div className="control-header">
        <h2>Stepper Motor Control System</h2>
        <div className="motor-status">
          <span className={`status-indicator ${isRunning ? 'running' : 'stopped'}`}>
            {isRunning ? 'RUNNING' : 'STOPPED'}
          </span>
          <span className="position-display">
            Position: {position.toFixed(1)} steps ({currentAngle.toFixed(1)}°)
          </span>
        </div>
      </div>
      
      <div className="control-layout">
        {/* Visual Motor Representation */}
        <div className="motor-visual">
          <div className="stepper-motor">
            <div 
              className="rotor"
              style={{ 
                transform: `rotate(${currentAngle}deg)`,
                transition: isRunning ? 'none' : 'transform 0.3s ease'
              }}
            >
              <div className="rotor-indicator"></div>
            </div>
            <div className="stator">
              <div className="coil coil-a" data-active={stepPatterns.full[Math.floor(position) % 4]?.[0]}></div>
              <div className="coil coil-b" data-active={stepPatterns.full[Math.floor(position) % 4]?.[1]}></div>
              <div className="coil coil-c" data-active={stepPatterns.full[Math.floor(position) % 4]?.[2]}></div>
              <div className="coil coil-d" data-active={stepPatterns.full[Math.floor(position) % 4]?.[3]}></div>
            </div>
          </div>
          
          <div className="motor-info">
            <div className="info-group">
              <label>Current Angle:</label>
              <span>{currentAngle.toFixed(1)}°</span>
            </div>
            <div className="info-group">
              <label>Target Angle:</label>
              <span>{targetAngle.toFixed(1)}°</span>
            </div>
            <div className="info-group">
              <label>Speed (RPM):</label>
              <span>{rpm.toFixed(1)}</span>
            </div>
            <div className="info-group">
              <label>Step Mode:</label>
              <span>{stepMode.toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        {/* Control Panels */}
        <div className="control-panels">
          {/* Mode Selection */}
          <div className="control-panel">
            <h3>Control Mode</h3>
            <div className="mode-selector">
              <button 
                className={controlMode === 'position' ? 'active' : ''}
                onClick={() => setControlMode('position')}
              >
                Position Control
              </button>
              <button 
                className={controlMode === 'speed' ? 'active' : ''}
                onClick={() => setControlMode('speed')}
              >
                Speed Control
              </button>
              <button 
                className={controlMode === 'sequence' ? 'active' : ''}
                onClick={() => setControlMode('sequence')}
              >
                Sequence Control
              </button>
            </div>
          </div>
          
          {/* Position Control */}
          {controlMode === 'position' && (
            <div className="control-panel">
              <h3>Position Control</h3>
              <div className="control-group">
                <label>Target Position (steps):</label>
                <input
                  type="number"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(Number(e.target.value))}
                  min="-3200"
                  max="3200"
                />
              </div>
              <div className="control-group">
                <label>Speed (steps/sec):</label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                />
                <span>{speed}</span>
              </div>
              <div className="button-group">
                <button onClick={() => setIsRunning(!isRunning)}>
                  {isRunning ? 'Stop' : 'Start'}
                </button>
                <button onClick={handleHome}>Home</button>
                <button onClick={handleEmergencyStop} className="emergency">
                  E-Stop
                </button>
              </div>
            </div>
          )}
          
          {/* Speed Control */}
          {controlMode === 'speed' && (
            <div className="control-panel">
              <h3>Speed Control</h3>
              <div className="control-group">
                <label>Speed (RPM):</label>
                <input
                  type="range"
                  min="0"
                  max="300"
                  value={rpm}
                  onChange={(e) => setSpeed((Number(e.target.value) * stepsPerRevolution) / 60)}
                />
                <span>{rpm.toFixed(1)}</span>
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
                <button onClick={() => {
                  setIsRunning(true);
                  setTargetPosition(position + direction * 1000);
                }}>
                  Run Continuous
                </button>
                <button onClick={handleEmergencyStop} className="emergency">
                  Stop
                </button>
              </div>
            </div>
          )}
          
          {/* Sequence Control */}
          {controlMode === 'sequence' && (
            <div className="control-panel">
              <h3>Sequence Programming</h3>
              <div className="sequence-builder">
                <div className="control-group">
                  <label>Position:</label>
                  <input
                    type="number"
                    value={targetPosition}
                    onChange={(e) => setTargetPosition(Number(e.target.value))}
                  />
                </div>
                <div className="control-group">
                  <label>Speed:</label>
                  <input
                    type="number"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                  />
                </div>
                <button onClick={addToSequence}>Add Step</button>
              </div>
              
              <div className="sequence-list">
                <h4>Sequence Steps:</h4>
                {stepSequence.map((step, index) => (
                  <div 
                    key={index} 
                    className={`sequence-item ${index === currentStep ? 'active' : ''}`}
                  >
                    <span>Step {index + 1}: {step.position} steps @ {step.speed} speed</span>
                    <button onClick={() => {
                      const newSequence = stepSequence.filter((_, i) => i !== index);
                      setStepSequence(newSequence);
                    }}>×</button>
                  </div>
                ))}
              </div>
              
              <div className="button-group">
                <button onClick={runSequence} disabled={stepSequence.length === 0}>
                  Run Sequence
                </button>
                <button onClick={() => setStepSequence([])}>
                  Clear Sequence
                </button>
              </div>
            </div>
          )}
          
          {/* Jog Controls */}
          <div className="control-panel">
            <h3>Jog Controls</h3>
            <div className="jog-controls">
              <div className="jog-row">
                <button onClick={() => handleJog(-100)}>-100</button>
                <button onClick={() => handleJog(-10)}>-10</button>
                <button onClick={() => handleJog(-1)}>-1</button>
                <button onClick={() => handleJog(1)}>+1</button>
                <button onClick={() => handleJog(10)}>+10</button>
                <button onClick={() => handleJog(100)}>+100</button>
              </div>
            </div>
          </div>
          
          {/* Motor Configuration */}
          <div className="control-panel">
            <h3>Motor Configuration</h3>
            <div className="control-group">
              <label>Step Mode:</label>
              <select 
                value={stepMode} 
                onChange={(e) => setStepMode(e.target.value)}
              >
                <option value="full">Full Step</option>
                <option value="half">Half Step</option>
                <option value="micro">Micro Step</option>
              </select>
            </div>
            {stepMode === 'micro' && (
              <div className="control-group">
                <label>Micro Step Resolution:</label>
                <select 
                  value={microStepResolution} 
                  onChange={(e) => setMicroStepResolution(Number(e.target.value))}
                >
                  <option value={2}>1/2</option>
                  <option value={4}>1/4</option>
                  <option value={8}>1/8</option>
                  <option value={16}>1/16</option>
                  <option value={32}>1/32</option>
                </select>
              </div>
            )}
            <div className="control-group">
              <label>Steps per Revolution:</label>
              <span>{stepsPerRevolution}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Step Pattern Visualization */}
      <div className="step-pattern-section">
        <h3>Step Pattern Visualization</h3>
        <div className="pattern-display">
          <div className="coil-states">
            {['A', 'B', 'C', 'D'].map((coil, index) => (
              <div key={coil} className="coil-column">
                <div className="coil-header">{coil}</div>
                <div className="pattern-steps">
                  {stepPatterns[stepMode] ? stepPatterns[stepMode].map((pattern, stepIndex) => (
                    <div 
                      key={stepIndex} 
                      className={`pattern-step ${pattern[index] ? 'active' : 'inactive'}`}
                    >
                      {pattern[index] ? '●' : '○'}
                    </div>
                  )) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepperMotorControl;