import {
    Briefcase,
    Users,
    Package,
    Activity,
    Cpu,
    Ticket,
    Receipt,
    FileText,
    UserPlus,
    Calendar,
    CreditCard,
    Landmark,
    Server,
    Terminal
} from "lucide-react";

export interface NavItem {
    title: string;
    href: string;
    icon?: any;
}

export interface ModuleNav {
    info: any[]; // Placeholder for stats
    pages: NavItem[];
    quickActions: NavItem[];
}

export const navigationData: Record<string, Record<string, ModuleNav>> = {
    erp: {
        capital: {
            info: [],
            pages: [
                { title: "Dashboard", href: "/erp/capital", icon: Activity },
                { title: "Invoices", href: "/erp/capital/invoices", icon: Receipt },
                { title: "Banking", href: "/erp/capital/banking", icon: Landmark },
            ],
            quickActions: [
                { title: "New Invoice", href: "/erp/capital/invoices/new", icon: Receipt },
            ]
        },
        people: {
            info: [],
            pages: [
                { title: "Dashboard", href: "/erp/people", icon: Users },
                { title: "Payroll", href: "/erp/people/payroll", icon: CreditCard },
                { title: "Performance", href: "/erp/people/performance", icon: Activity },
                { title: "Recruiting", href: "/erp/people/recruiting", icon: UserPlus },
                { title: "Time Off", href: "/erp/people/timeoff", icon: Calendar },
            ],
            quickActions: [
                { title: "Add Employee", href: "/erp/people/add", icon: UserPlus },
            ]
        },
        stock: {
            info: [],
            pages: [
                { title: "Dashboard", href: "/erp/stock", icon: Package },
                { title: "Inventory", href: "/erp/stock/inventory", icon: Package },
                { title: "Point of Sale", href: "/erp/stock/pos", icon: Terminal },
            ],
            quickActions: [
                { title: "Open POS", href: "/erp/stock/pos", icon: Terminal },
            ]
        }
    },
    msp: {
        pilot: {
            info: [],
            pages: [
                { title: "Dashboard", href: "/msp/pilot", icon: Activity },
                { title: "Tickets", href: "/msp/pilot/tickets", icon: Ticket },
                { title: "Billing", href: "/msp/pilot/billing", icon: Receipt },
            ],
            quickActions: [
                { title: "New Ticket", href: "/msp/pilot/tickets/new", icon: Ticket },
            ]
        },
        pulse: {
            info: [],
            pages: [
                { title: "Dashboard", href: "/msp/pulse", icon: Activity },
                { title: "Devices", href: "/msp/pulse/devices", icon: Server },
                { title: "Scripts", href: "/msp/pulse/scripts", icon: FileText },
            ],
            quickActions: [
                { title: "Run Script", href: "/msp/pulse/run", icon: Terminal },
            ]
        }
    }
};
