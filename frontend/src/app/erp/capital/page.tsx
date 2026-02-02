// src/app/erp/capital/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Plus, RefreshCcw, Activity, Receipt, Landmark } from "lucide-react";
import { CapitalService } from "@/lib/api/services";

export default function CapitalPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await CapitalService.GetTransactions();
            setTransactions(data || []);
        } catch (error) {
            console.error("Failed to load transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Capital</h2>
                    <p className="text-slate-400 text-lg">Manage recurring invoices, banking, and assets.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={loadData} 
                        disabled={loading}
                        className="p-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 transition-colors disabled:opacity-50"
                    >
                        <RefreshCcw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors">
                        <Plus className="h-5 w-5" /> New Invoice
                    </button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Total Revenue</h3>
                        <Activity className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-white">$45,231.89</div>
                        <p className="text-xs text-emerald-400 font-medium mt-1">+20.1% from last month</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-6">Recent Transactions</h3>
                    <div>
                        {loading ? (
                            <p className="text-slate-500 italic">Accessing secure ledger...</p>
                        ) : transactions.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 rounded-full bg-slate-800">
                                                <Landmark className="h-5 w-5 text-indigo-400" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-100">{tx.description}</p>
                                                <p className="text-sm text-slate-500">{tx.date}</p>
                                            </div>
                                        </div>
                                        <div className={`text-lg font-bold ${tx.amount < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Receipt className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-500">No recent transactions found in the vault.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
