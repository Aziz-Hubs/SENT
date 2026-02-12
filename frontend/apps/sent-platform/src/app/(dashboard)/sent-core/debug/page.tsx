"use client";

import * as React from "react";
import { Terminal, Play, Trash2, Save } from "lucide-react";
import { Button, Input, ScrollArea } from "@sent/platform-ui";

export default function DebugConsolePage() {
    const [logs, setLogs] = React.useState<string[]>([
        "[SYSTEM] Debug Console Initialized...",
        "[INFO] Connected to Sentinel Core Backend [ws://localhost:8080]",
        "[INFO] Watching telemetry streams: [syslog, audit, metrics]",
    ]);
    const [command, setCommand] = React.useState("");

    const handleExecute = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!command.trim()) return;

        setLogs(prev => [...prev, `> ${command}`, `[EXEC] Executing '${command}'...`, `[RESULT] Command executed successfully (mock).`]);
        setCommand("");
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Terminal</h1>
                    <p className="text-muted-foreground">
                        Direct backend interface. Use with caution.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setLogs([])}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                    <Button variant="outline" size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Export Log
                    </Button>
                </div>
            </div>

            <div className="flex-1 bg-black border border-zinc-800 rounded-lg overflow-hidden flex flex-col font-mono text-sm">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`${log.startsWith('>') ? 'text-zinc-400' : log.includes('[ERROR]') ? 'text-red-500' : 'text-green-500'}`}>
                                {log}
                            </div>
                        ))}
                        <div className="animate-pulse text-green-500">_</div>
                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-zinc-800 bg-zinc-900 flex gap-2">
                    <span className="text-green-500 flex items-center pl-2">$</span>
                    <form onSubmit={handleExecute} className="flex-1">
                        <input
                            className="w-full bg-transparent border-none text-white focus:outline-none focus:ring-0"
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="Type command..."
                            autoFocus
                        />
                    </form>
                    <Button size="sm" variant="ghost" onClick={handleExecute}><Play className="h-4 w-4" /></Button>
                </div>
            </div>
        </div>
    );
}
