import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sent/platform-ui";
import {
    Radar,
    Shield,
    Ticket,
    Zap,
    Search,
    Wifi,
    Radio,
    GraduationCap
} from "lucide-react";

const modules = [
    { name: "SENTradar", description: "SIEM / Log Analysis", icon: Radar },
    { name: "SENTshield", description: "GRC / Compliance", icon: Shield },
    { name: "SENTpilot (Sec)", description: "Incident Response", icon: Ticket },
    { name: "SENTreflex", description: "SOAR / Automation", icon: Zap },
    { name: "SENTprobe", description: "Vulnerability Scanning", icon: Search },
    { name: "SENTsonar", description: "Network Detection", icon: Wifi },
    { name: "SENTsignal", description: "Threat Intelligence", icon: Radio },
    { name: "SENTmind", description: "Security Training", icon: GraduationCap },
];

export default function SentSecPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-orange-500">SENTsec</h1>
                <p className="text-muted-foreground mt-2">
                    Security Operations Center tools for threat detection, compliance, and incident response.
                </p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {modules.map((module) => (
                    <Card key={module.name} className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-3">
                                <module.icon className="w-5 h-5 text-orange-500" />
                                <CardTitle className="text-base">{module.name}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CardDescription>{module.description}</CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Partner Integrations */}
            <Card>
                <CardHeader>
                    <CardTitle>Partner Integrations</CardTitle>
                    <CardDescription>Third-party security services</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Avanan (Email Security)</p>
                </CardContent>
            </Card>
        </div>
    );
}
