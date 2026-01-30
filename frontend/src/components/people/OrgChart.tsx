import React, { useState, useCallback, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface EmployeeNodeData {
  name: string;
  role: string;
  isHiPo: boolean;
  backups: { name: string; readiness: string }[];
  successionMode: boolean;
}

const CustomNode = ({ data }: { data: EmployeeNodeData }) => {
  return (
    <div
      className={`p-4 rounded-lg border-2 shadow-md bg-white ${data.isHiPo ? "border-amber-400" : "border-slate-200"} min-w-[200px]`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col">
        <span className="font-bold text-slate-800">{data.name}</span>
        <span className="text-xs text-slate-500">{data.role}</span>
        {data.isHiPo && (
          <span className="mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full w-fit">
            HiPo
          </span>
        )}

        {data.successionMode && data.backups.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">
              Backups
            </span>
            {data.backups.map((b, i) => (
              <div key={i} className="flex justify-between text-[10px] mt-1">
                <span className="text-slate-600">{b.name}</span>
                <span
                  className={`font-medium ${b.readiness === "EMERGENCY" ? "text-red-500" : "text-green-500"}`}
                >
                  {b.readiness}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

const nodeTypes = {
  employee: CustomNode,
};

interface OrgChartProps {
  onNodeClick?: (person: any) => void;
}

export const OrgChart: React.FC<OrgChartProps> = ({ onNodeClick }) => {
  const [successionMode, setSuccessionMode] = useState(false);

  // Mock data - in real app, fetch from Wails backend
  const initialNodes: Node[] = [
    {
      id: "1",
      type: "employee",
      data: {
        id: 1,
        name: "Jane Doe",
        role: "CEO",
        isHiPo: false,
        backups: [{ name: "John Smith", readiness: "READY_1_YEAR" }],
        successionMode: false,
      },
      position: { x: 250, y: 0 },
    },
    {
      id: "2",
      type: "employee",
      data: {
        id: 2,
        name: "John Smith",
        role: "CTO",
        isHiPo: true,
        backups: [{ name: "Alice Wong", readiness: "EMERGENCY" }],
        successionMode: false,
      },
      position: { x: 100, y: 150 },
    },
    {
      id: "3",
      type: "employee",
      data: {
        id: 3,
        name: "Sarah Connor",
        role: "COO",
        isHiPo: false,
        backups: [],
        successionMode: false,
      },
      position: { x: 400, y: 150 },
    },
  ];

  const initialEdges: Edge[] = [
    { id: "e1-2", source: "1", target: "2" },
    { id: "e1-3", source: "1", target: "3" },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onInternalNodeClick = useCallback(
    (_: any, node: Node) => {
      if (onNodeClick) onNodeClick(node.data);
    },
    [onNodeClick],
  );

  // Update nodes when succession mode toggles
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          successionMode: successionMode,
        },
      })),
    );
  }, [successionMode, setNodes]);

  return (
    <div className="w-full h-[600px] bg-slate-50 rounded-xl overflow-hidden relative border border-slate-200">
      <div className="absolute top-4 right-4 z-10 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex items-center gap-2">
        <Label
          htmlFor="succession-mode"
          className="text-sm font-medium text-slate-700 cursor-pointer"
        >
          Succession View
        </Label>
        <Switch
          id="succession-mode"
          checked={successionMode}
          onCheckedChange={setSuccessionMode}
        />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onInternalNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};
