import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product, ProductVariant } from "@/lib/types";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ModifierModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (product: Product, variant: ProductVariant | null) => void;
}

export function ModifierModal({
  product,
  isOpen,
  onClose,
  onConfirm,
}: ModifierModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(null);
    }
  }, [isOpen]);

  if (!product) return null;

  const handleConfirm = () => {
    if (product.hasVariants && !selectedVariant) return;
    onConfirm(product, selectedVariant);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-background border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
            Select Options
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-1">
              <h3 className="text-lg font-black">{product.name}</h3>
              <p className="text-sm text-muted-foreground font-mono">
                {product.sku}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-black text-erp">
                ${product.unitCost.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Available Variants
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {product.variants?.map((v) => (
                <div
                  key={v.id}
                  className={`
                    cursor-pointer rounded-xl border-2 p-4 transition-all
                    ${
                      selectedVariant?.id === v.id
                        ? "border-erp bg-erp/5"
                        : "border-muted hover:border-muted-foreground/50"
                    }
                    ${v.stock <= 0 ? "opacity-50 pointer-events-none grayscale" : ""}
                  `}
                  onClick={() => v.stock > 0 && setSelectedVariant(v)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{v.name}</span>
                    {v.priceAdjustment !== 0 && (
                      <Badge variant="secondary" className="text-[10px]">
                        {v.priceAdjustment > 0 ? "+" : ""} $
                        {v.priceAdjustment.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span className="font-mono">{v.sku}</span>
                    <span>{v.stock} left</span>
                  </div>
                </div>
              ))}
              {(!product.variants || product.variants.length === 0) && (
                <div className="col-span-2 text-center py-8 text-muted-foreground opacity-50 italic">
                  No variants defined for this product.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-bold uppercase tracking-widest text-[10px]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={product.hasVariants && !selectedVariant}
            className="bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest"
          >
            Add to Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
