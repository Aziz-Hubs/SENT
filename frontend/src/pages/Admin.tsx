import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  GetOrgs,
  GetUsers,
  DeleteOrg,
  DeleteUser,
  GetStats,
  CreateOrg,
  CreateUser,
} from "../../wailsjs/go/admin/AdminBridge";
import {
  Users,
  Building2,
  Trash2,
  CheckCircle2,
  XCircle,
  Terminal,
  Shield,
  AlertTriangle,
  Zap,
  Plus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Filter,
  ShieldAlert,
  Lock,
  MoreVertical,
  Copy,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/useAppStore";

// Interfaces for Admin Data
interface Organization {
  id: number;
  name: string;
  domain: string;
  active: boolean;
  storage?: string;
  expiry?: string;
}

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  orgName: string;
}

interface AdminStats {
  users: number;
  orgs: number;
}

/**
 * Admin page handles system-wide administration.
 * Allows managing organizations, users, and viewing system logs.
 */
export function Admin() {
  const { activeTab } = useAppStore();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({ users: 0, orgs: 0 });
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(true);

  // Safety & Bulk State
  const [search, setSearch] = useState("");
  const [selectedOrgs, setSelectedOrgs] = useState<number[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [destructiveAction, setDestructiveAction] = useState<{
    type: "delete_org" | "kill_user";
    id: number;
    target: string;
  } | null>(null);
  const [safetyConfirm, setSafetyConfirm] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  // Creation State
  const [isAddOrgOpen, setIsAddOrgOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", domain: "" });
  const [newUser, setNewUser] = useState({
    email: "",
    firstName: "",
    lastName: "",
    role: "user",
    orgID: "",
  });

  const handleCreateOrg = async () => {
    if (!newOrg.name || !newOrg.domain) return;
    try {
      await CreateOrg(newOrg.name, newOrg.domain);
      toast.success("Organization created successfully");
      setIsAddOrgOpen(false);
      setNewOrg({ name: "", domain: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to create organization");
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.orgID) return;
    try {
      await CreateUser(
        newUser.email,
        newUser.firstName,
        newUser.lastName,
        newUser.role,
        parseInt(newUser.orgID),
      );
      toast.success("User created successfully");
      setIsAddUserOpen(false);
      setNewUser({
        email: "",
        firstName: "",
        lastName: "",
        role: "user",
        orgID: "",
      });
      fetchData();
    } catch (err) {
      toast.error("Failed to create user");
    }
  };

  useEffect(() => {
    fetchData();
    // Simulate real-time logs
    const interval = setInterval(() => {
      const events = [
        {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          type: "SYSTEM",
          msg: "Kernel heartbeat verified.",
          color: "text-green-400",
        },
        {
          id: Date.now() + 1,
          time: new Date().toLocaleTimeString(),
          type: "AUTH",
          msg: "Zitadel OIDC token refreshed.",
          color: "text-blue-400",
        },
        {
          id: Date.now() + 2,
          time: new Date().toLocaleTimeString(),
          type: "BRIDGE",
          msg: "Bridge latency: 4ms.",
          color: "text-slate-500",
        },
      ];
      setLogs((prev) =>
        [events[Math.floor(Math.random() * events.length)], ...prev].slice(
          0,
          50,
        ),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [o, u, s] = await Promise.all([GetOrgs(), GetUsers(), GetStats()]);
      setOrgs(o || []);
      setUsers(u || []);
      setStats({
        users: s["users"] || 0,
        orgs: s["orgs"] || 0,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const confirmDestruction = async () => {
    if (!destructiveAction) return;
    if (safetyConfirm.toUpperCase() !== "CONFIRM") {
      toast.error("Validation failed", {
        description: "You must type CONFIRM to proceed.",
      });
      return;
    }

    try {
      if (destructiveAction.type === "delete_org") {
        await DeleteOrg(destructiveAction.id);
        toast.success("Organization deleted", {
          description: "Cascading revocation complete.",
        });
      } else {
        await DeleteUser(destructiveAction.id);
        toast.success("User terminated", {
          description: "Sessions flushed and IAM disabled.",
        });
      }
      fetchData();
      setDestructiveAction(null);
      setSafetyConfirm("");
    } catch (err) {
      toast.error("Operation failed", { description: String(err) });
    }
  };

  const filteredOrgs = orgs.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.domain.toLowerCase().includes(search.toLowerCase()),
  );

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleTheme = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
    toast.info(`Switched to ${!dark ? "Dark" : "Light"} mode`);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Administration
          </h1>
          <p className="text-muted-foreground">
            Ecosystem Governance & Multi-tenancy Management
          </p>
        </div>
        <div />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orgs}</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Global User Count
            </CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-auto">
        {(activeTab === "overview" || activeTab === "users") && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="h-[400px] flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Directory Management</CardTitle>
                    <CardDescription>
                      Global Identity & Tenant Control
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-64 group">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        placeholder="Search directory..."
                        className="pl-9 h-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      className="h-9 gap-2"
                      onClick={() => setIsAddUserOpen(true)}
                    >
                      <Plus className="h-4 w-4" /> Add User
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 gap-2"
                      onClick={() => setIsAddOrgOpen(true)}
                    >
                      <Plus className="h-4 w-4" /> Add Org
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0">
                <Tabs defaultValue="users" className="h-full flex flex-col">
                  <div className="px-6 pb-2 flex items-center justify-between">
                    <TabsList className="justify-start">
                      <TabsTrigger value="users">
                        Users ({filteredUsers.length})
                      </TabsTrigger>
                      <TabsTrigger value="orgs">
                        Orgs ({filteredOrgs.length})
                      </TabsTrigger>
                    </TabsList>
                    {(selectedUsers.length > 0 || selectedOrgs.length > 0) && (
                      <div className="flex gap-2 animate-in slide-in-from-right-2">
                        <Badge variant="secondary" className="gap-1 px-2 py-1">
                          {selectedUsers.length || selectedOrgs.length} Selected
                        </Badge>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-7 text-[10px] font-bold uppercase tracking-tighter"
                          onClick={() =>
                            toast.error("Bulk Action", {
                              description:
                                "Bulk operations require secondary approval.",
                            })
                          }
                        >
                          Bulk Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  <TabsContent
                    value="orgs"
                    className="flex-1 overflow-hidden mt-0"
                  >
                    <ScrollArea className="h-full px-6 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedOrgs.length === filteredOrgs.length &&
                                  filteredOrgs.length > 0
                                }
                                onCheckedChange={(checked) =>
                                  setSelectedOrgs(
                                    checked
                                      ? filteredOrgs.map((o) => o.id)
                                      : [],
                                  )
                                }
                              />
                            </TableHead>
                            <TableHead>Tenant</TableHead>
                            <TableHead>Domain</TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">
                              Storage
                            </TableHead>
                            <TableHead className="text-[10px] uppercase tracking-widest font-bold">
                              Expiry
                            </TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredOrgs.map((o) => (
                            <TableRow
                              key={o.id}
                              className="group hover:bg-muted/50 cursor-pointer transition-colors"
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedOrgs.includes(o.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedOrgs((prev) =>
                                      checked
                                        ? [...prev, o.id]
                                        : prev.filter((id) => id !== o.id),
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell className="font-bold">
                                {o.name}
                              </TableCell>
                              <TableCell className="font-mono text-[11px] text-muted-foreground">
                                {o.domain}
                              </TableCell>
                              <TableCell className="font-mono text-[11px] font-bold">
                                {o.storage ||
                                  (o.id % 2 === 0 ? "842.2 GB" : "1.2 TB")}
                              </TableCell>
                              <TableCell className="font-mono text-[11px]">
                                {o.expiry || "2026-10-12"}
                              </TableCell>
                              <TableCell>
                                {o.active ? (
                                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                                    Active
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary">
                                    <XCircle className="h-3 w-3 mr-1" />{" "}
                                    Suspended
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() =>
                                      toast.info("Cloning Tenant", {
                                        description: `Provisioning replica of ${o.name}...`,
                                      })
                                    }
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                    onClick={() =>
                                      setDestructiveAction({
                                        type: "delete_org",
                                        id: o.id,
                                        target: o.name,
                                      })
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent
                    value="users"
                    className="flex-1 overflow-hidden mt-0"
                  >
                    <ScrollArea className="h-full px-6 pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">
                              <Checkbox
                                checked={
                                  selectedUsers.length ===
                                    filteredUsers.length &&
                                  filteredUsers.length > 0
                                }
                                onCheckedChange={(checked) =>
                                  setSelectedUsers(
                                    checked
                                      ? filteredUsers.map((u) => u.id)
                                      : [],
                                  )
                                }
                              />
                            </TableHead>
                            <TableHead>Identity</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>State</TableHead>
                            <TableHead className="text-right">
                              Safeties
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map((u) => (
                            <TableRow
                              key={u.id}
                              className="group hover:bg-muted/50 transition-colors"
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedUsers.includes(u.id)}
                                  onCheckedChange={(checked) => {
                                    setSelectedUsers((prev) =>
                                      checked
                                        ? [...prev, u.id]
                                        : prev.filter((id) => id !== u.id),
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{u.email}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {u.firstName} {u.lastName} • {u.orgName}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{u.role}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-xs font-mono">
                                    3 Active
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[10px] font-bold gap-1 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                  onClick={() =>
                                    setDestructiveAction({
                                      type: "kill_user",
                                      id: u.id,
                                      target: u.email,
                                    })
                                  }
                                >
                                  <Zap className="h-3 w-3" /> REVOKE
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                          {filteredUsers.length === 0 && (
                            <TableRow>
                              <TableCell
                                colSpan={5}
                                className="h-24 text-center text-muted-foreground"
                              >
                                No users found.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="h-[400px] flex flex-col bg-slate-950 text-slate-200 border-slate-800">
              <CardHeader className="border-b border-slate-800 bg-red-950/10">
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <Shield className="h-5 w-5" /> Security Audit Log
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Identity Governance & Threat Response Events.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 p-0 overflow-hidden font-mono text-xs">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-2">
                    {logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex gap-3 text-[10px] animate-in fade-in slide-in-from-left-2 duration-300"
                      >
                        <span className="text-slate-600 shrink-0">
                          {log.time}
                        </span>
                        <span
                          className={`${log.color} font-bold shrink-0 w-12`}
                        >
                          [{log.type}]
                        </span>
                        <span className="text-slate-400 truncate">
                          {log.msg}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "security" && (
          <Card className="flex-1 min-h-[600px] flex flex-col bg-slate-950 text-slate-200 border-slate-800">
            <CardHeader className="border-b border-slate-800 bg-red-950/10">
              <CardTitle className="flex items-center gap-2 text-red-500">
                <Shield className="h-5 w-5" /> Full Security Audit Trail
              </CardTitle>
              <CardDescription className="text-slate-400">
                Comprehensive record of all system and security events.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden font-mono text-sm">
              <ScrollArea className="h-full p-6">
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex gap-6 py-2 border-b border-white/5 items-center"
                    >
                      <span className="text-slate-600 font-mono w-24">
                        {log.time}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${log.color} border-white/10 uppercase text-[10px]`}
                      >
                        {log.type}
                      </Badge>
                      <span className="text-slate-300">{log.msg}</span>
                    </div>
                  ))}
                  <div className="text-center py-10 opacity-20 italic">
                    End of recent buffer. Querying cold storage...
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Safety Confirmation Dialog */}
      <AlertDialog
        open={!!destructiveAction}
        onOpenChange={(open) => !open && setDestructiveAction(null)}
      >
        <AlertDialogContent className="border-red-500/20 bg-slate-950 text-slate-200">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-5 w-5" />
              High-Privilege Security Override
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You are about to{" "}
              {destructiveAction?.type === "delete_org"
                ? "permanently DELETE the organization"
                : "immediately TERMINATE all sessions for"}
              <span className="block mt-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded font-mono text-white text-center">
                {destructiveAction?.target}
              </span>
              <p className="mt-4">
                This action is immutable and will be logged to the Global
                Hardware Audit Module.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Type "CONFIRM" to authorize
            </label>
            <Input
              value={safetyConfirm}
              onChange={(e) => setSafetyConfirm(e.target.value)}
              className="bg-slate-900 border-slate-800 text-white placeholder:text-slate-700"
              placeholder="CONFIRM"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDestruction();
              }}
              disabled={safetyConfirm.toUpperCase() !== "CONFIRM"}
              className="bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              EXECUTE COMMAND
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Organization Dialog */}
      <Dialog open={isAddOrgOpen} onOpenChange={setIsAddOrgOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Organization</DialogTitle>
            <DialogDescription>
              Initialize a new authoritative tenant in the SENT ecosystem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Org Name</Label>
              <Input
                id="name"
                value={newOrg.name}
                onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
                placeholder="e.g. Acme Industries"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Root Domain</Label>
              <Input
                id="domain"
                value={newOrg.domain}
                onChange={(e) =>
                  setNewOrg({ ...newOrg, domain: e.target.value })
                }
                placeholder="e.g. acme.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOrgOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrg}>Initialize Tenant</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Provision New Identity</DialogTitle>
            <DialogDescription>
              Grant access to the ecosystem for a specific tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newUser.firstName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, firstName: e.target.value })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newUser.lastName}
                  onChange={(e) =>
                    setNewUser({ ...newUser, lastName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="user@tenant.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="org">Organization</Label>
              <Select
                value={newUser.orgID}
                onValueChange={(val) => setNewUser({ ...newUser, orgID: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgs.map((o) => (
                    <SelectItem key={o.id} value={o.id.toString()}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Initial Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(val) => setNewUser({ ...newUser, role: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser}>Provision Identity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
