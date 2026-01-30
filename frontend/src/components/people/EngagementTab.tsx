import React, { useEffect, useState } from "react";
import { usePulseStore } from "../../store/pulseStore";
import {
  Heart,
  Users,
  TrendingUp,
  AlertTriangle,
  MessageCircle,
  PlusCircle,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const SentimentSparkline = ({
  data,
  color,
}: {
  data: number[];
  color: string;
}) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 100);
  const min = Math.min(...data, 0);
  const range = max - min;
  const width = 100;
  const height = 40;

  const points = data
    .map((val, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
    >
      <path
        d={`M ${points}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={(points.split(" ").pop() || "").split(",")[0]}
        cy={(points.split(" ").pop() || "").split(",")[1]}
        r="3"
        fill={color}
      />
    </svg>
  );
};

export const EngagementTab: React.FC = () => {
  const { teams } = usePulseStore();
  const [loading, setLoading] = useState(true);
  const teamList = Object.values(teams);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Thriving":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "At Risk":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const getTrendColor = (status: string) => {
    switch (status) {
      case "Thriving":
        return "#10b981"; // emerald-500
      case "At Risk":
        return "#f43f5e"; // rose-500
      default:
        return "#f59e0b"; // amber-500
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-8 p-1">
      {/* Actions Bar inside Tab */}
      <div className="flex justify-between items-center bg-card/50 p-4 rounded-lg border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-500/10 rounded-full">
            <Heart className="h-5 w-5 text-indigo-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Pulse Surveys</h2>
            <p className="text-sm text-muted-foreground">
              Monitor organization health and burnout risk.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() =>
              toast.info("Survey Campaign", {
                description: "Drafting new pulse survey for All Hands.",
              })
            }
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Launch Survey
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamList.map((team) => (
          <Card
            key={team.id}
            className="overflow-hidden transition-all hover:shadow-lg hover:border-indigo-500/30 group border-muted/60 bg-linear-to-b from-card to-muted/20"
          >
            <CardHeader className="p-5 border-b flex flex-row justify-between items-start space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  {team.teamName}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users size={12} />
                  <span>{team.memberCount} Members</span>
                  <span>•</span>
                  <span>{team.responseRate}% Response</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`${getStatusColor(team.status)} border px-2 py-0.5 capitalize`}
              >
                {team.status}
              </Badge>
            </CardHeader>

            <CardContent className="p-5 space-y-6">
              {/* Primary Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-semibold">
                    Engagement
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {team.engagementScore}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${team.engagementScore >= 75 ? "bg-emerald-500" : team.engagementScore >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
                      style={{ width: `${team.engagementScore}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-wider font-semibold">
                    Burnout Risk
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-foreground">
                      {team.burnoutRisk}%
                    </span>
                    {team.burnoutRisk > 70 && (
                      <AlertTriangle size={14} className="text-rose-500" />
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${team.burnoutRisk > 70 ? "bg-rose-500" : team.burnoutRisk > 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                      style={{ width: `${team.burnoutRisk}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sentiment Trend */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <TrendingUp size={12} />
                    7-Day Sentiment
                  </span>
                </div>
                <div className="h-10 px-1">
                  <SentimentSparkline
                    data={team.sentimentTrend}
                    color={getTrendColor(team.status)}
                  />
                </div>
              </div>

              {/* Top Topics */}
              <div className="space-y-2 pt-2 border-t">
                <span className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
                  Top Topics
                </span>
                <div className="flex flex-wrap gap-2">
                  {team.topTopics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-[10px] font-medium border border-secondary-foreground/10"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Team Card */}
        <button className="border-2 border-dashed border-muted hover:border-primary/50 hover:bg-primary/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 transition-all group h-full min-h-[300px] text-muted-foreground hover:text-primary cursor-pointer">
          <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
            <PlusCircle size={32} />
          </div>
          <span className="font-medium">Add New Team</span>
        </button>

        {teamList.length === 0 && (
          <div className="col-span-full">
            <EmptyState
              icon={Heart}
              title="No pulse data available"
              description="Start your first engagement survey to see team insights here."
              action={{
                label: "Create Survey",
                onClick: () => toast.info("Create Survey"),
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
