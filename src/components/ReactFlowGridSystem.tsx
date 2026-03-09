import React, { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import type { Node, Edge, NodeTypes, Connection } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import CustomImageNode from "../components/CustomImageNode";
import type { CustomNodeData } from "../components/CustomImageNode";
import { GRID_SIZE, calculateSnappedPosition } from "../utils/gridUtils";

/**
 * Props for available nodes from prompt
 */
interface AvailableNodeInput {
  imageUrl: string;
  label: string;
  isRoot: boolean;
}

/**
 * Props for ReactFlowGridSystem
 */
interface ReactFlowGridSystemProps {
  availableNodes: AvailableNodeInput[];
}

/**
 * ReactFlowGridSystem Component
 * Main component that implements a grid-based node positioning system
 * with relative coordinates to a root/master node.
 */
const ReactFlowGridSystem: React.FC<ReactFlowGridSystemProps> = ({
  availableNodes: nodeInputs,
}) => {
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customImage: CustomImageNode as any,
    }),
    [],
  );

  /**
   * Available nodes that can be added from debug panel
   * All child nodes have relative coordinates to the root node
   * Constructed from prompt inputs
   */
  const availableNodes: Node<CustomNodeData>[] = useMemo(() => {
    return nodeInputs.map((input, index) => ({
      id: `node-${index + 1}`,
      data: {
        label: input.label,
        imageUrl: input.imageUrl,
        relativeTo: "root",
        gridCoords: { rX: (index + 1) * 5, rY: 0 },
        isRoot: input.isRoot,
        width: 59,
        height: 59,
      },
      position: { x: 400 + (index + 1) * 120, y: 200 },
      type: "customImage",
      draggable: true,
    }));
  }, [nodeInputs]);

  /**
   * Root node configuration
   * CSS transform: translate(-50%, -50%) makes position the visual center.
   * Position is set directly to a grid-aligned point.
   */
  const rootNode: Node<CustomNodeData> = {
    id: "root",
    data: {
      label: "Master Node",
      imageUrl:
        "https://kolayik-files.s3.eu-central-1.amazonaws.com/production/7103c5454f0c18e425477449802c5d12/avatar/516c5db56506e863de467e04809b194e_2025-02-1809%3A51%3A57-me.jpeg",
      relativeTo: "root",
      gridCoords: { rX: 0, rY: 0 },
      isRoot: true,
      width: 140,
      height: 140,
    },
    position: { x: 400, y: 200 },
    type: "customImage",
    draggable: true,
  };

  /**
   * Initial edges configuration
   * All nodes are connected only to the root node
   */
  const initialEdges: Edge[] = [];

  const [nodes, setNodes, onNodesChange] = useNodesState([rootNode]);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  /**
   * Handles node drag stop events
   * Implements snap-to-grid and relative coordinate calculation
   *
   * @param event - The drag event
   * @param node - The node being dragged
   */
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, draggedNode: Node<CustomNodeData>) => {
      setNodes((prevNodes: Node<CustomNodeData>[]) => {
        // Find the root node to use as reference
        const rootNode = prevNodes.find(
          (n: Node<CustomNodeData>) => n.data?.isRoot,
        );
        if (!rootNode) return prevNodes;


        if (draggedNode.id === "root") {
          const snappedData = calculateSnappedPosition(
            draggedNode.position.x,
            draggedNode.position.y,
            rootNode.position.x,
            rootNode.position.y,
            GRID_SIZE,
          );

          return prevNodes.map((node: Node<CustomNodeData>) => {
            if (node.data?.isRoot) {
              return {
                ...node,
                position: {
                  x: snappedData.worldX,
                  y: snappedData.worldY,
                },
                data: {
                  ...node.data,
                  gridCoords: { rX: 0, rY: 0 },
                },
              };
            }

            // Child nodes stay in place, recalculate relative coords
            const relativeX = Math.round(
              (node.position.x - snappedData.worldX) / GRID_SIZE,
            );
            const relativeY = Math.round(
              (node.position.y - snappedData.worldY) / GRID_SIZE,
            );

            return {
              ...node,
              data: {
                ...node.data,
                gridCoords: { rX: relativeX, rY: relativeY },
              },
            };
          });
        }

        // Child node drag
        const snappedData = calculateSnappedPosition(
          draggedNode.position.x,
          draggedNode.position.y,
          rootNode.position.x,
          rootNode.position.y,
          GRID_SIZE,
        );

        return prevNodes.map((node: Node<CustomNodeData>) => {
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
          return node;
        });
      });
    },
    [setNodes],
  );



  /**
   * Add a node from availableNodes
   */
  const addNodeFromAvailable = useCallback(
    (templateNode: Node<CustomNodeData>) => {
      const root = nodes.find((n) => n.data?.isRoot);
      if (!root) return;

      // Check if node already exists
      if (nodes.some((n) => n.id === templateNode.id)) {
        alert("This node already exists!");
        return;
      }

      // Since position IS the center (CSS translate handles visual centering),
      // child position = root position + relative * GRID_SIZE
      const worldX =
        root.position.x + (templateNode.data?.gridCoords.rX ?? 0) * GRID_SIZE;
      const worldY =
        root.position.y + (templateNode.data?.gridCoords.rY ?? 0) * GRID_SIZE;

      const newNode: Node<CustomNodeData> = {
        ...templateNode,
        position: { x: worldX, y: worldY },
      };

      setNodes((ns) => [...ns, newNode]);
      setSelectedNodeId(templateNode.id);
    },
    [nodes, setNodes, setEdges],
  );

  /**
   * Remove selected node
   */
  const removeSelectedNode = useCallback(() => {
    if (!selectedNodeId || selectedNodeId === "root") {
      alert("Cannot delete root node!");
      return;
    }

    setNodes((ns) => ns.filter((n) => n.id !== selectedNodeId));
    setSelectedNodeId(null);
  }, [selectedNodeId, setNodes, setEdges]);

  /**
   * Clear all nodes except root
   */
  const clearAllNodes = useCallback(() => {
    if (
      window.confirm("Are you sure? This will remove all nodes except root.")
    ) {
      setNodes((ns) => ns.filter((n) => n.data?.isRoot));

      setSelectedNodeId(null);
    }
  }, [setNodes, setEdges]);

  /**
   * Rename selected node
   */

  return (
    <div className="react-flow-grid-container">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]}
        // snapToGrid={true}
        // snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
      >
        {/* Visual grid background */}
        <Background
          color="#aaa"
          gap={GRID_SIZE}
          size={1}
          style={{ backgroundColor: "#f8f9fa" }}
        />

        {/* Standard React Flow controls */}
        <Controls />
      </ReactFlow>

      {/* Debug panel showing node information */}
      <div className="debug-panel">
        <h3>Grid System Info</h3>
        <p>Grid Size: {GRID_SIZE}px</p>
        <p>Total Nodes: {nodes.length}</p>

        <div className="nodes-info">
          <h4>Available Nodes:</h4>
          {availableNodes.map((node: Node<CustomNodeData>) => (
            <div
              key={node.id}
              className="available-node"
              onClick={() => addNodeFromAvailable(node)}
              style={{ cursor: "pointer" }}
            >
              <strong>{node.data?.label || node.id}</strong>
              <p style={{ fontSize: "12px", margin: "2px 0" }}>
                Relative: ({node.data?.gridCoords.rX},{" "}
                {node.data?.gridCoords.rY})
              </p>
              <button
                className="btn btn-add"
                style={{ width: "100%", marginTop: "4px" }}
              >
                ➕ Add
              </button>
            </div>
          ))}
        </div>

        {/* Node Management Buttons */}

        <div className="nodes-info">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4 style={{ margin: 0 }}>Active Nodes ({nodes.length}):</h4>
            <button
              onClick={clearAllNodes}
              className="btn btn-clear"
              style={{ padding: "6px 12px" }}
            >
              🗑️ Clear All
            </button>
          </div>
          {nodes.map((node: Node<CustomNodeData>) => (
            <div
              key={node.id}
              className={`node-info ${selectedNodeId === node.id ? "selected" : ""}`}
              onClick={() => setSelectedNodeId(node.id)}
              style={{ cursor: "pointer", position: "relative" }}
            >
              <strong>{node.data?.label || node.id}</strong>
              <p>
                World: ({Math.round(node.position.x)},{" "}
                {Math.round(node.position.y)})
              </p>
              <p>
                Relative: ({node.data?.gridCoords.rX},{" "}
                {node.data?.gridCoords.rY}) units
              </p>
              <p style={{ fontSize: "11px", color: "#999" }}>
                Size: {node.data?.width}×{node.data?.height}px
              </p>
              {selectedNodeId === node.id && (
                <p
                  style={{
                    fontSize: "10px",
                    color: "#2563eb",
                    fontWeight: "bold",
                  }}
                >
                  ✓ Selected
                </p>
              )}
              {node.id !== "root" && selectedNodeId === node.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeSelectedNode();

                  }}
                  style={{
                    position: "absolute",
                    top: "6px",
                    right: "6px",
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "24px",
                    height: "24px",
                    cursor: "pointer",
                    fontSize: "16px",
                    padding: "0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                  }}
                  title="Delete node"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactFlowGridSystem;
