import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PeopleService } from "@/lib/api/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard } from "lucide-react";

export default function PeopleDashboard() {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">People</h2>
                    <p className="text-muted-foreground">HR Management, Payroll, and Recruiting.</p>
                </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{loading ? "..." : employees.length}</div>
                    </CardContent>
                </Card>
                
                <div className="bg-card p-6 rounded-lg border shadow-sm">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> Payroll
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">Next run: Feb 15, 2026</p>
                    <Button variant="outline" className="w-full">Process Payroll</Button>
                </div>
            </div>
        </div>
    );
}
