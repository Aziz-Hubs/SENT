import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

interface DeviceNodeData {
  name: string;
  ip: string;
  vendor: string;
  status: 'ONLINE' | 'OFFLINE';
}

const TopologyMap: React.FC = () => {
  // Mock data - in real app, fetch from SENTnexus / SENTgrid API
  const nodes: Node[] = [
    {
      id: 'd1',
      data: { name: 'Core-SW-01', ip: '10.0.0.1', vendor: 'cisco', status: 'ONLINE' },
      position: { x: 250, y: 0 },
      style: { background: '#f8fafc', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
    },
    {
      id: 'd2',
      data: { name: 'Dist-SW-01', ip: '10.0.0.10', vendor: 'juniper', status: 'ONLINE' },
      position: { x: 100, y: 150 },
      style: { background: '#f8fafc', border: '2px solid #3b82f6', borderRadius: '8px', padding: '10px' }
    },
    {
      id: 'd3',
      data: { name: 'Dist-SW-02', ip: '10.0.0.11', vendor: 'cisco', status: 'ONLINE' },
      position: { x: 400, y: 150 },
      style: { background: '#f8fafc', border: '2px solid #ef4444', borderRadius: '8px', padding: '10px' }
    },
  ];

  const edges: Edge[] = [
    { 
      id: 'e1-2', 
      source: 'd1', 
      target: 'd2', 
      label: 'Gi0/1 <-> xe-0/0/0',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      style: { stroke: '#94a3b8' }
    },
    { 
      id: 'e1-3', 
      source: 'd1', 
      target: 'd3', 
      label: 'Gi0/2 <-> Gi0/1',
      markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
      style: { stroke: '#94a3b8', strokeDasharray: '5,5' } // Indicated drift or intermittent
    },
  ];

  return (
    <div className="w-full h-[500px] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        className="bg-slate-950"
      >
        <Background color="#1e293b" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default TopologyMap;
