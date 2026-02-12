import {
  Search,
  LayoutDashboard,
  Bell,
  Star,
  Monitor,
  Server,
  Laptop,
  Network,
  Users,
  Key,
  Terminal,
  Calendar,
  Shield,
  LifeBuoy,
  Ticket,
  Clock,
  ShieldCheck,
  Database,
  Activity,
  Package,
  FileText,
  Settings,
  User,
  LogOut,
  ChevronRight,
  UserPlus,
  Briefcase,
  DollarSign,
  Rocket,
  CheckCircle2,
  ShieldAlert,
  Building2,
  Cloud,
  Map,
  GitBranch,
  Banknote,
  Radio,
  Bug,
  VenetianMask as VenetionMaskPlaceholder,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  variant?: "ghost" | "default";
  label?: string; // For badges like "9" or "New"
  labelColor?: "default" | "red" | "blue";
  items?: NavItem[]; // For nested items
  isExpanded?: boolean; // For default open state
  actionId?: string; // For things that trigger actions instead of navigation (e.g. Search)
};

export type NavZone = {
  id: string;
  title?: string;
  items: NavItem[];
  className?: string;
};

export const sentRmmConfig: NavZone[] = [
  // Zone 1: Command Center (Sticky Top)
  {
    id: "command-center",
    items: [
      {
        title: "Search",
        icon: Search,
        actionId: "search",
        label: "Cmd+K",
      },
      {
        title: "Dashboard",
        href: "/sent-msp/sent-pulse/dashboard",
        icon: LayoutDashboard,
        items: [
          { title: "NOC View", href: "/sent-msp/sent-pulse/dashboard/noc", icon: Activity },
          { title: "Executive View", href: "/sent-msp/sent-pulse/dashboard/executive", icon: FileText },
          { title: "My Alerts", href: "/sent-msp/sent-pulse/dashboard/alerts", icon: Bell },
        ],
      },
      {
        title: "Alerts",
        href: "/sent-msp/sent-pulse/alerts",
        icon: Bell,
        label: "3",
        labelColor: "red",
        actionId: "quick-alerts",
      },
      {
        title: "Favorites",
        icon: Star,
        items: [
          { title: "Server Group A", href: "/sent-msp/sent-pulse/devices/group-a", icon: Server },
          { title: "Patch Policy B", href: "/sent-msp/sent-pulse/automation/patch-b", icon: Shield },
        ],
      },
    ],
  },
  // Zone 2: Core Operations (Scrollable Middle)
  {
    id: "core-ops",
    title: "Core Operations",
    items: [
      {
        title: "Devices & Assets",
        icon: Monitor,
        isExpanded: true,
        items: [
          { title: "All Devices", href: "/sent-msp/sent-pulse/devices", icon: Monitor },
          { title: "Servers", href: "/sent-msp/sent-pulse/devices/servers", icon: Server },
          { title: "Workstations", href: "/sent-msp/sent-pulse/devices/workstations", icon: Laptop },
          { title: "Network Devices", href: "/sent-msp/sent-pulse/devices/network", icon: Network },
          { title: "Smart Groups", href: "/sent-msp/sent-pulse/devices/groups", icon: Users },
        ],
      },
      {
        title: "Client Management",
        icon: Users,
        items: [
          { title: "Clients / Sites", href: "/sent-msp/sent-pulse/clients", icon: Users },
          { title: "Users & Contacts", href: "/sent-msp/sent-pulse/users", icon: User },
          { title: "Passwords", href: "/sent-msp/sent-pulse/passwords", icon: Key },
        ],
      },
      {
        title: "Automation",
        icon: Terminal,
        items: [
          { title: "Script Library", href: "/sent-msp/sent-pulse/scripts", icon: Terminal },
          { title: "Jobs / Schedule", href: "/sent-msp/sent-pulse/jobs", icon: Calendar },
          { title: "Patch Management", href: "/sent-msp/sent-pulse/patching", icon: Shield },
          { title: "Policies", href: "/sent-msp/sent-pulse/policies", icon: ShieldCheck },
        ],
      },
      {
        title: "Service Desk",
        icon: LifeBuoy,
        items: [
          { title: "My Tickets", href: "/sent-msp/sent-pulse/tickets/my", icon: Ticket },
          { title: "Unassigned Queue", href: "/sent-msp/sent-pulse/tickets/queue", icon: Ticket },
          { title: "Timesheets", href: "/sent-msp/sent-pulse/timesheets", icon: Clock },
        ],
      },
      {
        title: "Security",
        icon: Shield,
        items: [
          { title: "Antivirus / EDR", href: "/sent-msp/sent-pulse/security/av", icon: ShieldCheck },
          { title: "Backup Status", href: "/sent-msp/sent-pulse/security/backup", icon: Database },
          { title: "Ransomware Canary", href: "/sent-msp/sent-pulse/security/canary", icon: Activity },
        ],
      },
    ],
  },
  // Zone 3: Admin & Utility (Sticky Bottom)
  {
    id: "admin-utility",
    items: [
      {
        title: "Software",
        href: "/sent-msp/sent-pulse/software",
        icon: Package,
      },
      {
        title: "Reports",
        href: "/sent-msp/sent-pulse/reports",
        icon: FileText,
      },
      {
        title: "Admin",
        href: "/sent-msp/sent-pulse/admin",
        icon: Settings,
      },
      {
        title: "Profile",
        icon: User,
        items: [
          { title: "Dark Mode", actionId: "toggle-theme", icon: Monitor }, // Placeholder icon
          { title: "MFA Settings", href: "/settings/mfa", icon: Key },
          { title: "Logout", actionId: "logout", icon: LogOut },
        ],
      },
    ],
  },
];

export const sentCoreConfig: NavZone[] = [
  // Zone 1: Global Command (Sticky Top)
  {
    id: "global-command",
    items: [
      {
        title: "Omni-Search",
        icon: Search,
        actionId: "omni-search",
        label: "Cmd+K",
      },
      {
        title: "Dashboard",
        href: "/sent-core/noc",
        icon: Activity, // Represents Live Pulse
      },
      {
        title: "Impersonate",
        actionId: "impersonate-ghost",
        icon: VenetionMaskPlaceholder, // Using the alias
      },
    ],
  },
  // Zone 2: Platform Administration (Scrollable Core)
  {
    id: "platform-admin",
    title: "Platform Administration",
    items: [
      {
        title: "Tenant Registry",
        icon: Building2,
        isExpanded: true,
        items: [
          { title: "All Organizations", href: "/sent-core/tenants", icon: Building2 },
          { title: "User Management", href: "/sent-core/tenants/users", icon: Users },
          { title: "Onboarding Wizard", href: "/sent-core/partner-registration", icon: UserPlus },
          { title: "Audit Trail", href: "/sent-core/audit-logs", icon: FileText },
        ],
      },
      {
        title: "Cloud Infrastructure",
        icon: Cloud,
        items: [
          { title: "Region Map", href: "/sent-core/infrastructure/regions", icon: Map },
          { title: "Database Clusters", href: "/sent-core/infrastructure/databases", icon: Database },
          { title: "ZITADEL Identity", href: "http://localhost:8080/ui/console", icon: Key },
          { title: "Deployments", href: "/sent-core/infrastructure/deployments", icon: GitBranch },
        ],
      },
      {
        title: "Billing & Governance",
        icon: Banknote,
        items: [
          { title: "Invoices", href: "/sent-core/billing/invoices", icon: FileText },
          { title: "JoFotara Gateway", href: "/sent-core/billing/jofotara", icon: CheckCircle2 },
          { title: "SaaS Usage", href: "/sent-core/billing/usage", icon: Monitor },
        ],
      },
      {
        title: "Global SOC",
        icon: ShieldAlert,
        items: [
          { title: "Threat Stream", href: "/sent-core/soc/threats", icon: Radio },
          { title: "Global Blocklist", href: "/sent-core/soc/blocklist", icon: Shield },
        ],
      },
    ],
  },
  // Zone 3: System Utilities (Sticky Bottom)
  {
    id: "system-utilities",
    items: [
      {
        title: "Debug Console",
        actionId: "debug-console",
        icon: Bug,
      },
      {
        title: "Global Config",
        href: "/sent-core/config",
        icon: Settings,
      },
      {
        title: "Profile",
        href: "/sent-core/profile",
        icon: User,
      },
    ],
  },
];
