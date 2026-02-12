"use client";

import * as React from "react";
import {
    MoreHorizontal,
    Plus,
    Search,
    Filter,
    Download,
    Building2,
    MapPin,
    Shield,
    Users
} from "lucide-react";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@sent/platform-ui";
import Link from "next/link";

interface Organization {
    id: string;
    name: string;
    region: string;
    status: "active" | "provisioning" | "suspended" | "archived";
    plan: string;
    users: number;
    created: string;
}

const mockOrgs: Organization[] = [
    { id: "org_1", name: "Acme Corp", region: "us-east-1", status: "active", plan: "Enterprise", users: 154, created: "2024-01-15" },
    { id: "org_2", name: "Globex Inc", region: "eu-central-1", status: "active", plan: "Professional", users: 43, created: "2024-02-10" },
    { id: "org_3", name: "Soylent Corp", region: "us-west-2", status: "provisioning", plan: "Startup", users: 5, created: "2024-03-01" },
    { id: "org_4", name: "Initech", region: "us-east-1", status: "suspended", plan: "Enterprise", users: 890, created: "2023-11-20" },
    { id: "org_5", name: "Umbrella Corp", region: "ap-northeast-1", status: "active", plan: "Custom", users: 2100, created: "2023-08-05" },
    { id: "org_6", name: "Cyberdyne Systems", region: "us-west-1", status: "active", plan: "Enterprise", users: 67, created: "2024-01-30" },
    { id: "org_7", name: "Massive Dynamic", region: "us-east-1", status: "active", plan: "Professional", users: 120, created: "2024-02-15" },
    { id: "org_8", name: "Hooli", region: "us-west-2", status: "active", plan: "Startup", users: 12, created: "2024-03-05" },
];

export default function OrganizationsPage() {
    const [searchTerm, setSearchTerm] = React.useState("");

    const filteredOrgs = mockOrgs.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.region.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
                    <p className="text-muted-foreground">
                        Manage all tenant organizations and their subscriptions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Link href="/sent-core/partner-registration">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Organization
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center gap-2 w-full max-w-sm">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search organizations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Region</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Users</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrgs.map((org) => (
                                <TableRow key={org.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://avatar.vercel.sh/${org.name}.png`} alt={org.name} />
                                                <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span>{org.name}</span>
                                                <span className="text-xs text-muted-foreground font-normal">ID: {org.id}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3 w-3 text-muted-foreground" />
                                            {org.region}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={
                                                org.status === "active" ? "text-green-500 border-green-500 bg-green-500/10" :
                                                    org.status === "provisioning" ? "text-orange-500 border-orange-500 bg-orange-500/10" :
                                                        org.status === "suspended" ? "text-red-500 border-red-500 bg-red-500/10" :
                                                            "text-gray-500 border-gray-500 bg-gray-500/10"
                                            }
                                        >
                                            {org.status.charAt(0).toUpperCase() + org.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{org.plan}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-3 w-3 text-muted-foreground" />
                                            {org.users}
                                        </div>
                                    </TableCell>
                                    <TableCell>{org.created}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem>
                                                    <Building2 className="mr-2 h-4 w-4" />
                                                    View Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Shield className="mr-2 h-4 w-4" />
                                                    Manage Access
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive">
                                                    Suspend Organization
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
