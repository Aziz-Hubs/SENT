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
  Search,
  File,
  Folder,
  ArrowUp,
  Download,
  RefreshCw,
  HardDrive,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

declare global {
  interface Window {
    // Extending
  }
}

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

  // Basic breadcrumb / up one level logic
  const navigateUp = () => {
    if (currentPath === "." || currentPath === "/") return;
    // Simple path manipulation for MVP w/o robust path library
    const parts = currentPath.split("/"); // Assuming linux/mac for simplicity or converting backslashes
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
      } else {
        // Mock data
        setFiles([
          {
            name: "Documents",
            size: 0,
            mode: "drwxr-xr-x",
            modTime: new Date().toISOString(),
            isDir: true,
          },
          {
            name: "Downloads",
            size: 0,
            mode: "drwxr-xr-x",
            modTime: new Date().toISOString(),
            isDir: true,
          },
          {
            name: "config.json",
            size: 1024,
            mode: "-rw-r--r--",
            modTime: new Date().toISOString(),
            isDir: false,
          },
          {
            name: "error.log",
            size: 45002,
            mode: "-rw-r--r--",
            modTime: new Date(Date.now() - 3600000).toISOString(),
            isDir: false,
          },
        ]);
      }
    } catch (err) {
      toast.error(`Failed to list directory: ${path}`);
      console.error(err);
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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "--";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
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
              className="pl-8 font-mono bg-muted/50"
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

      <div className="border rounded-md flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Size</TableHead>
              <TableHead className="text-right">Modified</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((f) => (
              <TableRow
                key={f.name}
                className={f.isDir ? "cursor-pointer hover:bg-muted/50" : ""}
                onClick={() => handleNavigate(f)}
              >
                <TableCell>
                  {f.isDir ? (
                    <Folder className="h-4 w-4 text-sky-500" />
                  ) : (
                    <File className="h-4 w-4 text-slate-500" />
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-emerald-500"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
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
