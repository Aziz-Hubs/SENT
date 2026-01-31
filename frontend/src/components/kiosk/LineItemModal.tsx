import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Product, ProductVariant } from "@/lib/types";
import { useState, useEffect } from "react";
import { Trash2, Save } from "lucide-react";

interface CartItem extends Product {
  qty: number;
  variant?: ProductVariant;
  note?: string;
  unitCost: number;
}

interface LineItemModalProps {
  item: CartItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: string) => void;
  onDelete: () => void;
}

export function LineItemModal({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: LineItemModalProps) {
  const [note, setNote] = useState("");

  useEffect(() => {
    if (item) {
      setNote(item.note || "");
    }
  }, [item]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[425px] bg-background border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
            Edit Line Item
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="bg-muted/30 p-4 rounded-xl border border-dashed border-muted-foreground/20">
            <h3 className="font-black text-lg">{item.name}</h3>
            <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
              <span className="font-mono">{item.sku}</span>
              <span className="font-bold text-erp">
                ${item.unitCost.toFixed(2)} x {Math.abs(item.qty)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
              Item Note / Instructions
            </label>
            <Textarea
              placeholder="e.g. No Salt, Extra Sauce"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="font-bold bg-muted/50 border-none resize-none h-24"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button
            variant="destructive"
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="font-black uppercase tracking-widest text-[10px]"
          >
            <Trash2 className="h-4 w-4 mr-2" /> Remove Item
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-bold uppercase tracking-widest text-[10px]"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                onSave(note);
                onClose();
              }}
              className="bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest text-[10px]"
            >
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
