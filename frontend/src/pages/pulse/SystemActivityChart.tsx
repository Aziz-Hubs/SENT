import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { time: "10:00", cpu: 10, memory: 20 },
  { time: "10:05", cpu: 15, memory: 25 },
  { time: "10:10", cpu: 30, memory: 40 },
  { time: "10:15", cpu: 25, memory: 35 },
  { time: "10:20", cpu: 40, memory: 45 },
  { time: "10:25", cpu: 35, memory: 40 },
  { time: "10:30", cpu: 50, memory: 55 },
  { time: "10:35", cpu: 45, memory: 50 },
  { time: "10:40", cpu: 60, memory: 65 },
  { time: "10:45", cpu: 55, memory: 60 },
  { time: "10:50", cpu: 70, memory: 75 },
  { time: "10:55", cpu: 65, memory: 70 },
  { time: "11:00", cpu: 50, memory: 60 },
];

const SystemActivityChart = () => {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis
            dataKey="time"
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#666"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              borderColor: "#27272a",
              color: "#f4f4f5",
            }}
            itemStyle={{ color: "#f4f4f5" }}
          />
          <Area
            type="monotone"
            dataKey="cpu"
            name="CPU Usage"
            stackId="1"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.2}
          />
          <Area
            type="monotone"
            dataKey="memory"
            name="Memory Usage"
            stackId="2"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SystemActivityChart;
