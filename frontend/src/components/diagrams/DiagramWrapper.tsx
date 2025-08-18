import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  FitViewOptions,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';

import { DiagramErrorBoundary } from './DiagramErrorBoundary';
import {
  ArduinoNode,
  MotorDriverNode,
  DCMotorNode,
  EncoderNodeComponent,
  PowerSupplyNode,
  GroundNode,
  MechanicalNode,
  JunctionNode
} from './CustomNodes';
import { DiagramProps, DiagramNode, DiagramEdge } from './types';

// Custom node types mapping
const nodeTypes: NodeTypes = {
  arduino: ArduinoNode,
  motorDriver: MotorDriverNode,
  dcMotor: DCMotorNode,
  encoder: EncoderNodeComponent,
  powerSupply: PowerSupplyNode,
  ground: GroundNode,
  mechanical: MechanicalNode,
  junction: JunctionNode,
};

// Default edge style
const defaultEdgeStyle = {
  stroke: '#2196f3',
  strokeWidth: 2,
};

// Custom edge styles for different types
const getEdgeStyle = (edgeType?: string) => {
  switch (edgeType) {
    case 'power':
      return { stroke: '#f44336', strokeWidth: 3, strokeDasharray: '0' };
    case 'signal':
      return { stroke: '#4caf50', strokeWidth: 2, strokeDasharray: '5,5' };
    case 'data':
      return { stroke: '#9c27b0', strokeWidth: 2, strokeDasharray: '10,5' };
    case 'mechanical':
      return { stroke: '#ff9800', strokeWidth: 4, strokeDasharray: '0' };
    default:
      return defaultEdgeStyle;
  }
};

const DiagramWrapper: React.FC<DiagramProps> = ({
  title,
  nodes: initialNodes,
  edges: initialEdges,
  showMiniMap = true,
  showControls = true,
  interactive = true,
  className = '',
  height = '400px',
  onNodeClick,
  onEdgeClick
}) => {
  // Convert our custom types to ReactFlow types
  const reactFlowNodes: Node[] = useMemo(() => 
    initialNodes.map(node => ({
      ...node,
      type: node.data.type === 'arduino' ? 'arduino' :
             node.data.type === 'driver' ? 'motorDriver' :
             node.data.type === 'motor' ? 'dcMotor' :
             node.data.type === 'encoder' ? 'encoder' :
             node.data.type === 'power' ? 'powerSupply' :
             node.data.type === 'component' && node.data.label === 'GND' ? 'ground' :
             'mechanical'
    })), 
    [initialNodes]
  );

  const reactFlowEdges: Edge[] = useMemo(() => 
    initialEdges.map(edge => ({
      ...edge,
      style: {
        ...getEdgeStyle(edge.data?.type),
        ...edge.style
      },
      animated: edge.animated || false,
      markerEnd: {
        type: 'arrowclosed' as const,
        color: getEdgeStyle(edge.data?.type).stroke,
      }
    })),
    [initialEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Update nodes when props change
  React.useEffect(() => {
    setNodes(reactFlowNodes);
  }, [reactFlowNodes, setNodes]);

  // Update edges when props change
  React.useEffect(() => {
    setEdges(reactFlowEdges);
  }, [reactFlowEdges, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (interactive) {
        setEdges((eds) => addEdge(params, eds));
      }
    },
    [setEdges, interactive]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      if (onNodeClick) {
        onNodeClick(node as DiagramNode);
      }
    },
    [onNodeClick]
  );

  const handleEdgeClick = useCallback(
    (event: React.MouseEvent, edge: Edge) => {
      if (onEdgeClick) {
        onEdgeClick(edge as DiagramEdge);
      }
    },
    [onEdgeClick]
  );

  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
    includeHiddenNodes: false,
  };

  return (
    <DiagramErrorBoundary diagramName={title}>
      <div className={`diagram-container ${className}`} style={{ height }}>
        <div style={{
          background: '#f8f9fa',
          padding: '10px 15px',
          borderBottom: '1px solid #dee2e6',
          fontWeight: 'bold',
          fontSize: '1.1rem',
          color: '#495057'
        }}>
          {title}
        </div>
        
        <div style={{ width: '100%', height: 'calc(100% - 50px)' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={interactive ? onNodesChange : undefined}
            onEdgesChange={interactive ? onEdgesChange : undefined}
            onConnect={interactive ? onConnect : undefined}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={fitViewOptions}
            attributionPosition="bottom-right"
            nodesDraggable={interactive}
            nodesConnectable={interactive}
            elementsSelectable={interactive}
            selectNodesOnDrag={interactive}
            panOnDrag={true}
            zoomOnScroll={true}
            zoomOnPinch={true}
            zoomOnDoubleClick={true}
            deleteKeyCode={interactive ? 'Delete' : null}
          >
            {showControls && <Controls />}
            {showMiniMap && (
              <MiniMap 
                style={{ 
                  background: '#f8f9fa',
                  border: '1px solid #dee2e6'
                }}
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'arduino': return '#4CAF50';
                    case 'motorDriver': return '#2196F3';
                    case 'dcMotor': return '#FF5722';
                    case 'encoder': return '#FF9800';
                    case 'powerSupply': return '#9C27B0';
                    case 'ground': return '#424242';
                    case 'mechanical': return '#8BC34A';
                    case 'junction': return '#333';
                    default: return '#95a5a6';
                  }
                }}
              />
            )}
            <Background 
              variant="dots" as const 
              gap={20} 
              size={1} 
              style={{ background: '#fafafa' }}
            />
          </ReactFlow>
        </div>
      </div>
    </DiagramErrorBoundary>
  );
};

export default DiagramWrapper;