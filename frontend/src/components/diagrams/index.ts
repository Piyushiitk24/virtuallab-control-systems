// Main exports for diagram components
export { default as DiagramWrapper } from './DiagramWrapper';
export { DiagramErrorBoundary } from './DiagramErrorBoundary';

// Custom node components
export {
  ArduinoNode,
  MotorDriverNode,
  DCMotorNode,
  EncoderNodeComponent,
  PowerSupplyNode,
  GroundNode,
  MechanicalNode,
  JunctionNode
} from './CustomNodes';

// Connection diagrams
export {
  ArduinoPinDiagram,
  L298NConnectionDiagram,
  EncoderConnectionDiagram
} from './ConnectionDiagrams';

// Mechanical assembly diagrams
export {
  PendulumAssemblyDiagram,
  BallBeamAssemblyDiagram,
  DCMotorStructureDiagram
} from './MechanicalDiagrams';

// Study mode specific diagrams
export {
  SystemComponentsDiagram,
  PhysicsEquationDiagram,
  PinConnectionSummaryDiagram
} from './StudyModeDiagrams';

// Validation and layout utilities
export { DiagramValidator, DiagramLayouter } from './DiagramUtils';

// TypeScript types
export type {
  BaseNodeData,
  ElectricalNodeData,
  MechanicalNodeData,
  ControlNodeData,
  DiagramNode,
  DiagramEdge,
  DiagramProps,
  PinConnectionData,
  ComponentSpecs
} from './types';