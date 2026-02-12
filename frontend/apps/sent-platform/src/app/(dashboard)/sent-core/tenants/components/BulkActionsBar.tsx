"use client";

import * as React from "react";
import { Button } from "@sent/platform-ui";
import { Badge } from "@sent/platform-ui";
import {
    Lock,
    Trash2,
    RefreshCcw,
    X,
    CheckCircle2,
    ShieldAlert
} from "lucide-react";

interface BulkActionsBarProps {
    selectedCount: number;
    onClear: () => void;
    onSuspend: () => void;
    onSync: () => void;
    onDelete: () => void;
}

export function BulkActionsBar({
    selectedCount,
    onClear,
    onSuspend,
    onSync,
    onDelete
}: BulkActionsBarProps) {
    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900 text-white rounded-full px-6 py-4 shadow-2xl border border-slate-700 flex items-center gap-6">
                <div className="flex items-center gap-3 pr-6 border-r border-slate-700">
                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center bg-blue-500 text-white border-none">
                        {selectedCount}
                    </Badge>
                    <span className="text-sm font-bold uppercase tracking-wider">Organizations Selected</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-800 hover:text-green-400 transition-all duration-300"
                        onClick={onSync}
                    >
                        <RefreshCcw className="mr-2 h-4 w-4" /> Sync
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-800 hover:text-yellow-400 transition-all duration-300"
                        onClick={onSuspend}
                    >
                        <Lock className="mr-2 h-4 w-4" /> Suspend
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-slate-800 hover:text-red-400 transition-all duration-300"
                        onClick={onDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>

                <button
                    onClick={onClear}
                    className="p-1 hover:bg-slate-800 rounded-full transition-colors text-slate-400"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
}
