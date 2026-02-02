// src/app/msp/pilot/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Ticket, Activity, Clock } from "lucide-react";
import { PilotService } from "@/lib/api/services";

export default function PilotPage() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await PilotService.GetTickets();
                setTickets(data || []);
            } catch (e) {
                console.error("Failed to load tickets", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const criticalCount = tickets.filter(t => t.priority === 'critical').length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Pilot</h2>
                    <p className="text-slate-400 text-lg">MSP Helpdesk and Ticketing Board.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 hover:bg-rose-500 text-white font-medium transition-colors shadow-lg shadow-rose-900/20">
                    <Ticket className="h-5 w-5" /> New Ticket
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 rounded-xl bg-slate-900 border-l-4 border-l-rose-500 border-y border-r border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Critical Tickets</h3>
                    </div>
                    <div className="mt-2">
                        <div className="text-4xl font-bold text-white">{loading ? "..." : criticalCount}</div>
                        <p className="text-xs text-rose-400 font-medium mt-1">Requires immediate attention</p>
                    </div>
                </div>
                
                <div className="p-6 rounded-xl bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Open Tickets</h3>
                    </div>
                    <div className="mt-2 text-4xl font-bold text-white">{loading ? "..." : tickets.length}</div>
                </div>
            </div>
        </div>
    );
}
