import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Clock } from "lucide-react";

export default function PilotDashboard() {
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
                        <div className="text-3xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Requires immediate attention</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">14</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
