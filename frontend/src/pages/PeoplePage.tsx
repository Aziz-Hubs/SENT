import React, { useState, useEffect } from "react";
import { OrgChart } from "../components/people/OrgChart";
import { OnboardingPortal } from "../components/people/OnboardingPortal";
import { PayrollDashboard } from "../components/people/PayrollDashboard";
import TimeOffTab from "../components/people/TimeOffTab";
import PerformanceTab from "../components/people/PerformanceTab";
import { EngagementTab } from "../components/people/EngagementTab";
import { RecruitingTab } from "../components/people/RecruitingTab";
import { BenefitsTab } from "../components/people/BenefitsTab";
import {
  Users,
  UserPlus,
  FileText,
  LayoutGrid,
  Briefcase,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Laptop,
  Eye,
  EyeOff,
  Palmtree,
  Target,
  Heart,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PeoplePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const {
    setContextSidebar,
    toggleContext,
    isContextOpen,
    privacyMode,
    togglePrivacy,
    activeTab,
  } = useAppStore();
  const [selectedPerson, setSelectedPerson] = useState<any>(null);

  // Use native URLSearchParams for tab state
  const [currentTab, setCurrentTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") || "org";
  });

  const setTab = (val: string) => {
    setCurrentTab(val);
    const params = new URLSearchParams(window.location.search);
    params.set("view", val);
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
  };

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleNodeClick = (person: any) => {
    setSelectedPerson(person);
    setContextSidebar(<EmployeeDetails person={person} />);
    toggleContext(true);
  };

  const breadcrumbs = [{ label: "Business" }, { label: "SENTpeople HR" }];

  if (loading) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-12 w-1/3 mb-8" />
        <Skeleton className="h-10 w-full mb-6" />
        <Skeleton className="h-[600px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      <PageHeader
        title="SENTpeople"
        description="Authoritative Human Information System & Identity Lifecycle"
        icon={Users}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Add Employee",
          icon: UserPlus,
          onClick: () => {
            setSelectedPerson({
              name: "New Hire",
              role: "Draft",
              isHiPo: false,
            });
            setContextSidebar(<NewHireWizard />);
            toggleContext(true);
          },
        }}
      >
        <div className="flex items-center gap-2 mr-4 bg-slate-100 p-2 rounded-lg border border-slate-200">
          <Label
            htmlFor="privacy-mode"
            className="text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer flex items-center gap-2"
          >
            {privacyMode ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Privacy Mode
          </Label>
          <Switch
            id="privacy-mode"
            checked={privacyMode}
            onCheckedChange={togglePrivacy}
          />
        </div>
      </PageHeader>

      <div className="mt-8">
        {(activeTab === "overview" || activeTab === "org") && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OrgChart onNodeClick={handleNodeClick} />
          </div>
        )}
        {activeTab === "engagement" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EngagementTab />
          </div>
        )}
        {activeTab === "payroll" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PayrollDashboard />
          </div>
        )}
        {activeTab === "recruiting" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <RecruitingTab />
          </div>
        )}
        {activeTab === "benefits" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BenefitsTab />
          </div>
        )}
        {activeTab === "onboarding" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <OnboardingPortal />
          </div>
        )}
      </div>

      {isContextOpen && (
        <div className="fixed inset-y-0 right-0 z-50 h-screen flex flex-row-reverse pointer-events-none">
          <div className="pointer-events-auto h-full">
            <ContextSidebar
              isOpen={isContextOpen}
              onClose={() => toggleContext(false)}
              title="Employee Profile"
            >
              {/* Context Content managed by store, but if selectedPerson is set locally we render EmployeeDetails */}
              {/* The store's contextContent takes precedence if we want generic support, strictly following current pattern: */}
              <EmployeeDetails person={selectedPerson} />
            </ContextSidebar>
          </div>
        </div>
      )}
    </div>
  );
};

function NewHireWizard() {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg">
        <h4 className="font-bold text-indigo-900 mb-2">New Hire Onboarding</h4>
        <p className="text-xs text-indigo-700">
          Complete the 4-step wizard to provision identity, payroll, and asset
          allocation.
        </p>
      </div>
      <Tabs defaultValue="identity">
        <TabsList className="w-full">
          <TabsTrigger value="identity" className="flex-1 text-xs">
            Identity
          </TabsTrigger>
          <TabsTrigger value="comp" className="flex-1 text-xs">
            Comp
          </TabsTrigger>
          <TabsTrigger value="access" className="flex-1 text-xs">
            Access
          </TabsTrigger>
        </TabsList>
        <TabsContent value="identity" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500">
              Full Legal Name
            </Label>
            <input
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="e.g. Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs uppercase text-slate-500">
              National ID / SSN
            </Label>
            <input
              type="password"
              value="000-00-0000"
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono"
              readOnly
            />
          </div>
        </TabsContent>
      </Tabs>
      <div className="pt-4 border-t">
        <Button className="w-full">Initiate Onboarding Workflow</Button>
      </div>
    </div>
  );
}

function EmployeeDetails({ person }: any) {
  if (!person || person.role === "Draft") {
    if (person?.role === "Draft") return <NewHireWizard />;
    return null;
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-4 pb-6 border-b">
        <div className="h-16 w-16 min-w-[4rem] rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
          <span className="text-2xl font-black">{person.name[0]}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight leading-tight">
            {person.name}
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            {person.role}
          </p>
          <div className="flex gap-2 mt-2">
            <Badge
              variant={person.isHiPo ? "default" : "secondary"}
              className="text-[10px] h-5 px-1.5 pointer-events-none"
            >
              {person.isHiPo ? "High Potential" : "Standard"}
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] h-5 px-1.5 text-green-600 bg-green-50 border-green-200"
            >
              Active
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-3 h-8">
          <TabsTrigger value="overview" className="text-xs h-6">
            Overview
          </TabsTrigger>
          <TabsTrigger value="comp" className="text-xs h-6">
            Comp
          </TabsTrigger>
          <TabsTrigger value="assets" className="text-xs h-6">
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4 flex-1">
          <div className="grid gap-1">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Department
            </Label>
            <div className="text-sm font-medium">Product Engineering</div>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Manager
            </Label>
            <div className="text-sm font-medium text-indigo-600 underline cursor-pointer">
              Sarah Connor
            </div>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Work Email
            </Label>
            <div className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-3 w-3 text-slate-400" />
              {person.name.toLowerCase().replace(" ", ".")}@sent.jo
            </div>
          </div>
          <div className="grid gap-1">
            <Label className="text-[10px] font-bold uppercase text-slate-400">
              Office Location
            </Label>
            <div className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-3 w-3 text-slate-400" />
              Amman HQ, Floor 4
            </div>
          </div>
        </TabsContent>

        <TabsContent value="comp" className="mt-4 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-md">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-500">
                Base Salary
              </span>
              <Badge variant="outline" className="text-[10px]">
                Monthly
              </Badge>
            </div>
            <div className="text-lg font-mono font-bold">$10,000.00</div>
          </div>
          <div className="grid gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <FileText className="h-3.5 w-3.5 mr-2 text-slate-500" /> View Pay
              Slips
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-xs"
            >
              <CreditCard className="h-3.5 w-3.5 mr-2 text-slate-500" /> Tax
              Documents
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="assets" className="mt-4 space-y-4">
          <div className="flex items-center gap-3 p-2 border rounded-md">
            <Laptop className="h-8 w-8 text-slate-400" />
            <div>
              <div className="text-xs font-bold">MacBook Pro M3</div>
              <div className="text-[10px] font-mono text-slate-500">
                SN: C02XYZ123
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="pt-4 border-t mt-auto">
        <Button variant="default" className="w-full mb-2">
          <MoreVertical className="h-4 w-4 mr-2" /> Actions
        </Button>
      </div>
    </div>
  );
}

export default PeoplePage;
