import { DiagramNode, DiagramEdge } from './types';

// Validation utility functions for diagram components
export class DiagramValidator {
  
  // Validate that all nodes have required properties
  static validateNodes(nodes: DiagramNode[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    nodes.forEach((node, index) => {
      // Check required properties
      if (!node.id) {
        errors.push(`Node ${index}: Missing required 'id' property`);
      }
      
      if (!node.data) {
        errors.push(`Node ${index}: Missing required 'data' property`);
        return;
      }
      
      if (!node.data.label) {
        errors.push(`Node ${index} (${node.id}): Missing required 'label' property`);
      }
      
      if (!node.data.type) {
        errors.push(`Node ${index} (${node.id}): Missing required 'type' property`);
      }
      
      // Check position
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${index} (${node.id}): Invalid position property`);
      }
      
      // Type-specific validations
      if (node.data.type === 'arduino' && 'voltage' in node.data && !node.data.voltage) {
        errors.push(`Node ${index} (${node.id}): Arduino nodes should have voltage specification`);
      }
      
      if (node.data.type === 'motor' && 'voltage' in node.data && 'current' in node.data && 
          (!node.data.voltage || !node.data.current)) {
        errors.push(`Node ${index} (${node.id}): Motor nodes should have voltage and current specifications`);
      }
      
      if (node.data.type === 'encoder' && 'resolution' in node.data && !node.data.resolution) {
        errors.push(`Node ${index} (${node.id}): Encoder nodes should have resolution specification`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Validate edges and their connections
  static validateEdges(edges: DiagramEdge[], nodes: DiagramNode[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const nodeIds = new Set(nodes.map(node => node.id));
    
    edges.forEach((edge, index) => {
      // Check required properties
      if (!edge.id) {
        errors.push(`Edge ${index}: Missing required 'id' property`);
      }
      
      if (!edge.source) {
        errors.push(`Edge ${index}: Missing required 'source' property`);
      } else if (!nodeIds.has(edge.source)) {
        errors.push(`Edge ${index} (${edge.id}): Source node '${edge.source}' does not exist`);
      }
      
      if (!edge.target) {
        errors.push(`Edge ${index}: Missing required 'target' property`);
      } else if (!nodeIds.has(edge.target)) {
        errors.push(`Edge ${index} (${edge.id}): Target node '${edge.target}' does not exist`);
      }
      
      // Check for self-referencing edges
      if (edge.source === edge.target) {
        errors.push(`Edge ${index} (${edge.id}): Self-referencing edge detected`);
      }
      
      // Validate edge type if specified
      if (edge.data?.type) {
        const validTypes = ['electrical', 'mechanical', 'signal', 'data', 'power'];
        if (!validTypes.includes(edge.data.type)) {
          errors.push(`Edge ${index} (${edge.id}): Invalid edge type '${edge.data.type}'`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Check for duplicate node IDs
  static validateUniqueIds(nodes: DiagramNode[], edges: DiagramEdge[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for duplicate node IDs
    const nodeIds = new Set<string>();
    const duplicateNodeIds = new Set<string>();
    
    nodes.forEach(node => {
      if (nodeIds.has(node.id)) {
        duplicateNodeIds.add(node.id);
      } else {
        nodeIds.add(node.id);
      }
    });
    
    duplicateNodeIds.forEach(id => {
      errors.push(`Duplicate node ID detected: '${id}'`);
    });
    
    // Check for duplicate edge IDs
    const edgeIds = new Set<string>();
    const duplicateEdgeIds = new Set<string>();
    
    edges.forEach(edge => {
      if (edgeIds.has(edge.id)) {
        duplicateEdgeIds.add(edge.id);
      } else {
        edgeIds.add(edge.id);
      }
    });
    
    duplicateEdgeIds.forEach(id => {
      errors.push(`Duplicate edge ID detected: '${id}'`);
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Comprehensive validation
  static validateDiagram(nodes: DiagramNode[], edges: DiagramEdge[]): { 
    isValid: boolean; 
    errors: string[]; 
    warnings: string[] 
  } {
    const nodeValidation = this.validateNodes(nodes);
    const edgeValidation = this.validateEdges(edges, nodes);
    const idValidation = this.validateUniqueIds(nodes, edges);
    
    const allErrors = [
      ...nodeValidation.errors,
      ...edgeValidation.errors,
      ...idValidation.errors
    ];
    
    // Generate warnings for best practices
    const warnings: string[] = [];
    
    // Check for isolated nodes (no connections)
    const connectedNodeIds = new Set<string>();
    edges.forEach(edge => {
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    });
    
    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id)) {
        warnings.push(`Node '${node.id}' (${node.data.label}) has no connections`);
      }
    });
    
    // Check for nodes without descriptions
    nodes.forEach(node => {
      if (!node.data.description) {
        warnings.push(`Node '${node.id}' (${node.data.label}) missing description`);
      }
    });
    
    // Check for very close node positions (potential overlaps)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        const distance = Math.sqrt(
          Math.pow(node1.position.x - node2.position.x, 2) + 
          Math.pow(node1.position.y - node2.position.y, 2)
        );
        
        if (distance < 50) {
          warnings.push(`Nodes '${node1.id}' and '${node2.id}' are very close (${distance.toFixed(1)}px) - possible overlap`);
        }
      }
    }
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings
    };
  }
  
  // Get diagram statistics
  static getDiagramStats(nodes: DiagramNode[], edges: DiagramEdge[]): {
    nodeCount: number;
    edgeCount: number;
    nodeTypes: Record<string, number>;
    edgeTypes: Record<string, number>;
    avgConnections: number;
    isolatedNodes: number;
  } {
    const nodeTypes: Record<string, number> = {};
    const edgeTypes: Record<string, number> = {};
    
    // Count node types
    nodes.forEach(node => {
      const type = node.data.type;
      nodeTypes[type] = (nodeTypes[type] || 0) + 1;
    });
    
    // Count edge types
    edges.forEach(edge => {
      const type = edge.data?.type || 'unspecified';
      edgeTypes[type] = (edgeTypes[type] || 0) + 1;
    });
    
    // Calculate connections per node
    const connectionCount: Record<string, number> = {};
    nodes.forEach(node => {
      connectionCount[node.id] = 0;
    });
    
    edges.forEach(edge => {
      connectionCount[edge.source] = (connectionCount[edge.source] || 0) + 1;
      connectionCount[edge.target] = (connectionCount[edge.target] || 0) + 1;
    });
    
    const totalConnections = Object.values(connectionCount).reduce((sum, count) => sum + count, 0);
    const avgConnections = nodes.length > 0 ? totalConnections / nodes.length : 0;
    
    // Count isolated nodes
    const isolatedNodes = Object.values(connectionCount).filter(count => count === 0).length;
    
    return {
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodeTypes,
      edgeTypes,
      avgConnections,
      isolatedNodes
    };
  }
}

// Auto-layout utility for better node positioning
export class DiagramLayouter {
  
  // Simple force-directed layout algorithm
  static applyForceLayout(
    nodes: DiagramNode[], 
    edges: DiagramEdge[],
    options: {
      width?: number;
      height?: number;
      iterations?: number;
      repulsion?: number;
      attraction?: number;
      damping?: number;
    } = {}
  ): DiagramNode[] {
    const {
      width = 800,
      height = 600,
      iterations = 100,
      repulsion = 1000,
      attraction = 0.1,
      damping = 0.9
    } = options;
    
    // Initialize positions if not set
    const layoutNodes = nodes.map(node => ({
      ...node,
      position: node.position || {
        x: Math.random() * width,
        y: Math.random() * height
      },
      velocity: { x: 0, y: 0 }
    }));
    
    // Build adjacency map
    const adjacency: Record<string, string[]> = {};
    layoutNodes.forEach(node => {
      adjacency[node.id] = [];
    });
    
    edges.forEach(edge => {
      if (adjacency[edge.source] && adjacency[edge.target]) {
        adjacency[edge.source].push(edge.target);
        adjacency[edge.target].push(edge.source);
      }
    });
    
    // Force-directed layout iterations
    for (let iter = 0; iter < iterations; iter++) {
      layoutNodes.forEach(node => {
        let fx = 0, fy = 0;
        
        // Repulsive forces between all nodes
        layoutNodes.forEach(other => {
          if (node.id !== other.id) {
            const dx = node.position.x - other.position.x;
            const dy = node.position.y - other.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            const force = repulsion / (distance * distance);
            
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        });
        
        // Attractive forces between connected nodes
        adjacency[node.id].forEach(connectedId => {
          const other = layoutNodes.find(n => n.id === connectedId);
          if (other) {
            const dx = other.position.x - node.position.x;
            const dy = other.position.y - node.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy) || 1;
            
            fx += dx * attraction;
            fy += dy * attraction;
          }
        });
        
        // Update velocity and position
        (node as any).velocity.x = ((node as any).velocity.x + fx) * damping;
        (node as any).velocity.y = ((node as any).velocity.y + fy) * damping;
        
        node.position.x += (node as any).velocity.x;
        node.position.y += (node as any).velocity.y;
        
        // Keep nodes within bounds
        node.position.x = Math.max(50, Math.min(width - 50, node.position.x));
        node.position.y = Math.max(50, Math.min(height - 50, node.position.y));
      });
    }
    
    // Remove velocity property and return
    return layoutNodes.map(node => {
      const { velocity, ...cleanNode } = node as any;
      return cleanNode;
    });
  }
  
  // Grid layout for organized positioning
  static applyGridLayout(
    nodes: DiagramNode[],
    options: {
      columns?: number;
      spacing?: number;
      startX?: number;
      startY?: number;
    } = {}
  ): DiagramNode[] {
    const {
      columns = Math.ceil(Math.sqrt(nodes.length)),
      spacing = 120,
      startX = 50,
      startY = 50
    } = options;
    
    return nodes.map((node, index) => ({
      ...node,
      position: {
        x: startX + (index % columns) * spacing,
        y: startY + Math.floor(index / columns) * spacing
      }
    }));
  }
  
  // Hierarchical layout for tree-like structures
  static applyHierarchicalLayout(
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    options: {
      direction?: 'horizontal' | 'vertical';
      levelSpacing?: number;
      nodeSpacing?: number;
      startX?: number;
      startY?: number;
    } = {}
  ): DiagramNode[] {
    const {
      direction = 'vertical',
      levelSpacing = 150,
      nodeSpacing = 100,
      startX = 50,
      startY = 50
    } = options;
    
    // Build adjacency and find root nodes (nodes with no incoming edges)
    const incomingEdges: Record<string, string[]> = {};
    const outgoingEdges: Record<string, string[]> = {};
    
    nodes.forEach(node => {
      incomingEdges[node.id] = [];
      outgoingEdges[node.id] = [];
    });
    
    edges.forEach(edge => {
      incomingEdges[edge.target].push(edge.source);
      outgoingEdges[edge.source].push(edge.target);
    });
    
    // Find root nodes (no incoming edges)
    const rootNodes = nodes.filter(node => incomingEdges[node.id].length === 0);
    
    if (rootNodes.length === 0) {
      // Fallback to grid layout if no clear hierarchy
      return this.applyGridLayout(nodes, { spacing: nodeSpacing });
    }
    
    // Assign levels using BFS
    const levels: DiagramNode[][] = [];
    const visited = new Set<string>();
    const queue: { node: DiagramNode; level: number }[] = [];
    
    rootNodes.forEach(node => {
      queue.push({ node, level: 0 });
    });
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      
      if (visited.has(node.id)) continue;
      visited.add(node.id);
      
      if (!levels[level]) levels[level] = [];
      levels[level].push(node);
      
      // Add children to queue
      outgoingEdges[node.id].forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode && !visited.has(childId)) {
          queue.push({ node: childNode, level: level + 1 });
        }
      });
    }
    
    // Position nodes
    const positionedNodes: DiagramNode[] = [];
    
    levels.forEach((levelNodes, levelIndex) => {
      levelNodes.forEach((node, nodeIndex) => {
        const levelWidth = (levelNodes.length - 1) * nodeSpacing;
        const levelStartX = startX - levelWidth / 2;
        
        positionedNodes.push({
          ...node,
          position: direction === 'vertical' ? {
            x: levelStartX + nodeIndex * nodeSpacing,
            y: startY + levelIndex * levelSpacing
          } : {
            x: startX + levelIndex * levelSpacing,
            y: startY + nodeIndex * nodeSpacing
          }
        });
      });
    });
    
    return positionedNodes;
  }
}