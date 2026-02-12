"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Separator,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    cn
} from "@sent/platform-ui";
import {
    CheckCircle2,
    Loader2,
    Rocket,
    Building2,
    Shield,
    Users,
    Globe,
    Lock,
    Check,
    Zap,
    Database
} from "lucide-react";

// --- Schema Definition ---

const registrationSchema = z.object({
    // 1. Organization Details
    orgName: z.string().min(2, "Organization name must be at least 2 characters"),
    domain: z.string().min(3, "Domain is required (e.g. acme.com)"),
    logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),

    // 2. Scale & Compliance
    companySize: z.string().min(1, "Please select a company size"),
    region: z.string().min(1, "Region is required"),

    // 3. Module Selection (Tier)
    tier: z.enum(["tier1", "tier2", "tier3"]),


    // 4. Authentication
    authType: z.enum(["local", "azure-ad", "google"]),


    // Auth Config (Conditional)
    authConfig: z.object({
        clientId: z.string().optional(),
        clientSecret: z.string().optional(),
        tenantId: z.string().optional(),
    }).optional(),

    adminEmail: z.string().email("Invalid email address"),
    adminName: z.string().min(2, "Admin name is required"),
}).superRefine((data, ctx) => {
    if (data.authType === "azure-ad") {
        if (!data.authConfig?.clientId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Client ID is required for Azure AD",
                path: ["authConfig", "clientId"],
            });
        }
        if (!data.authConfig?.clientSecret) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Client Secret is required for Azure AD",
                path: ["authConfig", "clientSecret"],
            });
        }
        if (!data.authConfig?.tenantId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Tenant ID is required for Azure AD",
                path: ["authConfig", "tenantId"],
            });
        }
    }
    if (data.authType === "google") {
        if (!data.authConfig?.clientId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Client ID is required for Google",
                path: ["authConfig", "clientId"],
            });
        }
        if (!data.authConfig?.clientSecret) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Client Secret is required for Google",
                path: ["authConfig", "clientSecret"],
            });
        }
    }
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

// --- Constants ---

const TIERS = [
    {
        id: "tier1",
        name: "Core",
        description: "Essential RMM & Documentation",
        price: "$150/mo",
        features: ["SENTpulse (RMM)", "SENTpilot (Ticketing)", "SENTnexus (Wiki)"],
        icon: Zap,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
    },
    {
        id: "tier2",
        name: "Pro",
        description: "Advanced Security & Ops",
        price: "$350/mo",
        features: ["Everything in Core", "SENTradar (SIEM)", "SENTshield (GRC)", "SENTmail & Chat"],
        icon: Shield,
        color: "text-purple-400",
        bgColor: "bg-purple-400/10",
        borderColor: "border-purple-400/20",
        recommended: true,
    },
    {
        id: "tier3",
        name: "Enterprise",
        description: "Full ERP & Security Suite",
        price: "$850/mo",
        features: ["All Modules", "Dedicated Support", "Custom Integrations", "AI Analytics"],
        icon: Building2,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        borderColor: "border-emerald-400/20",
    },
];

const AUTH_TYPES = [
    { id: "local", name: "Local Credentials", description: "Email & Password managed by ZITADEL", icon: Lock },
    { id: "azure-ad", name: "Azure AD (Entra ID)", description: "Microsoft 365 SSO Integration", icon: Users },
    { id: "google", name: "Google Workspace", description: "Google OIDC Integration", icon: Globe },
];

export default function OnboardingWizardPage() {
    const [loading, setLoading] = React.useState(false);
    const [success, setSuccess] = React.useState(false);
    const [result, setResult] = React.useState<{ orgId: string; dbName: string } | null>(null);

    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            orgName: "",
            domain: "",
            logoUrl: "",
            companySize: "",
            region: "us-east-1",
            tier: "tier2",
            authType: "local",
            authConfig: {
                clientId: "",
                clientSecret: "",
                tenantId: "",
            },
            adminEmail: "",
            adminName: "",
        },
    });

    const selectedAuthType = useWatch({ control: form.control, name: "authType" });
    const selectedTier = useWatch({ control: form.control, name: "tier" });

    async function onSubmit(values: RegistrationFormValues) {
        setLoading(true);
        // Onboarding request started

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"}/api/v1/onboarding/onboard`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Failed to onboard");
            }

            const data = await response.json();

            setResult({
                orgId: data.org_id,
                dbName: data.db_name,
            });
            setSuccess(true);
        } catch (error) {
            console.error("Onboarding failed:", error);
            // Optionally set error state to show to user
            alert("Onboarding failed: " + (error instanceof Error ? error.message : "Unknown error"));
        } finally {
            setLoading(false);
        }
    }

    if (success && result) {
        return (
            <div className="flex h-[calc(100vh-80px)] items-center justify-center p-6 animate-in fade-in duration-500">
                <Card className="max-w-md w-full border-green-500/20 bg-green-500/5 shadow-2xl">
                    <CardHeader className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500 shadow-inner ring-1 ring-green-500/50">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-green-500">Onboarding Complete</CardTitle>
                        <CardDescription>
                            Infrastructure has been successfully provisioned.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-lg bg-black/40 p-4 space-y-3 border border-border/50">
                            <div className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Building2 className="h-4 w-4" /> Organization ID
                                </span>
                                <span className="font-mono text-foreground font-medium">{result.orgId}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-border/20 pb-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Database className="h-4 w-4" /> Database
                                </span>
                                <span className="font-mono text-blue-400">{result.dbName}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Users className="h-4 w-4" /> Admin User
                                </span>
                                <span className="text-foreground">{form.getValues().adminEmail}</span>
                            </div>
                        </div>
                        <div className="text-xs text-center text-muted-foreground bg-muted/30 p-2 rounded">
                            An email with ZITADEL credentials has been sent to the admin.
                        </div>
                    </CardContent>
                    <CardFooter className="gap-2">
                        <Button className="w-full" variant="outline" onClick={() => {
                            setSuccess(false);
                            form.reset();
                        }}>
                            Onboard Another
                        </Button>
                        <Button className="w-full" onClick={() => window.location.href = "/sent-core/tenants"}>
                            View in Registry
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Onboarding Wizard</h1>
                </div>
                <p className="text-muted-foreground max-w-2xl text-lg">
                    Provision a new tenant environment, configure ZITADEL identity, and deploy database infrastructure in a single workflow.
                </p>
            </div>

            <Separator className="bg-border/50" />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Section 1: Organization Details */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm border border-border">1</span>
                            <h2>Organization Details</h2>
                        </div>

                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                                <FormField
                                    control={form.control}
                                    name="orgName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Organization Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. Acme Corporation" {...field} className="bg-background/50" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="domain"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Primary Domain</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g. acme.com" {...field} className="bg-background/50" />
                                            </FormControl>
                                            <FormDescription>Used for ZITADEL domain verification</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="companySize"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Company Size</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background/50">
                                                        <SelectValue placeholder="Select size range" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1-10">1-10 Employees</SelectItem>
                                                    <SelectItem value="11-50">11-50 Employees</SelectItem>
                                                    <SelectItem value="51-200">51-200 Employees</SelectItem>
                                                    <SelectItem value="201-500">201-500 Employees</SelectItem>
                                                    <SelectItem value="500+">500+ Employees</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="region"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Data Region</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="bg-background/50">
                                                        <SelectValue placeholder="Select region" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="us-east-1">US East (N. Virginia)</SelectItem>
                                                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                                                    <SelectItem value="eu-central-1">EU (Frankfurt)</SelectItem>
                                                    <SelectItem value="ap-southeast-1">Asia Pacific (Singapore)</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>Determines physical DB location</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </section>

                    {/* Section 2: Module Selection */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm border border-border">2</span>
                            <h2>Subscription Tier</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TIERS.map((tier) => (
                                <FormField
                                    key={tier.id}
                                    control={form.control}
                                    name="tier"
                                    render={({ field }) => (
                                        <div
                                            onClick={() => field.onChange(tier.id)}
                                            className={cn(
                                                "cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 relative overflow-hidden",
                                                field.value === tier.id
                                                    ? `${tier.borderColor} ${tier.bgColor} ring-1 ring-offset-0`
                                                    : "border-border/50 bg-card hover:border-border hover:bg-muted/50",
                                                field.value === tier.id && tier.recommended ? "ring-purple-500" : ""
                                            )}
                                        >
                                            {tier.recommended && (
                                                <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-bl-lg">
                                                    Recommended
                                                </div>
                                            )}
                                            <div className="flex flex-col h-full gap-3">
                                                <div className="flex justify-between items-start">
                                                    <div className={cn("p-2 rounded-lg bg-background/50", tier.color)}>
                                                        <tier.icon className="h-6 w-6" />
                                                    </div>
                                                    {field.value === tier.id && (
                                                        <CheckCircle2 className={cn("h-6 w-6", tier.color)} />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">{tier.name}</h3>
                                                    <p className="text-sm text-muted-foreground">{tier.description}</p>
                                                </div>
                                                <div className="mt-auto pt-4 border-t border-border/10 space-y-2">
                                                    {tier.features.slice(0, 3).map((feat, i) => (
                                                        <div key={i} className="flex items-center gap-2 text-xs">
                                                            <Check className="h-3 w-3 text-muted-foreground" />
                                                            <span>{feat}</span>
                                                        </div>
                                                    ))}
                                                    {tier.features.length > 3 && (
                                                        <div className="text-xs text-muted-foreground pl-5">
                                                            + {tier.features.length - 3} more...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Section 3: Authentication & Admin */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm border border-border">3</span>
                            <h2>Authentication & Admin</h2>
                        </div>

                        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                            <CardContent className="space-y-6 pt-6">
                                <FormField
                                    control={form.control}
                                    name="authType"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Identity Provider</FormLabel>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {AUTH_TYPES.map((auth) => (
                                                    <div
                                                        key={auth.id}
                                                        onClick={() => field.onChange(auth.id)}
                                                        className={cn(
                                                            "cursor-pointer rounded-lg border p-3 flex items-center gap-3 transition-all",
                                                            field.value === auth.id
                                                                ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                                                                : "border-border hover:bg-muted/50"
                                                        )}
                                                    >
                                                        <auth.icon className={cn("h-5 w-5", field.value === auth.id ? "text-primary" : "text-muted-foreground")} />
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-sm">{auth.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Authenticator Config Fields */}
                                {selectedAuthType === "azure-ad" && (
                                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <h3 className="font-medium text-sm flex items-center gap-2">
                                            <Users className="h-4 w-4 text-blue-400" />
                                            Azure AD Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="authConfig.clientId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Client ID (Application ID)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="00000000-0000-..." {...field} className="bg-background/80" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="authConfig.clientSecret"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Client Secret</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="Key value..." {...field} className="bg-background/80" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="authConfig.tenantId"
                                                render={({ field }) => (
                                                    <FormItem className="col-span-1 md:col-span-2">
                                                        <FormLabel>Tenant ID (Directory ID)</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="00000000-0000-..." {...field} className="bg-background/80" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                {selectedAuthType === "google" && (
                                    <div className="rounded-lg bg-muted/30 p-4 border border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <h3 className="font-medium text-sm flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-orange-400" />
                                            Google Workspace Configuration
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="authConfig.clientId"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Client ID</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="...apps.googleusercontent.com" {...field} className="bg-background/80" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="authConfig.clientSecret"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Client Secret</FormLabel>
                                                        <FormControl>
                                                            <Input type="password" placeholder="Key value..." {...field} className="bg-background/80" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Separator className="bg-border/30" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="adminName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Admin Full Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John Doe" {...field} className="bg-background/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="adminEmail"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Admin Email</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="admin@company.com" {...field} className="bg-background/50" />
                                                </FormControl>
                                                <FormDescription>
                                                    This email will receive the initial login credentials.
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <div className="flex justify-end pt-6">
                        <Button type="submit" size="lg" className="w-full md:w-auto min-w-[200px]" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Provisioning Environment...
                                </>
                            ) : (
                                <>
                                    Provision Tenant
                                    <Rocket className="ml-2 h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>

                </form>
            </Form>
        </div>
    );
}
