/**
 * Grid and Coordinate Utilities for React Flow Grid System
 * Handles snap-to-grid calculations and relative positioning logic
 */

export const GRID_SIZE = 20; // 20px grid unit

/**
 * Snaps a coordinate to the nearest grid point
 * @param value - The coordinate value to snap
 * @param gridSize - The size of the grid unit (default: GRID_SIZE)
 * @returns The snapped coordinate value
 */
export const snapToGrid = (
  value: number,
  gridSize: number = GRID_SIZE,
): number => {
  return Math.round(value / gridSize) * gridSize;
};

/**
 * Converts world coordinates to relative coordinates based on a reference node
 * @param worldX - World position X
 * @param worldY - World position Y
 * @param referenceX - Reference node world position X
 * @param referenceY - Reference node world position Y
 * @param gridSize - The size of the grid unit (default: GRID_SIZE)
 * @returns Object with relative coordinates in grid units
 */
export const calculateRelativeCoordinates = (
  worldX: number,
  worldY: number,
  referenceX: number,
  referenceY: number,
  gridSize: number = GRID_SIZE,
): { rX: number; rY: number } => {
  const relativeX = worldX - referenceX;
  const relativeY = worldY - referenceY;

  return {
    rX: Math.round(relativeX / gridSize),
    rY: Math.round(relativeY / gridSize),
  };
};

/**
 * Converts relative coordinates to world coordinates
 * @param relativeX - Relative X coordinate (in grid units)
 * @param relativeY - Relative Y coordinate (in grid units)
 * @param referenceX - Reference node world position X
 * @param referenceY - Reference node world position Y
 * @param gridSize - The size of the grid unit (default: GRID_SIZE)
 * @returns Object with world coordinates
 */
export const calculateWorldCoordinates = (
  relativeX: number,
  relativeY: number,
  referenceX: number,
  referenceY: number,
  gridSize: number = GRID_SIZE,
): { x: number; y: number } => {
  return {
    x: referenceX + relativeX * gridSize,
    y: referenceY + relativeY * gridSize,
  };
};

/**
 * Calculates the snapped position for a node being dragged
 * Uses both grid snapping and relative coordinate calculation
 * @param newX - New world X position
 * @param newY - New world Y position
 * @param referenceX - Reference node world position X
 * @param referenceY - Reference node world position Y
 * @param gridSize - The size of the grid unit (default: GRID_SIZE)
 * @returns Object with snapped world coordinates and relative grid coordinates
 */
export const calculateSnappedPosition = (
  newX: number,
  newY: number,
  referenceX: number,
  referenceY: number,
  gridSize: number = GRID_SIZE,
) => {
  // Snap to grid first
  const snappedX = snapToGrid(newX, gridSize);
  const snappedY = snapToGrid(newY, gridSize);

  // Calculate relative coordinates
  const { rX, rY } = calculateRelativeCoordinates(
    snappedX,
    snappedY,
    referenceX,
    referenceY,
    gridSize,
  );

  return {
    worldX: snappedX,
    worldY: snappedY,
    relativeX: rX,
    relativeY: rY,
  };
};

/**
 * Draws a background grid pattern for visual reference
 * Used in canvas context or SVG
 * @param ctx - Canvas 2D context
 * @param width - Canvas width
 * @param height - Canvas height
 * @param gridSize - The size of the grid unit (default: GRID_SIZE)
 * @param color - Grid line color (default: #e0e0e0)
 */
export const drawGridPattern = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  gridSize: number = GRID_SIZE,
  color: string = "#e0e0e0",
) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 0.5;

  // Vertical lines
  for (let x = 0; x < width; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // Horizontal lines
  for (let y = 0; y < height; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
};
