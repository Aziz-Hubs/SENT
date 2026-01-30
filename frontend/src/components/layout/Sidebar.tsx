import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Shield,
  Briefcase,
  Settings,
  ChevronLeft,
  ChevronRight,
  HardDrive,
  Package,
  Banknote,
  Scale,
  ShieldAlert,
  ScanLine,
  LayoutPanelLeft,
  Activity,
  Users,
} from "lucide-react";
import { useState } from "react";

// Divisions Configuration
// Chromatic Architecture: Module-specific neon colors
const CORE_DIVISIONS = [
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "text-slate-400",
  },
  {
    id: "admin",
    name: "Administration",
    icon: ShieldAlert,
    color: "text-neon-violet", // Violet Neon: Admin/System
  },
];

const MSP_DIVISIONS = [
  { id: "pulse", name: "Pulse RMM", icon: Activity, color: "text-neon-cyan" },
  { id: "nexus", name: "Nexus CMDB", icon: Shield, color: "text-neon-cyan" },
  { id: "optic", name: "Optic NVR", icon: ScanLine, color: "text-neon-cyan" },
  { id: "grid", name: "Grid Net", icon: Activity, color: "text-neon-cyan" },
  {
    id: "pilot",
    name: "Pilot PSA",
    icon: LayoutPanelLeft,
    color: "text-neon-cyan",
  },
  {
    id: "horizon",
    name: "Horizon vCIO",
    icon: LayoutDashboard,
    color: "text-neon-cyan",
  },
  {
    id: "control",
    name: "Control SMP",
    icon: Shield,
    color: "text-neon-amber",
  }, // Amber: Compliance
  { id: "wave", name: "Wave VoIP", icon: Activity, color: "text-neon-cyan" },
];

const ERP_DIVISIONS = [
  { id: "people", name: "People HR", icon: Users, color: "text-neon-cyan" }, // Cyan: People-centric
  { id: "erp", name: "Capital", icon: Briefcase, color: "text-neon-emerald" }, // Emerald: Financial
  { id: "stock", name: "Inventory", icon: Package, color: "text-neon-emerald" },
  {
    id: "engagement",
    name: "Engagement",
    icon: Activity,
    color: "text-neon-cyan",
  },
  { id: "kiosk", name: "Kiosk", icon: Banknote, color: "text-neon-emerald" },
  { id: "vault", name: "Vault", icon: HardDrive, color: "text-neon-violet" }, // Violet: System
  { id: "tax", name: "Tax Compliance", icon: Scale, color: "text-neon-amber" }, // Amber: Compliance
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeDivision: string;
  onDivisionChange: (division: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

/**
 * Sidebar component handles navigation between different application divisions.
 * It supports collapsing to save screen space and mobile responsive mode.
 */
export function Sidebar({
  className,
  activeDivision,
  onDivisionChange,
  mobileOpen = false,
  onMobileClose,
  onCollapseChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const renderSection = (title: string, items: any[]) => (
    <div className="space-y-1 mb-4">
      {!collapsed && (
        <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
          {title}
        </h4>
      )}
      {items.map((division) => (
        <motion.div
          key={division.id}
          whileHover={{ x: 4, backgroundColor: "rgba(255,255,255,0.03)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
          className="rounded-md"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={activeDivision === division.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start h-9 transition-all bg-transparent hover:bg-transparent",
                  collapsed ? "px-2" : "px-4",
                  activeDivision === division.id &&
                    "bg-secondary font-semibold",
                )}
                onClick={() => onDivisionChange(division.id)}
              >
                <division.icon
                  className={cn("h-4 w-4 shrink-0", division.color)}
                />
                {!collapsed && (
                  <span className="truncate">{division.name}</span>
                )}
              </Button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent
                side="right"
                className="bg-black/80 backdrop-blur border-white/10 text-neon-cyan"
              >
                {division.name}
              </TooltipContent>
            )}
          </Tooltip>
        </motion.div>
      ))}
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col glass-sidebar transition-all duration-300 md:relative md:h-screen overflow-hidden",
          mobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
          collapsed && !mobileOpen ? "md:w-16" : "md:w-64",
          className,
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 py-4 mb-2">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-[10px] font-black text-white">S</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-foreground italic neon-pulse-glow">
                SENT
              </span>
            </div>
          )}

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="h-8 w-8 ml-auto md:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Desktop Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapse}
            className="h-8 w-8 ml-auto hidden md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-3 min-h-0">
          {renderSection("Core", CORE_DIVISIONS)}
          {renderSection("Infrastructure", MSP_DIVISIONS)}
          {renderSection("Business", ERP_DIVISIONS)}
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full h-9 justify-start gap-2",
              collapsed ? "px-2" : "px-4",
            )}
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="text-sm">Settings</span>}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
