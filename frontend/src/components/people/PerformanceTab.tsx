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
import { Progress } from "@/components/ui/progress";
import {
  Target,
  Plus,
  Trophy,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Goal {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  progress: number;
  target_date: string;
}

interface Review {
  id: number;
  cycle_name: string;
  overall_rating: string;
  status: string;
  reviewer_name: string;
  submitted_at: string;
}

const PerformanceTab: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "PERFORMANCE",
    targetDate: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        const g = await w.go.bridge.PeopleBridge.GetMyGoals(1);
        setGoals(g || []);

        const r = await w.go.bridge.PeopleBridge.GetMyReviews(1);
        setReviews(r || []);
      } else {
        // Mock data
        setGoals([
          {
            id: 1,
            title: "Complete TypeScript Migration",
            description: "Migrate all frontend components to TypeScript",
            category: "PERFORMANCE",
            status: "IN_PROGRESS",
            progress: 65,
            target_date: "2024-03-31",
          },
          {
            id: 2,
            title: "Improve API Response Times",
            description: "Reduce P95 latency by 30%",
            category: "PERFORMANCE",
            status: "NOT_STARTED",
            progress: 0,
            target_date: "2024-04-15",
          },
          {
            id: 3,
            title: "Mentor Junior Developer",
            description: "Weekly 1:1s with new team member",
            category: "DEVELOPMENT",
            status: "IN_PROGRESS",
            progress: 40,
            target_date: "2024-06-30",
          },
        ]);
        setReviews([
          {
            id: 1,
            cycle_name: "Q4 2023 Review",
            overall_rating: "EXCEEDS",
            status: "ACKNOWLEDGED",
            reviewer_name: "Sarah Connor",
            submitted_at: "2024-01-15",
          },
          {
            id: 2,
            cycle_name: "Q1 2024 Review",
            overall_rating: "",
            status: "PENDING",
            reviewer_name: "Sarah Connor",
            submitted_at: "",
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch performance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async () => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        await w.go.bridge.PeopleBridge.CreateGoal(
          1,
          formData.title,
          formData.description,
          formData.category,
          formData.targetDate,
        );
        toast.success("Goal created");
        fetchData();
        setIsModalOpen(false);
      } else {
        toast.success("Mock: Goal created");
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to create goal");
    }
  };

  const updateProgress = async (goalId: number, newProgress: number) => {
    try {
      const w = window as any;
      const status = newProgress === 100 ? "COMPLETED" : "IN_PROGRESS";
      if (w.go && w.go.bridge && w.go.bridge.PeopleBridge) {
        await w.go.bridge.PeopleBridge.UpdateGoalProgress(
          goalId,
          newProgress,
          status,
        );
        fetchData();
      } else {
        setGoals(
          goals.map((g) =>
            g.id === goalId ? { ...g, progress: newProgress, status } : g,
          ),
        );
      }
      toast.success("Progress updated");
    } catch (err) {
      toast.error("Failed to update progress");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-700 gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        );
      case "IN_PROGRESS":
        return (
          <Badge className="bg-blue-100 text-blue-700 gap-1">
            <TrendingUp className="h-3 w-3" /> In Progress
          </Badge>
        );
      case "NOT_STARTED":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" /> Not Started
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRatingBadge = (rating: string) => {
    const colors: Record<string, string> = {
      EXCEPTIONAL: "bg-purple-100 text-purple-700",
      EXCEEDS: "bg-green-100 text-green-700",
      MEETS: "bg-blue-100 text-blue-700",
      DEVELOPING: "bg-yellow-100 text-yellow-700",
      NEEDS_IMPROVEMENT: "bg-red-100 text-red-700",
    };
    if (!rating) return <Badge variant="secondary">Pending</Badge>;
    return (
      <Badge className={colors[rating] || ""}>
        <Star className="h-3 w-3 mr-1" />
        {rating.replace("_", " ")}
      </Badge>
    );
  };

  const completedGoals = goals.filter((g) => g.status === "COMPLETED").length;
  const inProgressGoals = goals.filter(
    (g) => g.status === "IN_PROGRESS",
  ).length;
  const avgProgress =
    goals.length > 0
      ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length)
      : 0;

  return (
    <div className="p-6 space-y-6 fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {completedGoals}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {inProgressGoals}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">
              Avg. Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {avgProgress}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="goals" className="w-full">
        <TabsList>
          <TabsTrigger value="goals" className="gap-2">
            <Target className="h-4 w-4" /> Goals
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <Trophy className="h-4 w-4" /> Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">My Goals</h3>
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>
                    Set a new performance or development goal.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Goal title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Goal details..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) =>
                        setFormData({ ...formData, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PERFORMANCE">Performance</SelectItem>
                        <SelectItem value="DEVELOPMENT">Development</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                        <SelectItem value="BEHAVIORAL">Behavioral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) =>
                        setFormData({ ...formData, targetDate: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal}>Create Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => (
              <Card key={goal.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold">{goal.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {goal.description}
                      </p>
                    </div>
                    {getStatusBadge(goal.status)}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1">
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {goal.progress}%
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateProgress(
                            goal.id,
                            Math.min(goal.progress + 10, 100),
                          )
                        }
                      >
                        +10%
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Category: {goal.category}</span>
                    <span>Due: {goal.target_date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-4">
          <h3 className="text-lg font-semibold mb-4">Performance Reviews</h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cycle</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {review.cycle_name}
                    </TableCell>
                    <TableCell>{review.reviewer_name}</TableCell>
                    <TableCell>
                      {getRatingBadge(review.overall_rating)}
                    </TableCell>
                    <TableCell>{getStatusBadge(review.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {review.submitted_at || "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceTab;
