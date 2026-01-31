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
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  FileCode,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    // Extending
  }
}

interface Script {
  id: number;
  name: string;
  description: string;
  content: string;
  type: "ps1" | "sh";
}

const ScriptRepository: React.FC = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingScript, setEditingScript] = useState<Script | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    content: "",
    type: "ps1" as "ps1" | "sh",
  });

  const fetchScripts = async () => {
    setLoading(true);
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        const res = await w.go.bridge.PulseBridge.ListScripts();
        setScripts(res || []);
      } else {
        // Mock data
        setScripts([
          {
            id: 1,
            name: "Get-SystemInfo",
            description: "Collects system info",
            content: "Get-ComputerInfo",
            type: "ps1",
          },
          {
            id: 2,
            name: "Cleanup-Temp",
            description: "Cleans temp folder",
            content: "Remove-Item $env:TEMP\\* -Recurse -Force",
            type: "ps1",
          },
        ]);
      }
    } catch (err) {
      toast.error("Failed to fetch scripts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const handleSave = async () => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        if (editingScript) {
          // Update (Only content for now based on API, but full update is easy to add)
          await w.go.bridge.PulseBridge.UpdateScript(
            editingScript.id,
            formData.content,
          );
          toast.success("Script updated");
        } else {
          // Create
          await w.go.bridge.PulseBridge.CreateScript(
            formData.name,
            formData.description,
            formData.content,
            formData.type,
          );
          toast.success("Script created");
        }
        fetchScripts();
        setIsModalOpen(false);
        resetForm();
      } else {
        toast.success("Mock: Script saved");
        resetForm();
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error("Failed to save script");
      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const w = window as any;
      if (w.go && w.go.bridge && w.go.bridge.PulseBridge) {
        await w.go.bridge.PulseBridge.DeleteScript(id);
        toast.success("Script deleted");
        fetchScripts();
      } else {
        toast.success("Mock: Script deleted");
        // Update local state for immediate feedback in mock mode
        setScripts((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      toast.error("Failed to delete script");
    }
  };

  const openEdit = (script: Script) => {
    setEditingScript(script);
    setFormData({
      name: script.name,
      description: script.description,
      content: script.content,
      type: script.type,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingScript(null);
    setFormData({
      name: "",
      description: "",
      content: "",
      type: "ps1",
    });
  };

  const filteredScripts = scripts.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-6 space-y-6 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Script Repository
          </h1>
          <p className="text-muted-foreground">
            Manage automation scripts for your fleet.
          </p>
        </div>

        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            setIsModalOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Script
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>
                {editingScript ? "Edit Script" : "Create New Script"}
              </DialogTitle>
              <DialogDescription>
                {editingScript
                  ? "Update existing script content."
                  : "Add a new script to the repository."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!!editingScript} // MVP: Don't allow renaming yet
                    placeholder="e.g. Daily-Cleanup"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v: "ps1" | "sh") =>
                      setFormData({ ...formData, type: v })
                    }
                    disabled={!!editingScript}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ps1">PowerShell (.ps1)</SelectItem>
                      <SelectItem value="sh">Shell / Bash (.sh)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  disabled={!!editingScript}
                  placeholder="What does this script do?"
                />
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  className="font-mono h-[300px]"
                  placeholder="# Script code goes here..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Script</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scripts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredScripts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No scripts found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              filteredScripts.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <FileCode className="h-4 w-4 text-blue-500" />
                  </TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      .{s.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.description}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-rose-500 hover:text-rose-600"
                        onClick={() => handleDelete(s.id)}
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
      </div>
    </div>
  );
};

export default ScriptRepository;
