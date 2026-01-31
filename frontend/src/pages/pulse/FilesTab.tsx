import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  File,
  Folder,
  ArrowUp,
  Download,
  RefreshCw,
  HardDrive,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface FileInfo {
  name: string;
  size: number;
  mode: string;
  modTime: string;
  isDir: boolean;
}

interface FilesTabProps {
  deviceId: string;
}

const FilesTab: React.FC<FilesTabProps> = ({ deviceId }) => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [currentPath, setCurrentPath] = useState(".");
  const [loading, setLoading] = useState(false);

  const navigateUp = () => {
    if (currentPath === "." || currentPath === "/") return;
    const parts = currentPath.split("/");
    parts.pop();
    const newPath = parts.join("/") || "/";
    setCurrentPath(newPath);
  };

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.ListFiles(deviceId, path);
        setFiles(res || []);
      }
    } catch (err) {
      toast.error(`Failed to list directory: ${path}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [deviceId, currentPath]);

  const handleNavigate = (file: FileInfo) => {
    if (file.isDir) {
      const separator = currentPath.endsWith("/") ? "" : "/";
      const newPath =
        currentPath === "."
          ? file.name
          : `${currentPath}${separator}${file.name}`;
      setCurrentPath(newPath);
    }
  };

  const handleDelete = async (file: FileInfo) => {
    if (!window.confirm(`Are you sure you want to delete ${file.name}?`))
      return;
    try {
      const path =
        currentPath === "." ? file.name : `${currentPath}/${file.name}`;
      await (window as any).go.bridge.PulseBridge.DeleteFile(deviceId, path);
      toast.success("File deleted");
      fetchFiles(currentPath);
    } catch (e) {
      toast.error("Failed to delete file");
    }
  };

  const handleDownload = async (file: FileInfo) => {
    try {
      const path =
        currentPath === "." ? file.name : `${currentPath}/${file.name}`;
      const bytes = await (window as any).go.bridge.PulseBridge.DownloadFile(
        deviceId,
        path,
      );
      const blob = new Blob([new Uint8Array(bytes)]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error("Failed to download file");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "--";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4 h-full flex flex-col fade-in">
      <div className="flex justify-between items-center gap-2">
        <div className="flex gap-2 flex-1 items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={navigateUp}
            disabled={currentPath === "." || currentPath === "/"}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <HardDrive className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={currentPath}
              readOnly
              className="pl-8 font-mono bg-zinc-900/50 border-zinc-800"
            />
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => fetchFiles(currentPath)}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <div className="border border-zinc-800 rounded-md flex-1 overflow-auto bg-zinc-900/30">
        <Table>
          <TableHeader className="bg-zinc-900/50">
            <TableRow className="border-zinc-800">
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Modified</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((f) => (
              <TableRow
                key={f.name}
                className={`border-zinc-800 ${
                  f.isDir
                    ? "cursor-pointer hover:bg-zinc-900/50"
                    : "hover:bg-zinc-900/20"
                }`}
                onClick={() => handleNavigate(f)}
              >
                <TableCell>
                  {f.isDir ? (
                    <Folder className="h-4 w-4 text-blue-400" />
                  ) : (
                    <File className="h-4 w-4 text-zinc-500" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{f.name}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {formatSize(f.size)}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(f.modTime), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell>
                  {!f.isDir && (
                    <div className="flex gap-1 justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-emerald-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(f);
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-rose-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(f);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FilesTab;
