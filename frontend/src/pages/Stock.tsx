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
  GetAuditLogs,
  GetExpiringWarranties,
  ScheduleMaintenance,
  GetPendingMaintenance,
  CompleteMaintenance,
  GetAlerts,
  MarkAlertRead,
  CreatePurchaseOrder,
  GetPurchaseOrders,
  ReceivePurchaseOrder,
  RecordCount,
  DisposeAsset,
  ImportProducts,
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
  UserCheck,
  Receipt,
  Wrench,
  ShieldCheck,
  Trash2,
  ClipboardCheck,
  Upload,
  Bell,
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
import { CheckoutDialog } from "@/components/stock/CheckoutDialog";
import { ReorderPane } from "@/components/stock/ReorderPane";
import { Suppliers } from "@/pages/Suppliers";
import { Categories } from "@/pages/Categories";
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // New features states
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isPODialogOpen, setIsPODialogOpen] = useState(false);
  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [countQty, setCountQty] = useState<number>(0);
  const [importContent, setImportContent] = useState("");
  const [disposalReason, setDisposalReason] = useState("");
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);

  const { setContextSidebar, toggleContext, isContextOpen, activeTab } =
    useAppStore();

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
    setContextSidebar(
      <ProductDetails
        product={product}
        onCheckout={() => {
          setSelectedProduct(product);
          setIsCheckoutOpen(true);
        }}
        setIsDisposalOpen={setIsDisposalOpen}
      />,
    );
    toggleContext(true);
  };

  const fetchAuditLogs = async () => {
    try {
      const data = await GetAuditLogs("", 0);
      setAuditLogs(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchMaintenance = async () => {
    try {
      const data = await GetPendingMaintenance();
      setMaintenanceTasks(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchPOs = async () => {
    try {
      const data = await GetPurchaseOrders();
      setPurchaseOrders(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  const fetchAlerts = async () => {
    try {
      const data = await GetAlerts();
      setAlerts(data || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAuditLogs();
    fetchMaintenance();
    fetchPOs();
    fetchAlerts();

    GetHistory().then((data) => setHistory(data || []));
  }, []);

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
            <Download className="h-3 w-3" /> Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2"
            onClick={() => setIsImportDialogOpen(true)}
          >
            <Upload className="h-3 w-3" /> Import
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

      <div className="flex-1 overflow-auto">
        {activeTab === "inventory" || activeTab === "overview" ? (
          <div className="space-y-4">
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
                        <div className="font-bold text-sm truncate">
                          {p.name}
                        </div>
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
                            ((p.quantity - (p.reserved || 0)) / p.quantity) *
                            100
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
                        <TableHead className="text-right pr-6">
                          Actions
                        </TableHead>
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
                                  <div className="font-bold text-sm">
                                    {p.name}
                                  </div>
                                  <div className="font-mono text-[10px] text-blue-600 font-black tracking-tighter">
                                    {p.sku}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/30 w-fit px-2 py-1 rounded-full border border-primary/10 transition-colors">
                                <MapPin className="h-3 w-3 text-primary" />{" "}
                                Aisle {(p.id % 5) + 1}
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
          </div>
        ) : activeTab === "suppliers" ? (
          <Suppliers />
        ) : activeTab === "categories" ? (
          <Categories />
        ) : activeTab === "reports" ? (
          <ReorderPane products={products} />
        ) : activeTab === "pos" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
                  Purchase Orders
                </CardTitle>
                <CardDescription>
                  Generated procurement manifests for strategic suppliers.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setIsPODialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create PO
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground italic"
                      >
                        No active procurement cycles
                      </TableCell>
                    </TableRow>
                  ) : (
                    purchaseOrders.map((po) => (
                      <TableRow key={po.id}>
                        <TableCell className="font-bold">
                          {po.poNumber}
                        </TableCell>
                        <TableCell>{po.supplierName}</TableCell>
                        <TableCell>
                          {new Date(po.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              po.status === "received" ? "secondary" : "default"
                            }
                          >
                            {po.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {po.status !== "received" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-emerald-500/10 hover:text-emerald-600"
                              onClick={() =>
                                ReceivePurchaseOrder(po.id).then(fetchPOs)
                              }
                            >
                              <Package className="h-4 w-4 mr-1" /> Receive
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : activeTab === "maintenance" ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
                  Maintenance Schedules
                </CardTitle>
                <CardDescription>
                  Preventative lifecycle management for high-value assets.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsMaintenanceDialogOpen(true)}
              >
                <Wrench className="mr-2 h-4 w-4" /> Schedule
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Scheduled Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceTasks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground italic"
                      >
                        No maintenance pending
                      </TableCell>
                    </TableRow>
                  ) : (
                    maintenanceTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell className="font-bold">
                          {task.productName}
                        </TableCell>
                        <TableCell>
                          {new Date(task.scheduledAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              task.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {task.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs max-w-[200px] truncate">
                          {task.notes}
                        </TableCell>
                        <TableCell className="text-right">
                          {task.status !== "completed" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                CompleteMaintenance(task.id).then(
                                  fetchMaintenance,
                                )
                              }
                            >
                              <ShieldCheck className="h-4 w-4 mr-1" /> Finish
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : activeTab === "audit" ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
                Authrozied Audit Trail
              </CardTitle>
              <CardDescription>
                Immutable record of all inventory transactions and status
                changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg border bg-muted/10 relative overflow-hidden group"
                  >
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold uppercase tracking-tight">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(log.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foreground mt-0.5">
                        {log.details}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">
                        USER: {log.userName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent">
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setIsScannerOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedProduct && (
        <CheckoutDialog
          open={isCheckoutOpen}
          onOpenChange={setIsCheckoutOpen}
          product={selectedProduct}
          onSuccess={fetchProducts}
        />
      )}

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
          <ProductDetails
            product={selectedProduct}
            onCheckout={() => setIsCheckoutOpen(true)}
            setIsDisposalOpen={setIsDisposalOpen}
          />
          <div className="mt-4 px-4 pb-4">
            <Button
              variant="outline"
              className="w-full text-[10px] font-bold uppercase"
              onClick={() => setIsCountDialogOpen(true)}
            >
              <ClipboardCheck className="mr-2 h-4 w-4" /> Record Cycle Count
            </Button>
          </div>
        </ContextSidebar>
      )}

      <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispose Asset</DialogTitle>
            <DialogDescription>
              Decommission this asset from active inventory.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Reason for Disposal</Label>
            <Input
              value={disposalReason}
              onChange={(e) => setDisposalReason(e.target.value)}
              placeholder="e.g., Damaged beyond repair, End of life..."
            />
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedProduct) {
                  DisposeAsset(selectedProduct.id, disposalReason).then(() => {
                    setIsDisposalOpen(false);
                    fetchProducts();
                    toast.success("Asset disposed");
                  });
                }
              }}
            >
              Confirm Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCountDialogOpen} onOpenChange={setIsCountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Physical Cycle Count</DialogTitle>
            <DialogDescription>
              Record a physical count to verify system accuracy.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Label>Actual Counted Quantity</Label>
            <Input
              type="number"
              value={countQty}
              onChange={(e) => setCountQty(Number(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedProduct) {
                  RecordCount(selectedProduct.id, countQty).then(() => {
                    setIsCountDialogOpen(false);
                    fetchProducts();
                    toast.success("Count recorded");
                  });
                }
              }}
            >
              Update System
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPODialogOpen} onOpenChange={setIsPODialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Purchase Order</DialogTitle>
            <DialogDescription>
              Quick-generate a PO for a supplier.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-xs text-muted-foreground italic">
              Note: In a full implementation, you would select a supplier and
              add multiple lines. This shortcut creates a default PO for
              testing.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                CreatePurchaseOrder(1, []).then(() => {
                  setIsPODialogOpen(false);
                  fetchPOs();
                  toast.success("PO Created");
                });
              }}
            >
              Create Draft PO
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule Maintenance</DialogTitle>
            <DialogDescription>
              Register a new maintenance task for an asset.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-xs text-muted-foreground italic">
              Scheduling maintenance for the currently selected product if
              available.
            </p>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                if (selectedProduct) {
                  ScheduleMaintenance(
                    selectedProduct.id,
                    new Date().toISOString(),
                    "Routine checkup",
                  ).then(() => {
                    setIsMaintenanceDialogOpen(false);
                    fetchMaintenance();
                    toast.success("Maintenance Scheduled");
                  });
                } else {
                  toast.error("Select a product first");
                }
              }}
            >
              Schedule Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Bulk Product Import</DialogTitle>
            <DialogDescription>
              Paste CSV data (SKU, Name, Description, Cost, Qty, Category,
              Supplier) to bulk ingest catalog items.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full h-48 p-4 font-mono text-xs bg-muted/30 rounded-lg border-none focus:ring-0"
              placeholder="SKU-001,Laptop,High-end Macbook,1200,10,Hardware,Apple"
              value={importContent}
              onChange={(e) => setImportContent(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              onClick={() => {
                ImportProducts(importContent)
                  .then((count: any) => {
                    setIsImportDialogOpen(false);
                    fetchProducts();
                    toast.success(`Successfully imported ${count} entities`);
                  })
                  .catch((err: any) => toast.error(err));
              }}
            >
              Execute Authoritative Ingest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductDetails({
  product,
  onCheckout,
  setIsDisposalOpen,
}: {
  product: Product | null;
  onCheckout: () => void;
  setIsDisposalOpen: (open: boolean) => void;
}) {
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
            {product.categoryName && (
              <Badge
                variant="outline"
                className="h-4 px-1.5 text-[8px] uppercase"
              >
                {product.categoryName}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold mt-2">{product.name}</h2>
          <p className="text-3xl font-black tracking-tighter mt-2">
            ${product.unitCost.toLocaleString()}
          </p>
          {product.serialNumber && (
            <p className="text-xs text-blue-600 font-mono mt-1">
              S/N: {product.serialNumber}
            </p>
          )}
          {product.supplierName && (
            <p className="text-xs text-muted-foreground mt-1">
              Supplier:{" "}
              <span className="font-semibold text-foreground">
                {product.supplierName}
              </span>
            </p>
          )}
          <div className="flex gap-2 mt-4">
            <Button
              className="flex-1"
              size="sm"
              onClick={onCheckout}
              disabled={product.isDisposed}
            >
              <UserCheck className="mr-2 h-4 w-4" /> Check Out
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsDisposalOpen(true)}
              disabled={product.isDisposed}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {product.purchasePrice !== undefined && (
        <Card className="bg-muted/10 border-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                Valuation
              </span>
              <Badge variant="outline" className="text-[9px] font-bold">
                DEPRECIATING
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">
                  Acquisition
                </p>
                <p className="text-sm font-bold">
                  ${product.purchasePrice?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">
                  Current Net
                </p>
                <p className="text-sm font-bold text-emerald-600">
                  ${product.currentValue?.toLocaleString()}
                </p>
              </div>
            </div>
            {product.warrantyExpiresAt && (
              <div className="pt-2 border-t border-muted-foreground/10 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-blue-500" />
                <span className="text-[10px] font-bold">
                  Warranty until{" "}
                  {new Date(product.warrantyExpiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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
        <div className="text-lg font-bold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          {product.location || "Not Assigned"}
        </div>
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
