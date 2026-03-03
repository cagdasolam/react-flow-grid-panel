/**
 * TypeScript Type Definitions for React Flow Grid System
 * Comprehensive type definitions for all components and utilities
 */

import type { Node, Edge } from "reactflow";

/**
 * Grid coordinate system for relative positioning
 */
export interface GridCoordinates {
  rX: number; // Relative X coordinate (in grid units)
  rY: number; // Relative Y coordinate (in grid units)
}

/**
 * World coordinates for absolute positioning
 */
export interface WorldCoordinates {
  x: number;
  y: number;
}

/**
 * Custom node data structure for image-based nodes
 */
export interface CustomNodeData {
  /** URL of the image to display */
  imageUrl: string;

  /** Optional label displayed on hover */
  label?: string;

  /** Reference node for relative positioning (currently only 'root') */
  relativeTo: "root";

  /** Grid-based coordinates relative to the reference node */
  gridCoords: GridCoordinates;

  /** Whether this node is the root/master node */
  isRoot?: boolean;
}

/**
 * Extended Node type with CustomNodeData
 */
export type CustomNode = Node<CustomNodeData>;

/**
 * Grid snapping and positioning result
 */
export interface SnappedPositionResult {
  /** Snapped world X coordinate */
  worldX: number;

  /** Snapped world Y coordinate */
  worldY: number;

  /** Relative X coordinate (in grid units) */
  relativeX: number;

  /** Relative Y coordinate (in grid units) */
  relativeY: number;
}

/**
 * Node arrangement configuration for bulk operations
 */
export interface NodeArrangementConfig {
  /** Type of arrangement */
  type: "circle" | "grid" | "line" | "custom";

  /** Spacing between nodes (in pixels) */
  spacing?: number;

  /** Radius for circular arrangement (in pixels) */
  radius?: number;

  /** Number of columns for grid arrangement */
  columns?: number;

  /** Direction for linear arrangement */
  direction?: "horizontal" | "vertical";
}

/**
 * Structure configuration with nodes and edges
 */
export interface GridStructure {
  /** Array of nodes */
  nodes: CustomNode[];

  /** Array of edges connecting nodes */
  edges: Edge[];
}

/**
 * Node export format for serialization
 */
export interface ExportedNodeInfo {
  /** Unique node identifier */
  id: string;

  /** Node label */
  label?: string;

  /** World position coordinates */
  worldPosition: WorldCoordinates;

  /** Relative position in grid units */
  relativePosition: {
    units: GridCoordinates;
  };

  /** Image URL */
  imageUrl: string;

  /** Whether this is the root node */
  isRoot: boolean;
}

/**
 * Validation result for hierarchy checks
 */
export interface HierarchyValidationResult {
  /** Whether the hierarchy is valid */
  isValid: boolean;

  /** List of error messages if invalid */
  errors: string[];

  /** Number of nodes in the hierarchy */
  nodeCount: number;

  /** Whether a root node exists */
  hasRoot: boolean;
}

/**
 * Configuration for grid system
 */
export interface GridSystemConfig {
  /** Size of each grid unit in pixels */
  gridSize: number;

  /** Whether to snap nodes to grid */
  snapToGrid: boolean;

  /** Background color of the canvas */
  backgroundColor?: string;

  /** Grid line color */
  gridColor?: string;

  /** Visibility of debug panel */
  showDebugPanel: boolean;

  /** Visibility of grid background */
  showGridBackground: boolean;
}

/**
 * Handler function types
 */
export type OnNodeDragStop = (
  event: React.MouseEvent,
  draggedNode: CustomNode,
) => void;

export type OnNodeDragStart = (
  event: React.MouseEvent,
  draggedNode: CustomNode,
) => void;

export type OnNodesChange = (changes: any[]) => void;
export type OnEdgesChange = (changes: any[]) => void;

/**
 * Hook return types
 */
export interface UseGridNodeHandlingReturn {
  onNodeDragStop: OnNodeDragStop;
  recalculateAllCoordinates: () => void;
}

export interface UseNodeInfoReturn {
  formatNodesForExport: (nodes: CustomNode[]) => ExportedNodeInfo[];
  findRootNode: (nodes: CustomNode[]) => CustomNode | undefined;
  getChildNodes: (nodes: CustomNode[]) => CustomNode[];
  validateHierarchy: (nodes: CustomNode[]) => boolean;
}

export interface UseBulkNodeOperationsReturn {
  moveAllNodes: (deltaX: number, deltaY: number) => void;
  centerNodesAround: (centerX: number, centerY: number) => void;
  arrangeInCircle: (radius?: number) => void;
  arrangeInGrid: (spacing?: number) => void;
}

/**
 * Event payload types
 */
export interface NodePositionChangeEvent {
  nodeId: string;
  oldPosition: WorldCoordinates;
  newPosition: WorldCoordinates;
  relativePosition: GridCoordinates;
  timestamp: number;
}

export interface NodeSelectionChangeEvent {
  nodeId: string;
  selected: boolean;
  timestamp: number;
}

/**
 * Utility function parameter and return types
 */
export interface SnapToGridParams {
  value: number;
  gridSize?: number;
}

export interface CalculateRelativeCoordinatesParams {
  worldX: number;
  worldY: number;
  referenceX: number;
  referenceY: number;
  gridSize?: number;
}

export interface CalculateWorldCoordinatesParams {
  relativeX: number;
  relativeY: number;
  referenceX: number;
  referenceY: number;
  gridSize?: number;
}

/**
 * Context types for state management
 */
export interface GridContextType {
  nodes: CustomNode[];
  edges: Edge[];
  setNodes: (
    nodes: CustomNode[] | ((prev: CustomNode[]) => CustomNode[]),
  ) => void;
  setEdges: (edges: Edge[] | ((prev: Edge[]) => Edge[])) => void;
  config: GridSystemConfig;
}

/**
 * Error types
 */
export class GridSystemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GridSystemError";
  }
}

export class InvalidReferenceError extends GridSystemError {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReferenceError";
  }
}

export class HierarchyError extends GridSystemError {
  constructor(message: string) {
    super(message);
    this.name = "HierarchyError";
  }
}
