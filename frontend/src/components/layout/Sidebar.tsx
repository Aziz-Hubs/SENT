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
  Heart,
  Clock,
  Video,
  Ticket,
  Timer,
  Database,
  FileText,
  Phone,
  Voicemail,
  LayoutGrid,
  UserPlus,
  CreditCard,
  Globe,
  Palmtree,
  Target,
  Layers,
  Bell,
  ScrollText,
  MonitorPlay,
  FolderSync,
  BarChart3,
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
    // Monitoring
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "devices", name: "Devices", icon: Server },
    { id: "alerts", name: "Alerts", icon: Bell },
    // Management
    { id: "patches", name: "Patching", icon: Shield },
    { id: "software", name: "Software", icon: Package },
    { id: "policies", name: "Policies", icon: ScrollText },
    // Automation
    { id: "scripts", name: "Scripts", icon: FileCode },
    { id: "jobs", name: "Scheduled Jobs", icon: Calendar },
    { id: "history", name: "Execution Log", icon: History },
    // Remote Access
    { id: "remote", name: "Remote Connect", icon: MonitorPlay },
    { id: "files", name: "File Transfer", icon: FolderSync },
    // Reports
    { id: "reports", name: "Reports", icon: BarChart3 },
  ],
  stock: [
    { id: "overview", name: "Inventory", icon: Package },
    { id: "suppliers", name: "Suppliers", icon: Truck },
    { id: "categories", name: "Categories", icon: Layers },
    { id: "reports", name: "Valuation", icon: TrendingUp },
    { id: "maintenance", name: "Asset Health", icon: Wrench },
  ],
  erp: [
    { id: "overview", name: "General Ledger", icon: Briefcase },
    { id: "accounts", name: "Accounts", icon: Banknote },
    { id: "tax", name: "Tax Audit", icon: Scale },
  ],
  people: [
    { id: "org", name: "Org Chart", icon: LayoutGrid },
    { id: "recruiting", name: "Recruiting", icon: UserPlus },
    { id: "benefits", name: "Benefits", icon: Heart },
    { id: "engagement", name: "Engagement", icon: TrendingUp },
    { id: "payroll", name: "Payroll", icon: CreditCard },
    { id: "onboarding", name: "Onboarding", icon: FileText },
  ],
  employee: [
    { id: "overview", name: "My Profile", icon: LayoutDashboard },
    { id: "time", name: "Time Off", icon: Palmtree },
    { id: "performance", name: "Performance", icon: Target },
  ],
  nexus: [
    { id: "overview", name: "Asset Graph", icon: Database },
    { id: "vault", name: "Secure Vault", icon: Lock },
    { id: "saas", name: "SaaS Audit", icon: Globe },
    { id: "discovery", name: "Discovery Inbox", icon: Search },
  ],
  optic: [
    { id: "overview", name: "Live View", icon: Video },
    { id: "archive", name: "Recordings", icon: History },
    { id: "ai", name: "Object Detection", icon: ScanLine },
  ],
  pilot: [
    { id: "overview", name: "Service Desk", icon: Ticket },
    { id: "projects", name: "Project Board", icon: Briefcase },
    { id: "slas", name: "SLA Monitor", icon: Timer },
  ],
  grid: [
    { id: "overview", name: "Network Map", icon: Database },
    { id: "automation", name: "Runbooks", icon: FileCode },
  ],
  horizon: [
    { id: "overview", name: "Strategy", icon: TrendingUp },
    { id: "budget", name: "Roadmaps", icon: Banknote },
  ],
  control: [
    { id: "overview", name: "SaaS Ops", icon: ShieldAlert },
    { id: "licensing", name: "Licenses", icon: FileText },
  ],
  wave: [
    { id: "overview", name: "Softphone", icon: Phone },
    { id: "history", name: "Recent Calls", icon: History },
    { id: "voicemail", name: "Voicemail", icon: Voicemail },
  ],
  kiosk: [
    { id: "overview", name: "Point of Sale", icon: ShoppingCart },
    { id: "orders", name: "Order History", icon: History },
  ],
  vault: [
    { id: "overview", name: "Secure Storage", icon: HardDrive },
    { id: "retention", name: "Compliance", icon: Shield },
  ],
  tax: [
    { id: "overview", name: "Filings", icon: Scale },
    { id: "audit", name: "Audit Defense", icon: ShieldAlert },
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
          "fixed inset-y-0 left-16 z-40 flex flex-col glass-sidebar transition-all duration-300 md:left-0 md:relative md:h-screen overflow-hidden",
          mobileOpen
            ? "translate-x-0 w-64 shadow-2xl"
            : "-translate-x-[calc(100%+64px)] md:translate-x-0",
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
