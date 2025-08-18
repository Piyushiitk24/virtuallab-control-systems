import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Custom Node Components
const ReferenceNode = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
      border: '2px solid #fff'
    }}>
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>
        📎 Reference
      </div>
      <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
        {data.value} RPM
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #ff6b6b' }} />
    </div>
  );
};

const PIDControllerNode = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #4ecdc4 0%, #2dd4bf 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '160px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)',
      border: '2px solid #fff'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #4ecdc4' }} />
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        🎛️ PID Controller
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        Kp: {data.kp?.toFixed(2)} | Ki: {data.ki?.toFixed(2)} | Kd: {data.kd?.toFixed(2)}
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
        Output: {data.output?.toFixed(1)}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #4ecdc4' }} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #4ecdc4' }} />
    </div>
  );
};

const MotorNode = ({ data }) => {
  return (
    <div style={{
      background: data.type === 'hardware' 
        ? 'linear-gradient(135deg, #45b7d1 0%, #2196f3 100%)'
        : 'linear-gradient(135deg, #9c27b0 0%, #673ab7 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '150px',
      textAlign: 'center',
      boxShadow: data.type === 'hardware' 
        ? '0 4px 12px rgba(69, 183, 209, 0.3)'
        : '0 4px 12px rgba(156, 39, 176, 0.3)',
      border: '2px solid #fff'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #45b7d1' }} />
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        {data.type === 'hardware' ? '⚙️ DC Motor' : '🖥️ Motor Model'}
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        {data.type === 'hardware' ? 'L298N + 600RPM' : 'Mathematical'}
      </div>
      <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
        {data.speed?.toFixed(1)} RPM
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #45b7d1' }} />
    </div>
  );
};

const EncoderNode = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '140px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(243, 156, 18, 0.3)',
      border: '2px solid #fff'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #f39c12' }} />
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        📡 Encoder
      </div>
      <div style={{ fontSize: '0.8rem', marginBottom: '5px' }}>
        600 PPR Optical
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
        {data.count || 0} pulses
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #f39c12' }} />
    </div>
  );
};

const SummerNode = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
      color: 'white',
      padding: '10px',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 4px 12px rgba(39, 174, 96, 0.3)',
      border: '2px solid #fff',
      fontSize: '1.5rem',
      fontWeight: 'bold'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#fff', border: '2px solid #27ae60' }} />
      <Handle type="target" position={Position.Bottom} style={{ background: '#fff', border: '2px solid #27ae60' }} />
      <div>Σ</div>
      <Handle type="source" position={Position.Right} style={{ background: '#fff', border: '2px solid #27ae60' }} />
    </div>
  );
};

const PlotNode = ({ data }) => {
  return (
    <div style={{
      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
      color: 'white',
      padding: '15px 20px',
      borderRadius: '12px',
      minWidth: '200px',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)',
      border: '2px solid #fff'
    }}>
      <Handle type="target" position={Position.Top} style={{ background: '#fff', border: '2px solid #34495e' }} />
      <div style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '8px' }}>
        📊 Live Comparison Plot
      </div>
      <div style={{ fontSize: '0.9rem', marginBottom: '5px' }}>
        Reference | Simulated | Actual
      </div>
      <div style={{ fontSize: '0.8rem' }}>
        Real-time Performance Analysis
      </div>
    </div>
  );
};

// Custom node types
const nodeTypes = {
  reference: ReferenceNode,
  pidController: PIDControllerNode,
  motor: MotorNode,
  encoder: EncoderNode,
  summer: SummerNode,
  plot: PlotNode,
};

// Custom edge style
const customEdgeStyle = {
  stroke: '#2196f3',
  strokeWidth: 3,
  strokeDasharray: '0',
  markerEnd: {
    type: 'arrowclosed',
    color: '#2196f3',
  },
};

const SystemDiagram = ({ 
  referenceSpeed, 
  simulatedSpeed, 
  actualSpeed, 
  simulationParams, 
  comparisonActive, 
  diagramType = 'hardware' // 'hardware' or 'simulation'
}) => {
  
  const initialNodes = useMemo(() => {
    if (diagramType === 'hardware') {
      return [
        {
          id: 'reference',
          type: 'reference',
          position: { x: 50, y: 100 },
          data: { value: referenceSpeed },
        },
        {
          id: 'summer',
          type: 'summer',
          position: { x: 250, y: 110 },
          data: {},
        },
        {
          id: 'pid',
          type: 'pidController',
          position: { x: 350, y: 80 },
          data: { 
            kp: simulationParams?.kp,
            ki: simulationParams?.ki,
            kd: simulationParams?.kd,
            output: (referenceSpeed - actualSpeed) * (simulationParams?.kp || 1)
          },
        },
        {
          id: 'motor',
          type: 'motor',
          position: { x: 570, y: 80 },
          data: { 
            type: 'hardware',
            speed: actualSpeed 
          },
        },
        {
          id: 'encoder',
          type: 'encoder',
          position: { x: 620, y: 200 },
          data: { 
            count: Math.floor(actualSpeed * 40) // Approximate pulse count
          },
        },
        {
          id: 'plot',
          type: 'plot',
          position: { x: 350, y: 280 },
          data: {},
        },
      ];
    } else {
      return [
        {
          id: 'reference-sim',
          type: 'reference',
          position: { x: 50, y: 100 },
          data: { value: referenceSpeed },
        },
        {
          id: 'summer-sim',
          type: 'summer',
          position: { x: 250, y: 110 },
          data: {},
        },
        {
          id: 'pid-sim',
          type: 'pidController',
          position: { x: 350, y: 80 },
          data: { 
            kp: simulationParams?.kp,
            ki: simulationParams?.ki,
            kd: simulationParams?.kd,
            output: (referenceSpeed - simulatedSpeed) * (simulationParams?.kp || 1)
          },
        },
        {
          id: 'motor-sim',
          type: 'motor',
          position: { x: 570, y: 80 },
          data: { 
            type: 'simulation',
            speed: simulatedSpeed 
          },
        },
        {
          id: 'plot-sim',
          type: 'plot',
          position: { x: 350, y: 200 },
          data: {},
        },
      ];
    }
  }, [referenceSpeed, simulatedSpeed, actualSpeed, simulationParams, diagramType]);

  const initialEdges = useMemo(() => {
    if (diagramType === 'hardware') {
      return [
        {
          id: 'ref-summer',
          source: 'reference',
          target: 'summer',
          style: customEdgeStyle,
          animated: comparisonActive,
        },
        {
          id: 'summer-pid',
          source: 'summer',
          target: 'pid',
          style: customEdgeStyle,
          animated: comparisonActive,
        },
        {
          id: 'pid-motor',
          source: 'pid',
          target: 'motor',
          style: customEdgeStyle,
          animated: comparisonActive,
          label: 'PWM Signal',
        },
        {
          id: 'motor-encoder',
          source: 'motor',
          target: 'encoder',
          style: customEdgeStyle,
          animated: comparisonActive,
        },
        {
          id: 'encoder-summer',
          source: 'encoder',
          target: 'summer',
          targetHandle: 'bottom',
          style: { 
            ...customEdgeStyle, 
            stroke: '#f39c12',
            strokeDasharray: '5,5'
          },
          animated: comparisonActive,
          label: 'Feedback',
        },
        {
          id: 'pid-plot',
          source: 'pid',
          sourceHandle: 'bottom',
          target: 'plot',
          targetHandle: 'top',
          style: { ...customEdgeStyle, stroke: '#9c27b0' },
          animated: comparisonActive,
        },
      ];
    } else {
      return [
        {
          id: 'ref-summer-sim',
          source: 'reference-sim',
          target: 'summer-sim',
          style: customEdgeStyle,
          animated: comparisonActive,
        },
        {
          id: 'summer-pid-sim',
          source: 'summer-sim',
          target: 'pid-sim',
          style: customEdgeStyle,
          animated: comparisonActive,
        },
        {
          id: 'pid-motor-sim',
          source: 'pid-sim',
          target: 'motor-sim',
          style: customEdgeStyle,
          animated: comparisonActive,
          label: 'Control Signal',
        },
        {
          id: 'motor-summer-sim',
          source: 'motor-sim',
          target: 'summer-sim',
          targetHandle: 'bottom',
          style: { 
            ...customEdgeStyle, 
            stroke: '#9c27b0',
            strokeDasharray: '5,5'
          },
          animated: comparisonActive,
          label: 'Feedback',
        },
        {
          id: 'pid-plot-sim',
          source: 'pid-sim',
          sourceHandle: 'bottom',
          target: 'plot-sim',
          targetHandle: 'top',
          style: { ...customEdgeStyle, stroke: '#9c27b0' },
          animated: comparisonActive,
        },
      ];
    }
  }, [comparisonActive, diagramType]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes when props change
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.type === 'reference') {
          return { ...node, data: { ...node.data, value: referenceSpeed } };
        }
        if (node.type === 'pidController') {
          const error = diagramType === 'hardware' 
            ? referenceSpeed - actualSpeed 
            : referenceSpeed - simulatedSpeed;
          return { 
            ...node, 
            data: { 
              ...node.data,
              kp: simulationParams?.kp,
              ki: simulationParams?.ki,
              kd: simulationParams?.kd,
              output: error * (simulationParams?.kp || 1)
            } 
          };
        }
        if (node.type === 'motor') {
          const speed = node.data.type === 'hardware' ? actualSpeed : simulatedSpeed;
          return { ...node, data: { ...node.data, speed } };
        }
        if (node.type === 'encoder' && diagramType === 'hardware') {
          return { 
            ...node, 
            data: { 
              ...node.data, 
              count: Math.floor(actualSpeed * 40) // Approximate pulse count
            } 
          };
        }
        return node;
      })
    );
  }, [referenceSpeed, simulatedSpeed, actualSpeed, simulationParams, diagramType, setNodes]);

  // Update edges animation when comparison state changes
  React.useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({ ...edge, animated: comparisonActive }))
    );
  }, [comparisonActive, setEdges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap 
          style={{ 
            background: '#f8f9fa',
            border: '1px solid #dee2e6'
          }}
          nodeColor={(node) => {
            switch (node.type) {
              case 'reference': return '#ff6b6b';
              case 'pidController': return '#4ecdc4';
              case 'motor': return node.data.type === 'hardware' ? '#45b7d1' : '#9c27b0';
              case 'encoder': return '#f39c12';
              case 'summer': return '#27ae60';
              case 'plot': return '#34495e';
              default: return '#95a5a6';
            }
          }}
        />
        <Background 
          variant="dots" 
          gap={20} 
          size={1} 
          style={{ background: '#fafafa' }}
        />
      </ReactFlow>
    </div>
  );
};

export default SystemDiagram;