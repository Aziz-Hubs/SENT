import React from "react";
import { Button } from "@/components/ui/button";

export default function PeopleDashboard() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">People</h2>
                    <p className="text-muted-foreground">HR Management, Payroll, and Recruiting.</p>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2">Payroll</h3>
                    <p className="text-sm text-muted-foreground mb-4">Next run: Feb 15, 2026</p>
                    <Button variant="outline" className="w-full">Process Payroll</Button>
                </div>
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2">Time Off</h3>
                    <p className="text-sm text-muted-foreground mb-4">3 pending requests</p>
                    <Button variant="outline" className="w-full">Review Requests</Button>
                </div>
            </div>
        </div>
    );
}
