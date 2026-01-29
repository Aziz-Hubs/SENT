import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { LayoutDashboard, Shield, Briefcase, Settings, ChevronLeft, ChevronRight, HardDrive, Package, Banknote, Scale, ShieldAlert, ScanLine, LayoutPanelLeft, Activity, Users } from "lucide-react"
import { useState } from "react"

// Divisions Configuration
const CORE_DIVISIONS = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, color: "text-slate-400" },
  { id: "admin", name: "Administration", icon: ShieldAlert, color: "text-red-500" },
]

const MSP_DIVISIONS = [
  { id: "pulse", name: "Pulse RMM", icon: Activity, color: "text-msp" },
  { id: "nexus", name: "Nexus CMDB", icon: Shield, color: "text-msp" },
  { id: "optic", name: "Optic NVR", icon: ScanLine, color: "text-msp" },
  { id: "grid", name: "Grid Net", icon: Activity, color: "text-msp" },
  { id: "pilot", name: "Pilot PSA", icon: LayoutPanelLeft, color: "text-msp" },
  { id: "horizon", name: "Horizon vCIO", icon: LayoutDashboard, color: "text-msp" },
  { id: "control", name: "Control SMP", icon: Shield, color: "text-msp" },
  { id: "wave", name: "Wave VoIP", icon: Activity, color: "text-msp" },
]

const ERP_DIVISIONS = [
  { id: "people", name: "People HR", icon: Users, color: "text-erp" },
  { id: "erp", name: "Capital", icon: Briefcase, color: "text-erp" },
  { id: "stock", name: "Inventory", icon: Package, color: "text-erp" },
  { id: "kiosk", name: "Kiosk", icon: Banknote, color: "text-erp" },
  { id: "vault", name: "Vault", icon: HardDrive, color: "text-erp" },
  { id: "tax", name: "Bridge", icon: Scale, color: "text-erp" },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeDivision: string;
  onDivisionChange: (division: string) => void;
}

/**
 * Sidebar component handles navigation between different application divisions.
 * It supports collapsing to save screen space.
 */
export function Sidebar({ className, activeDivision, onDivisionChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const renderSection = (title: string, items: any[]) => (
    <div className="space-y-1 mb-4">
      {!collapsed && <h4 className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">{title}</h4>}
      {items.map((division) => (
        <Button
          key={division.id}
          variant={activeDivision === division.id ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start h-9 transition-all",
            collapsed ? "px-2" : "px-4",
            activeDivision === division.id && "bg-secondary font-semibold"
          )}
          onClick={() => onDivisionChange(division.id)}
          title={collapsed ? division.name : undefined}
        >
          <division.icon className={cn("h-4 w-4 shrink-0", division.color)} />
          {!collapsed && <span className="truncate">{division.name}</span>}
        </Button>
      ))}
    </div>
  )

  return (
    <div className={cn("relative flex flex-col border-r bg-background transition-all duration-300", collapsed ? "w-16" : "w-64", className)}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 py-4 mb-2">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-primary rounded flex items-center justify-center">
                <span className="text-[10px] font-black text-primary-foreground">S</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-foreground italic">SENT</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8 ml-auto">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3">
        {renderSection("Core", CORE_DIVISIONS)}
        {renderSection("Infrastructure", MSP_DIVISIONS)}
        {renderSection("Business", ERP_DIVISIONS)}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t p-4">
        <Button variant="ghost" className={cn("w-full h-9 justify-start gap-2", collapsed ? "px-2" : "px-4")}>
          <Settings className="h-4 w-4" />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Button>
      </div>
    </div>
  )
}
