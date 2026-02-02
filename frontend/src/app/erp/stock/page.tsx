// src/app/erp/stock/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Package, AlertCircle, Barcode } from "lucide-react";
import { StockService } from "@/lib/api/services";

export default function StockPage() {
    const [inventory, setInventory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await StockService.GetInventory();
                setInventory(data || []);
            } catch (e) {
                console.error("Failed to load inventory", e);
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
                    <h2 className="text-3xl font-bold tracking-tight text-slate-100">Stock Control</h2>
                    <p className="text-slate-400 text-lg">Inventory management and procurement.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-lg">
                    <Barcode className="h-5 w-5" /> Open POS
                </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-slate-300 uppercase tracking-wider">Total SKUs</h3>
                        <Package className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="mt-2 text-3xl font-bold text-white">{loading ? "..." : inventory.length}</div>
                </div>
                
                <div className="p-6 rounded-xl bg-slate-900 border border-rose-900/50 bg-rose-950/10 shadow-xl">
                    <div className="flex items-center justify-between space-y-0 pb-2">
                        <h3 className="text-sm font-medium text-rose-300 uppercase tracking-wider">Critical Alerts</h3>
                        <AlertCircle className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="mt-2">
                        <div className="text-3xl font-bold text-rose-100">12</div>
                        <p className="text-xs text-rose-400 font-medium mt-1">Below reorder threshold</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
