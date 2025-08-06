import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const modules = [
    {
      id: 'rotary-pendulum',
      title: 'Rotary Inverted Pendulum',
      description: 'Learn control theory through hands-on experimentation with an inverted pendulum system. Features PID control, real-time plotting, and Arduino integration.',
      icon: '⚖️',
      studyPath: '/study/rotary-pendulum',
      experimentPath: '/experiment/rotary-pendulum'
    },
    // Future modules can be added here
    {
      id: 'dc-motor-control',
      title: 'DC Motor Speed Control',
      description: 'Master the fundamentals of motor control systems with PWM, feedback loops, and speed regulation techniques.',
      icon: '⚙️',
      studyPath: '/study/dc-motor-control',
      experimentPath: '/experiment/dc-motor-control',
      disabled: true
    },
    {
      id: 'servo-positioning',
      title: 'Servo Position Control',
      description: 'Explore precise positioning systems using servo motors with closed-loop feedback and trajectory planning.',
      icon: '🎯',
      studyPath: '/study/servo-positioning',
      experimentPath: '/experiment/servo-positioning',
      disabled: true
    }
  ];

  const handleModuleAction = (path, disabled) => {
    if (!disabled) {
      navigate(path);
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Control System Laboratory</h1>
      <p className="home-subtitle">
        Interactive learning platform for control systems engineering with real-time hardware experiments
      </p>
      
      <div className="modules-grid">
        {modules.map((module) => (
          <div 
            key={module.id} 
            className={`module-card ${module.disabled ? 'disabled' : ''}`}
            style={{ 
              opacity: module.disabled ? 0.6 : 1,
              cursor: module.disabled ? 'not-allowed' : 'pointer'
            }}
          >
            <div className="module-icon">{module.icon}</div>
            <h3 className="module-title">{module.title}</h3>
            <p className="module-description">{module.description}</p>
            
            <div className="module-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleModuleAction(module.studyPath, module.disabled)}
                disabled={module.disabled}
                title={module.disabled ? 'Coming Soon!' : 'Learn the theory and basics'}
              >
                📚 Study
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => handleModuleAction(module.experimentPath, module.disabled)}
                disabled={module.disabled}
                title={module.disabled ? 'Coming Soon!' : 'Hands-on hardware experiments'}
              >
                🔬 Experiment
              </button>
            </div>
            
            {module.disabled && (
              <div style={{ 
                marginTop: '1rem', 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '0.9rem' 
              }}>
                Coming Soon!
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '3rem', 
        color: 'rgba(255,255,255,0.8)', 
        fontSize: '0.9rem',
        textAlign: 'center'
      }}>
        <p>
          💡 <strong>Tip:</strong> For the best experience, use Google Chrome with Web Serial API support
        </p>
        <p>
          🔧 Make sure your Arduino is connected and the appropriate firmware is uploaded before starting experiments
        </p>
      </div>
    </div>
  );
};

export default HomePage;
