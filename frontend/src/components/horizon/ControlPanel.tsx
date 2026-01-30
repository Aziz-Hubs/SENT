import React from "react";
import {
  Sliders,
  TrendingUp,
  Users,
  DollarSign,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScenarioLevers {
  revenueGrowth: number;
  inflationRate: number;
  headcountGrowth: number;
  opexEfficiency: number;
  marketCondition: "bull" | "bear" | "stagnant";
  showVariance: boolean;
}

interface ControlPanelProps {
  levers: ScenarioLevers;
  setLevers: React.Dispatch<React.SetStateAction<ScenarioLevers>>;
  className?: string;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  levers,
  setLevers,
  className,
}) => {
  const handleChange = (
    key: keyof ScenarioLevers,
    value: number | string | boolean,
  ) => {
    setLevers((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card
      className={cn(
        "h-full border-l rounded-none border-y-0 border-r-0 shadow-xl bg-card/50 backdrop-blur-xl",
        className,
      )}
    >
      <CardHeader className="border-b bg-muted/20 pb-4">
        <CardTitle className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
          <Sliders className="h-4 w-4 text-primary" />
          Scenario Levers
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-8">
        {/* Macro Economic Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Macro Conditions
            </Label>
            <Badge
              variant={
                levers.marketCondition === "bull"
                  ? "default"
                  : levers.marketCondition === "bear"
                    ? "destructive"
                    : "secondary"
              }
              className="text-[10px]"
            >
              {levers.marketCondition.toUpperCase()}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "bull", icon: TrendingUp, label: "Boom" },
              { id: "stagnant", icon: RefreshCw, label: "Flat" },
              {
                id: "bear",
                icon: TrendingUp,
                label: "Crash",
                className: "rotate-180 text-rose-500",
              },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleChange("marketCondition", mode.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-xs font-medium gap-2",
                  levers.marketCondition === mode.id
                    ? "bg-primary/5 border-primary text-primary"
                    : "bg-background border-border hover:bg-muted text-muted-foreground",
                )}
              >
                <mode.icon className={cn("h-4 w-4", mode.className)} />
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Section */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-500" /> Revenue
                Growth
              </Label>
              <span className="text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded">
                {levers.revenueGrowth > 0 ? "+" : ""}
                {levers.revenueGrowth}%
              </span>
            </div>
            <Slider
              value={[levers.revenueGrowth]}
              min={-20}
              max={50}
              step={1}
              onValueChange={(val) => handleChange("revenueGrowth", val[0])}
              className="[&_.rc-slider-handle]:border-emerald-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <TrendingUp className="h-3.5 w-3.5 text-amber-500" /> Inflation
                Rate
              </Label>
              <span className="text-xs font-mono font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                {levers.inflationRate}%
              </span>
            </div>
            <Slider
              value={[levers.inflationRate]}
              min={0}
              max={15}
              step={0.5}
              onValueChange={(val) => handleChange("inflationRate", val[0])}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-3.5 w-3.5 text-blue-500" /> Headcount
              </Label>
              <span className="text-xs font-mono font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded">
                {levers.headcountGrowth > 0 ? "+" : ""}
                {levers.headcountGrowth}%
              </span>
            </div>
            <Slider
              value={[levers.headcountGrowth]}
              min={-10}
              max={30}
              step={1}
              onValueChange={(val) => handleChange("headcountGrowth", val[0])}
            />
          </div>
        </div>

        <div className="pt-4 border-t border-dashed">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Show Variance Delta
            </Label>
            <Switch
              checked={levers.showVariance}
              onCheckedChange={(val) => handleChange("showVariance", val)}
            />
          </div>
        </div>

        <div className="pt-8">
          <Button className="w-full gap-2" size="sm">
            Run Simulation <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="text-[10px] text-center text-muted-foreground mt-3">
            Powered by SENTengine™ Stochastic Model
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
