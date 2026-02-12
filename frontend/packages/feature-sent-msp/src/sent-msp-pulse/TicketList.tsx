"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@sent/platform-ui";

interface Ticket {
    id: string;
    title: string;
    status: "open" | "in-progress" | "closed";
    priority: "low" | "medium" | "high" | "critical";
}

interface TicketListProps {
    tickets?: Ticket[];
}

export function TicketList({ tickets = [] }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">No tickets found.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Tickets ({tickets.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {tickets.map((ticket) => (
                        <li
                            key={ticket.id}
                            className="flex items-center justify-between p-2 rounded-md border"
                        >
                            <span>{ticket.title}</span>
                            <span className="text-sm text-muted-foreground">
                                {ticket.status}
                            </span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}
