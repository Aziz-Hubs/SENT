import Link from "next/link";
import {
    Activity,
    Shield,
    LayoutGrid,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@sent/platform-ui";

export default function SentMspHub() {
    const apps = [
        {
            title: "SENTpulse",
            description: "Remote Monitoring & Management",
            icon: Activity,
            href: "/sent-msp/sent-pulse",
            color: "text-blue-500",
        },
        {
            title: "SENTpilot",
            description: "Professional Services Automation",
            icon: LayoutGrid,
            href: "#", // Placeholder
            color: "text-purple-500",
        },
        {
            title: "SENTnexus",
            description: "Knowledge & Documentation",
            icon: Shield, // Placeholder icon
            href: "#", // Placeholder
            color: "text-green-500",
        },
    ];

    return (
        <div className="container mx-auto py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">SENTmsp Hub</h1>
                <p className="text-muted-foreground mt-2">
                    Select an application to launch.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {apps.map((app) => (
                    <Link key={app.title} href={app.href} className="block group">
                        <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg bg-background border ${app.color}`}>
                                        <app.icon className="h-6 w-6" />
                                    </div>
                                    <CardTitle className="group-hover:text-primary transition-colors">
                                        {app.title}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription>{app.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
