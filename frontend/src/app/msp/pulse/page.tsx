// src/app/msp/pulse/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Wifi, Activity, Server, Zap } from "lucide-react";
import { PulseService } from "@/lib/api/services";

export default function PulsePage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                // In our current bridge, Pulse uses createRpcProxy with 'pulse' package
                const data = await PulseService.GetDevices();
                setDevices(data || []);
            } catch (e) {
                console.error("Failed to load devices", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const onlineCount = devices.filter(d => d.status === 'online').length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Pulse</h2>
                    <p className="text-slate-400 text-lg">RMM and Device Monitoring.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Online Devices</h3>
                        <Wifi className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-4xl font-bold text-white">{loading ? "..." : onlineCount}</div>
                        <p className="text-xs text-slate-500 font-medium mt-1">Across your entire fleet</p>
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Uptime Avg</h3>
                        <Activity className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="mt-2 text-4xl font-bold text-white">98.2%</div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-1">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Server className="h-48 w-48 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-amber-400" /> Fleet Overview
                    </h3>
                    
                    {loading ? (
                        <p className="text-slate-500 animate-pulse italic">Scanning network endpoints...</p>
                    ) : devices.length > 0 ? (
                        <div className="grid gap-4">
                           {devices.map((d, i) => (
                               <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                                   <div className="flex items-center gap-4">
                                       <div className={`h-3 w-3 rounded-full ${d.status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                       <div>
                                           <p className="font-semibold text-slate-100">{d.name}</p>
                                           <p className="text-sm text-slate-500">{d.ip}</p>
                                       </div>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-sm text-slate-300 font-mono">{d.os}</p>
                                       <p className="text-xs text-slate-500">{d.last_seen}</p>
                                   </div>
                               </div>
                           ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-lg">
                            <p className="text-slate-500">No managed devices found in the system.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
