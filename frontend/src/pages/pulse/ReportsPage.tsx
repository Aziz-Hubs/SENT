import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Download,
  FileText,
  PieChart,
  TrendingUp,
} from "lucide-react";

const ReportsPage: React.FC = () => {
  const reports = [
    {
      id: 1,
      name: "Fleet Health Summary",
      description: "Overview of all endpoints health status",
      icon: TrendingUp,
      type: "Weekly",
    },
    {
      id: 2,
      name: "Patch Compliance",
      description: "OS and software patch status report",
      icon: BarChart3,
      type: "Monthly",
    },
    {
      id: 3,
      name: "Software Inventory",
      description: "Complete software inventory across all devices",
      icon: FileText,
      type: "On-Demand",
    },
    {
      id: 4,
      name: "Alert Trends",
      description: "Alert distribution and trends analysis",
      icon: PieChart,
      type: "Monthly",
    },
  ];

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground text-sm">
            Generate and download RMM reports
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((report) => (
          <Card
            key={report.id}
            className="hover:border-primary/50 transition-colors cursor-pointer"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.name}
              </CardTitle>
              <report.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {report.description}
              </CardDescription>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {report.type}
                </span>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" /> Generate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
