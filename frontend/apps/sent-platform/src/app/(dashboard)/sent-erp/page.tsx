import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sent/platform-ui";
import {
    Mail,
    MessageSquare,
    Video,
    Calendar,
    FileText,
    Table2,
    Presentation,
    FolderKanban,
    Wallet,
    Receipt,
    Users2,
    BarChart3,
    Layout,
    ShoppingCart,
    Store,
    Globe
} from "lucide-react";

const modules = [
    { name: "SENTmail", description: "Universal Webmail Client", icon: Mail },
    { name: "SENTchat", description: "Team Messaging", icon: MessageSquare },
    { name: "SENTmeet", description: "Video Conferencing", icon: Video },
    { name: "SENTcal", description: "Calendar & Scheduling", icon: Calendar },
    { name: "SENTscribe", description: "Business Wiki / SOPs", icon: FileText },
    { name: "SENTsheet", description: "Collaborative Spreadsheets", icon: Table2 },
    { name: "SENTdeck", description: "Presentations", icon: Presentation },
    { name: "SENTmission", description: "Project Accounting", icon: FolderKanban },
    { name: "SENTcapital", description: "Finance / Ledger", icon: Wallet },
    { name: "SENTbridge", description: "JoFotara Tax Integration", icon: Receipt },
    { name: "SENTorbit", description: "CRM / Sales", icon: Users2 },
    { name: "SENTstock", description: "Inventory", icon: ShoppingCart },
    { name: "SENTpeople", description: "HR / Payroll", icon: Users2 },
    { name: "SENTvault", description: "Document Management", icon: FileText },
    { name: "SENTprism", description: "Business Intelligence", icon: BarChart3 },
    { name: "SENTcanvas", description: "Headless CMS", icon: Layout },
    { name: "SENTaccess", description: "Client Portal", icon: Globe },
    { name: "SENTkiosk", description: "Point of Sale", icon: Store },
];

export default function SentErpPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-green-500">SENTerp</h1>
                <p className="text-muted-foreground mt-2">
                    Enterprise Resource Planning suite covering communication, finance, HR, and business operations.
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {modules.map((module) => (
                    <Card key={module.name} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <module.icon className="w-5 h-5 text-green-500" />
                                <CardTitle className="text-sm">{module.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription className="text-xs">{module.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
