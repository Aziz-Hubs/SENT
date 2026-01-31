import React, { useEffect, useState } from "react";
import {
  Heart,
  Shield,
  Glasses,
  Umbrella,
  CheckCircle2,
  Plus,
  AlertCircle,
  Stethoscope,
  Baby,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BenefitPlan {
  id: number;
  name: string;
  type: string;
  description: string;
  employee_cost: number;
  employer_cost: number;
}

interface Enrollment {
  id: number;
  plan_name: string;
  plan_type: string;
  tier: string;
  my_cost: number;
  status: string;
  effective_date: string;
}

export const BenefitsTab: React.FC = () => {
  const [plans, setPlans] = useState<BenefitPlan[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlan | null>(null);
  const [selectedTier, setSelectedTier] = useState<string>("INDIVIDUAL");
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        const p = await w.go.bridge.PeopleBridge.GetBenefitPlans();
        const e = await w.go.bridge.PeopleBridge.GetMyBenefits(1); // Hardcoded ID 1
        setPlans(p || []);
        setEnrollments(e || []);
      } else {
        // Mocks
        setPlans([
          {
            id: 1,
            name: "Aetna EPO High Deductible",
            type: "MEDICAL",
            description:
              "Low premiums with a higher deductible. Good for healthy individuals.",
            employee_cost: 120.5,
            employer_cost: 450.0,
          },
          {
            id: 2,
            name: "Delta Dental PPO",
            type: "DENTAL",
            description:
              "Comprehensive dental coverage including orthodontics.",
            employee_cost: 15.0,
            employer_cost: 45.0,
          },
          {
            id: 3,
            name: "VSP Vision Choice",
            type: "VISION",
            description:
              "Annual eye exam and allowance for frames or contacts.",
            employee_cost: 5.5,
            employer_cost: 12.0,
          },
        ]);
        setEnrollments([]);
      }
    } catch (err) {
      toast.error("Failed to load benefits data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEnroll = async () => {
    if (!selectedPlan) return;
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        await w.go.bridge.PeopleBridge.EnrollInBenefit(
          1,
          selectedPlan.id,
          selectedTier,
        );
        toast.success(`Enrolled in ${selectedPlan.name}`);
        setIsEnrollModalOpen(false);
        fetchData();
      } else {
        toast.success(
          `Mock: Enrolled in ${selectedPlan.name} (${selectedTier})`,
        );
        // Optimistically update mock
        const newEnrollment: Enrollment = {
          id: Date.now(),
          plan_name: selectedPlan.name,
          plan_type: selectedPlan.type,
          tier: selectedTier,
          my_cost:
            selectedPlan.employee_cost * (selectedTier === "FAMILY" ? 2.5 : 1),
          status: "PENDING",
          effective_date: new Date().toISOString().split("T")[0],
        };
        setEnrollments([...enrollments, newEnrollment]);
        setIsEnrollModalOpen(false);
      }
    } catch (err) {
      toast.error("Enrollment failed");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "MEDICAL":
        return <Stethoscope className="h-5 w-5 text-rose-500" />;
      case "DENTAL":
        return <Baby className="h-5 w-5 text-sky-500" />; // closest to tooth?
      case "VISION":
        return <Glasses className="h-5 w-5 text-indigo-500" />;
      case "RETIREMENT":
        return <Umbrella className="h-5 w-5 text-emerald-500" />;
      default:
        return <Shield className="h-5 w-5 text-slate-500" />;
    }
  };

  const calculateCost = (baseCost: number, tier: string) => {
    let multiplier = 1.0;
    if (tier === "FAMILY") multiplier = 2.5;
    if (tier === "COUPLE") multiplier = 1.8;
    if (tier === "CHILDREN_ONLY") multiplier = 1.5;
    return baseCost * multiplier;
  };

  const totalMonthlyCost = enrollments.reduce((sum, e) => sum + e.my_cost, 0);

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Benefits & Wellness
          </h2>
          <p className="text-muted-foreground">
            Manage your health coverage and retirement plans.
          </p>
        </div>
        <Card className="bg-slate-50 border-slate-200 shadow-none">
          <CardContent className="p-4 flex items-center gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Your Monthly Cost
              </p>
              <p className="text-xl font-bold text-slate-900">
                ${totalMonthlyCost.toFixed(2)}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200"></div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Employer Contrib.
              </p>
              <p className="text-xl font-bold text-emerald-600">$1,250.00</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="my-coverage" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-coverage">My Coverage</TabsTrigger>
          <TabsTrigger value="browse-plans">Browse Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="my-coverage" className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No Active Coverage</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You haven't enrolled in any benefit plans yet.
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  (
                    document.querySelector(
                      '[value="browse-plans"]',
                    ) as HTMLElement
                  )?.click()
                }
              >
                Browse Available Plans
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrollments.map((enroll) => (
                <Card
                  key={enroll.id}
                  className="border-l-4 border-l-emerald-500"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-50 rounded-md">
                          {getIcon(enroll.plan_type)}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {enroll.plan_name}
                          </CardTitle>
                          <CardDescription>
                            {enroll.tier} Coverage
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200"
                      >
                        {enroll.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex justify-between text-sm py-2 border-t">
                      <span className="text-muted-foreground">Your Cost</span>
                      <span className="font-semibold">
                        ${enroll.my_cost.toFixed(2)}/mo
                      </span>
                    </div>
                    <div className="flex justify-between text-sm py-2 border-t">
                      <span className="text-muted-foreground">
                        Effective Date
                      </span>
                      <span>{enroll.effective_date}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse-plans">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="p-2 bg-slate-50 rounded-md">
                      {getIcon(plan.type)}
                    </div>
                    <Badge variant="secondary">{plan.type}</Badge>
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Employee Cost
                      </span>
                      <span className="font-semibold">
                        ${plan.employee_cost.toFixed(2)}+
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Employer Contrib.
                      </span>
                      <span className="font-semibold text-emerald-600">
                        ${plan.employer_cost.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog
                    open={isEnrollModalOpen && selectedPlan?.id === plan.id}
                    onOpenChange={(open) => {
                      if (open) setSelectedPlan(plan);
                      else {
                        setIsEnrollModalOpen(false);
                        setSelectedPlan(null);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedPlan(plan);
                          setIsEnrollModalOpen(true);
                        }}
                      >
                        Enroll Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Enroll in {selectedPlan?.name}
                        </DialogTitle>
                        <DialogDescription>
                          Select who you would like to cover under this plan.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="py-4 space-y-4">
                        <div className="space-y-2">
                          <Label>Coverage Tier</Label>
                          <Select
                            value={selectedTier}
                            onValueChange={setSelectedTier}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INDIVIDUAL">
                                Individual (You Only)
                              </SelectItem>
                              <SelectItem value="COUPLE">
                                Employee + Spouse
                              </SelectItem>
                              <SelectItem value="CHILDREN_ONLY">
                                Employee + Children
                              </SelectItem>
                              <SelectItem value="FAMILY">
                                Family (Spouse + Children)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedPlan && (
                          <div className="bg-slate-50 p-4 rounded-md space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Base Cost</span>
                              <span>
                                ${selectedPlan.employee_cost.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between font-bold pt-2 border-t border-slate-200">
                              <span>Total Monthly Deduction</span>
                              <span>
                                $
                                {calculateCost(
                                  selectedPlan.employee_cost,
                                  selectedTier,
                                ).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsEnrollModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handleEnroll}>
                          Confirm Enrollment
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
