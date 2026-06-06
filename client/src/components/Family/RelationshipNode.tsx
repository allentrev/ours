import { Handle, Position } from "@xyflow/react";

const RelationshipNode = () => {
  return (
    <div className="relative h-5 w-5 rounded-full border-2 border-gray-500 bg-white shadow">
      <Handle type="target" position={Position.Left} id="left" />
      <Handle type="target" position={Position.Left} id="left-target" />
      <Handle type="source" position={Position.Left} id="left-source" />
      <Handle type="target" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Right} id="right-target" />
      <Handle type="source" position={Position.Right} id="right-source" />
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  );
};

export default RelationshipNode;