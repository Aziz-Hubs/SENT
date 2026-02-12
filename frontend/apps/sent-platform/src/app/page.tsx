import Link from "next/link";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sent/platform-ui";
import { Shield, Briefcase, Server, Building2 } from "lucide-react";

const divisions = [
    {
        name: "SENTmsp",
        description: "Managed Service Provider tools for IT operations",
        href: "/sent-msp",
        icon: Server,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
    },
    {
        name: "SENTerp",
        description: "Enterprise Resource Planning suite",
        href: "/sent-erp",
        icon: Briefcase,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
    },
    {
        name: "SENTsec",
        description: "Security Operations Center tools",
        href: "/sent-sec",
        icon: Shield,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
    },
    {
        name: "SENTcore",
        description: "Corporate headquarters administration",
        href: "/sent-core",
        icon: Building2,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
    },
];

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
            <div className="container mx-auto px-4 py-16">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold tracking-tight mb-4">
                        Welcome to <span className="text-primary">SENT Platform</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        The unified enterprise platform powering MSP operations, ERP workflows,
                        and security operations under one roof.
                    </p>
                </div>

                {/* Division Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {divisions.map((division) => (
                        <Link key={division.name} href={division.href}>
                            <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer">
                                <CardHeader>
                                    <div className={`w-12 h-12 rounded-lg ${division.bgColor} flex items-center justify-center mb-4`}>
                                        <division.icon className={`w-6 h-6 ${division.color}`} />
                                    </div>
                                    <CardTitle>{division.name}</CardTitle>
                                    <CardDescription>{division.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="w-full">
                                        Enter Division
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="text-center text-muted-foreground">
                    <p>SENT LLC © 2026 - Cloud Singularity Architecture</p>
                </div>
            </div>
        </main>
    );
}
