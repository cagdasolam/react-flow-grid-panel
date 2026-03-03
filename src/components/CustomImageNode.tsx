import { memo } from "react";
import { Handle, Position } from "reactflow";
import type { NodeProps } from "reactflow";

/**
 * CustomImageNode Props Interface
 * Represents the data structure for custom image nodes
 */
export interface CustomNodeData {
  imageUrl: string;
  label?: string;
  relativeTo: "root";
  gridCoords: {
    rX: number; // Relative X coordinate (in grid units)
    rY: number; // Relative Y coordinate (in grid units)
  };
  isRoot?: boolean;
  width?: number; // Node width in pixels (optional)
  height?: number; // Node height in pixels (optional)
}

/**
 * CustomImageNode Component
 * A node that displays only an image without any default React Flow styling.
 * Handles are hidden to create a floating image effect.
 */
const CustomImageNode = memo(
  ({ data, isConnectable }: NodeProps<CustomNodeData>) => {
    const { imageUrl, label, isRoot, width, height } = data;
    // Default sizes if not specified
    const nodeWidth = width || (isRoot ? 120 : 100);
    const nodeHeight = height || (isRoot ? 120 : 100);

    return (
      <div className="custom-image-node">
        {/*
        Hidden handles - positioned at all sides for connection points
        but made invisible with opacity: 0 to maintain connectivity
      */}
        <Handle
          type="target"
          position={Position.Top}
          isConnectable={isConnectable}
          style={{ opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Right}
          isConnectable={isConnectable}
          style={{ opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ opacity: 0 }}
        />
        <Handle
          type="target"
          position={Position.Left}
          isConnectable={isConnectable}
          style={{ opacity: 0 }}
        />

        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={isConnectable}
          style={{ opacity: 0 }}
        />

        {/*
        Image container with responsive sizing
        Root nodes are typically larger
      */}
        <div
          className={`image-container ${isRoot ? "root-node" : "child-node"}`}
          title={label || "Node"}
          style={{
            width: `${nodeWidth}px`,
            height: `${nodeHeight}px`,
          }}
        >
          <img
            src={imageUrl}
            alt={label || "Node Image"}
            className="node-image"
            draggable={false}
          />
          {label && <div className="node-label">{label}</div>}
        </div>
      </div>
    );
  },
);

CustomImageNode.displayName = "CustomImageNode";

export default CustomImageNode;
