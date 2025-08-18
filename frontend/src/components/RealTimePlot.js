import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RealTimePlot = ({ 
  plotData, 
  referenceSpeed, 
  simulatedSpeed, 
  actualSpeed, 
  comparisonActive 
}) => {
  const chartRef = useRef();

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0, // Disable animation for real-time updates
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            weight: 'bold',
          },
        },
      },
      title: {
        display: true,
        text: 'Real-time Speed Comparison: Reference vs Simulated vs Actual',
        font: {
          size: 16,
          weight: 'bold',
        },
        color: '#333',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff',
        borderWidth: 1,
        displayColors: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} RPM`;
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Time (seconds)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Speed (RPM)',
          font: {
            size: 14,
            weight: 'bold',
          },
        },
        min: 0,
        max: Math.max(700, referenceSpeed + 100),
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          lineWidth: 1,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      point: {
        radius: 3,
        hoverRadius: 6,
      },
      line: {
        tension: 0.2,
        borderWidth: 3,
      },
    },
  };

  const data = {
    datasets: [
      {
        label: 'Reference Speed',
        data: plotData.time.map((time, index) => ({
          x: time,
          y: plotData.reference[index] || referenceSpeed,
        })),
        borderColor: '#d32f2f',
        backgroundColor: 'rgba(211, 47, 47, 0.1)',
        borderWidth: 3,
        borderDash: [5, 5],
        pointBackgroundColor: '#d32f2f',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: false,
      },
      {
        label: 'Simulated Speed',
        data: plotData.time.map((time, index) => ({
          x: time,
          y: plotData.simulated[index] || simulatedSpeed,
        })),
        borderColor: '#9c27b0',
        backgroundColor: 'rgba(156, 39, 176, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#9c27b0',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: false,
      },
      {
        label: 'Actual Speed',
        data: plotData.time.map((time, index) => ({
          x: time,
          y: plotData.actual[index] || actualSpeed,
        })),
        borderColor: '#2e7d32',
        backgroundColor: 'rgba(46, 125, 50, 0.1)',
        borderWidth: 3,
        pointBackgroundColor: '#2e7d32',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        fill: false,
      },
    ],
  };

  // Update chart when data changes
  useEffect(() => {
    if (chartRef.current && comparisonActive) {
      chartRef.current.update('none'); // Update without animation
    }
  }, [plotData, comparisonActive]);

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '20px',
      borderRadius: '12px',
      border: '2px solid #e9ecef',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
      minHeight: '450px',
    }}>
      {plotData.time.length > 0 ? (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px',
            padding: '10px 15px',
            background: 'rgba(33, 150, 243, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(33, 150, 243, 0.2)',
          }}>
            <div style={{ 
              display: 'flex', 
              gap: '20px',
              fontSize: '0.9rem',
              fontWeight: 'bold',
            }}>
              <span style={{ color: '#d32f2f' }}>
                🎯 Ref: {referenceSpeed} RPM
              </span>
              <span style={{ color: '#9c27b0' }}>
                🖥️ Sim: {simulatedSpeed.toFixed(1)} RPM
              </span>
              <span style={{ color: '#2e7d32' }}>
                ⚙️ Act: {actualSpeed.toFixed(1)} RPM
              </span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: comparisonActive ? '#4caf50' : '#f44336',
                animation: comparisonActive ? 'pulse 1.5s infinite' : 'none',
              }} />
              <span style={{ 
                fontSize: '0.9rem', 
                fontWeight: 'bold',
                color: comparisonActive ? '#4caf50' : '#f44336',
              }}>
                {comparisonActive ? 'LIVE' : 'STOPPED'}
              </span>
            </div>
          </div>
          <div style={{ height: '350px' }}>
            <Line 
              ref={chartRef}
              data={data} 
              options={options} 
            />
          </div>
          <div style={{
            marginTop: '15px',
            padding: '10px 15px',
            background: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 193, 7, 0.2)',
            fontSize: '0.85rem',
            color: '#666',
          }}>
            💡 <strong>Live Performance Metrics:</strong> 
            Error = {Math.abs(referenceSpeed - actualSpeed).toFixed(1)} RPM | 
            Sim Error = {Math.abs(referenceSpeed - simulatedSpeed).toFixed(1)} RPM | 
            Data Points: {plotData.time.length}
          </div>
        </>
      ) : (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          height: '400px',
          textAlign: 'center',
          color: '#666' 
        }}>
          <div style={{ 
            fontSize: '4rem', 
            marginBottom: '20px',
            background: 'linear-gradient(135deg, #2196f3, #9c27b0)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            📊
          </div>
          <h3 style={{ 
            color: '#333', 
            marginBottom: '10px',
            fontSize: '1.3rem',
          }}>
            Real-time Comparison Plot
          </h3>
          <p style={{ 
            fontSize: '1rem', 
            marginBottom: '20px',
            maxWidth: '400px',
            lineHeight: '1.5',
          }}>
            Start the comparison to see live plotting of Reference, Simulated, and Actual motor speeds
          </p>
          <div style={{
            display: 'flex',
            gap: '15px',
            marginTop: '20px',
          }}>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(211, 47, 47, 0.1)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              color: '#d32f2f',
              fontWeight: 'bold',
            }}>
              🎯 Reference
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(156, 39, 176, 0.1)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              color: '#9c27b0',
              fontWeight: 'bold',
            }}>
              🖥️ Simulated
            </div>
            <div style={{
              padding: '8px 16px',
              background: 'rgba(46, 125, 50, 0.1)',
              borderRadius: '20px',
              fontSize: '0.9rem',
              color: '#2e7d32',
              fontWeight: 'bold',
            }}>
              ⚙️ Actual
            </div>
          </div>
        </div>
      )}
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default RealTimePlot;