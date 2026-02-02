import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { PilotService } from "@/lib/api/services";

export default function PilotDashboard() {
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Pilot</h2>
                    <p className="text-muted-foreground">MSP Helpdesk and Ticketing Board.</p>
                </div>
                <Button>
                    <Ticket className="mr-2 h-4 w-4" /> New Ticket
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Critical Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "..." : criticalCount}</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{loading ? "..." : tickets.length}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
