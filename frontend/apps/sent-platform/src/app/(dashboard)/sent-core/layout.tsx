"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AppShell, ImpersonationModal } from "@sent/platform-ui";
import { OrgGuard } from "@sent/feature-sent-core";
import { sentCoreConfig, sentRmmConfig } from "@/config/nav-config";
import { AlertTriangle, Loader2 } from "lucide-react";


// Mock Context for Ghost Mode and Provisioning
export const CoreOpsContext = React.createContext<{
    isImpersonating: boolean;
    targetTenant: string | null;
    currentIdentity: string | null;
    startImpersonationFlow: () => void;
    stopImpersonation: () => void;
    isProvisioning: boolean;
    startProvisioning: (tenantName: string) => void;
}>({
    isImpersonating: false,
    targetTenant: null,
    currentIdentity: null,
    startImpersonationFlow: () => { },
    stopImpersonation: () => { },
    isProvisioning: false,
    startProvisioning: () => { },
});

export default function SentCoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isImpersonating, setIsImpersonating] = React.useState(false);
    const [targetTenant, setTargetTenant] = React.useState<string | null>(null);
    const [currentIdentity, setCurrentIdentity] = React.useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = React.useState(false);

    const [isProvisioning, setIsProvisioning] = React.useState(false);
    const [provisioningTenant, setProvisioningTenant] = React.useState<string | null>(null);

    // Effect to simulate provisioning completion
    React.useEffect(() => {
        if (isProvisioning) {
            const timer = setTimeout(() => {
                setIsProvisioning(false);
                setProvisioningTenant(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [isProvisioning]);

    const startImpersonationFlow = () => {
        setIsModalOpen(true);
    };

    const handleImpersonationComplete = (tenant: string, identity: string) => {
        setTargetTenant(tenant);
        setCurrentIdentity(identity);
        setIsImpersonating(true);
        // Redirect to the Hub Page
        router.push(`/sent-core/impersonation-hub?tenant=${encodeURIComponent(tenant)}&identity=${encodeURIComponent(identity)}`);
    };

    const stopImpersonation = () => {
        setIsImpersonating(false);
        setTargetTenant(null);
        setCurrentIdentity(null);
        router.push('/sent-core');
    };

    const startProvisioning = (tenantName: string) => {
        setIsProvisioning(true);
        setProvisioningTenant(tenantName);
    };

    // Listen for custom events triggered from Sidebar Actions
    React.useEffect(() => {
        const handleImpersonateEvent = () => {
            startImpersonationFlow();
        };

        const handleProvisionEvent = () => {
            startProvisioning("TechStart Jordan");
        };

        const handleExitGhostEvent = () => {
            stopImpersonation();
        }

        const handleDebugConsoleEvent = () => {
            router.push('/sent-core/debug');
        }

        window.addEventListener('impersonate-ghost', handleImpersonateEvent);
        window.addEventListener('onboard-tenant', handleProvisionEvent);
        window.addEventListener('exit-ghost-mode', handleExitGhostEvent);
        window.addEventListener('debug-console', handleDebugConsoleEvent);

        return () => {
            window.removeEventListener('impersonate-ghost', handleImpersonateEvent);
            window.removeEventListener('onboard-tenant', handleProvisionEvent);
            window.removeEventListener('exit-ghost-mode', handleExitGhostEvent);
            window.removeEventListener('debug-console', handleDebugConsoleEvent);
        };
    }, [router]);

    // Create a modified nav config that includes the provisioning item if active
    const activeNavConfig = isImpersonating ? sentRmmConfig : React.useMemo(() => {
        if (!isProvisioning) return sentCoreConfig;

        // Clone config to inject provisioning item into Zone 2 (Tenant Registry)
        return sentCoreConfig.map(zone => {
            if (zone.id === 'platform-admin') {
                return {
                    ...zone,
                    items: zone.items.map(item => {
                        if (item.title === 'Tenant Registry') {
                            return {
                                ...item,
                                items: [
                                    ...item.items || [],
                                    {
                                        title: `Provisioning: ${provisioningTenant}...`,
                                        icon: Loader2,
                                        href: '#',
                                        variant: 'ghost' as const,
                                        label: 'Working',
                                        labelColor: 'blue' as const
                                    }
                                ]
                            };
                        }
                        return item;
                    })
                };
            }
            return zone;
        });
    }, [isProvisioning, provisioningTenant]);


    return (
        <OrgGuard>
            <CoreOpsContext.Provider value={{
                isImpersonating,
                targetTenant,
                currentIdentity,
                startImpersonationFlow,
                stopImpersonation,
                isProvisioning,
                startProvisioning
            }}>
                <div className="relative flex min-h-screen flex-col">
                    {/* Ghost Mode Banner */}
                    {isImpersonating && (
                        <div className="bg-orange-600 text-white px-4 py-2 text-sm font-bold flex items-center justify-between shadow-md relative z-50">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span>🕵️ GHOST MODE ACTIVE: You are viewing {targetTenant} as {currentIdentity}.</span>
                            </div>
                            <button
                                onClick={stopImpersonation}
                                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs transition-colors"
                            >
                                Exit Session
                            </button>
                        </div>
                    )}

                    <AppShell
                        navConfig={activeNavConfig}
                        title={isImpersonating ? targetTenant || "Client View" : "SENTcore"}
                    >
                        {children}
                    </AppShell>

                    {/* Impersonation Modal */}
                    <ImpersonationModal
                        open={isModalOpen}
                        onOpenChange={setIsModalOpen}
                        onComplete={handleImpersonationComplete}
                    />
                </div>
            </CoreOpsContext.Provider>
        </OrgGuard>
    );
}
