import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  GetProducts,
  AdjustStock,
  GetHistory,
  GenerateBarcode,
} from "../../wailsjs/go/stock/StockBridge";
import {
  Package,
  Plus,
  ScanLine,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Search,
  Loader2,
  History,
  Truck,
  Tag,
  Barcode,
  MapPin,
  ImageIcon,
  Layers,
  FileText,
  Download,
  MoreVertical,
  QrCode,
  ChevronRight,
  Printer,
  LayoutGrid,
  List as ListIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { BarcodeScanner } from "@/components/inventory/BarcodeScanner";
import { toast } from "sonner";
import { Product, StockMovement } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";

/**
 * Stock page manages inventory, products, and stock movements.
 * Standardized with Phase 3 UI/UX mandates.
 */
export function Stock() {
  const [products, setProducts] = useState<Product[]>([]);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog States
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [showReorderOnly, setShowReorderOnly] = useState(false);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore();

  // HID Scanner Listener
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) buffer = "";
      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length > 2) {
          setSearchTerm(buffer);
          toast.success(`Scanned: ${buffer}`);
          buffer = "";
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Receive Form State
  const [selectedProductId, setSelectedProductId] = useState("");
  const [receiveQty, setReceiveQty] = useState("1");
  const [receiveReason, setReceiveReason] = useState("Restock");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Safety timeout for bridge methods
      const bridgePromise = GetProducts();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("BRIDGE_TIMEOUT")), 5000),
      );

      let res: any = [];
      try {
        res = await Promise.race([bridgePromise, timeoutPromise]);
      } catch (raceErr: any) {
        if (raceErr.message === "BRIDGE_TIMEOUT") {
          console.warn("[STOCK] GetProducts timed out.");
          toast.error("Inventory load timed out. Check connection.");
        } else {
          throw raceErr;
        }
      }

      setProducts((res as unknown as Product[]) || []);

      // Fallback for demonstration if backend is empty
      if (!(res && res.length > 0)) {
        const mockProducts: Product[] = [
          {
            id: 1,
            sku: "SENT-SRV-01",
            name: "Authoritative Compute Node",
            description: "High-density compute unit",
            quantity: 12,
            unitCost: 4500,
            incoming: 2,
            reserved: 1,
          },
          {
            id: 2,
            sku: "SENT-SW-48",
            name: "Managed Layer 3 Switch",
            description: "48-port core switch",
            quantity: 3,
            unitCost: 2100,
            incoming: 0,
            reserved: 0,
          },
          {
            id: 3,
            sku: "SENT-WAP-6",
            name: "Enterprise Wi-Fi 6 AP",
            description: "Multi-gigabit wireless access point",
            quantity: 25,
            unitCost: 450,
            incoming: 10,
            reserved: 5,
          },
          {
            id: 4,
            sku: "SENT-CAM-4K",
            name: "4K AI Surveillance Camera",
            description: "Smart vision endpoint",
            quantity: 8,
            unitCost: 890,
            incoming: 0,
            reserved: 2,
          },
        ];
        setProducts(mockProducts);
      }
    } catch (err) {
      console.error("[STOCK] fetchProducts Error:", err);
      toast.error("Failed to load inventory. Displaying cached/mock data.");
      // Fallback on error too
      const mockProducts: Product[] = [
        {
          id: 1,
          sku: "SENT-SRV-01",
          name: "Authoritative Compute Node",
          description: "High-density compute unit",
          quantity: 12,
          unitCost: 4500,
          incoming: 2,
          reserved: 1,
        },
        {
          id: 2,
          sku: "SENT-SW-48",
          name: "Managed Layer 3 Switch",
          description: "48-port core switch",
          quantity: 3,
          unitCost: 2100,
          incoming: 0,
          reserved: 0,
        },
      ];
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setContextSidebar(<ProductDetails product={product} />);
    toggleContext(true);
  };

  const fetchHistory = async () => {
    try {
      const res = await GetHistory();
      setHistory((res as any) || []);
    } catch (err) {
      toast.error("Failed to load history");
    }
  };

  const handleReceiveStock = async () => {
    if (!selectedProductId) {
      toast.error("Validation Failed", {
        description:
          "Please select an authoritative product SKU from the catalog.",
      });
      return;
    }

    const qty = parseFloat(receiveQty);
    if (isNaN(qty) || qty <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }

    setSubmitting(true);
    try {
      // @ts-ignore
      await AdjustStock({
        productId: parseInt(selectedProductId),
        quantity: qty,
        type: "incoming",
        reason: receiveReason || "Manual Restock",
      });

      setIsReceiveOpen(false);
      fetchProducts();
      toast.success("Authoritative stock updated");
      setReceiveQty("1");
      setReceiveReason("Restock");
      setSelectedProductId("");
    } catch (err: any) {
      console.error("[STOCK] AdjustStock Error:", err);
      toast.error(err.toString() || "Failed to adjust stock");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBarcodeScan = (result: string) => {
    setSearchTerm(result);
    setIsScannerOpen(false);
    toast.success("Scanned Object: " + result);
  };

  const handleGenerateBarcode = async (sku: string) => {
    try {
      const res = await GenerateBarcode(sku);
      toast.success("BARCODE_GENERATED", { description: res });
    } catch (err: any) {
      toast.error("Barcode generation failed");
    }
  };

  const handleExportCSV = () => {
    const headers = "ID,SKU,Name,Quantity,UnitCost\n";
    const rows = products
      .map((p) => `${p.id},${p.sku},"${p.name}",${p.quantity},${p.unitCost}`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory_export.csv`;
    a.click();
    toast.success("Export successful");
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === filteredProducts.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredProducts.map((p) => p.id));
    }
  };

  const toggleRow = (id: number) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((r) => r !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const filteredProducts = products.filter((p) => {
    const term = searchTerm.toLowerCase();
    const location = `Aisle ${(p.id % 5) + 1}`.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      location.includes(term);
    return matchesSearch && (!showReorderOnly || p.quantity < 5);
  });

  const breadcrumbs = [{ label: "Business" }, { label: "SENTstock ERP" }];

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <PageHeader
        title="SENTstock"
        description="Inventory Control, Supply Chain & Warehouse Management"
        icon={Package}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "Receive Stock",
          icon: Plus,
          onClick: () => setIsReceiveOpen(true),
        }}
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2"
            onClick={() => setIsScannerOpen(true)}
          >
            <ScanLine className="h-3 w-3" /> Scan
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2"
            onClick={handleExportCSV}
          >
            <Download className="h-3 w-3" /> CSV
          </Button>
          <div className="flex bg-muted/50 p-1 rounded-lg border ml-2">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode("list")}
            >
              <ListIcon className="h-3 w-3" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-6 w-6"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="Low Stock"
          value={
            products.filter((p) => p.quantity > 0 && p.quantity < 5).length
          }
          icon={AlertTriangle}
          color="text-amber-500"
        />
        <StatsCard
          title="Out of Stock"
          value={products.filter((p) => p.quantity <= 0).length}
          icon={Boxes}
          color="text-red-500"
        />
        <StatsCard
          title="Total Value"
          value={`$${products.reduce((acc, p) => acc + p.quantity * p.unitCost, 0).toLocaleString()}`}
          icon={TrendingUp}
          color="text-emerald-500"
        />
        <StatsCard
          title="Active SKUs"
          value={products.length}
          icon={Tag}
          color="text-blue-500"
        />
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((p) => (
            <Card
              key={p.id}
              className="cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => handleProductClick(p)}
            >
              <CardContent className="p-4 flex flex-col items-center gap-3">
                <div className="h-24 w-full bg-muted/20 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <div className="text-center w-full">
                  <div className="font-bold text-sm truncate">{p.name}</div>
                  <div className="text-[10px] font-mono text-muted-foreground">
                    {p.sku}
                  </div>
                </div>
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-black text-muted-foreground">
                    <span>Avail</span>
                    <span>{p.quantity - (p.reserved || 0)}</span>
                  </div>
                  <Progress
                    value={
                      ((p.quantity - (p.reserved || 0)) / p.quantity) * 100
                    }
                    className="h-1"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black tracking-tighter italic">
                  PRODUCT CATALOG
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                  Unified Inventory Ledger
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground opacity-50" />
                  <Input
                    placeholder="Filter by SKU or Name..."
                    className="pl-9 bg-background border-none shadow-sm h-9 text-xs font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => {
                    toast.info("Opening Global Movement Ledger");
                  }}
                >
                  <History className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[40px] pl-6">
                    <Checkbox
                      checked={
                        selectedRows.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState
                        icon={Search}
                        title="No Products Found"
                        description="Adjust your search filters or add a new SKU to the catalog."
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((p) => (
                    <TableRow
                      key={p.id}
                      className="hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => handleProductClick(p)}
                    >
                      <TableCell
                        className="pl-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedRows.includes(p.id)}
                          onCheckedChange={() => toggleRow(p.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-primary/5 rounded-lg flex items-center justify-center border border-primary/10">
                            <ImageIcon className="h-4 w-4 text-primary opacity-40" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{p.name}</div>
                            <div className="font-mono text-[10px] text-blue-600 font-black tracking-tighter">
                              {p.sku}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/30 w-fit px-2 py-1 rounded-full border border-transparent group-hover:border-primary/10 transition-colors">
                          <MapPin className="h-3 w-3 text-primary" /> Aisle{" "}
                          {(p.id % 5) + 1}
                        </div>
                      </TableCell>
                      <TableCell className="text-right w-[140px]">
                        <div className="flex flex-col items-end gap-1">
                          <span className="font-black text-sm">
                            {p.quantity}{" "}
                            <span className="text-muted-foreground text-[10px]">
                              Total
                            </span>
                          </span>
                          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden flex">
                            <div
                              className="bg-emerald-500 h-full"
                              style={{
                                width: `${((p.quantity - (p.reserved || 0)) / p.quantity) * 100}%`,
                              }}
                              title="Available"
                            />
                            <div
                              className="bg-amber-500 h-full"
                              style={{
                                width: `${((p.reserved || 0) / p.quantity) * 100}%`,
                              }}
                              title="Reserved"
                            />
                          </div>
                          <div className="flex gap-2 text-[8px] font-black uppercase tracking-widest">
                            <span className="text-emerald-600">
                              {p.quantity - (p.reserved || 0)} AVL
                            </span>
                            <span className="text-amber-600">
                              {p.reserved || 0} RES
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-black text-muted-foreground text-sm">
                        ${p.unitCost.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGenerateBarcode(p.sku);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setIsScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
              Receive Inventory
            </DialogTitle>
            <DialogDescription className="font-medium">
              Update stock levels for authoritative catalog items.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Select Product
              </Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger className="bg-muted/30 border-none h-11">
                  <SelectValue placeholder="Select a SKU..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.sku} - {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Quantity
                </Label>
                <Input
                  type="number"
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  className="bg-muted/30 border-none h-11 font-bold"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Reason
                </Label>
                <Input
                  value={receiveReason}
                  onChange={(e) => setReceiveReason(e.target.value)}
                  className="bg-muted/30 border-none h-11"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-2 border-t">
            <Button
              onClick={handleReceiveStock}
              disabled={submitting}
              className="w-full bg-primary hover:bg-primary/90 h-12 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Boxes className="mr-2 h-4 w-4" />
              )}
              Confirm Intake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isContextOpen && (
        <ContextSidebar
          isOpen={isContextOpen}
          onClose={() => toggleContext(false)}
          title={`SKU: ${selectedProduct?.sku}`}
        >
          <ProductDetails product={selectedProduct} />
        </ContextSidebar>
      )}
    </div>
  );
}

function ProductDetails({ product }: { product: Product | null }) {
  if (!product) return null;
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-40 w-full bg-muted/30 rounded-xl flex flex-col items-center justify-center border border-dashed border-muted-foreground/20">
          <ImageIcon className="h-10 w-10 text-muted-foreground/20 mb-2" />
          <span className="text-[10px] font-bold uppercase text-muted-foreground/40 tracking-widest">
            No Image Asset Registered
          </span>
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded tracking-tighter">
              {product.sku}
            </span>
            {product.quantity < 5 && (
              <Badge
                variant="destructive"
                className="h-4 px-1.5 text-[8px] uppercase"
              >
                Low Stock
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold mt-2">{product.name}</h2>
          <p className="text-3xl font-black tracking-tighter mt-2">
            ${product.unitCost.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Availability
          </span>
          <div className="text-lg font-bold text-emerald-600">
            {product.quantity - (product.reserved || 0)} Units
          </div>
          <div className="text-[10px] text-muted-foreground">
            Of {product.quantity} Total
          </div>
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
            Allocated
          </span>
          <div className="text-lg font-bold text-amber-600">
            {product.reserved || 0} Reserved
          </div>
          {product.incoming > 0 && (
            <div className="text-[10px] text-blue-500 font-bold">
              +{product.incoming} Incoming
            </div>
          )}
        </div>
      </div>
      <div className="space-y-1 pt-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Location
        </span>
        <div className="text-lg font-bold">Aisle {(product.id % 5) + 1}</div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Linked Incidents (SENTpilot)
        </span>
        <div className="grid gap-2">
          <div
            className="group flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:border-red-500/50 transition-colors cursor-pointer"
            onClick={() => toast.info("Deep-linking to Ticket #402")}
          >
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-red-500" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black">
                  #T-402 Physical Damage
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Reported by NOC • 2h ago
                </span>
              </div>
            </div>
            <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-red-500" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Authoritative History
        </span>
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center text-center bg-muted/20 min-h-[120px]">
          <History className="h-5 w-5 text-muted-foreground/30 mb-2" />
          <p className="text-[10px] text-muted-foreground max-w-[180px]">
            No recent stock movements recorded for this object.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="h-16 flex-col gap-1 text-[10px] font-bold uppercase"
          onClick={() => toast.success("Barcode Dispatched to Printer")}
        >
          <Printer className="h-4 w-4" /> Print Labels
        </Button>
        <Button
          variant="outline"
          className="h-16 flex-col gap-1 text-[10px] font-bold uppercase"
        >
          <Truck className="h-4 w-4" /> View Supplier
        </Button>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-black ${color}`}>{value}</div>
      </CardContent>
      <div className={`h-1 w-full opacity-10 ${color.replace("text", "bg")}`} />
    </Card>
  );
}

export default Stock;
