// src/app/erp/people/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Users, CreditCard, UserPlus } from "lucide-react";
import { PeopleService } from "@/lib/api/services";

export default function PeoplePage() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await PeopleService.GetEmployees();
                setEmployees(data || []);
            } catch (e) {
                console.error("Failed to load employees", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">People</h2>
                    <p className="text-slate-400 text-lg">HR Management, Payroll, and Recruiting.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
                    <UserPlus className="h-5 w-5" /> Add Staff
                </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Total Staff</h3>
                        <Users className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="mt-2 text-3xl font-bold text-white">{loading ? "..." : employees.length}</div>
                </div>
                
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-indigo-400" /> Payroll
                    </h3>
                    <p className="text-slate-500 mb-6">Next processing date: <span className="text-slate-200">Feb 15, 2026</span></p>
                    <button className="w-full py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors">
                        Process Batch
                    </button>
                </div>
            </div>
        </div>
    );
}
