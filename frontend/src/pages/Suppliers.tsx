import { useState, useEffect } from "react";
// @ts-ignore
import {
  CreateSupplier,
  GetSuppliers,
} from "../../wailsjs/go/stock/StockBridge";
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const res = await GetSuppliers();
      setSuppliers(res || []);
    } catch (err) {
      toast.error("Failed to load suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName) return;
    setSubmitting(true);
    try {
      await CreateSupplier(newName);
      toast.success("Supplier created");
      setOpen(false);
      setNewName("");
      loadSuppliers();
    } catch (err: any) {
      toast.error("Failed to create supplier");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="Suppliers"
        description="Manage product vendors and supply chain partners"
        icon={Truck}
        breadcrumbs={[{ label: "Stock" }, { label: "Suppliers" }]}
        primaryAction={{
          label: "Add Supplier",
          icon: Plus,
          onClick: () => setOpen(true),
        }}
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.id}</TableCell>
                <TableCell className="font-medium">{s.name}</TableCell>
              </TableRow>
            ))}
            {!loading && suppliers.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Supplier</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Supplier Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
