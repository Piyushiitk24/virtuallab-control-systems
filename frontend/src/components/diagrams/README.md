# React Flow Diagram System Documentation

## Overview

This comprehensive React Flow diagram system replaces all text-based "pin-diagram" sections throughout the application with interactive, professional visualizations. The system includes specialized components for electrical connections, mechanical assemblies, and control system schematics.

## Architecture

### Core Components

1. **DiagramWrapper** - Main container component for all diagrams
2. **CustomNodes** - Specialized node components for different system elements
3. **DiagramErrorBoundary** - Error handling and retry functionality
4. **DiagramUtils** - Validation and layout utilities

### Component Types

#### Custom Node Components
- `ArduinoNode` - Microcontroller boards
- `MotorDriverNode` - Power driver modules (L298N, etc.)
- `DCMotorNode` - DC motors with specifications
- `EncoderNodeComponent` - Position feedback sensors
- `PowerSupplyNode` - Power sources
- `GroundNode` - Ground connections
- `MechanicalNode` - Mechanical components
- `JunctionNode` - Connection points

#### Diagram Categories
- **Connection Diagrams** - Electrical wiring and pin connections
- **Mechanical Diagrams** - Physical assembly and structure
- **Study Mode Diagrams** - Educational system overviews

## Usage

### Basic Implementation

```tsx
import { DiagramWrapper } from './components/diagrams';
import { DiagramNode, DiagramEdge } from './components/diagrams/types';

const MyDiagram: React.FC = () => {
  const nodes: DiagramNode[] = [
    {
      id: 'arduino',
      type: 'default',
      position: { x: 100, y: 100 },
      data: {
        type: 'arduino',
        label: 'Arduino UNO',
        voltage: '5V',
        description: 'Main controller'
      }
    }
  ];

  const edges: DiagramEdge[] = [
    {
      id: 'e1',
      source: 'arduino',
      target: 'motor',
      data: { type: 'signal' }
    }
  ];

  return (
    <DiagramWrapper
      title="My Custom Diagram"
      nodes={nodes}
      edges={edges}
      height="400px"
      interactive={false}
    />
  );
};
```

### Pre-built Diagram Components

#### Connection Diagrams
```tsx
import { 
  ArduinoPinDiagram, 
  L298NConnectionDiagram, 
  EncoderConnectionDiagram 
} from './components/diagrams';

// Use directly in JSX
<ArduinoPinDiagram />
<L298NConnectionDiagram />
<EncoderConnectionDiagram />
```

#### Mechanical Assembly Diagrams
```tsx
import { 
  PendulumAssemblyDiagram, 
  BallBeamAssemblyDiagram, 
  DCMotorStructureDiagram 
} from './components/diagrams';

<PendulumAssemblyDiagram />
<BallBeamAssemblyDiagram />
<DCMotorStructureDiagram />
```

#### Study Mode Diagrams
```tsx
import { 
  SystemComponentsDiagram, 
  PhysicsEquationDiagram, 
  PinConnectionSummaryDiagram 
} from './components/diagrams';

<SystemComponentsDiagram />
<PhysicsEquationDiagram />
<PinConnectionSummaryDiagram />
```

## Migration from Text-based Diagrams

### Original Text Diagram
```javascript
<div className="pin-diagram">
{`Arduino Mega → L298N Connections:
Pin 8  → IN1  (Direction control 1) ✓
Pin 7  → IN2  (Direction control 2) ✓
Pin 9  → ENA  (PWM speed control)   ✓`}
</div>
```

### New React Flow Diagram
```tsx
import { PinConnectionSummaryDiagram } from './components/diagrams';

<PinConnectionSummaryDiagram />
```

## Validation and Quality Assurance

### Using the Validation System
```tsx
import { DiagramValidator } from './components/diagrams';

const validateMyDiagram = (nodes: DiagramNode[], edges: DiagramEdge[]) => {
  const validation = DiagramValidator.validateDiagram(nodes, edges);
  
  if (!validation.isValid) {
    console.error('Diagram validation errors:', validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Diagram warnings:', validation.warnings);
  }
  
  return validation.isValid;
};
```

### Getting Diagram Statistics
```tsx
import { DiagramValidator } from './components/diagrams';

const stats = DiagramValidator.getDiagramStats(nodes, edges);
console.log('Diagram statistics:', stats);
```

## Layout Utilities

### Auto-layout Options
```tsx
import { DiagramLayouter } from './components/diagrams';

// Force-directed layout
const layoutedNodes = DiagramLayouter.applyForceLayout(nodes, edges, {
  width: 800,
  height: 600,
  iterations: 100
});

// Grid layout
const gridNodes = DiagramLayouter.applyGridLayout(nodes, {
  columns: 3,
  spacing: 120
});

// Hierarchical layout
const hierarchicalNodes = DiagramLayouter.applyHierarchicalLayout(nodes, edges, {
  direction: 'vertical',
  levelSpacing: 150
});
```

## TypeScript Types

### Node Data Types
```tsx
interface ElectricalNodeData extends BaseNodeData {
  type: 'arduino' | 'motor' | 'driver' | 'encoder' | 'power' | 'component';
  pin?: string;
  pins?: string[];
  voltage?: string;
  current?: string;
  resolution?: string;
}

interface MechanicalNodeData extends BaseNodeData {
  type: 'pendulum' | 'arm' | 'mass' | 'motor' | 'bearing' | 'coupling';
  dimensions?: string;
  material?: string;
  weight?: string;
}
```

### Edge Data Types
```tsx
interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    signal?: string;
    bandwidth?: string;
    power?: string;
    type?: 'electrical' | 'mechanical' | 'signal' | 'data' | 'power';
  };
}
```

## Styling and Customization

### Edge Styles by Type
- **Power connections**: Red, thick lines (3px)
- **Signal connections**: Green, dashed lines (2px)
- **Data connections**: Purple, dash-dot lines (2px)
- **Mechanical connections**: Orange, solid thick lines (4px)
- **Electrical connections**: Blue, standard lines (2px)

### Node Color Coding
- **Arduino**: Green (#4CAF50)
- **Motor Driver**: Blue (#2196F3)
- **DC Motor**: Red-orange (#FF5722)
- **Encoder**: Orange (#FF9800)
- **Power Supply**: Purple (#9C27B0)
- **Ground**: Dark gray (#424242)
- **Mechanical**: Light green (#8BC34A)

## Error Handling

The system includes comprehensive error boundaries that:
- Catch and display diagram rendering errors
- Provide retry functionality
- Show helpful error messages
- Fallback to simplified views when needed

## Performance Considerations

- **Lazy Loading**: Import diagram components only when needed
- **Memoization**: Use React.memo for diagram components
- **Virtualization**: Large diagrams automatically handle performance
- **Interactive Control**: Disable interactions for read-only diagrams

## Best Practices

### Node Design
1. **Consistent Sizing**: Keep nodes proportionally sized
2. **Clear Labels**: Use descriptive, concise labels
3. **Proper Spacing**: Maintain 50px minimum between nodes
4. **Type Safety**: Always specify correct data types

### Edge Connections
1. **Logical Flow**: Connect related components meaningfully
2. **Type Specification**: Always specify edge type (power, signal, etc.)
3. **Clear Labels**: Add labels for complex connections
4. **Avoid Overlaps**: Use layout utilities to prevent crossing edges

### Validation
1. **Pre-validation**: Validate diagrams before rendering
2. **Error Handling**: Implement proper error boundaries
3. **User Feedback**: Show validation warnings to users
4. **Testing**: Include diagram validation in unit tests

## Migration Checklist

When replacing text-based diagrams:

- [ ] Identify all `.pin-diagram` classes in the codebase
- [ ] Create appropriate React Flow equivalent
- [ ] Validate diagram data structure
- [ ] Test interactive features (if enabled)
- [ ] Verify responsive layout on different screen sizes
- [ ] Check error handling scenarios
- [ ] Update any related documentation
- [ ] Remove old text-based diagram code

## Future Extensions

The system is designed for easy extension:
- Add new custom node types
- Create new diagram categories
- Implement advanced layout algorithms
- Add animation and transition effects
- Integrate with real-time data sources
- Support export to various formats (SVG, PNG, PDF)

## Support and Troubleshooting

### Common Issues
1. **TypeScript Errors**: Ensure proper type imports and usage
2. **Layout Problems**: Use layout utilities for complex diagrams
3. **Performance Issues**: Check for unnecessary re-renders
4. **Validation Failures**: Review node/edge data structure

### Debug Mode
Enable React Flow dev tools for debugging:
```tsx
<ReactFlow {...props} debug={process.env.NODE_ENV === 'development'} />
```