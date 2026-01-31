import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollText, Plus, Search, Settings, Shield } from "lucide-react";

interface Policy {
  id: number;
  name: string;
  type: "patch" | "security" | "software" | "monitoring";
  targets: number;
  enabled: boolean;
  lastModified: string;
}

const PoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setPolicies([
      {
        id: 1,
        name: "Windows Security Baseline",
        type: "security",
        targets: 45,
        enabled: true,
        lastModified: "2024-01-15",
      },
      {
        id: 2,
        name: "Auto-Patch Workstations",
        type: "patch",
        targets: 120,
        enabled: true,
        lastModified: "2024-01-20",
      },
      {
        id: 3,
        name: "Block Unauthorized Software",
        type: "software",
        targets: 200,
        enabled: false,
        lastModified: "2024-01-10",
      },
      {
        id: 4,
        name: "CPU Alert Threshold 90%",
        type: "monitoring",
        targets: 50,
        enabled: true,
        lastModified: "2024-01-25",
      },
    ]);
  }, []);

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "security":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "patch":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "software":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const filteredPolicies = policies.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Policies</h2>
          <p className="text-muted-foreground text-sm">
            Configuration policies for endpoints
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Policy
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Policy Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Targets</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                  {policy.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={getTypeStyle(policy.type)}
                  >
                    {policy.type}
                  </Badge>
                </TableCell>
                <TableCell>{policy.targets} devices</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      policy.enabled
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-slate-500/10 text-slate-500"
                    }
                  >
                    {policy.enabled ? "Enabled" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {policy.lastModified}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PoliciesPage;
