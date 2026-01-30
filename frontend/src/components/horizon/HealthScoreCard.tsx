import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface HealthScoreCardProps {
  score: number;
  performance: number;
  security: number;
  lifecycle: number;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ score, performance, security, lifecycle }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (val: number) => {
    if (val >= 85) return '#10b981'; // Green
    if (val >= 70) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Infrastructure Health</h3>
      
      <div className="w-48 h-48 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              startAngle={90}
              endAngle={450}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell fill={getColor(score)} />
              <Cell fill="#f1f5f9" />
              <Label 
                value={`${score.toFixed(0)}%`} 
                position="center" 
                className="text-3xl font-black fill-slate-800"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 w-full mt-6">
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 uppercase">Perf</div>
          <div className="text-lg font-bold text-slate-700">{performance.toFixed(0)}</div>
        </div>
        <div className="text-center border-x border-slate-100">
          <div className="text-xs font-bold text-slate-400 uppercase">Sec</div>
          <div className="text-lg font-bold text-slate-700">{security.toFixed(0)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs font-bold text-slate-400 uppercase">Life</div>
          <div className="text-lg font-bold text-slate-700">{lifecycle.toFixed(0)}</div>
        </div>
      </div>
    </div>
  );
};
