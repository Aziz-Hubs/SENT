import React from "react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface ForecastData {
  month: string;
  amount: number; // Baseline
  scenarioAmount: number; // Simulated
  delta: number; // Difference
  isPeak: boolean;
}

interface BudgetWallProps {
  data: ForecastData[];
  showVariance: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const baseline =
      payload.find((p: any) => p.dataKey === "amount")?.value || 0;
    const scenario =
      payload.find((p: any) => p.dataKey === "scenarioAmount")?.value || 0;
    const delta = scenario - baseline;
    const deltaPercent = ((delta / baseline) * 100).toFixed(1);

    return (
      <div className="bg-popover/95 backdrop-blur-sm border shadow-xl p-3 rounded-xl text-xs space-y-2 min-w-[150px]">
        <p className="font-bold text-sm mb-1">{label}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Baseline:</span>
            <span className="font-mono font-medium text-foreground">
              ${baseline.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-primary font-medium">
            <span>Scenario:</span>
            <span className="font-mono">${scenario.toLocaleString()}</span>
          </div>
          <div className="border-t pt-1 mt-1 flex justify-between items-center">
            <span>Variance:</span>
            <span
              className={`font-mono font-bold flex items-center gap-1 ${delta > 0 ? "text-red-500" : delta < 0 ? "text-emerald-500" : "text-slate-500"}`}
            >
              {delta > 0 ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : delta < 0 ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {Math.abs(Number(deltaPercent))}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const BudgetWall: React.FC<BudgetWallProps> = ({
  data,
  showVariance,
}) => {
  const totalBaseline = data.reduce((acc, curr) => acc + curr.amount, 0);
  const totalScenario = data.reduce(
    (acc, curr) => acc + curr.scenarioAmount,
    0,
  );
  const totalDelta = totalScenario - totalBaseline;
  const deltaPercent = ((totalDelta / totalBaseline) * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-border transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-400 dark:text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            P&L Forecast Bridge
            {showVariance && (
              <Badge
                variant="outline"
                className={`ml-2 ${totalDelta > 0 ? "text-rose-500 border-rose-200 bg-rose-50" : "text-emerald-500 border-emerald-200 bg-emerald-50"}`}
              >
                {totalDelta > 0 ? "+" : ""}
                {deltaPercent}% Var
              </Badge>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Multi-variable linear regression model
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <span className="text-slate-500">Baseline</span>
          </div>
          {showVariance && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-indigo-600 font-bold">Scenario</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#f1f5f9"
              className="dark:stroke-slate-800"
            />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
              tickFormatter={(val) => `$${val / 1000}k`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />

            {/* Baseline Bar */}
            <Bar
              dataKey="amount"
              name="Baseline"
              fill="#cbd5e1"
              radius={[4, 4, 0, 0]}
              barSize={20}
              fillOpacity={showVariance ? 0.5 : 1}
            />

            {/* Scenario Area & Line */}
            {showVariance && (
              <>
                <Area
                  type="monotone"
                  dataKey="scenarioAmount"
                  fill="url(#colorScenario)"
                  stroke="transparent"
                />
                <Line
                  type="monotone"
                  dataKey="scenarioAmount"
                  name="Scenario"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#white",
                    stroke: "#6366f1",
                    strokeWidth: 2,
                  }}
                  activeDot={{ r: 6 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
