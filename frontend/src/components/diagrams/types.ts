// TypeScript types for React Flow diagrams
import { Node, Edge } from 'reactflow';

export interface BaseNodeData {
  label: string;
  description?: string;
  status?: 'active' | 'inactive' | 'error';
  value?: string | number;
}

export interface ElectricalNodeData extends BaseNodeData {
  type: 'arduino' | 'motor' | 'driver' | 'encoder' | 'power' | 'component';
  pin?: string;
  pins?: string[];
  voltage?: string;
  current?: string;
  resolution?: string;
}

export interface MechanicalNodeData extends BaseNodeData {
  type: 'pendulum' | 'arm' | 'mass' | 'motor' | 'bearing' | 'coupling';
  dimensions?: string;
  material?: string;
  weight?: string;
}

export interface ControlNodeData extends BaseNodeData {
  type: 'controller' | 'sensor' | 'actuator' | 'summer' | 'gain' | 'integrator' | 'differentiator';
  parameters?: Record<string, number>;
  transferFunction?: string;
}

export interface DiagramNode extends Node {
  data: ElectricalNodeData | MechanicalNodeData | ControlNodeData;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  label?: string;
  data?: {
    signal?: string;
    bandwidth?: string;
    power?: string;
    type?: 'electrical' | 'mechanical' | 'signal' | 'data' | 'power';
  };
}

export interface DiagramProps {
  title: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  showMiniMap?: boolean;
  showControls?: boolean;
  interactive?: boolean;
  className?: string;
  height?: string;
  onNodeClick?: (node: DiagramNode) => void;
  onEdgeClick?: (edge: DiagramEdge) => void;
}

export interface PinConnectionData {
  from: { component: string; pin: string; };
  to: { component: string; pin: string; };
  signal: string;
  color: string;
}

export interface ComponentSpecs {
  name: string;
  type: string;
  pins?: Array<{
    name: string;
    type: 'input' | 'output' | 'power' | 'ground';
    description: string;
  }>;
  specifications?: Record<string, string>;
}