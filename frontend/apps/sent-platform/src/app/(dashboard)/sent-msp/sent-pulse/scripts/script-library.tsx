"use client";

import { useState } from "react";
import {
    Terminal,
    Play,
    Calendar,
    Search,
    Code
} from "lucide-react";
import { Script } from "@sent/feature-sent-msp";
import {
    Button,
    Input,
    Badge,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    cn
} from "@sent/platform-ui";

interface ScriptLibraryProps {
    initialScripts: Script[];
}

export function ScriptLibrary({ initialScripts }: ScriptLibraryProps) {
    const [search, setSearch] = useState("");
    const [filterLang, setFilterLang] = useState<string | "all">("all");

    const filteredScripts = initialScripts.filter(script => {
        const matchesSearch = script.name.toLowerCase().includes(search.toLowerCase()) ||
            script.description.toLowerCase().includes(search.toLowerCase());
        const matchesLang = filterLang === "all" || script.language === filterLang;
        return matchesSearch && matchesLang;
    });

    return (
        <div className="space-y-6">
            {/* Search & Filter */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="flex w-full sm:w-auto items-center gap-2">
                    <div className="relative w-full sm:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search scripts..."
                            className="pl-8"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center bg-muted rounded-md p-1">
                        {["all", "powershell", "bash", "python"].map((lang) => (
                            <button
                                key={lang}
                                onClick={() => setFilterLang(lang)}
                                className={cn(
                                    "px-3 py-1 text-sm font-medium rounded-sm transition-all",
                                    filterLang === lang ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <Button>
                    <div className="mr-2 h-4 w-4" >+</div> New Script
                </Button>
            </div>

            {/* Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredScripts.map(script => (
                    <Card key={script.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className={cn(
                                    "p-2 rounded-md",
                                    script.language === "powershell" ? "bg-blue-500/10 text-blue-600" :
                                        script.language === "bash" ? "bg-slate-500/10 text-slate-600" :
                                            "bg-yellow-500/10 text-yellow-600"
                                )}>
                                    <Terminal className="h-5 w-5" />
                                </div>
                                <Badge variant="outline" className={cn(
                                    script.successRate >= 98 ? "border-green-500 text-green-600" : "border-yellow-500 text-yellow-600"
                                )}>
                                    {script.successRate}% Success
                                </Badge>
                            </div>
                            <CardTitle className="mt-4">{script.name}</CardTitle>
                            <CardDescription className="line-clamp-2 min-h-[40px]">
                                {script.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex flex-wrap gap-2">
                                {script.tags.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                            <div className="mt-4 text-xs text-muted-foreground">
                                Last Run: {script.lastRun ? new Date(script.lastRun).toLocaleDateString() : "Never"}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4 bg-muted/20">
                            <Button variant="ghost" size="sm" className="h-8">
                                <Calendar className="mr-2 h-3 w-3" /> Schedule
                            </Button>
                            <Button size="sm" className="h-8">
                                <Play className="mr-2 h-3 w-3" /> Run Now
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
