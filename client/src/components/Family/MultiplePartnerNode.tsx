import { Handle, Position } from "@xyflow/react";

interface Props {
  data: {
    personHandle: string;
    shortId: string;
    noPartners: number;
    label?: string;
  };
}

const MultiplePartnerNode = ({ data }: Props) => {
  return (
    <div className="relative min-w-[180px] rounded-xl border-2 border-purple-500 bg-white shadow-md overflow-hidden">
      
      <Handle type="target" position={Position.Top} id="top-target" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" />

      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Left} id="spouse-left-source" />
      <Handle type="target" position={Position.Left} id="spouse-left-target" />
      
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="source" position={Position.Right} id="spouse-right-source" />
      <Handle type="target" position={Position.Right} id="spouse-right-target" />
      
      <div className="bg-purple-600 px-3 py-2">
        <h3 className="text-sm font-semibold text-white truncate">
          Multiple Partners
        </h3>
        <div className="text-xs text-gray-500">
          {data.shortId}
        </div>
      </div>

      <div className="p-3 text-sm text-gray-700 space-y-1">
        <div>
          <span className="font-medium">Partners:</span>{" "}
          {data.noPartners}
        </div>

        <div className="pt-2 text-xs text-gray-500">
          Select to expand relationships
        </div>
      </div>
    </div>
  );
};

export default MultiplePartnerNode;