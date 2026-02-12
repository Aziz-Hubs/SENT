"use client";

import * as React from "react";
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    LineChart, Line, XAxis, YAxis, Tooltip,
    BarChart, Bar
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { MapPin, Zap, Shield, Users } from "lucide-react";

// --- Widget 1: Sync Health Donut ---
export function SyncDonut({ synced, dbOnly, zitadelOnly }: { synced: number, dbOnly: number, zitadelOnly: number }) {
    const data = [
        { name: "Synced", value: synced, color: "#22c55e" },
        { name: "DB Only", value: dbOnly, color: "#eab308" },
        { name: "Zitadel Only", value: zitadelOnly, color: "#a855f7" },
    ].filter(d => d.value > 0);

    return (
        <Card className="flex flex-col h-[180px]">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-bold uppercase text-slate-500">Sync Visibility</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex items-center justify-center">
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={35}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="pr-4 py-2 space-y-1">
                    {data.map(d => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[10px] font-bold">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                            <span>{d.value}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Widget 2: Tenant Growth Line ---
export function GrowthLine({ data }: { data: { month: string, count: number }[] }) {
    return (
        <Card className="h-[180px]">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-bold uppercase text-slate-500">Node Onboarding</CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <XAxis dataKey="month" hide />
                            <YAxis hide />
                            <Tooltip
                                contentStyle={{ backgroundColor: "#1e293b", border: "none", borderRadius: "8px", color: "#fff", fontSize: '10px' }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ fill: "#3b82f6", r: 3 }}
                                activeDot={{ r: 5 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="px-4 pb-2 text-[10px] font-bold text-muted-foreground flex justify-between uppercase">
                    <span>{data[0]?.month}</span>
                    <span className="text-blue-500">+{data[data.length - 1]?.count - data[0]?.count} Trend</span>
                    <span>{data[data.length - 1]?.month}</span>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Widget 3: Auth Distribution (Pie) ---
export function AuthPie({ data }: { data: { name: string, value: number, color: string }[] }) {
    return (
        <Card className="h-[180px]">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-bold uppercase text-slate-500">Auth Mix</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex items-center">
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={35}
                                dataKey="value"
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="pr-4 space-y-0.5">
                    {data.slice(0, 3).map(d => (
                        <div key={d.name} className="flex items-center gap-1.5 text-[9px] font-bold whitespace-nowrap">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ background: d.color }} />
                            <span>{d.name}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Widget 4: Regional Distribution (Grid) ---
export function RegionalGrid({ regions }: { regions: { name: string, count: number, flag: string }[] }) {
    const max = Math.max(...regions.map(r => r.count), 1);
    return (
        <Card className="h-[180px]">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-bold uppercase text-slate-500">Geospatial Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-4">
                <div className="space-y-2">
                    {regions.slice(0, 4).map(r => (
                        <div key={r.name} className="flex items-center justify-between text-[10px]">
                            <div className="flex items-center gap-2">
                                <span>{r.flag}</span>
                                <span className="font-bold text-slate-600 truncate w-20">{r.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1 justify-end px-2">
                                <div className="max-w-[60px] w-full h-1 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500"
                                        style={{ width: `${(r.count / max) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span className="font-black text-slate-800 w-4 text-right">{r.count}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

// --- Widget 5: Activity Heatmap (Simple Grid) ---
export function ActivityHeatmap({ throughput }: { throughput: number }) {
    // Generate semi-random dots but consistent for a session frame
    const dots = React.useMemo(() => Array.from({ length: 98 }, (_, i) => Math.random() > 0.4), []);

    return (
        <Card className="h-[180px]">
            <CardHeader className="p-3 pb-0">
                <CardTitle className="text-xs font-bold uppercase text-slate-500">Edge Connectivity</CardTitle>
            </CardHeader>
            <CardContent className="p-3">
                <div className="grid grid-cols-14 gap-0.5">
                    {dots.map((active, i) => (
                        <div
                            key={i}
                            className={`h-2 w-2 rounded-[1px] transition-colors duration-500 ${active ? 'bg-blue-500/40 shadow-[0_0_4px_rgba(59,130,246,0.3)]' : 'bg-muted/30'}`}
                        />
                    ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[9px] uppercase font-black text-slate-400">
                    <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Live Stream
                    </span>
                    <span className="flex items-center gap-1 text-blue-600">
                        {throughput} REQ/S
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Health Score Component (for table) ---
export function HealthScore({ score }: { score: number }) {
    const color = score > 80 ? "#22c55e" : score > 50 ? "#eab308" : "#ef4444";
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="relative h-10 w-10 flex items-center justify-center">
            <svg className="h-full w-full rotate-[-90deg]">
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="transparent"
                    className="text-muted/20"
                />
                <circle
                    cx="20"
                    cy="20"
                    r={radius}
                    stroke={color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-[10px] font-bold">{score}%</span>
        </div>
    );
}
