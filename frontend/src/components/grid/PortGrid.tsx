import React from 'react';

interface Port {
  id: number;
  name: string;
  status: 'up' | 'down' | 'shutdown';
  vlan: number;
  poeWattage: number;
  isPoE: boolean;
}

export const PortGrid: React.FC<{ deviceName: string }> = ({ deviceName }) => {
  // Mock data
  const ports: Port[] = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    name: `Gi0/${i + 1}`,
    status: Math.random() > 0.3 ? 'up' : 'down',
    vlan: 10,
    poeWattage: Math.random() > 0.5 ? Math.random() * 15 : 0,
    isPoE: i < 12
  }));

  return (
    <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
      <h3 className="text-slate-200 font-bold mb-4 flex justify-between items-center">
        {deviceName} - Interface Matrix
        <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">Switch Commander</span>
      </h3>
      
      <div className="grid grid-cols-6 gap-2">
        {ports.map((p) => (
          <div 
            key={p.id}
            className={`p-2 rounded border transition-all cursor-pointer group ${
              p.status === 'up' ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10' : 
              p.status === 'shutdown' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono text-slate-400">{p.name}</span>
              <div className={`w-2 h-2 rounded-full ${p.status === 'up' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`} />
            </div>
            
            <div className="mt-1">
              <span className="text-[10px] text-slate-500 font-bold">VLAN {p.vlan}</span>
            </div>
            
            {p.isPoE && (
              <div className="mt-1 flex items-center gap-1">
                <div className="w-1 h-3 bg-amber-500 rounded-full" />
                <span className="text-[10px] text-amber-500/80">{p.poeWattage.toFixed(1)}W</span>
              </div>
            )}

            {/* Hover Actions */}
            <div className="hidden group-hover:flex absolute mt-[-40px] ml-[-4px] bg-slate-800 border border-slate-700 rounded shadow-xl p-1 gap-1 z-20">
              <button className="text-[9px] bg-indigo-600 px-1 rounded">VLAN</button>
              <button className="text-[9px] bg-amber-600 px-1 rounded">Cycle</button>
              <button className="text-[9px] bg-red-600 px-1 rounded">QUAR</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
