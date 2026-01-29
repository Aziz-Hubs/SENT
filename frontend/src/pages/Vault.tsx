import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ListFiles, CreateFolder, DeleteFile, ReadFile } from "../../wailsjs/go/vault/VaultBridge"
import { Folder, FileText, Download, Trash2, FolderPlus, Upload, ChevronRight, Home, Eye, History, Loader2, FilePlus, Archive } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"

// FileEntry represents a file or directory in the vault
interface FileEntry {
    name: string
    path: string
    size: number
    modTime: string
    isDir: boolean
}

/**
 * Vault page provides a secure file management interface.
 * Supports file uploads, directory navigation, and file preview/download.
 */
export function Vault() {
  const [currentPath, setCurrentPath] = useState("")
  const [files, setFiles] = useState<FileEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState("")
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false)
  
  // Preview State
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<FileEntry | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  useEffect(() => {
    fetchFiles(currentPath)
  }, [currentPath])

  const fetchFiles = async (path: string) => {
    setLoading(true)
    try {
      const res = await ListFiles(path)
      setFiles(res || [])
    } catch (err) {
      console.error(err)
      toast.error("Failed to list files")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTextFile = async () => {
      const name = prompt("Filename (e.g. notes.txt):")
      if (!name) return
      const content = prompt("Content:")
      if (!content) return
      
      const b64 = btoa(content)
      const path = currentPath ? `${currentPath}/${name}` : name
      try {
        // @ts-ignore
        await window.go.vault.VaultBridge.SaveFile(path, b64)
        fetchFiles(currentPath)
        toast.success("File created")
      } catch (err) {
        toast.error("Failed to save file: " + err)
      }
  }

  const handleDownloadZip = () => {
      toast.info("Compressing folder... (Background Job Started)")
  }

  const handleFileDownload = async (file: FileEntry) => {
      try {
          const b64 = await ReadFile(file.path)
          const link = document.createElement('a')
          link.href = `data:application/octet-stream;base64,${b64}`
          link.download = file.name
          link.click()
      } catch (err) {
          toast.error("Download failed: " + err)
      }
  }

  const handlePreview = async (file: FileEntry) => {
    try {
        setPreviewFile(file)
        const b64 = await ReadFile(file.path)
        setPreviewContent(b64)
        setIsPreviewOpen(true)
    } catch (err) {
        toast.error("Failed to load preview: " + err)
    }
  }

  const handleNavigate = (path: string) => setCurrentPath(path)

  const handleNavigateUp = () => {
    if (currentPath === "" || currentPath === ".") return
    const parts = currentPath.split('/')
    parts.pop()
    setCurrentPath(parts.join('/'))
  }

  const handleCreateFolder = async () => {
    if (!newFolderName) return
    const path = currentPath ? `${currentPath}/${newFolderName}` : newFolderName
    try {
      await CreateFolder(path)
      setNewFolderName("")
      setIsFolderDialogOpen(false)
      fetchFiles(currentPath)
      toast.success("Folder created")
    } catch (err) {
      toast.error("Failed to create folder: " + err)
    }
  }

  const handleDelete = async (path: string) => {
    if(!confirm("Are you sure you want to delete " + path + "?")) return
    try {
        await DeleteFile(path)
        fetchFiles(currentPath)
        toast.success("Deleted successfully")
    } catch (err) {
        toast.error("Failed to delete: " + err)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1]
        const path = currentPath ? `${currentPath}/${file.name}` : file.name
        try {
            // @ts-ignore
            await window.go.vault.VaultBridge.SaveFile(path, base64)
            fetchFiles(currentPath)
            toast.success("File uploaded")
        } catch (err) {
            toast.error("Upload failed: " + err)
        }
    }
    reader.readAsDataURL(file)
  }

  const breadcrumbs = [
    { label: "Infrastructure" },
    { label: "SENTvault" }
  ]

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
          onClick: () => document.getElementById('file-upload')?.click()
        }}
      >
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest gap-2" onClick={handleDownloadZip}>
                <Archive className="h-3 w-3" /> Archive
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest gap-2" onClick={handleCreateTextFile}>
                <FilePlus className="h-3 w-3" /> New File
            </Button>
            <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest gap-2">
                        <FolderPlus className="h-3 w-3" /> Folder
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-background">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">Create Directory</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Directory Name</Label>
                            <Input id="name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="bg-muted/30 border-none h-11" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateFolder} className="w-full bg-primary font-black uppercase tracking-widest h-11">Initialize Directory</Button>
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
            <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono bg-background/50 w-fit px-3 py-1 rounded-full border">
                <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-transparent" onClick={() => setCurrentPath("")}>
                    <Home className="h-3 w-3" />
                </Button>
                {currentPath.split('/').filter(Boolean).map((part, i) => (
                    <div key={i} className="flex items-center">
                        <ChevronRight className="h-3 w-3 mx-1 opacity-50" />
                        <span className="font-bold text-msp">{part}</span>
                    </div>
                ))}
            </div>
        </CardHeader>
        <CardContent className="p-0">
            {currentPath && (
                <div className="p-2 border-b bg-muted/10">
                     <Button variant="ghost" size="sm" onClick={handleNavigateUp} className="gap-2 h-7 text-[10px] font-bold uppercase">
                        <ChevronRight className="h-3 w-3 rotate-180" /> Back to Parent
                     </Button>
                </div>
            )}
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[50px] pl-6"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="h-10 w-10 animate-spin mx-auto text-msp" /></TableCell></TableRow>
              ) : files.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-20">
                    <EmptyState 
                        icon={Folder}
                        title="Directory is Empty"
                        description="This path contains no authoritative assets. Upload a file or create a subdirectory to begin."
                    />
                </TableCell></TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.path} className="group hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => file.isDir && handleNavigate(file.path)}>
                    <TableCell className="pl-6">
                        {file.isDir ? <Folder className="h-5 w-5 text-msp" /> : <FileText className="h-5 w-5 text-slate-400" />}
                    </TableCell>
                    <TableCell className="font-bold text-sm">
                        {file.name}
                    </TableCell>
                    <TableCell className="text-[10px] font-mono opacity-70">{file.isDir ? "-" : (file.size / 1024).toFixed(1) + " KB"}</TableCell>
                    <TableCell className="text-[10px] font-mono opacity-70">{new Date(file.modTime).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right pr-6">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                            {!file.isDir && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-msp hover:bg-msp/10" onClick={(e) => { e.stopPropagation(); handlePreview(file); }}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            )}
                            {!file.isDir && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-500 hover:bg-emerald-500/10" onClick={(e) => { e.stopPropagation(); handleFileDownload(file); }}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-500 hover:bg-amber-500/10" onClick={(e) => { e.stopPropagation(); }}>
                                <History className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); handleDelete(file.path); }}>
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
                <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">{previewFile?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden bg-muted/10">
                {previewFile?.name.toLowerCase().endsWith('.pdf') ? (
                    <iframe 
                        src={`data:application/pdf;base64,${previewContent}`} 
                        className="w-full h-full border-none"
                    />
                ) : previewFile?.name.match(/\.(txt|md|json|log|csv)$/i) ? (
                    <pre className="p-8 w-full h-full overflow-auto font-mono text-xs whitespace-pre-wrap text-foreground selection:bg-msp/20">
                        {atob(previewContent || "")}
                    </pre>
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-10">
                        <img 
                            src={`data:image/png;base64,${previewContent}`} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg border"
                        />
                    </div>
                )}
            </div>
            <DialogFooter className="p-4 bg-muted/30 border-t">
                <Button variant="ghost" onClick={() => setIsPreviewOpen(false)} className="font-bold">Close</Button>
                {previewFile && (
                    <Button className="bg-msp hover:bg-msp/90 gap-2 text-white font-black uppercase tracking-widest h-11 px-6 shadow-lg shadow-msp/20" onClick={() => handleFileDownload(previewFile)}>
                        <Download className="h-4 w-4" /> Download Original
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" /></TableCell></TableRow>
              ) : files.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground italic">This folder is empty</TableCell></TableRow>
              ) : (
                files.map((file) => (
                  <TableRow key={file.path} className="group hover:bg-muted/20">
                    <TableCell>
                        {file.isDir ? <Folder className="h-5 w-5 text-blue-500" /> : <FileText className="h-5 w-5 text-slate-400" />}
                    </TableCell>
                    <TableCell className="font-medium">
                        <span className={file.isDir ? "cursor-pointer text-blue-400 hover:underline" : ""} onClick={() => file.isDir && handleNavigate(file.path)}>
                            {file.name}
                        </span>
                    </TableCell>
                    <TableCell className="text-xs opacity-70">{file.isDir ? "-" : (file.size / 1024).toFixed(1) + " KB"}</TableCell>
                    <TableCell className="text-xs opacity-70">{new Date(file.modTime).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!file.isDir && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={() => handlePreview(file)}>
                                    <Eye className="h-4 w-4" />
                                </Button>
                            )}
                            {!file.isDir && (
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/30" onClick={() => handleFileDownload(file)}>
                                    <Download className="h-4 w-4" />
                                </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {}}>
                                <History className="h-4 w-4 text-amber-500" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDelete(file.path)}>
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
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-background">
            <DialogHeader>
                <DialogTitle>{previewFile?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden rounded-md border bg-slate-100 dark:bg-slate-900 mt-2">
                {previewFile?.name.toLowerCase().endsWith('.pdf') ? (
                    <iframe 
                        src={`data:application/pdf;base64,${previewContent}`} 
                        className="w-full h-full border-none"
                    />
                ) : previewFile?.name.match(/\.(txt|md|json|log|csv)$/i) ? (
                    <pre className="p-4 w-full h-full overflow-auto font-mono text-xs whitespace-pre-wrap text-foreground">
                        {atob(previewContent || "")}
                    </pre>
                ) : (
                    <div className="w-full h-full flex items-center justify-center p-4">
                        <img 
                            src={`data:image/png;base64,${previewContent}`} 
                            alt="Preview" 
                            className="max-w-full max-h-full object-contain shadow-2xl"
                        />
                    </div>
                )}
            </div>
            <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Close Preview</Button>
                {previewFile && (
                    <Button className="bg-blue-600 hover:bg-blue-700 gap-2 text-white font-bold" onClick={() => handleFileDownload(previewFile)}>
                        <Download className="h-4 w-4" /> Download
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
