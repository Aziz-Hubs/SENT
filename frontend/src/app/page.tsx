// src/app/page.tsx
import Link from 'next/link';
import { Activity, Users, Package, Shield, LayoutGrid } from 'lucide-react';

export default function Home() {
  const modules = [
    { name: 'Capital', path: '/erp/capital', icon: Activity, division: 'ERP', color: 'text-emerald-400' },
    { name: 'People', path: '/erp/people', icon: Users, division: 'ERP', color: 'text-indigo-400' },
    { name: 'Stock', path: '/erp/stock', icon: Package, division: 'ERP', color: 'text-amber-400' },
    { name: 'Pilot', path: '/msp/pilot', icon: Shield, division: 'MSP', color: 'text-rose-400' },
    { name: 'Pulse', path: '/msp/pulse', icon: LayoutGrid, division: 'MSP', color: 'text-blue-400' },
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">
            SENT ECOSYSTEM
          </h1>
          <p className="text-xl text-slate-400 font-medium tracking-wide">
            Unified Cloud Operating System for Enterprise
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((mod) => (
            <Link 
              key={mod.name} 
              href={mod.path}
              className="group p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 transition-all shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <mod.icon className={`h-10 w-10 ${mod.color}`} />
                <span className="text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-400 uppercase tracking-widest border border-slate-700">
                  {mod.division}
                </span>
              </div>
              <h2 className="text-2xl font-bold group-hover:translate-x-1 transition-transform">
                {mod.name}
              </h2>
              <p className="text-slate-500 mt-2">
                Access the {mod.name.toLowerCase()} subsystem.
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
