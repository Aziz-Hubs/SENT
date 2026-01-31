import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Search,
  Plus,
  Filter,
  MapPin,
  DollarSign,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const RecruitingTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now, would use bridge later
    const mockJobs = [
      {
        id: 1,
        title: "Senior Go Engineer",
        department: "Core Platform",
        location: "Amman, Jordan (Remote Friendly)",
        status: "OPEN",
        candidates: 24,
        hired: 0,
        target: 2,
        daysOpen: 12,
        priority: "High",
      },
      {
        id: 2,
        title: "Security Operations Analyst",
        department: "SENTsec SOC",
        location: "On-site / Shifted",
        status: "OPEN",
        candidates: 45,
        hired: 1,
        target: 3,
        daysOpen: 25,
        priority: "Critical",
      },
      {
        id: 3,
        title: "Product Designer",
        department: "Product UX",
        location: "San Francisco / Remote",
        status: "CLOSED",
        candidates: 112,
        hired: 1,
        target: 1,
        daysOpen: 45,
        priority: "Standard",
      },
    ];

    const timer = setTimeout(() => {
      setJobs(mockJobs);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-indigo-50/50 border-indigo-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                  Active Roles
                </p>
                <p className="text-2xl font-black text-indigo-900 mt-1">12</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Briefcase className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                  Total Candidates
                </p>
                <p className="text-2xl font-black text-emerald-900 mt-1">428</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/50 border-amber-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                  Interviews Today
                </p>
                <p className="text-2xl font-black text-amber-900 mt-1">8</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <Calendar className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Time to Hire
                </p>
                <p className="text-2xl font-black text-slate-900 mt-1">22d</p>
              </div>
              <div className="p-2 bg-white rounded-lg shadow-sm border">
                <Clock className="h-5 w-5 text-slate-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search roles or candidates..."
            className="pl-10 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 shrink-0">
            <Filter className="h-4 w-4" /> Filters
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 gap-2 w-full sm:w-auto shadow-indigo-200 shadow-lg">
            <Plus className="h-4 w-4" /> Post Job
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">
              Open Positions
            </h3>
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-600 font-bold border-none"
            >
              {jobs.length} roles
            </Badge>
          </div>

          <div className="grid gap-4">
            {jobs.map((job) => (
              <Card
                key={job.id}
                className={`group hover:shadow-xl transition-all duration-300 border-l-4 ${
                  job.priority === "Critical"
                    ? "border-l-rose-500"
                    : job.priority === "High"
                      ? "border-l-indigo-500"
                      : "border-l-slate-300"
                } overflow-hidden`}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {job.status === "OPEN" ? (
                              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 text-[10px] font-bold uppercase py-0 px-1.5 h-5">
                                Live
                              </Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-100 text-[10px] font-bold uppercase py-0 px-1.5 h-5">
                                Closed
                              </Badge>
                            )}
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                              {job.department}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h4>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-slate-400 hover:text-slate-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit Posting</DropdownMenuItem>
                            <DropdownMenuItem>Share link</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600">
                              Archive role
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <MapPin className="h-3.5 w-3.5" /> {job.location}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Users className="h-3.5 w-3.5" /> {job.candidates}{" "}
                          Applicants
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                          <Clock className="h-3.5 w-3.5" /> Posted{" "}
                          {job.daysOpen}d ago
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-72 bg-slate-50/50 border-t md:border-t-0 md:border-l p-6 flex flex-col justify-center">
                      <div className="space-y-3">
                        <div className="flex justify-between items-end">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">
                            Hiring Progress
                          </span>
                          <span className="text-xs font-black text-slate-900">
                            {job.hired} / {job.target}
                          </span>
                        </div>
                        <Progress
                          value={(job.hired / job.target) * 100}
                          className="h-2 bg-slate-200"
                        />
                        <div className="flex justify-between pt-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {Math.round((job.hired / job.target) * 100)}%
                            Fulfilled
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-indigo-600 text-[10px] font-black uppercase"
                          >
                            View Pipeline{" "}
                            <ChevronRight className="h-2 w-2 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
