import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palmtree, Target, LayoutDashboard } from "lucide-react";
import TimeOffTab from "@/components/people/TimeOffTab";
import PerformanceTab from "@/components/people/PerformanceTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAppStore } from "@/store/useAppStore";

const EmployeePage: React.FC = () => {
  const { activeTab } = useAppStore();

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <PageHeader
        title="Employee Portal"
        description="Manage your time off, goals, and performance reviews."
      />

      <div className="w-full px-8 mt-6">
        {(activeTab === "overview" || activeTab === "dashboard") && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Use the tabs above to manage your leave requests and track
                    your performance goals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {(activeTab === "time" || activeTab === "timeoff") && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TimeOffTab />
          </div>
        )}

        {activeTab === "performance" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PerformanceTab />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeePage;
