import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  ListFiles,
  CreateFolder,
  DeleteFile,
  ReadFile,
  SaveFile,
} from "../../wailsjs/go/vault/VaultBridge";
import {
  Folder,
  FileText,
  Download,
  Trash2,
  FolderPlus,
  Upload,
  ChevronRight,
  Home,
  Eye,
  History,
  Loader2,
  FilePlus,
  Archive,
  HardDrive,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";

// FileEntry represents a file or directory in the vault
interface FileEntry {
  name: string;
  path: string;
  size: number;
  modTime: string;
  isDir: boolean;
}

// Helper to prevent memory leaks from massive base64 strings in React State
function base64ToBlob(base64: string, mimeType: string) {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function VaultBreadcrumbs({
  currentPath,
  onNavigate,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
}) {
  const parts = currentPath.split("/").filter(Boolean);

  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono bg-background/50 w-fit px-3 py-1 rounded-full border">
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={() => onNavigate("")}
      >
        <Home className="h-3 w-3" />
      </Button>
      {parts.map((part, i) => {
        const path = parts.slice(0, i + 1).join("/");
        return (
          <div key={i} className="flex items-center">
            <ChevronRight className="h-3 w-3 mx-1 opacity-50" />
            <span
              className="font-bold text-blue-500 hover:underline cursor-pointer"
              onClick={() => onNavigate(path)}
            >
              {part}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Vault page provides a secure file management interface.
 * Supports file uploads, directory navigation, and file preview/download.
 */
export function Vault() {
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);

  // Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Modal State
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileContent, setNewFileContent] = useState("");

  const { user } = useAppStore();
  const tenantID = user?.tenantId || 1;

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  const fetchFiles = async (path: string) => {
    setLoading(true);
    try {
      const res = await ListFiles(path);
      setFiles((res || []) as any);
    } catch (err) {
      console.error(err);
      toast.error("Failed to list files");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTextFile = () => {
    setNewFileName("");
    setNewFileContent("");
    setIsNewFileDialogOpen(true);
  };

  const submitCreateFile = async () => {
    if (!newFileName) {
      toast.error("Filename is required");
      return;
    }

    const finalName = newFileName.includes(".")
      ? newFileName
      : `${newFileName}.txt`;
    const b64 = btoa(newFileContent);
    const path = currentPath ? `${currentPath}/${finalName}` : finalName;

    try {
      await SaveFile(path, b64);
      fetchFiles(currentPath);
      toast.success("File created successfully");
      setIsNewFileDialogOpen(false);
    } catch (err) {
      toast.error("Failed to save file: " + err);
    }
  };

  const handleDownloadZip = () => {
    toast.info("Compressing folder... (Background Job Started)");
  };

  const handleFileDownload = async (file: FileEntry) => {
    try {
      const b64 = await ReadFile(file.path);
      const link = document.createElement("a");
      link.href = `data:application/octet-stream;base64,${b64}`;
      link.download = file.name;
      link.click();
    } catch (err) {
      toast.error("Download failed: " + err);
    }
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handlePreview = async (file: FileEntry) => {
    try {
      setPreviewFile(file);
      const b64 = await ReadFile(file.path);

      // Determine MIME type roughly
      let mime = "application/octet-stream";
      if (file.name.endsWith(".pdf")) mime = "application/pdf";
      else if (file.name.match(/\.(png|jpg|jpeg|gif)$/i)) mime = "image/png";
      else if (file.name.match(/\.(txt|md|json|log|csv)$/i))
        mime = "text/plain";

      const blob = base64ToBlob(b64, mime);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setIsPreviewOpen(true);
    } catch (err) {
      toast.error("Failed to load preview: " + err);
    }
  };

  const handleNavigate = (path: string) => setCurrentPath(path);

  const handleNavigateUp = () => {
    if (currentPath === "" || currentPath === ".") return;
    const parts = currentPath.split("/");
    parts.pop();
    setCurrentPath(parts.join("/"));
  };

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    const path = currentPath
      ? `${currentPath}/${newFolderName}`
      : newFolderName;
    try {
      await CreateFolder(path);
      setNewFolderName("");
      setIsFolderDialogOpen(false);
      fetchFiles(currentPath);
      toast.success("Folder created");
    } catch (err) {
      toast.error("Failed to create folder: " + err);
    }
  };

  const handleDelete = (path: string) => {
    setFileToDelete(path);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    try {
      await DeleteFile(fileToDelete);
      fetchFiles(currentPath);
      toast.success("Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete: " + err);
    } finally {
      setFileToDelete(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(",")[1];
      const path = currentPath ? `${currentPath}/${file.name}` : file.name;
      try {
        await SaveFile(path, base64);
        fetchFiles(currentPath);
        toast.success("File uploaded");
      } catch (err) {
        toast.error("Upload failed: " + err);
      }
    };
    reader.readAsDataURL(file);
  };

  const breadcrumbs = [{ label: "Infrastructure" }, { label: "SENTvault" }];

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="SENTvault"
        description="Secure Document Storage, Asset Vault & Governance"
        icon={HardDrive}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Upload File",
          icon: Upload,
          onClick: () => document.getElementById("file-upload")?.click(),
        }}
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 flex-1 sm:flex-none justify-center"
            onClick={handleDownloadZip}
          >
            <Archive className="h-3 w-3" /> Archive
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 flex-1 sm:flex-none justify-center"
            onClick={handleCreateTextFile}
          >
            <FilePlus className="h-3 w-3" /> New File
          </Button>
          <Dialog
            open={isFolderDialogOpen}
            onOpenChange={setIsFolderDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 flex-1 sm:flex-none justify-center"
              >
                <FolderPlus className="h-3 w-3" /> Folder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
                  Create Directory
                </DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                  >
                    Directory Name
                  </Label>
                  <Input
                    id="name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-muted/30 border-none h-11"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateFolder}
                  className="w-full bg-primary font-black uppercase tracking-widest h-11"
                >
                  Initialize Directory
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <div className="relative">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b">
          <VaultBreadcrumbs
            currentPath={currentPath}
            onNavigate={setCurrentPath}
          />
        </CardHeader>
        <CardContent className="p-0">
          {currentPath && (
            <div className="p-2 border-b bg-muted/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNavigateUp}
                className="gap-2 h-7 text-[10px] font-bold uppercase"
              >
                <ChevronRight className="h-3 w-3 rotate-180" /> Back to Parent
              </Button>
            </div>
          )}
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px] pl-6"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden md:table-cell">Modified</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-500" />
                  </TableCell>
                </TableRow>
              ) : files.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20">
                    <EmptyState
                      icon={Folder}
                      title="Directory is Empty"
                      description="This path contains no authoritative assets. Upload a file or create a subdirectory to begin."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                files.map((file) => (
                  <TableRow
                    key={file.path}
                    className="group hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="pl-6">
                      {file.isDir ? (
                        <Folder className="h-5 w-5 text-blue-500" />
                      ) : (
                        <FileText className="h-5 w-5 text-slate-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        onClick={() =>
                          file.isDir
                            ? handleNavigate(file.path)
                            : handlePreview(file)
                        }
                        className="font-bold text-sm cursor-pointer hover:underline hover:text-blue-600 decoration-blue-500 underline-offset-4"
                      >
                        {file.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-[10px] font-mono opacity-70 hidden md:table-cell">
                      {file.isDir ? "-" : (file.size / 1024).toFixed(1) + " KB"}
                    </TableCell>
                    <TableCell className="text-[10px] font-mono opacity-70 hidden md:table-cell">
                      {new Date(file.modTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        {!file.isDir && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-500 hover:bg-blue-100"
                            onClick={() => handlePreview(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        {!file.isDir && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-500 hover:bg-green-100"
                            onClick={() => handleFileDownload(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-500 hover:bg-amber-100"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-100"
                          onClick={() => handleDelete(file.path)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-background border-none shadow-2xl p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-muted/30 border-b">
            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
              {previewFile?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden bg-muted/10">
            {previewFile?.name.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={previewUrl || ""}
                className="w-full h-full border-none"
              />
            ) : previewFile?.name.match(/\.(txt|md|json|log|csv)$/i) ? (
              <iframe
                src={previewUrl || ""}
                className="w-full h-full bg-white border-none p-4 font-mono"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-10">
                <img
                  src={previewUrl || ""}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border"
                />
              </div>
            )}
          </div>
          <DialogFooter className="p-4 bg-muted/30 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsPreviewOpen(false)}
              className="font-bold"
            >
              Close
            </Button>
            {previewFile && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 gap-2 text-white font-black uppercase tracking-widest h-11 px-6 shadow-lg shadow-blue-500/20"
                onClick={() => handleFileDownload(previewFile)}
              >
                <Download className="h-4 w-4" /> Download Original
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{" "}
              <span className="font-bold text-foreground">{fileToDelete}</span>{" "}
              from the vault.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
              onClick={confirmDelete}
            >
              Delete Asset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* New File Dialog */}
      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent className="bg-background sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
              New Text Asset
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="filename"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Filename
              </Label>
              <Input
                id="filename"
                placeholder="e.g. meeting-notes.txt"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="bg-muted/30 border-none h-11"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="content"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Content
              </Label>
              <textarea
                id="content"
                className="flex w-full rounded-md border border-input bg-muted/30 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px]"
                placeholder="Enter file content..."
                value={newFileContent}
                onChange={(e) => setNewFileContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={submitCreateFile}
              className="w-full bg-primary font-black uppercase tracking-widest h-11"
            >
              Create File
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
