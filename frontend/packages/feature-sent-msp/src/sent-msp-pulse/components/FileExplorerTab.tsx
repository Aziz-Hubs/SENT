"use client";

import { useState, useEffect, useCallback, Fragment, useRef, useMemo } from "react";
import {
    Folder,
    File,
    FileText,
    HardDrive,
    ArrowLeft,
    RefreshCw,
    Search,
    ChevronRight,
    Home,
    Download,
    Trash2,
    MoreVertical,
    Loader2,
    ArrowUp,
    ArrowDown,
    FileCode,
    FileImage,
    FileAudio,
    FileVideo,
    FileArchive,
    X,
    FolderOpen
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Button,
    Input,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Skeleton,
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    cn // Ensure cn utility is available or imported if needed, usually from platform-ui or lib
} from "@sent/platform-ui";
import { FileSystemEntry } from "../../types";
import { pulseService } from "../../services/pulse-client";
import { parseISO, isValid, format } from "date-fns";

interface FileExplorerTabProps {
    deviceId: string;
}

const MAX_RETRIES = 8;
const RETRY_DELAY_MS = 3000;

type SortField = "name" | "size" | "date" | "type";
type SortDirection = "asc" | "desc";

export function FileExplorerTab({ deviceId }: FileExplorerTabProps) {
    const [currentPath, setCurrentPath] = useState<string>("");
    const [entries, setEntries] = useState<FileSystemEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [history, setHistory] = useState<string[]>([]);
    const [connecting, setConnecting] = useState<boolean>(false);
    const [retryCount, setRetryCount] = useState<number>(0);
    const [sortField, setSortField] = useState<SortField>("name");
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const retryTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Cleanup retry timer on unmount
    useEffect(() => {
        return () => {
            if (retryTimerRef.current) {
                clearTimeout(retryTimerRef.current);
            }
        };
    }, []);

    const fetchDirectory = useCallback(async (path: string, isRetry = false) => {
        if (!isRetry) {
            setLoading(true);
            setError(null);
            setConnecting(false);
            setRetryCount(0);
        }

        try {
            const resp = await pulseService.listDirectory(deviceId, path);
            setEntries(resp.entries);
            setCurrentPath(resp.currentPath);
            setLoading(false);
            setConnecting(false);
            setRetryCount(0);
            setError(null);
        } catch (err: any) {
            console.error("Failed to list directory:", err);

            const errorMessage = err?.message || "";
            const isUnavailable = errorMessage.includes("unavailable") ||
                errorMessage.includes("connecting") ||
                errorMessage.includes("not connected") ||
                errorMessage.includes("[unavailable]");

            if (isUnavailable && retryCount < MAX_RETRIES) {
                // Agent is bootstrapping - show connecting state and retry
                setConnecting(true);
                setLoading(false);
                const nextRetryCount = retryCount + 1;
                setRetryCount(nextRetryCount);

                retryTimerRef.current = setTimeout(() => {
                    fetchDirectory(path, true);
                }, RETRY_DELAY_MS);
            } else {
                setError(isUnavailable
                    ? "Agent is not available. Please ensure the agent is running on the device and try again."
                    : errorMessage || "Failed to load directory"
                );
                setLoading(false);
                setConnecting(false);
                setRetryCount(0);
            }
        }
    }, [deviceId, retryCount]);

    useEffect(() => {
        fetchDirectory("");
    }, [deviceId]);

    const handleNavigate = (path: string) => {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        setHistory(prev => [...prev, currentPath]);
        setSearchQuery(""); // Clear search on navigation
        fetchDirectory(path);
    };

    const handleBack = () => {
        if (history.length > 0) {
            if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
            const lastPath = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            fetchDirectory(lastPath);
        }
    };

    const handleRefresh = () => {
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        fetchDirectory(currentPath);
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const processedEntries = useMemo(() => {
        let filtered = entries.filter(entry =>
            entry.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return filtered.sort((a, b) => {
            // Always keep folders on top
            if (a.isDirectory && !b.isDirectory) return -1;
            if (!a.isDirectory && b.isDirectory) return 1;

            let comparison = 0;
            switch (sortField) {
                case "name":
                    comparison = a.name.localeCompare(b.name);
                    break;
                case "size":
                    comparison = Number(a.sizeBytes) - Number(b.sizeBytes);
                    break;
                case "date":
                    // Simple string comparison for ISO dates or parse if needed
                    comparison = (a.modTime || "").localeCompare(b.modTime || "");
                    break;
                case "type":
                    const extA = a.name.split('.').pop() || "";
                    const extB = b.name.split('.').pop() || "";
                    comparison = extA.localeCompare(extB);
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });
    }, [entries, searchQuery, sortField, sortDirection]);

    const formatSize = (bytes: bigint | number | string) => {
        const b = Number(bytes);
        if (b === 0) return "0 B";
        if (isNaN(b)) return "-";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(b) / Math.log(k));
        return parseFloat((b / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const getFileIcon = (entry: FileSystemEntry) => {
        if (entry.isDirectory) return <Folder className="h-4 w-4 text-blue-500 fill-blue-500/20" />;

        const ext = entry.name.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'js': case 'ts': case 'tsx': case 'jsx': case 'json': case 'html': case 'css':
                return <FileCode className="h-4 w-4 text-yellow-500" />;
            case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp':
                return <FileImage className="h-4 w-4 text-purple-500" />;
            case 'mp3': case 'wav': case 'ogg':
                return <FileAudio className="h-4 w-4 text-pink-500" />;
            case 'mp4': case 'mov': case 'avi':
                return <FileVideo className="h-4 w-4 text-red-500" />;
            case 'zip': case 'rar': case '7z': case 'tar': case 'gz':
                return <FileArchive className="h-4 w-4 text-orange-500" />;
            case 'exe': case 'msi': case 'bat': case 'ps1':
                return <HardDrive className="h-4 w-4 text-slate-500" />;
            case 'pdf': case 'doc': case 'docx': case 'txt': case 'md':
                return <FileText className="h-4 w-4 text-blue-400" />;
            default:
                return <File className="h-4 w-4 text-muted-foreground" />;
        }
    };

    const handleDownload = async (entry: FileSystemEntry) => {
        try {
            const result = await pulseService.readFile(deviceId, entry.path);

            // Create blob and download
            const blob = new Blob([result.content as any], { type: result.mimeType || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = entry.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            console.error("Failed to download file:", err);
            // Ideally use a toast notification here
            alert(`Failed to download file: ${err.message || 'Unknown error'}`);
        }
    };

    const breadcrumbs = currentPath.split(/[\\/]/).filter(Boolean);
    const isWindows = currentPath.includes(":");

    const formatModTime = (dateStr: string) => {
        if (!dateStr) return "-";
        try {
            const date = parseISO(dateStr);
            return isValid(date) ? format(date, "MMM dd, yyyy HH:mm") : "-";
        } catch {
            return "-";
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <Card className="flex-1 flex flex-col shadow-sm border-border/60">
                <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <FolderOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">File Explorer</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">Browse and manage files on device</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    placeholder="Search current folder..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 bg-background/50 border-input/60 focus:bg-background transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={connecting} className="h-9 w-9">
                                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col min-h-[500px]">
                    {/* Connecting State */}
                    {connecting && (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center max-w-md mx-auto">
                                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                </div>
                                <h3 className="text-lg font-medium">Connecting to Agent</h3>
                                <p className="text-muted-foreground mt-2 mb-6">
                                    Establishing a secure file transfer session with the remote device.
                                    This might take a few moments...
                                </p>
                                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full transition-all duration-500 ease-out"
                                        style={{ width: `${(retryCount / MAX_RETRIES) * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">Attempt {retryCount} of {MAX_RETRIES}</p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Bar */}
                    {!connecting && (
                        <div className="px-4 py-3 flex items-center gap-2 bg-muted/10 border-b border-border/40 overflow-x-auto no-scrollbar">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 rounded-full hover:bg-muted"
                                disabled={history.length === 0}
                                onClick={handleBack}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>

                            <div className="flex items-center gap-1 text-sm font-medium text-foreground/80">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 px-2 flex items-center gap-1.5 shrink-0 hover:bg-muted ${!currentPath ? 'bg-muted/50 text-foreground' : ''}`}
                                    onClick={() => handleNavigate(isWindows ? "C:\\" : "/")}
                                >
                                    <Home className="h-3.5 w-3.5" />
                                    {isWindows ? "Computer" : "Root"}
                                </Button>

                                {breadcrumbs.map((crumb, i) => (
                                    <Fragment key={i}>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`h-8 px-2 shrink-0 hover:bg-muted ${i === breadcrumbs.length - 1 ? 'font-semibold text-foreground bg-muted/30' : ''}`}
                                            onClick={() => {
                                                const path = breadcrumbs.slice(0, i + 1).join(isWindows ? "\\" : "/");
                                                handleNavigate(isWindows ? path + (path.endsWith(":") ? "\\" : "") : "/" + path);
                                            }}
                                        >
                                            {crumb}
                                        </Button>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="m-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3 text-destructive">
                            <div className="p-2 bg-destructive/10 rounded-full">
                                <X className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">Unable to access directory</p>
                                <p className="text-xs opacity-90 mt-1">{error}</p>
                                <Button variant="outline" size="sm" className="mt-3 h-8 border-destructive/20 hover:bg-destructive/10" onClick={handleRefresh}>
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {!connecting && (
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader className="bg-muted/20 sticky top-0 z-10 backdrop-blur-sm">
                                    <TableRow className="hover:bg-transparent border-b border-border/40">
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("name")}>
                                            <div className="flex items-center gap-1">
                                                Name
                                                {sortField === "name" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell cursor-pointer hover:text-foreground transition-colors w-[180px]" onClick={() => handleSort("date")}>
                                            <div className="flex items-center gap-1">
                                                Date Modified
                                                {sortField === "date" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell w-[100px] cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("type")}>
                                            Type
                                        </TableHead>
                                        <TableHead className="text-right w-[100px] cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("size")}>
                                            <div className="flex items-center justify-end gap-1">
                                                Size
                                                {sortField === "size" && (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                                            </div>
                                        </TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        Array.from({ length: 8 }).map((_, i) => (
                                            <TableRow key={i} className="border-border/40">
                                                <TableCell><Skeleton className="h-5 w-5 rounded-md" /></TableCell>
                                                <TableCell><Skeleton className="h-4 w-3/4 rounded-md" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24 rounded-md" /></TableCell>
                                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12 rounded-md" /></TableCell>
                                                <TableCell className="text-right"><Skeleton className="h-4 w-10 ml-auto rounded-md" /></TableCell>
                                                <TableCell></TableCell>
                                            </TableRow>
                                        ))
                                    ) : processedEntries.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <div className="p-4 bg-muted/30 rounded-full mb-3">
                                                        <FolderOpen className="h-8 w-8 opacity-50" />
                                                    </div>
                                                    <p className="font-medium">This folder is empty</p>
                                                    {searchQuery && <p className="text-xs mt-1">No files match your search</p>}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        processedEntries.map((entry) => (
                                            <TableRow
                                                key={entry.path}
                                                className="group cursor-pointer hover:bg-muted/40 transition-colors border-border/40"
                                                onDoubleClick={() => entry.isDirectory && handleNavigate(entry.path)}
                                            >
                                                <TableCell className="pr-0 py-2.5">
                                                    {getFileIcon(entry)}
                                                </TableCell>
                                                <TableCell className="font-medium max-w-[200px] md:max-w-md truncate py-2.5" title={entry.name}>
                                                    <button
                                                        className="hover:underline text-left w-full focus:outline-none"
                                                        onClick={() => entry.isDirectory && handleNavigate(entry.path)}
                                                    >
                                                        {entry.name}
                                                    </button>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell text-muted-foreground text-xs tabular-nums py-2.5">
                                                    {formatModTime(entry.modTime)}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell py-2.5">
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4.5 font-normal bg-muted/50 text-muted-foreground border-border/40">
                                                        {entry.isDirectory ? "Folder" : (entry.name.split('.').pop() || "File").toUpperCase()}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground text-xs tabular-nums py-2.5 font-mono">
                                                    {entry.isDirectory ? "-" : formatSize(entry.sizeBytes)}
                                                </TableCell>
                                                <TableCell className="py-2.5 pr-4">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all hover:bg-background border border-transparent hover:border-border/60 shadow-sm">
                                                                <MoreVertical className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-40">
                                                            <DropdownMenuItem disabled={entry.isDirectory} className="text-xs" onClick={() => handleDownload(entry)}>
                                                                <Download className="mr-2 h-3.5 w-3.5" /> Download
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive text-xs">
                                                                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Footer */}
                    {!connecting && !loading && (
                        <div className="px-4 py-2 bg-muted/20 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex gap-4">
                                <span>{processedEntries.filter(e => e.isDirectory).length} folders</span>
                                <span>{processedEntries.filter(e => !e.isDirectory).length} files</span>
                            </div>
                            <span className="truncate max-w-[200px] opacity-70 font-mono">{currentPath}</span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
