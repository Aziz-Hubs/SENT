"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    Activity,
    Database,
    FileText,
    Settings,
    User,
    Shield,
    Map,
    Bug,
    VenetianMask,
    UserPlus,
} from "lucide-react";

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "../ui/command";

// Quick navigation items for SENTcore
const sentCoreQuickNav = [
    { title: "NOC Wallboard", href: "/sent-core/noc", icon: Activity, shortcut: "⌘1" },
    { title: "Tenant Registry", href: "/sent-core/tenants", icon: Building2, shortcut: "⌘2" },
    { title: "Cloud Regions", href: "/sent-core/infrastructure/regions", icon: Map, shortcut: "⌘3" },
    { title: "Database Clusters", href: "/sent-core/infrastructure/databases", icon: Database },
    { title: "Invoices", href: "/sent-core/billing/invoices", icon: FileText },
    { title: "Audit Logs", href: "/sent-core/audit-logs", icon: FileText },
    { title: "Debug Console", href: "/sent-core/debug", icon: Bug },
];

const sentCoreActions = [
    { title: "Impersonate Tenant", actionId: "impersonate-ghost", icon: VenetianMask },
    { title: "Onboard New Partner", actionId: "onboard-tenant", icon: UserPlus },
];

const settingsItems = [
    { title: "Global Config", href: "/sent-core/config", icon: Settings },
    { title: "Profile", href: "/sent-core/profile", icon: User },
    { title: "SOC Threats", href: "/sent-core/soc/threats", icon: Shield },
];

export function CommandPalette() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleNavigation = (href: string) => {
        router.push(href);
        setOpen(false);
    };

    const handleAction = (actionId: string) => {
        window.dispatchEvent(new CustomEvent(actionId));
        setOpen(false);
    };

    return (
        <>
            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Search tenants, navigate, or run actions..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>

                    {/* Quick Navigation */}
                    <CommandGroup heading="Quick Navigation">
                        {sentCoreQuickNav.map((item) => (
                            <CommandItem
                                key={item.href}
                                onSelect={() => handleNavigation(item.href)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                                {item.shortcut && (
                                    <CommandShortcut>{item.shortcut}</CommandShortcut>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Actions */}
                    <CommandGroup heading="Actions">
                        {sentCoreActions.map((item) => (
                            <CommandItem
                                key={item.actionId}
                                onSelect={() => handleAction(item.actionId)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>

                    <CommandSeparator />

                    {/* Settings */}
                    <CommandGroup heading="Settings">
                        {settingsItems.map((item) => (
                            <CommandItem
                                key={item.href}
                                onSelect={() => handleNavigation(item.href)}
                            >
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.title}</span>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
