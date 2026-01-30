import React, { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PayrollRecord {
  id: number;
  name: string;
  baseSalary: number;
  baseCurrency: string;
  payoutCurrency: string;
  gross: number;
  tax: number;
  net: number;
}

export const PayrollDashboard: React.FC = () => {
  const [currency, setCurrency] = useState("USD");
  const { privacyMode } = useAppStore();

  const formatMoney = (amount: number, curr: string) => {
    if (privacyMode) return "••••••";
    return (
      amount.toLocaleString(undefined, { minimumFractionDigits: 2 }) +
      (currency !== curr && !privacyMode ? "" : "")
    );
  };

  // Mock data - in real app, fetch from PayrollEngine.CalculateMonthlyPayout
  const records: PayrollRecord[] = [
    {
      id: 1,
      name: "Jane Doe",
      baseSalary: 120000,
      baseCurrency: "USD",
      payoutCurrency: currency,
      gross: currency === "JOD" ? 85080 : 120000,
      tax: currency === "JOD" ? 5955.6 : 12000,
      net: currency === "JOD" ? 79124.4 : 108000,
    },
    {
      id: 2,
      name: "John Smith",
      baseSalary: 95000,
      baseCurrency: "USD",
      payoutCurrency: currency,
      gross: currency === "JOD" ? 67355 : 95000,
      tax: currency === "JOD" ? 4714.85 : 9500,
      net: currency === "JOD" ? 62640.15 : 85500,
    },
  ];

  return (
    <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Precision Payroll
          </h2>
          <p className="text-sm text-slate-500">
            Multi-currency Gross-to-Net Engine
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["USD", "JOD", "SAR"].map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${
                currency === c
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                Employee
              </th>
              <th className="pb-2 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                Base Salary
              </th>
              <th className="pb-2 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                Gross ({currency})
              </th>
              <th className="pb-2 font-semibold text-slate-400 text-[10px] uppercase tracking-wider">
                Tax/Deduction
              </th>
              <th className="pb-2 font-semibold text-slate-400 text-[10px] uppercase tracking-wider text-right">
                Net Payout
              </th>
              <th className="pb-2 w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {records.map((r) => (
              <tr
                key={r.id}
                className="hover:bg-slate-50/80 transition-colors group"
              >
                <td className="py-2">
                  <span className="font-medium text-slate-900 text-sm">
                    {r.name}
                  </span>
                </td>
                <td className="py-2">
                  <span className="text-slate-500 text-xs font-mono">
                    {privacyMode
                      ? "••••••"
                      : `$${r.baseSalary.toLocaleString()} USD`}
                  </span>
                </td>
                <td className="py-2 font-mono text-xs">
                  {formatMoney(r.gross, currency)}
                </td>
                <td className="py-2 font-mono text-xs text-red-600">
                  {privacyMode
                    ? "••••••"
                    : `-${r.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
                </td>
                <td className="py-2 text-right">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-xs font-mono ${privacyMode ? "bg-slate-100 text-slate-500" : "bg-green-50 text-green-700"}`}
                  >
                    {formatMoney(r.net, currency)} {privacyMode ? "" : currency}
                  </span>
                </td>
                <td className="py-2 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Generate Payslip</DropdownMenuItem>
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Force Recalculation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 p-4 bg-indigo-50 rounded-xl flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-indigo-700">
          Rounding Governance: Standardized on <strong>Half-Up Rounding</strong>{" "}
          for all operations to ensure cent-perfect reconciliation with
          SENTcapital ledger entries.
        </p>
      </div>
    </div>
  );
};
