import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "reactflow";
import type { Node, Edge, NodeTypes, Connection } from "reactflow";
import "reactflow/dist/style.css";

import CustomImageNode from "../components/CustomImageNode";
import type { CustomNodeData } from "../components/CustomImageNode";
import { GRID_SIZE, calculateSnappedPosition } from "../utils/gridUtils";

/**
 * ReactFlowGridSystem Component
 * Main component that implements a grid-based node positioning system
 * with relative coordinates to a root/master node.
 */
const ReactFlowGridSystem: React.FC = () => {
  // Define custom node types
  const nodeTypes: NodeTypes = useMemo(
    () => ({
      customImage: CustomImageNode,
    }),
    [],
  );

  /**
   * Available nodes that can be added from debug panel
   * All child nodes have relative coordinates to the root node
   */
  const availableNodes: Node<CustomNodeData>[] = [
    {
      id: "node-1",
      data: {
        label: "Child Node 1",
        imageUrl: "",
        relativeTo: "root",
        gridCoords: { rX: 5, rY: 0 },
        isRoot: false,
        width: 100,
        height: 100,
      },
      position: { x: 500, y: 200 },
      type: "customImage",
      draggable: true,
    },
    {
      id: "node-2",
      data: {
        label: "Child Node 2",
        imageUrl: "",
        relativeTo: "root",
        gridCoords: { rX: -5, rY: 0 },
        isRoot: false,
        width: 110,
        height: 110,
      },
      position: { x: 300, y: 200 },
      type: "customImage",
      draggable: true,
    },
    {
      id: "node-3",
      data: {
        label: "Child Node 3",
        imageUrl: "",
        relativeTo: "root",
        gridCoords: { rX: 0, rY: 5 },
        isRoot: false,
        width: 90,
        height: 90,
      },
      position: { x: 400, y: 300 },
      type: "customImage",
      draggable: true,
    },
    {
      id: "node-4",
      data: {
        label: "Child Node 4",
        imageUrl: "",
        relativeTo: "root",
        gridCoords: { rX: 5, rY: -5 },
        isRoot: false,
        width: 100,
        height: 100,
      },
      position: { x: 500, y: 100 },
      type: "customImage",
      draggable: true,
    },
  ];

  /**
   * Root node configuration
   */
  const rootNode: Node<CustomNodeData> = {
    id: "root",
    data: {
      label: "Master Node",
      imageUrl: "",
      relativeTo: "root",
      gridCoords: { rX: 0, rY: 0 },
      isRoot: true,
      width: 120,
      height: 60,
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

        // If root node is being dragged, update it and recalculate all child relative coordinates
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
              // Update root node position
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

            // Child nodes stay in place but their relative coordinates are updated
            // Calculate new relative coordinates based on the new master position
            const relativeX = Math.round(
              (node.position.x - snappedData.worldX) / GRID_SIZE,
            );
            const relativeY = Math.round(
              (node.position.y - snappedData.worldY) / GRID_SIZE,
            );

            return {
              ...node,
              // Position stays the same!
              data: {
                ...node.data,
                gridCoords: {
                  rX: relativeX,
                  rY: relativeY,
                },
              },
            };
          });
        }

        // If a child node is being dragged, update its position and relative coordinates
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
   * Handles new connection attempts
   * Currently only allows connections to the root node
   */
  const onConnect = useCallback(
    (connection: Connection) => {
      // Optionally restrict connections - uncomment to enforce root-only connections
      // if (connection.source !== 'root' && connection.target !== 'root') {
      //   return;
      // }
      setEdges((eds: Edge[]) => addEdge(connection, eds));
    },
    [setEdges],
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

      // Calculate world position based on relative coordinates
      const worldX =
        root.position.x + (templateNode.data?.gridCoords.rX ?? 0) * GRID_SIZE;
      const worldY =
        root.position.y + (templateNode.data?.gridCoords.rY ?? 0) * GRID_SIZE;

      const newNode: Node<CustomNodeData> = {
        ...templateNode,
        position: { x: worldX, y: worldY },
      };

      setNodes((ns) => [...ns, newNode]);
      setEdges((eds) => [
        ...eds,
        {
          id: `e-root-${templateNode.id}`,
          source: "root",
          target: templateNode.id,
        },
      ]);
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
    setEdges((eds) =>
      eds.filter(
        (e) => e.source !== selectedNodeId && e.target !== selectedNodeId,
      ),
    );
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
      setEdges([]);
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
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
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
        <div className="debug-controls" style={{ marginTop: "12px" }}>
          <button
            onClick={removeSelectedNode}
            className="btn btn-remove"
            disabled={!selectedNodeId || selectedNodeId === "root"}
          >
            ➖ Remove Selected
          </button>
          <button onClick={clearAllNodes} className="btn btn-clear">
            🗑️ Clear All
          </button>
        </div>

        <div className="nodes-info">
          <h4>Active Nodes ({nodes.length}):</h4>
          {nodes.map((node: Node<CustomNodeData>) => (
            <div
              key={node.id}
              className={`node-info ${selectedNodeId === node.id ? "selected" : ""}`}
              onClick={() => setSelectedNodeId(node.id)}
              style={{ cursor: "pointer" }}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReactFlowGridSystem;
