"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@sent/platform-ui";

interface OrgGuardProps {
    children: React.ReactNode;
    requiredOrgId?: string; // ID of the organization the user must belong to (e.g., SENT Internal)
    requiredRole?: string; // Role required (e.g., platform_admin)
}

export function OrgGuard({ children, requiredOrgId, requiredRole }: OrgGuardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAuthorized, setIsAuthorized] = React.useState(false);

    React.useEffect(() => {
        // Placeholder for real ZITADEL auth check
        // In a real implementation, this would check the user's session claims
        const checkAuth = async () => {
            // Simulate API latency
            await new Promise(resolve => setTimeout(resolve, 800));

            // MOCK: Checking if user is part of SENT Internal
            // For now, we assume the user is authorized if they are logged in
            // In the future, this will check: session.org_id === requiredOrgId
            const mockUser = {
                orgId: "sent-internal",
                roles: ["platform_admin"]
            };

            const hasOrg = !requiredOrgId || mockUser.orgId === "sent-internal"; // Simplify for mock
            const hasRole = !requiredRole || mockUser.roles.includes(requiredRole);

            if (hasOrg && hasRole) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
            setIsLoading(false);
        };

        checkAuth();
    }, [requiredOrgId, requiredRole]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Verifying secure access permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background p-4">
                <Card className="max-w-md border-destructive/50 bg-destructive/5">
                    <CardHeader>
                        <div className="flex items-center gap-2 text-destructive">
                            <ShieldAlert className="h-5 w-5" />
                            <CardTitle>Access Denied</CardTitle>
                        </div>
                        <CardDescription>
                            You do not have the required permissions to access the SENTcore Administration Console.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This area is restricted to <strong>SENT Internal</strong> employees with the
                            <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">platform_admin</code> role.
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => router.push("/sent-msp")}>
                                Return to Dashboard
                            </Button>
                            <Button variant="destructive" onClick={() => router.push("/login")}>
                                Switch Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
