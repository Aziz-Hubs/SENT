import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  Settings,
  Database,
  Activity,
  Shield,
  ScanLine,
  LayoutPanelLeft,
  Users,
  Briefcase,
  Package,
  Banknote,
  HardDrive,
  Scale,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const MODULES = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    category: "core",
    color: "text-slate-400",
  },
  {
    id: "admin",
    name: "Admin",
    icon: Settings,
    category: "core",
    color: "text-neon-violet",
  },

  {
    id: "pulse",
    name: "Pulse RMM",
    icon: Activity,
    category: "infrastructure",
    color: "text-neon-cyan",
  },
  {
    id: "nexus",
    name: "Nexus CMDB",
    icon: Shield,
    category: "infrastructure",
    color: "text-neon-cyan",
  },
  {
    id: "optic",
    name: "Optic NVR",
    icon: ScanLine,
    category: "infrastructure",
    color: "text-neon-cyan",
  },
  {
    id: "pilot",
    name: "Pilot PSA",
    icon: LayoutPanelLeft,
    category: "infrastructure",
    color: "text-neon-cyan",
  },

  {
    id: "people",
    name: "People HR",
    icon: Users,
    category: "business",
    color: "text-neon-emerald",
  },
  {
    id: "erp",
    name: "Capital",
    icon: Briefcase,
    category: "business",
    color: "text-neon-emerald",
  },
  {
    id: "stock",
    name: "Inventory",
    icon: Package,
    category: "business",
    color: "text-neon-emerald",
  },
  {
    id: "kiosk",
    name: "Kiosk",
    icon: Banknote,
    category: "business",
    color: "text-neon-emerald",
  },
  {
    id: "vault",
    name: "Vault",
    icon: HardDrive,
    category: "business",
    color: "text-neon-violet",
  },
  {
    id: "tax",
    name: "Tax",
    icon: Scale,
    category: "business",
    color: "text-neon-amber",
  },
];

export function PrimarySidebar() {
  const { activeDivision, setDivision, setCategory } = useAppStore();

  const handleModuleClick = (mod: any) => {
    setDivision(mod.id);
    setCategory(mod.category as any);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col w-16 h-screen glass-sidebar border-r border-white/5 py-3 items-center z-50 overflow-y-auto no-scrollbar">
        {/* Branding */}
        <div className="mb-6">
          <div className="h-10 w-10 bg-linear-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <span className="text-xl font-black text-white italic">S</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full px-2">
          {MODULES.map((mod) => (
            <Tooltip key={mod.id}>
              <TooltipTrigger asChild>
                <motion.button
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255,255,255,0.05)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleModuleClick(mod)}
                  className={cn(
                    "h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300 relative group shrink-0",
                    activeDivision === mod.id
                      ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <mod.icon
                    className={cn("h-5 w-5 transition-colors", mod.color)}
                  />
                  {activeDivision === mod.id && (
                    <motion.div
                      layoutId="active-indicator-prim"
                      className="absolute -left-2 w-1 h-6 bg-primary rounded-r-full"
                    />
                  )}
                </motion.button>
              </TooltipTrigger>
              <TooltipContent
                side="right"
                className="bg-black/95 backdrop-blur border-white/10 ml-2"
              >
                <p className="font-bold text-xs uppercase tracking-widest">
                  {mod.name}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
