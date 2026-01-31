import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
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
  Server,
  FileCode,
  Calendar,
  History,
  TrendingUp,
  Truck,
  Wrench,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";

// Mock sub-page configuration for modules
const SUB_PAGES: Record<string, { id: string; name: string; icon: any }[]> = {
  dashboard: [
    { id: "overview", name: "Executive View", icon: LayoutDashboard },
    { id: "audit", name: "Ecological Logs", icon: History },
  ],
  pulse: [
    { id: "overview", name: "Telemetry", icon: Activity },
    { id: "devices", name: "Endpoint Map", icon: Server },
    { id: "scripts", name: "Script Repo", icon: FileCode },
    { id: "jobs", name: "Scheduled Jobs", icon: Calendar },
  ],
  stock: [
    { id: "overview", name: "Inventory", icon: Package },
    { id: "suppliers", name: "Suppliers", icon: Truck },
    { id: "reports", name: "Valuation", icon: TrendingUp },
    { id: "maintenance", name: "Asset Health", icon: Wrench },
  ],
  erp: [
    { id: "overview", name: "General Ledger", icon: Briefcase },
    { id: "accounts", name: "Accounts", icon: Banknote },
    { id: "tax", name: "Tax Audit", icon: Scale },
  ],
  people: [
    { id: "overview", name: "Directory", icon: Users },
    { id: "hris", name: "HRIS Core", icon: Shield },
    { id: "payroll", name: "Payroll", icon: Banknote },
  ],
  nexus: [
    { id: "overview", name: "Asset Graph", icon: Shield },
    { id: "docs", name: "Documentation", icon: FileCode },
  ],
  kiosk: [
    { id: "overview", name: "Point of Sale", icon: ShoppingCart },
    { id: "orders", name: "Order History", icon: History },
  ],
  admin: [
    { id: "overview", name: "System Config", icon: Settings },
    { id: "users", name: "User Access", icon: Users },
    { id: "security", name: "Security Audit", icon: ShieldAlert },
  ],
};

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeDivision: string;
  onDivisionChange: (division: string) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  className,
  activeDivision,
  onDivisionChange,
  mobileOpen = false,
  onMobileClose,
  onCollapseChange,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { activeTab, setTab } = useAppStore();

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onCollapseChange?.(newCollapsed);
  };

  const pages = SUB_PAGES[activeDivision] || [
    { id: "overview", name: "Global Overview", icon: LayoutDashboard },
    { id: "search", name: "Global Search", icon: Search },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col glass-sidebar transition-all duration-300 md:relative md:h-screen overflow-hidden",
          mobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-full md:translate-x-0",
          collapsed && !mobileOpen ? "md:w-20" : "md:w-60",
          className,
        )}
      >
        {/* Module Header */}
        <div className="flex h-16 items-center justify-between px-6 py-4 border-b border-white/5">
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground/60"
            >
              Navigation
            </motion.span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleCollapse}
            className="h-8 w-8 ml-auto hidden md:flex hover:bg-white/5"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-3 py-6 custom-scrollbar">
          <div className="space-y-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDivision}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {pages.map((page) => (
                  <motion.div
                    key={page.id}
                    whileHover={{
                      x: 4,
                      backgroundColor: "rgba(255,255,255,0.03)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    className="rounded-md"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            activeTab === page.id ? "secondary" : "ghost"
                          }
                          className={cn(
                            "w-full justify-start h-10 transition-all bg-transparent hover:bg-transparent",
                            collapsed ? "px-2" : "px-4",
                            activeTab === page.id &&
                              "bg-primary/10 text-primary font-bold border-r-2 border-primary rounded-none",
                          )}
                          onClick={() => setTab(page.id)}
                        >
                          <page.icon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors mr-3",
                              activeTab === page.id
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          {!collapsed && (
                            <span className="truncate text-xs font-medium">
                              {page.name}
                            </span>
                          )}
                        </Button>
                      </TooltipTrigger>
                      {collapsed && (
                        <TooltipContent
                          side="right"
                          className="bg-black/95 backdrop-blur border-white/10 text-primary"
                        >
                          {page.name}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollArea>

        {/* Footer info */}
        <div className="p-4 border-t border-white/5">
          <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
            <p className="text-[10px] font-black uppercase tracking-tighter text-primary">
              SENT v1.4.2
            </p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
