"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Button,
    Input,
    Avatar,
    AvatarFallback,
    Badge,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@sent/platform-ui";
import { Search, Building2, Shield, Loader2, CheckCircle2 } from "lucide-react";
// import { useRouter } from "next/navigation";

// Mock Data
const MOCK_TENANTS = [
    { id: "org_1", name: "Acme Corp", agents: 45, tickets: 2, icon: "AC" },
    { id: "org_2", name: "Globex Inc", agents: 12, tickets: 0, icon: "GL" },
    { id: "org_3", name: "TechStart Jordan", agents: 5, tickets: 1, icon: "TS" },
];

const MOCK_USERS = [
    { id: "u_1", name: "John Doe", email: "john@acme.com", role: "Org Admin" },
    { id: "u_2", name: "Jane Smith", email: "jane@acme.com", role: "Technician" },
];

interface ImpersonationModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (tenant: string, identity: string) => void;
}

export function ImpersonationModal({ open, onOpenChange, onComplete }: ImpersonationModalProps) {
    const [step, setStep] = React.useState<1 | 2>(1);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedTenant, setSelectedTenant] = React.useState<typeof MOCK_TENANTS[0] | null>(null);
    const [selectedIdentity, setSelectedIdentity] = React.useState<typeof MOCK_USERS[0] | null>(null);
    const [identityType, setIdentityType] = React.useState<"user" | "role">("user");
    const [isLoading, setIsLoading] = React.useState(false);

    // Reset state when closed
    React.useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep(1);
                setSearchTerm("");
                setSelectedTenant(null);
                setSelectedIdentity(null);
            }, 300);
        }
    }, [open]);

    const filteredTenants = MOCK_TENANTS.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleTenantSelect = (tenant: typeof MOCK_TENANTS[0]) => {
        setIsLoading(true);
        // Simulate API check
        setTimeout(() => {
            setSelectedTenant(tenant);
            setStep(2);
            setIsLoading(false);
        }, 600);
    };

    const handleConfirm = () => {
        if (!selectedTenant) return;

        setIsLoading(true);
        setTimeout(() => {
            onComplete(selectedTenant.name, selectedIdentity?.name || "Generic Admin");
            setIsLoading(false);
            onOpenChange(false);
        }, 800);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0">
                <div className="bg-zinc-950 p-6 text-white border-b border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <span className="bg-orange-500/20 text-orange-500 p-1 rounded">
                                <Shield className="h-5 w-5" />
                            </span>
                            Ghost Mode Authentication
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            You are requesting privileged access to a client environment. This session will be strictly audited.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Progress Steps */}
                    <div className="flex items-center mt-6 text-sm">
                        <div className={`flex items-center gap-2 ${step === 1 ? 'text-orange-500 font-bold' : 'text-green-500'}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${step === 1 ? 'border-orange-500' : 'border-green-500 bg-green-500/20'}`}>
                                {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
                            </div>
                            Select Tenant
                        </div>
                        <div className="w-12 h-px bg-zinc-800 mx-4" />
                        <div className={`flex items-center gap-2 ${step === 2 ? 'text-orange-500 font-bold' : 'text-zinc-600'}`}>
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center border ${step === 2 ? 'border-orange-500' : 'border-zinc-800'}`}>
                                2
                            </div>
                            Select Identity
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-background min-h-[300px]">
                    {step === 1 ? (
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-9 bg-muted/50 border-0 text-lg py-6"
                                    placeholder="Search org name or ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="grid gap-2 mt-4">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                    Available Organizations
                                </p>
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                                        <p className="text-sm text-muted-foreground">Verifying access rights...</p>
                                    </div>
                                ) : (
                                    filteredTenants.map((tenant) => (
                                        <button
                                            key={tenant.id}
                                            onClick={() => handleTenantSelect(tenant)}
                                            className="flex items-center justify-between p-4 rounded-lg border hover:border-orange-500 hover:bg-orange-500/5 transition-all text-left group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border group-hover:border-orange-500/50">
                                                    <AvatarFallback className="bg-zinc-900 text-zinc-300 group-hover:text-orange-500">{tenant.icon}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="font-semibold group-hover:text-orange-600 transition-colors">{tenant.name}</h4>
                                                    <p className="text-xs text-muted-foreground">ID: {tenant.id} • {tenant.agents} Agents Online</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="group-hover:border-orange-500/30">Select</Badge>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Building2 className="h-5 w-5 text-muted-foreground" />
                                    <span className="font-medium">{selectedTenant?.name}</span>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => setStep(1)}>Change</Button>
                            </div>

                            <Tabs value={identityType} onValueChange={(v: any) => setIdentityType(v)} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="user">Specific User (Support)</TabsTrigger>
                                    <TabsTrigger value="role">Generic Role (Audit)</TabsTrigger>
                                </TabsList>
                                <TabsContent value="user" className="space-y-2 mt-4">
                                    {MOCK_USERS.map((user) => (
                                        <div
                                            key={user.id}
                                            className={`flex items-center p-3 rounded-md border cursor-pointer transition-all ${selectedIdentity?.id === user.id ? 'border-orange-500 bg-orange-500/5' : 'hover:bg-muted'}`}
                                            onClick={() => setSelectedIdentity(user)}
                                        >
                                            <Avatar className="h-9 w-9 mr-3">
                                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.role} • {user.email}</p>
                                            </div>
                                            {selectedIdentity?.id === user.id && <CheckCircle2 className="h-4 w-4 text-orange-500" />}
                                        </div>
                                    ))}
                                </TabsContent>
                                <TabsContent value="role" className="space-y-2 mt-4">
                                    <div className="p-4 border border-orange-500/30 bg-orange-500/5 rounded-md text-sm text-muted-foreground">
                                        <p>You will be logged in as a <strong>System Administrator</strong>.</p>
                                        <p className="mt-1">This action is visible in the Audit Log as "System Override".</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-muted/20 border-t items-center sm:justify-between">
                    {step === 2 ? (
                        <>
                            <Button variant="ghost" onClick={() => setStep(1)} disabled={isLoading}>Back</Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={isLoading || (identityType === 'user' && !selectedIdentity)}
                                className="bg-orange-600 hover:bg-orange-700 text-white"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Ghost as {identityType === 'user' ? (selectedIdentity?.name || 'User') : 'Admin'}
                            </Button>
                        </>
                    ) : (
                        <div className="text-xs text-muted-foreground w-full text-center">
                            Press <strong>Esc</strong> to cancel impersonation
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
