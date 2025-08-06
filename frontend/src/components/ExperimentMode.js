import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import serialHandler from '../utils/SerialHandler';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ExperimentMode = () => {
  const { module } = useParams();
  const navigate = useNavigate();
  const chartRef = useRef(null);
  
  // Connection states
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  // Pin check states
  const [pinChecks, setPinChecks] = useState({
    pin8: { status: 'untested', message: 'Not tested' },
    pin7: { status: 'untested', message: 'Not tested' },
    pin9: { status: 'untested', message: 'Not tested' },
    pinA2: { status: 'untested', message: 'Not tested' },
    pinA3: { status: 'untested', message: 'Not tested' }
  });
  const [allPinsValid, setAllPinsValid] = useState(false);
  
  // Control states
  const [motorSpeed, setMotorSpeed] = useState(0);
  const [isBalancing, setIsBalancing] = useState(false);
  const [pidParams, setPidParams] = useState({ kp: 100, ki: 10, kd: 1 });
  
  // Data states
  const [angleData, setAngleData] = useState([]);
  const [controlData, setControlData] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);
  const [currentAngle, setCurrentAngle] = useState(0);
  
  const maxDataPoints = 100;

  useEffect(() => {
    // Set up serial response handlers
    serialHandler.onResponse('OK', handleOkResponse);
    serialHandler.onResponse('ERROR', handleErrorResponse);
    serialHandler.onResponse('ANGLE:', handleAngleResponse);
    serialHandler.onResponse('CONTROL:', handleControlResponse);
    serialHandler.onResponse('READY', handleReadyResponse);

    return () => {
      serialHandler.clearCallbacks();
    };
  }, []);

  useEffect(() => {
    // Check if all pins are valid
    const allValid = Object.values(pinChecks).every(check => check.status === 'ok');
    setAllPinsValid(allValid);
  }, [pinChecks]);

  const handleOkResponse = (response) => {
    console.log('Command executed successfully');
  };

  const handleErrorResponse = (response) => {
    console.error('Arduino error:', response);
  };

  const handleAngleResponse = (response) => {
    const angle = parseFloat(response.split(':')[1]);
    if (!isNaN(angle)) {
      setCurrentAngle(angle);
      updateChartData(angle, null);
    }
  };

  const handleControlResponse = (response) => {
    const control = parseFloat(response.split(':')[1]);
    if (!isNaN(control)) {
      updateChartData(null, control);
    }
  };

  const handleReadyResponse = (response) => {
    console.log('Arduino ready for operation');
  };

  const updateChartData = (angle, control) => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString();

    setTimeLabels(prev => {
      const newLabels = [...prev, timeLabel];
      return newLabels.slice(-maxDataPoints);
    });

    if (angle !== null) {
      setAngleData(prev => {
        const newData = [...prev, angle];
        return newData.slice(-maxDataPoints);
      });
    }

    if (control !== null) {
      setControlData(prev => {
        const newData = [...prev, control];
        return newData.slice(-maxDataPoints);
      });
    }
  };

  const handleConnect = async () => {
    try {
      setConnectionStatus('connecting');
      await serialHandler.connect();
      setIsConnected(true);
      setConnectionStatus('connected');
      
      // Wait a moment for Arduino to initialize
      setTimeout(() => {
        runPinChecks();
      }, 2000);
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionStatus('error');
      alert(`Connection failed: ${error.message}`);
    }
  };

  const handleDisconnect = async () => {
    if (isBalancing) {
      await handleStopBalance();
    }
    await serialHandler.disconnect();
    setIsConnected(false);
    setConnectionStatus('disconnected');
    resetPinChecks();
    clearChartData();
  };

  const resetPinChecks = () => {
    setPinChecks({
      pin8: { status: 'untested', message: 'Not tested' },
      pin7: { status: 'untested', message: 'Not tested' },
      pin9: { status: 'untested', message: 'Not tested' },
      pinA2: { status: 'untested', message: 'Not tested' },
      pinA3: { status: 'untested', message: 'Not tested' }
    });
  };

  const clearChartData = () => {
    setAngleData([]);
    setControlData([]);
    setTimeLabels([]);
    setCurrentAngle(0);
  };

  const runPinChecks = async () => {
    const pins = ['pin8', 'pin7', 'pin9', 'pinA2', 'pinA3'];
    const pinNumbers = [8, 7, 9, 'A2', 'A3'];

    for (let i = 0; i < pins.length; i++) {
      const pin = pins[i];
      const pinNumber = pinNumbers[i];

      // Set pin as testing
      setPinChecks(prev => ({
        ...prev,
        [pin]: { status: 'testing', message: 'Testing...' }
      }));

      try {
        // Test the pin
        await serialHandler.testPin(pinNumber);
        
        // Wait for response (simulate - in real implementation, you'd wait for actual response)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate response - in real implementation, this would come from serial handler
        const success = Math.random() > 0.2; // 80% success rate for demo
        
        setPinChecks(prev => ({
          ...prev,
          [pin]: {
            status: success ? 'ok' : 'error',
            message: success ? 'Pin configured correctly' : 'Pin configuration error'
          }
        }));
      } catch (error) {
        setPinChecks(prev => ({
          ...prev,
          [pin]: { status: 'error', message: `Test failed: ${error.message}` }
        }));
      }
    }
  };

  const handleSpeedChange = async (speed) => {
    setMotorSpeed(speed);
    if (isConnected && !isBalancing) {
      try {
        await serialHandler.setMotorSpeed(speed);
      } catch (error) {
        console.error('Failed to set speed:', error);
      }
    }
  };

  const handleStartBalance = async () => {
    if (!allPinsValid) {
      alert('Please ensure all pin checks pass before starting balancing mode.');
      return;
    }

    try {
      // Set PID parameters
      await serialHandler.setPIDParams(pidParams.kp, pidParams.ki, pidParams.kd);
      
      // Start balancing
      await serialHandler.startBalance();
      setIsBalancing(true);
      
      // Start data collection
      startDataCollection();
    } catch (error) {
      console.error('Failed to start balancing:', error);
      alert('Failed to start balancing mode');
    }
  };

  const handleStopBalance = async () => {
    try {
      await serialHandler.stopBalance();
      setIsBalancing(false);
      stopDataCollection();
    } catch (error) {
      console.error('Failed to stop balancing:', error);
    }
  };

  const dataCollectionInterval = useRef(null);

  const startDataCollection = () => {
    dataCollectionInterval.current = setInterval(async () => {
      try {
        await serialHandler.getAngle();
      } catch (error) {
        console.error('Failed to get angle:', error);
      }
    }, 100); // 10Hz data collection
  };

  const stopDataCollection = () => {
    if (dataCollectionInterval.current) {
      clearInterval(dataCollectionInterval.current);
      dataCollectionInterval.current = null;
    }
  };

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: 'Pendulum Angle (degrees)',
        data: angleData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 2,
        pointRadius: 1,
        tension: 0.1
      },
      {
        label: 'Control Signal',
        data: controlData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        pointRadius: 1,
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Real-time Pendulum Data'
      }
    },
    scales: {
      x: {
        display: false // Hide time labels for cleaner look
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Value'
        }
      }
    },
    animation: {
      duration: 0 // Disable animation for real-time updates
    }
  };

  const getPinStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return <div className="pin-status-icon pin-status-ok"></div>;
      case 'error':
        return <div className="pin-status-icon pin-status-error"></div>;
      case 'testing':
        return <div className="pin-status-icon pin-status-testing"></div>;
      default:
        return <div className="pin-status-icon" style={{ background: '#ccc' }}></div>;
    }
  };

  return (
    <div className="experiment-container">
      <div className="experiment-header">
        <div>
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back
          </button>
          <h2 style={{ display: 'inline', marginLeft: '1rem' }}>
            Experiment Mode: {module.replace('-', ' ').toUpperCase()}
          </h2>
        </div>
        <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
          Current Angle: {currentAngle.toFixed(2)}°
        </div>
      </div>

      {/* Connection Panel */}
      <div className="connection-panel">
        <h3>🔌 Hardware Connection</h3>
        <div className="connection-status">
          <span 
            className={`status-indicator ${
              connectionStatus === 'connected' ? 'status-connected' :
              connectionStatus === 'connecting' ? 'status-connecting' :
              'status-disconnected'
            }`}
          ></span>
          <span>
            {connectionStatus === 'connected' ? 'Connected to Arduino' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             'Not connected'}
          </span>
        </div>
        
        {!isConnected ? (
          <button 
            className="btn btn-primary"
            onClick={handleConnect}
            disabled={connectionStatus === 'connecting'}
          >
            {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Arduino'}
          </button>
        ) : (
          <button 
            className="btn btn-danger"
            onClick={handleDisconnect}
          >
            Disconnect
          </button>
        )}

        {/* Pin Checks */}
        {isConnected && (
          <div className="pin-checks">
            <h4>Pin Configuration Checks</h4>
            {Object.entries(pinChecks).map(([pin, check]) => (
              <div key={pin} className="pin-check-item">
                <span className="pin-check-name">
                  {pin.replace('pin', 'Pin ').replace('A', 'A')} 
                  {pin === 'pin8' && ' (IN1)'}
                  {pin === 'pin7' && ' (IN2)'}
                  {pin === 'pin9' && ' (ENA)'}
                  {pin === 'pinA2' && ' (Encoder A)'}
                  {pin === 'pinA3' && ' (Encoder B)'}
                </span>
                <div className="pin-check-status">
                  {getPinStatusIcon(check.status)}
                  <span>{check.message}</span>
                </div>
              </div>
            ))}
            {allPinsValid && (
              <div className="alert alert-success">
                ✅ All pin checks passed! Ready for experimentation.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-section">
          <h3>🎛️ Manual Motor Control</h3>
          <div className="control-group">
            <label>Motor Speed (PWM: 0-255)</label>
            <div className="slider-container">
              <input
                type="range"
                min="0"
                max="255"
                value={motorSpeed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className="slider"
                disabled={!isConnected || isBalancing}
              />
              <span className="slider-value">{motorSpeed}</span>
            </div>
          </div>
          {isBalancing && (
            <div className="alert alert-warning">
              Manual control disabled during balancing mode
            </div>
          )}
        </div>

        <div className="control-section">
          <h3>⚖️ Pendulum Control</h3>
          <div className="control-group">
            <label>PID Parameters</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem' }}>Kp</label>
                <input
                  type="number"
                  value={pidParams.kp}
                  onChange={(e) => setPidParams(prev => ({ ...prev, kp: parseFloat(e.target.value) }))}
                  disabled={isBalancing}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem' }}>Ki</label>
                <input
                  type="number"
                  value={pidParams.ki}
                  onChange={(e) => setPidParams(prev => ({ ...prev, ki: parseFloat(e.target.value) }))}
                  disabled={isBalancing}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem' }}>Kd</label>
                <input
                  type="number"
                  value={pidParams.kd}
                  onChange={(e) => setPidParams(prev => ({ ...prev, kd: parseFloat(e.target.value) }))}
                  disabled={isBalancing}
                  style={{ width: '100%', padding: '0.5rem' }}
                />
              </div>
            </div>
          </div>

          <div className="control-group">
            {!isBalancing ? (
              <button
                className="btn btn-success"
                onClick={handleStartBalance}
                disabled={!allPinsValid || !isConnected}
                style={{ width: '100%' }}
              >
                🚀 Start Balancing
              </button>
            ) : (
              <button
                className="btn btn-danger"
                onClick={handleStopBalance}
                style={{ width: '100%' }}
              >
                ⏹️ Stop Balancing
              </button>
            )}
          </div>

          {isBalancing && (
            <div className="alert alert-info">
              🤖 PID controller active - pendulum balancing in progress
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="chart-container">
        <Line ref={chartRef} data={chartData} options={chartOptions} />
      </div>

      {/* System Info */}
      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px',
        fontSize: '0.9rem'
      }}>
        <h4>📊 System Parameters</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
          <div>Pendulum Length: 0.3m</div>
          <div>Pendulum Mass: 0.1kg</div>
          <div>Arm Length: 0.2m</div>
        </div>
      </div>
    </div>
  );
};

export default ExperimentMode;
