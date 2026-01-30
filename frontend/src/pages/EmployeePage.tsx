import React, { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palmtree, Target, LayoutDashboard } from "lucide-react";
import TimeOffTab from "@/components/people/TimeOffTab";
import PerformanceTab from "@/components/people/PerformanceTab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EmployeePage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState("dashboard");

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <PageHeader
        title="Employee Portal"
        description="Manage your time off, goals, and performance reviews."
      />

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
        className="w-full px-8"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-8">
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="timeoff" className="gap-2">
            <Palmtree className="h-4 w-4" />
            Time Off
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-2">
            <Target className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TabsContent value="dashboard">
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
          </TabsContent>

          <TabsContent value="timeoff">
            <TimeOffTab />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceTab />
          </TabsContent>
        </main>
      </Tabs>
    </div>
  );
};

export default EmployeePage;
