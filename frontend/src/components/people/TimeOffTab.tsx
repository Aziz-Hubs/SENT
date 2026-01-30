import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Hourglass,
  Palmtree,
  Thermometer,
  Baby,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeOffRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  request_type: string;
  start_date: string;
  end_date: string;
  requested_hours: number;
  status: string;
  notes: string;
  created_at: string;
}

interface TimeOffBalance {
  id: number;
  policy_name: string;
  leave_type: string;
  available_hours: number;
  used_hours: number;
  pending_hours: number;
}

const TimeOffTab: React.FC = () => {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [balances, setBalances] = useState<TimeOffBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    type: "PTO",
    startDate: "",
    endDate: "",
    hours: 8,
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        // MVP: hardcode employee ID = 1 for demo
        const reqs = await w.go.bridge.PeopleBridge.GetMyTimeOffRequests(1);
        setRequests(reqs || []);

        const bals = await w.go.bridge.PeopleBridge.GetTimeOffBalance(1);
        setBalances(bals || []);
      } else {
        // Mock data
        setRequests([
          {
            id: 1,
            employee_id: 1,
            employee_name: "John Smith",
            request_type: "PTO",
            start_date: "2024-02-15",
            end_date: "2024-02-16",
            requested_hours: 16,
            status: "APPROVED",
            notes: "Family vacation",
            created_at: "2024-01-15T10:00:00Z",
          },
          {
            id: 2,
            employee_id: 1,
            employee_name: "John Smith",
            request_type: "SICK",
            start_date: "2024-02-01",
            end_date: "2024-02-01",
            requested_hours: 8,
            status: "APPROVED",
            notes: "",
            created_at: "2024-02-01T08:00:00Z",
          },
          {
            id: 3,
            employee_id: 1,
            employee_name: "John Smith",
            request_type: "PTO",
            start_date: "2024-03-20",
            end_date: "2024-03-22",
            requested_hours: 24,
            status: "PENDING",
            notes: "Spring break",
            created_at: "2024-02-10T14:00:00Z",
          },
        ]);
        setBalances([
          {
            id: 1,
            policy_name: "Standard PTO",
            leave_type: "PTO",
            available_hours: 120,
            used_hours: 24,
            pending_hours: 24,
          },
          {
            id: 2,
            policy_name: "Sick Leave",
            leave_type: "SICK",
            available_hours: 40,
            used_hours: 8,
            pending_hours: 0,
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch time off data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        await w.go.bridge.PeopleBridge.RequestTimeOff(
          1, // MVP: hardcoded employee ID
          formData.type,
          formData.startDate,
          formData.endDate,
          formData.hours,
          formData.notes,
        );
        toast.success("Time off request submitted");
        fetchData();
        setIsModalOpen(false);
      } else {
        toast.success("Mock: Request submitted");
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to submit request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        );
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Hourglass className="h-3 w-3" /> Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PTO":
        return <Palmtree className="h-4 w-4 text-blue-500" />;
      case "SICK":
        return <Thermometer className="h-4 w-4 text-orange-500" />;
      case "PARENTAL":
        return <Baby className="h-4 w-4 text-pink-500" />;
      default:
        return <Calendar className="h-4 w-4 text-slate-500" />;
    }
  };

  const totalAvailable = balances.reduce(
    (sum, b) => sum + b.available_hours,
    0,
  );
  const totalUsed = balances.reduce((sum, b) => sum + b.used_hours, 0);
  const totalPending = balances.reduce((sum, b) => sum + b.pending_hours, 0);

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {balances.map((b) => (
          <Card key={b.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {b.policy_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{b.available_hours}h</div>
              <p className="text-xs text-muted-foreground">
                {b.used_hours}h used • {b.pending_hours}h pending
              </p>
              <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${(b.used_hours / (b.available_hours + b.used_hours)) * 100}%`,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}

        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">
              Total Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {totalAvailable}h
            </div>
            <p className="text-xs text-indigo-600">
              {totalAvailable / 8} days remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">My Time Off Requests</h2>
          <p className="text-sm text-muted-foreground">
            View and manage your leave requests
          </p>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Submit a new time off request for manager approval.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Leave Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PTO">PTO / Vacation</SelectItem>
                    <SelectItem value="SICK">Sick Leave</SelectItem>
                    <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                    <SelectItem value="PARENTAL">Parental Leave</SelectItem>
                    <SelectItem value="BEREAVEMENT">Bereavement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Total Hours</Label>
                <Input
                  type="number"
                  value={formData.hours}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hours: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Reason for leave..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit Request</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Requests Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No time off requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(req.request_type)}
                      {req.request_type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-xs">
                      {req.start_date} → {req.end_date}
                    </span>
                  </TableCell>
                  <TableCell>{req.requested_hours}h</TableCell>
                  <TableCell>{getStatusBadge(req.status)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs max-w-xs truncate">
                    {req.notes || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TimeOffTab;
