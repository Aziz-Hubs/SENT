"use client";

import * as React from "react";
import {
    FileText,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button
} from "@sent/platform-ui";

export default function InvoicesPage() {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice ID</TableHead>
                                <TableHead>Organization</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="font-mono">INV-2024-001</TableCell>
                                <TableCell>Acme Corp</TableCell>
                                <TableCell>Feb 01, 2024</TableCell>
                                <TableCell>$4,500.00</TableCell>
                                <TableCell><Badge className="bg-green-500">Paid</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-mono">INV-2024-002</TableCell>
                                <TableCell>Globex Inc</TableCell>
                                <TableCell>Feb 01, 2024</TableCell>
                                <TableCell>$1,200.00</TableCell>
                                <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="font-mono">INV-2024-003</TableCell>
                                <TableCell>Umbrella Corp</TableCell>
                                <TableCell>Jan 01, 2024</TableCell>
                                <TableCell>$12,000.00</TableCell>
                                <TableCell><Badge variant="destructive">Overdue</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
