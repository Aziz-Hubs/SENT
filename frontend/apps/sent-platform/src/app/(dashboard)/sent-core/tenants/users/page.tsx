"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@sent/platform-ui";
import { Button } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import { Input } from "@sent/platform-ui";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@sent/platform-ui";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@sent/platform-ui";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@sent/platform-ui";
import {
    Users,
    UserPlus,
    Search,
    Mail,
    Shield,
    ShieldCheck,
    ShieldAlert,
    Trash2,
    Lock,
    Unlock,
    Key,
    Smartphone,
    MoreVertical,
    CheckSquare,
    UserX,
    Filter,
    ChevronLeft
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Checkbox } from "@sent/platform-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@sent/platform-ui";

// API Base URL
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081") + "/api/v1";

interface Tenant {
    OrgID: string;
    Name: string;
}

interface User {
    userId: string;
    username: string;
    state: string;
    createdAt: string;
    human: {
        profile: {
            givenName: string;
            familyName: string;
        };
        email: {
            email: string;
            isEmailVerified: boolean;
        };
    };
    // Mocked for UI features
    roles?: string[];
    mfaEnabled?: boolean;
    healthScore?: number;
    lastActive?: string;
}

export default function UserManagementPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orgFromUrl = searchParams.get("org");

    const [tenants, setTenants] = React.useState<Tenant[]>([]);
    const [selectedOrgId, setSelectedOrgId] = React.useState<string>(orgFromUrl || "");
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedUserIds, setSelectedUserIds] = React.useState<Set<string>>(new Set());

    // Form states
    const [isAddUserOpen, setIsAddUserOpen] = React.useState(false);
    const [addMode, setAddMode] = React.useState<"email" | "password">("email");
    const [newUser, setNewUser] = React.useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
    });

    // Fetch tenants for the selector (fallback)
    React.useEffect(() => {
        const fetchTenants = async () => {
            try {
                const res = await fetch(`${API_BASE}/tenants`);
                if (res.ok) {
                    const data = await res.json();
                    setTenants(data || []);
                    if (!orgFromUrl && data && data.length > 0) {
                        setSelectedOrgId(data[0].OrgID);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch tenants", err);
            }
        };
        fetchTenants();
    }, [orgFromUrl]);

    const activeTenantName = tenants.find(t => t.OrgID === selectedOrgId)?.Name || "Select Organization";

    // Fetch users for the selected organization
    const fetchUsers = React.useCallback(async (orgId: string) => {
        if (!orgId) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/tenants/${orgId}/users`);
            if (res.ok) {
                const data = await res.json();
                // Enrich with competitive UI features
                const enriched = (data || []).map((u: User) => ({
                    ...u,
                    roles: u.username.includes('admin') ? ['System Admin', 'Owner'] : ['Billing Manager'],
                    mfaEnabled: Math.random() > 0.5,
                    healthScore: Math.floor(Math.random() * 40) + 60,
                    lastActive: Math.random() > 0.5 ? "2 mins ago" : "Yesterday"
                }));
                setUsers(enriched);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (selectedOrgId) {
            fetchUsers(selectedOrgId);
        }
    }, [selectedOrgId, fetchUsers]);

    const handleAddUser = async () => {
        if (!newUser.email || !newUser.username) return;
        try {
            const payload = { ...newUser };
            if (addMode === 'email') payload.password = ""; // Signal to send email in backend

            const res = await fetch(`${API_BASE}/tenants/${selectedOrgId}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (res.ok) {
                setIsAddUserOpen(false);
                setNewUser({ firstName: "", lastName: "", email: "", username: "", password: "" });
                fetchUsers(selectedOrgId);
            } else {
                alert("Failed to create user. Backend might not be reachable.");
            }
        } catch (err) {
            console.error("Error creating user", err);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this security identifier?")) return;
        try {
            const res = await fetch(`${API_BASE}/tenants/${selectedOrgId}/users/${userId}`, {
                method: "DELETE",
            });
            if (res.ok) {
                fetchUsers(selectedOrgId);
            }
        } catch (err) {
            console.error("Error deleting user", err);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) setSelectedUserIds(new Set(users.map(u => u.userId)));
        else setSelectedUserIds(new Set());
    };

    const toggleUserSelection = (id: string) => {
        const next = new Set(selectedUserIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedUserIds(next);
    };

    const filteredUsers = React.useMemo(() => {
        return users.filter(u =>
            (u.human.profile.givenName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.human.profile.familyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.human.email.email || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const activeUsers = users.filter(u => u.state === "USER_STATE_ACTIVE").length;

    return (
        <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/sent-core/tenants")} className="shadow-none h-10 w-10">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            {activeTenantName}
                            <Badge variant="outline" className="text-blue-600 bg-blue-50 border-blue-200 uppercase text-[10px]">Team Hub</Badge>
                        </h1>
                        <p className="text-muted-foreground font-medium text-sm">Orchestrate organization members and hierarchy</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2 shadow-sm border-slate-200">
                                <Shield className="h-4 w-4" /> Swap Organization
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[280px]">
                            {tenants.map(t => (
                                <DropdownMenuItem key={t.OrgID} onClick={() => setSelectedOrgId(t.OrgID)} className="py-3 items-center justify-between">
                                    <div className="font-bold">{t.Name}</div>
                                    <div className="text-[10px] font-mono text-muted-foreground">{t.OrgID.slice(0, 8)}</div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={() => setIsAddUserOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg">
                        <UserPlus className="h-4 w-4" /> Provision Member
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-card border rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                        <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Total Users</div>
                    </div>
                </div>
                <div className="p-4 bg-card border rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                        <Search className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">{activeUsers}</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Active Users</div>
                    </div>
                </div>
                <div className="p-4 bg-card border rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                        <ShieldCheck className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Administrators</div>
                    </div>
                </div>
                <div className="p-4 bg-card border rounded-xl flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                        <Mail className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">0</div>
                        <div className="text-xs text-muted-foreground font-medium uppercase">Pending Invites</div>
                    </div>
                </div>
            </div>

            {/* User List Section */}
            <div className="bg-white border rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden relative">
                {selectedUserIds.size > 0 && (
                    <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white p-3 z-10 flex items-center justify-between animate-in slide-in-from-top">
                        <span className="text-sm font-bold flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" /> {selectedUserIds.size} Members Selected
                        </span>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">Deactivate</Button>
                            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 font-bold" onClick={() => setSelectedUserIds(new Set())}>Cancel</Button>
                            <Button variant="destructive" size="sm" className="bg-red-500 font-bold">Batch Terminate</Button>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4 max-w-md w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search names, emails, or usernames..."
                            className="pl-11 h-11 border-slate-200 shadow-inner"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button variant="ghost" size="icon" className="shrink-0 h-11 w-11 border bg-white">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" className="gap-2 shadow-sm font-bold h-11 px-6">
                            <Mail className="h-4 w-4" /> Export Directory
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-slate-500 font-black uppercase text-xs tracking-widest">Decrypting IAM Records...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="py-24 text-center flex flex-col items-center gap-6">
                        <div className="p-6 bg-slate-100 rounded-full animate-bounce">
                            <UserX className="h-16 w-16 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-2xl tracking-tighter">ZERO GHOSTS DETECTED</h3>
                            <p className="text-slate-500 font-medium">This organization has no provisioned security identifiers.</p>
                        </div>
                        <Button className="h-12 px-8 bg-blue-600 rounded-xl" onClick={() => setIsAddUserOpen(true)}>Initialize Directory</Button>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={selectedUserIds.size === users.length}
                                        onCheckedChange={(c) => handleSelectAll(!!c)}
                                    />
                                </TableHead>
                                <TableHead className="w-[280px]">User Profile</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Permissions</TableHead>
                                <TableHead>Auth & MFA</TableHead>
                                <TableHead>Compliance</TableHead>
                                <TableHead className="text-right">Orchestrate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.userId} className={selectedUserIds.has(user.userId) ? 'bg-blue-50/50' : ''}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedUserIds.has(user.userId)}
                                            onCheckedChange={() => toggleUserSelection(user.userId)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white font-black text-xs shadow-lg">
                                                {user.human.profile.givenName?.[0]}{user.human.profile.familyName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-900 leading-tight">
                                                    {user.human.profile.givenName} {user.human.profile.familyName}
                                                </div>
                                                <div className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-0.5">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={user.state === "USER_STATE_ACTIVE" ? "default" : "secondary"} className={`h-5 text-[9px] font-black uppercase tracking-widest ${user.state === "USER_STATE_ACTIVE" ? "bg-green-500" : ""}`}>
                                                {user.state.replace("USER_STATE_", "")}
                                            </Badge>
                                            <span className="text-[9px] text-slate-400 font-bold ml-1">{user.lastActive}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles?.map(role => (
                                                <Badge key={role} variant="outline" className="text-[9px] font-black border-slate-300 py-0 h-4 uppercase">
                                                    {role}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                                                <Key className="h-3 w-3" /> Standard
                                            </div>
                                            <div className={`flex items-center gap-2 text-[10px] font-bold ${user.mfaEnabled ? 'text-green-600' : 'text-slate-300'}`}>
                                                <Smartphone className={`h-3 w-3 ${user.mfaEnabled ? 'fill-green-600/20' : ''}`} /> MFA {user.mfaEnabled ? 'ON' : 'OFF'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 max-w-[60px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${user.healthScore && user.healthScore > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${user.healthScore}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-black text-slate-800">{user.healthScore}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100">
                                                    <MoreVertical className="h-4 w-4 text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2">
                                                <div className="px-2 py-1.5 text-[10px] font-black uppercase text-slate-400">Tactical Control</div>
                                                <DropdownMenuItem className="gap-3 py-2 font-bold">
                                                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Privilege Escalation
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 py-2 font-bold">
                                                    <Search className="h-4 w-4 text-slate-600" /> Activity Scrutiny
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="gap-3 py-2 font-bold text-amber-600">
                                                    <Lock className="h-4 w-4" /> Revoke Tokens
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-3 py-2 font-bold text-red-600" onClick={() => handleDeleteUser(user.userId)}>
                                                    <Trash2 className="h-4 w-4" /> Purge Identifier
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Provision Member Dialog - Comprehensive Route */}
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
                    <div className="bg-slate-900 text-white p-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter">Provision Security Identifier</h2>
                        <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Target: {activeTenantName}</p>
                    </div>

                    <Tabs value={addMode} onValueChange={(v: any) => setAddMode(v)}>
                        <div className="border-b px-6 bg-slate-50">
                            <TabsList className="bg-transparent gap-4">
                                <TabsTrigger value="email" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 text-xs font-bold uppercase tracking-widest">
                                    <Mail className="h-3 w-3 mr-2" /> Send Invitation
                                </TabsTrigger>
                                <TabsTrigger value="password" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12 text-xs font-bold uppercase tracking-widest">
                                    <Key className="h-3 w-3 mr-2" /> Manual Password
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">First Name</label>
                                    <Input
                                        value={newUser.firstName}
                                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-500">Last Name</label>
                                    <Input
                                        value={newUser.lastName}
                                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                                        className="h-10 border-slate-200"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Internal Username</label>
                                <Input
                                    value={newUser.username}
                                    placeholder="e.g. jdoe_admin"
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                    className="h-10 border-slate-200 font-mono text-sm"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-slate-500">Primary Email</label>
                                <Input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="h-10 border-slate-200"
                                />
                            </div>

                            <TabsContent value="password" title="" className="m-0 pt-2 border-t">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-700">Set Initial Password</label>
                                    <Input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="h-10 border-blue-200 shadow-sm"
                                        placeholder="Min 8 characters..."
                                    />
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">Administrator must provide this to member securely.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="email" title="" className="m-0 pt-2 border-t text-center space-y-2">
                                <div className="flex justify-center py-2">
                                    <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center">
                                        <Mail className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 font-medium">An activation link will be sent to the primary email. The member must create their own password.</p>
                            </TabsContent>
                        </div>
                    </Tabs>

                    <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setIsAddUserOpen(false)} className="font-bold">Abort</Button>
                        <Button onClick={handleAddUser} className="bg-slate-900 px-8 font-black uppercase tracking-widest text-xs h-10">
                            Execute Provisioning
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
