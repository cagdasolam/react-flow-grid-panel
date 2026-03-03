import { useCallback } from "react";
import type { Node } from "reactflow";
import {
  calculateSnappedPosition,
  calculateRelativeCoordinates,
  GRID_SIZE,
} from "../utils/gridUtils";
import type { CustomNodeData } from "../components/CustomImageNode";

/**
 * Hook for managing grid-based node positioning
 * Provides efficient callbacks for drag operations
 */
export const useGridNodeHandling = (
  setNodes: (
    callback: (nodes: Node<CustomNodeData>[]) => Node<CustomNodeData>[],
  ) => void,
  gridSize: number = GRID_SIZE,
) => {
  /**
   * Handles node drag stop event with snap-to-grid and relative positioning
   */
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node<CustomNodeData>) => {
      setNodes((prevNodes) => {
        const rootNode = prevNodes.find((n) => n.data?.isRoot);
        if (!rootNode) return prevNodes;

        const snappedData = calculateSnappedPosition(
          draggedNode.position.x,
          draggedNode.position.y,
          rootNode.position.x,
          rootNode.position.y,
          gridSize,
        );

        return prevNodes.map((node) => {
          if (node.id === draggedNode.id) {
            return {
              ...node,
              position: {
                x: snappedData.worldX,
                y: snappedData.worldY,
              },
              data: {
                ...node.data,
                gridCoords: {
                  rX: snappedData.relativeX,
                  rY: snappedData.relativeY,
                },
              },
            };
          }

          if (node.data?.isRoot && draggedNode.id === "root") {
            return {
              ...node,
              position: {
                x: snappedData.worldX,
                y: snappedData.worldY,
              },
              data: {
                ...node.data,
                gridCoords: {
                  rX: 0,
                  rY: 0,
                },
              },
            };
          }

          return node;
        });
      });
    },
    [setNodes, gridSize],
  );

  /**
   * Recalculates relative coordinates for all nodes
   * Useful after bulk operations or when reference frame changes
   */
  const recalculateAllCoordinates = useCallback(() => {
    setNodes((prevNodes) => {
      const rootNode = prevNodes.find((n) => n.data?.isRoot);
      if (!rootNode) return prevNodes;

      return prevNodes.map((node) => {
        if (node.data?.isRoot) return node;

        const { rX, rY } = calculateRelativeCoordinates(
          node.position.x,
          node.position.y,
          rootNode.position.x,
          rootNode.position.y,
          gridSize,
        );

        return {
          ...node,
          data: {
            ...node.data,
            gridCoords: { rX, rY },
          },
        };
      });
    });
  }, [setNodes, gridSize]);

  return {
    onNodeDragStop,
    recalculateAllCoordinates,
  };
};

/**
 * Hook for getting node information
 * Provides utilities to query and format node data
 */
export const useNodeInfo = () => {
  /**
   * Gets all nodes in a structured format for export/debug
   */
  const formatNodesForExport = useCallback((nodes: Node<CustomNodeData>[]) => {
    return nodes.map((node) => ({
      id: node.id,
      label: node.data?.label,
      worldPosition: {
        x: node.position.x,
        y: node.position.y,
      },
      relativePosition: {
        units: node.data?.gridCoords,
      },
      imageUrl: node.data?.imageUrl,
      isRoot: node.data?.isRoot || false,
    }));
  }, []);

  /**
   * Finds the root node in a set of nodes
   */
  const findRootNode = useCallback((nodes: Node<CustomNodeData>[]) => {
    return nodes.find((n) => n.data?.isRoot) || nodes[0];
  }, []);

  /**
   * Gets all child nodes (non-root nodes)
   */
  const getChildNodes = useCallback((nodes: Node<CustomNodeData>[]) => {
    return nodes.filter((n) => !n.data?.isRoot);
  }, []);

  /**
   * Validates node hierarchy (all nodes should have relative coords)
   */
  const validateHierarchy = useCallback((nodes: Node<CustomNodeData>[]) => {
    return nodes.every(
      (node) =>
        node.data?.gridCoords &&
        typeof node.data.gridCoords.rX === "number" &&
        typeof node.data.gridCoords.rY === "number",
    );
  }, []);

  return {
    formatNodesForExport,
    findRootNode,
    getChildNodes,
    validateHierarchy,
  };
};

/**
 * Hook for managing bulk node operations
 */
export const useBulkNodeOperations = (
  setNodes: (
    callback: (nodes: Node<CustomNodeData>[]) => Node<CustomNodeData>[],
  ) => void,
  gridSize: number = GRID_SIZE,
) => {
  /**
   * Moves all nodes by a delta offset
   */
  const moveAllNodes = useCallback(
    (deltaX: number, deltaY: number) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => ({
          ...node,
          position: {
            x: node.position.x + deltaX,
            y: node.position.y + deltaY,
          },
        })),
      );
    },
    [setNodes],
  );

  /**
   * Centers all nodes around a point
   */
  const centerNodesAround = useCallback(
    (centerX: number, centerY: number) => {
      setNodes((prevNodes) => {
        if (prevNodes.length === 0) return prevNodes;

        // Calculate current center
        const avgX =
          prevNodes.reduce((sum, n) => sum + n.position.x, 0) /
          prevNodes.length;
        const avgY =
          prevNodes.reduce((sum, n) => sum + n.position.y, 0) /
          prevNodes.length;

        // Calculate offset
        const offsetX = centerX - avgX;
        const offsetY = centerY - avgY;

        return prevNodes.map((node) => ({
          ...node,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y + offsetY,
          },
        }));
      });
    },
    [setNodes],
  );

  /**
   * Arranges child nodes in a circle around root
   */
  const arrangeInCircle = useCallback(
    (radius: number = 150) => {
      setNodes((prevNodes) => {
        const rootNode = prevNodes.find((n) => n.data?.isRoot);
        if (!rootNode) return prevNodes;

        const childNodes = prevNodes.filter((n) => !n.data?.isRoot);
        const angleStep = (2 * Math.PI) / childNodes.length;

        return prevNodes.map((node) => {
          if (node.data?.isRoot) return node;

          const childIndex = childNodes.findIndex((n) => n.id === node.id);
          const angle = childIndex * angleStep;

          const newX = rootNode.position.x + Math.cos(angle) * radius;
          const newY = rootNode.position.y + Math.sin(angle) * radius;

          const { rX, rY } = calculateRelativeCoordinates(
            newX,
            newY,
            rootNode.position.x,
            rootNode.position.y,
            gridSize,
          );

          return {
            ...node,
            position: { x: newX, y: newY },
            data: {
              ...node.data,
              gridCoords: { rX, rY },
            },
          };
        });
      });
    },
    [setNodes, gridSize],
  );

  /**
   * Arranges child nodes in a grid pattern around root
   */
  const arrangeInGrid = useCallback(
    (spacing: number = 200) => {
      setNodes((prevNodes) => {
        const rootNode = prevNodes.find((n) => n.data?.isRoot);
        if (!rootNode) return prevNodes;

        const childNodes = prevNodes.filter((n) => !n.data?.isRoot);
        const cols = Math.ceil(Math.sqrt(childNodes.length));
        let childIndex = 0;

        return prevNodes.map((node) => {
          if (node.data?.isRoot) return node;

          const row = Math.floor(childIndex / cols);
          const col = childIndex % cols;

          const newX =
            rootNode.position.x - (cols - 1) * (spacing / 2) + col * spacing;
          const newY =
            rootNode.position.y -
            (Math.ceil(childNodes.length / cols) - 1) * (spacing / 2) +
            row * spacing;

          const { rX, rY } = calculateRelativeCoordinates(
            newX,
            newY,
            rootNode.position.x,
            rootNode.position.y,
            gridSize,
          );

          childIndex++;

          return {
            ...node,
            position: { x: newX, y: newY },
            data: {
              ...node.data,
              gridCoords: { rX, rY },
            },
          };
        });
      });
    },
    [setNodes, gridSize],
  );

  return {
    moveAllNodes,
    centerNodesAround,
    arrangeInCircle,
    arrangeInGrid,
  };
};
