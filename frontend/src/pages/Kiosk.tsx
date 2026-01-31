import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GetProducts } from "../../wailsjs/go/stock/StockBridge";
import {
  Checkout,
  OpenDrawer,
  PrintReceipt,
} from "../../wailsjs/go/stock/KioskBridge";
import {
  ShoppingCart,
  Trash2,
  Banknote,
  CreditCard,
  Eraser,
  Printer,
  CheckCircle2,
  PauseCircle,
  Percent,
  Split,
  FileText,
  StickyNote,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Product } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ModifierModal } from "@/components/kiosk/ModifierModal";
import { LineItemModal } from "@/components/kiosk/LineItemModal";
import { ProductVariant } from "@/lib/types";
import {
  User,
  QrCode,
  Clock,
  Star,
  Archive,
  ShieldAlert,
  LogOut,
  LogIn,
} from "lucide-react";

// CartItem extends Product with sales-specific fields
interface CartItem extends Product {
  qty: number;
  variant?: ProductVariant;
  note?: string;
}

/**
 * Kiosk page handles Point of Sale (POS) operations.
 * Supports cart management, discounts, holding carts, and checkout.
 */
export function Kiosk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const categories = [
    "All",
    ...Array.from(
      new Set(products.map((p) => p.categoryName || "Uncategorized")),
    ),
  ];
  const filteredProducts =
    activeCategory === "All"
      ? products
      : products.filter(
          (p) => (p.categoryName || "Uncategorized") === activeCategory,
        );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Line Item Edit State
  const [selectedCartIndex, setSelectedCartIndex] = useState<number | null>(
    null,
  );
  const [isLineItemOpen, setIsLineItemOpen] = useState(false);

  // Favorites
  const [favorites] = useState<number[]>([1, 2, 3]); // Mock IDs for favorites

  // Parked Orders State
  const [isParkedListOpen, setIsParkedListOpen] = useState(false);
  const [parkedOrders, setParkedOrders] = useState<any[]>([]);

  // Drawer/Manager State
  const [isPinOpen, setIsPinOpen] = useState(false);
  const [pinAction, setPinAction] = useState<"z-report" | "drawer">("z-report");
  const [pinInput, setPinInput] = useState("");
  const [isDrawerOpsOpen, setIsDrawerOpsOpen] = useState(false);
  const [drawerOpType, setDrawerOpType] = useState<"in" | "out">("out");
  const [drawerAmount, setDrawerAmount] = useState("");

  // Receipt State
  const [receipt, setReceipt] = useState<string | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Cash State
  const [isCashOpen, setIsCashOpen] = useState(false);
  const [tendered, setTendered] = useState("");
  const [change, setChange] = useState(0);

  // Split Payment State
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [splitPayments, setSplitPayments] = useState<
    { method: string; amount: number }[]
  >([]);
  const [splitAmount, setSplitAmount] = useState("");

  // Discount State
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<"percent" | "amount">(
    "percent",
  );
  const [discountValue, setDiscountValue] = useState("");

  // Return Mode State
  const [isReturnMode, setIsReturnMode] = useState(false);

  // Modifiers State
  const [selectedProductForModifier, setSelectedProductForModifier] =
    useState<Product | null>(null);
  const [isModifierOpen, setIsModifierOpen] = useState(false);

  // Scanner State
  const [barcodeBuffer, setBarcodeBuffer] = useState("");
  const [lastKeyTime, setLastKeyTime] = useState(0);

  // Shift/Customer State (Placeholder for now)
  const [shiftActive, setShiftActive] = useState(false);
  const [customer, setCustomer] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  // Barcode Scanner Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if input focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 100) {
        setBarcodeBuffer(""); // Reset if gap too long (manual typing)
      }
      setLastKeyTime(now);

      if (e.key === "Enter") {
        if (barcodeBuffer.length > 0) {
          handleScan(barcodeBuffer);
          setBarcodeBuffer("");
        }
      } else if (e.key.length === 1) {
        setBarcodeBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [barcodeBuffer, lastKeyTime, products]);

  const handleScan = (code: string) => {
    const product = products.find((p) => p.sku === code || p.barcode === code);
    if (product) {
      handleProductCheck(product);
      toast.success(`Scanned: ${product.name}`);
    } else {
      toast.error(`Unknown barcode: ${code}`);
    }
  };

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
          console.warn("[KIOSK] GetProducts timed out.");
          // Fallback to empty but clear loading
        } else {
          throw raceErr;
        }
      }
      setProducts(res || []);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate unique cart key (id + variantId)
  const getCartItemKey = (item: CartItem) => {
    return `${item.id}-${item.variant?.id || "base"}`;
  };

  // Override addToCart logic for variants
  const processAddToCart = (
    product: Product,
    variant?: ProductVariant | null,
  ) => {
    const newItemKey = `${product.id}-${variant?.id || "base"}`;
    const existingIndex = cart.findIndex(
      (item) => getCartItemKey(item) === newItemKey,
    );

    const stockAvailable = variant ? variant.stock : product.quantity;

    if (existingIndex >= 0) {
      const item = cart[existingIndex];
      if (item.qty + 1 > stockAvailable) {
        toast.error(`Insufficient stock! Only ${stockAvailable} available.`);
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].qty += 1;
      setCart(newCart);
    } else {
      let price = variant
        ? product.unitCost + variant.priceAdjustment
        : product.unitCost;
      // Invert price if in return mode
      if (isReturnMode) {
        price = -Math.abs(price);
      }

      const sku = variant ? variant.sku : product.sku;
      const name = variant ? `${product.name} (${variant.name})` : product.name;

      const newItem: CartItem = {
        ...product,
        qty: isReturnMode ? -1 : 1, // Negative qty for returns
        variant: variant || undefined,
        unitCost: price, // Override price
        sku: sku, // Override SKU
        name: name, // Override name for display
      };
      setCart([...cart, newItem]);
    }
  };

  const addToCart = (product: Product, variant?: ProductVariant | null) => {
    processAddToCart(product, variant);
  };

  const decrementCart = (index: number) => {
    const newCart = [...cart];
    if (Math.abs(newCart[index].qty) > 1) {
      newCart[index].qty =
        newCart[index].qty > 0
          ? newCart[index].qty - 1
          : newCart[index].qty + 1;
      setCart(newCart);
    } else {
      removeFromCart(index);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleProductCheck = (product: Product) => {
    if (product.hasVariants) {
      setSelectedProductForModifier(product);
      setIsModifierOpen(true);
    } else {
      addToCart(product);
    }
  };

  const applyDiscount = () => {
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) return;

    let newCart = [...cart];
    if (discountType === "percent") {
      newCart = newCart.map((item) => ({
        ...item,
        unitCost: item.unitCost * (1 - val / 100),
      }));
    } else {
      // Distribute amount discount across items proportionally
      const totalBefore = cart.reduce((acc, i) => acc + i.unitCost * i.qty, 0);
      if (totalBefore > 0) {
        newCart = newCart.map((item) => ({
          ...item,
          unitCost:
            item.unitCost -
            (val * ((item.unitCost * item.qty) / totalBefore)) / item.qty,
        }));
      }
    }
    setCart(newCart);
    setIsDiscountOpen(false);
    setDiscountValue("");
    toast.success("Discount applied");
  };

  const holdCart = () => {
    if (cart.length === 0) return;

    // Auto-name based on time/customer
    const name = customer || `Order #${Math.floor(Math.random() * 1000)}`;
    const newOrder = {
      id: Date.now(),
      name: name,
      cart: cart,
      date: new Date().toLocaleString(),
    };

    const updated = [...parkedOrders, newOrder];
    setParkedOrders(updated);
    // Persist to local storage in real app
    setCart([]);
    toast.success(`Order parked: ${name}`);
  };

  const restoreParkedOrder = (index: number) => {
    setCart(parkedOrders[index].cart);
    const newParked = [...parkedOrders];
    newParked.splice(index, 1);
    setParkedOrders(newParked);
    setIsParkedListOpen(false);
    toast.success("Order retrieved");
  };

  const handleManagerAction = (action: "z-report" | "drawer") => {
    setPinAction(action);
    setPinInput("");
    setIsPinOpen(true);
  };

  const submitPin = () => {
    if (pinInput === "1234") {
      setIsPinOpen(false);
      if (pinAction === "z-report") handleZReport();
      if (pinAction === "drawer") setIsDrawerOpsOpen(true);
    } else {
      toast.error("Invalid PIN");
      setPinInput("");
    }
  };

  const handleDrawerLog = () => {
    // Mock log
    toast.success(`Drawer ${drawerOpType.toUpperCase()}: $${drawerAmount}`);
    setIsDrawerOpsOpen(false);
    setDrawerAmount("");
  };

  const total = cart.reduce((acc, item) => acc + item.unitCost * item.qty, 0);

  const initiateCheckout = (method: string) => {
    if (cart.length === 0) return;
    if (method === "cash") {
      setTendered("");
      setChange(0);
      setIsCashOpen(true);
    } else {
      handleCheckout("card");
    }
  };

  const handleCheckout = async (method: string) => {
    setIsProcessing(true);
    try {
      const payload = {
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.qty,
          price: i.unitCost,
        })),
        total: total,
        paymentMethod: method,
      };

      // @ts-ignore - bridge types
      await Checkout(payload);
      // @ts-ignore - bridge types
      const text = await PrintReceipt(payload);

      setReceipt(text);
      setIsReceiptOpen(true);
      setCart([]);
      setIsCashOpen(false);

      // Refresh inventory
      fetchProducts();

      if (method === "cash") await OpenDrawer();
      toast.success("Sale successful");
    } catch (err: any) {
      toast.error(err.toString());
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSplitPayment = async () => {
    // Validate total
    const paid = splitPayments.reduce((acc, p) => acc + p.amount, 0);
    if (paid < total) {
      toast.error(`Remaining balance: $${(total - paid).toFixed(2)}`);
      return;
    }

    setIsProcessing(true);
    try {
      // Mocking checkout for split payments as bridge might not support it yet
      // In production, we'd send the 'payments' array to a new bridge endpoint
      const payload = {
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.qty,
          price: i.unitCost,
        })),
        total: total,
        paymentMethod: "split", // Simplified for now
      };

      // @ts-ignore
      await Checkout(payload);
      // @ts-ignore
      const text = await PrintReceipt(payload);
      setReceipt(text);
      setIsReceiptOpen(true);
      setCart([]);
      setIsSplitOpen(false);
      setSplitPayments([]);
      fetchProducts();
      toast.success("Split Payment Successful");
    } catch (err: any) {
      toast.error(err.toString());
    } finally {
      setIsProcessing(false);
    }
  };

  const addSplitPayment = (method: string) => {
    const val = parseFloat(splitAmount);
    if (isNaN(val) || val <= 0) return;
    setSplitPayments([...splitPayments, { method, amount: val }]);
    setSplitAmount("");
  };

  /* Z-Report is now protected */
  const handleZReport = () => {
    // Mock Z-Report
    const date = new Date().toLocaleDateString();
    const report = `
      === Z-REPORT ===
      Date: ${date}
      Shift ID: SHIFT-${Math.floor(Math.random() * 1000)}
      
      Total Sales: $${(Math.random() * 5000).toFixed(2)}
      Cash in Drawer: $${(Math.random() * 1000).toFixed(2)}
      Card Sales: $${(Math.random() * 4000).toFixed(2)}
      
      Returns: $0.00
      Discounts: $0.00
      
      --- END REPORT ---
    `;
    setReceipt(report);
    setIsReceiptOpen(true);
  };

  const breadcrumbs = [{ label: "Business" }, { label: "SENTkiosk POS" }];

  return (
    <div className="flex flex-col h-full space-y-6 fade-in">
      <PageHeader
        title="SENTkiosk"
        description="Authoritative Point of Sale & Retail Ingest"
        icon={Banknote}
        breadcrumbs={breadcrumbs}
      />

      {loading && products.length === 0 ? (
        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="w-full lg:w-[400px] h-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row flex-1 gap-6 overflow-hidden">
          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col">
            {/* Category Tabs */}
            <div className="flex gap-2 pb-4 overflow-x-auto">
              <Button
                variant={
                  activeCategory === "Favorites" ? "default" : "secondary"
                }
                size="sm"
                className="rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap bg-amber-100 text-amber-700 hover:bg-amber-200"
                onClick={() => setActiveCategory("Favorites")}
              >
                <Star className="w-3 h-3 mr-1 fill-current" /> Favorites
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "secondary"}
                  size="sm"
                  className="rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
              {(activeCategory === "Favorites"
                ? products.filter((p) => favorites.includes(p.id) || p.id < 5)
                : filteredProducts
              ).map((p) => (
                <Card
                  key={p.id}
                  className={`group cursor-pointer hover:border-erp transition-all active:scale-95 touch-none bg-card shadow-sm hover:shadow-md ${p.quantity <= 0 ? "opacity-50 grayscale pointer-events-none" : ""}`}
                  onClick={() => p.quantity > 0 && handleProductCheck(p)}
                >
                  <CardHeader className="p-4 pb-2">
                    <CardTitle
                      className="text-xs font-black uppercase tracking-tight truncate group-hover:text-erp transition-colors"
                      title={p.name}
                    >
                      {p.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-[10px] text-muted-foreground font-mono font-bold">
                      {p.sku}
                    </p>
                    <div className="flex justify-between items-end mt-4">
                      <p className="text-xl font-black text-erp">
                        ${p.unitCost.toLocaleString()}
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-[8px] font-black ${p.quantity < 5 ? "text-red-500 border-red-500/20" : "text-muted-foreground opacity-50"}`}
                      >
                        {p.quantity} Units
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <Card className="w-full lg:w-[400px] flex flex-col shadow-xl border-erp/10 h-[400px] lg:h-full overflow-hidden shrink-0">
            <CardHeader className="border-b bg-muted/30 py-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-erp" />
                  <span className="text-sm font-black uppercase tracking-widest italic">
                    Current Order
                  </span>
                </div>
                <Badge variant="outline">
                  {cart.reduce((acc, i) => acc + i.qty, 0)} Items
                </Badge>
              </CardTitle>
              <div className="flex gap-2 mt-2">
                <Button
                  variant={shiftActive ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-[10px] uppercase font-bold"
                  onClick={() => setShiftActive(!shiftActive)}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {shiftActive ? "Clocked In" : "Clock In"}
                </Button>
                <Button
                  variant={customer ? "default" : "outline"}
                  size="sm"
                  className="flex-1 text-[10px] uppercase font-bold"
                  onClick={() => setCustomer(customer ? null : "John Doe")}
                >
                  <User className="h-3 w-3 mr-1" />
                  {customer ? customer : "Add Customer"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-card">
              <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground opacity-20">
                    <ShoppingCart className="h-20 w-20 mb-4" />
                    <p className="font-black uppercase tracking-widest text-xs">
                      Awaiting Input
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {cart.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                        onClick={() => {
                          setSelectedCartIndex(i);
                          setIsLineItemOpen(true);
                        }}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-xs font-black uppercase truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted-foreground">
                            ${item.unitCost.toFixed(2)}
                            {item.note && (
                              <span className="block text-amber-500 italic">
                                Note: {item.note}
                              </span>
                            )}
                            {item.qty < 0 && (
                              <span className="block text-red-500 font-bold">
                                RETURN
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center bg-muted rounded-md p-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-sm hover:bg-background"
                              onClick={() => decrementCart(i)}
                            >
                              -
                            </Button>
                            <span className="font-mono w-6 text-center text-[10px] font-black">
                              {item.qty}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-sm hover:bg-background"
                              onClick={() => addToCart(item, item.variant)}
                            >
                              +
                            </Button>
                          </div>
                          <div className="w-16 text-right">
                            <p className="font-mono font-black text-xs text-erp">
                              ${(item.qty * item.unitCost).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="p-6 bg-muted/30 border-t space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="font-mono font-bold text-sm">
                    $
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-3xl font-black tracking-tighter">
                  <span>TOTAL</span>
                  <span className={total < 0 ? "text-destructive" : "text-erp"}>
                    $
                    {total.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={isReturnMode ? "destructive" : "secondary"}
                    size="sm"
                    className="text-[9px] uppercase font-black tracking-widest"
                    onClick={() => setIsReturnMode(!isReturnMode)}
                  >
                    {isReturnMode ? "Return Mode Review" : "Return Mode"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[9px] uppercase font-black tracking-widest relative"
                    onClick={() => setIsParkedListOpen(true)}
                  >
                    <Archive className="h-3 w-3 mr-1" /> Parked (
                    {parkedOrders.length})
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-[9px] font-black uppercase tracking-widest"
                    onClick={() => setIsDiscountOpen(true)}
                  >
                    <Percent className="h-3 w-3 mr-1.5" /> Disc
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-[10px] uppercase font-bold text-purple-600 border-purple-200 hover:bg-purple-50"
                    onClick={() => handleManagerAction("z-report")}
                  >
                    <ShieldAlert className="h-3 w-3 mr-1" />
                    Manager
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-[9px] font-black uppercase tracking-widest"
                    onClick={holdCart}
                  >
                    <PauseCircle className="h-3 w-3 mr-1.5" /> Hold
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5"
                    onClick={() => setCart([])}
                  >
                    <Eraser className="h-3 w-3 mr-1.5" /> Void
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    className="h-14 flex-col gap-1 bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]"
                    onClick={() => initiateCheckout("cash")}
                    disabled={isProcessing}
                  >
                    <Banknote className="h-4 w-4" /> Cash
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 flex-col gap-1 bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-erp/20"
                    onClick={() => initiateCheckout("card")}
                    disabled={isProcessing}
                  >
                    <CreditCard className="h-4 w-4" /> Card
                  </Button>
                  <Button
                    size="lg"
                    className="col-span-2 h-10 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black uppercase tracking-widest text-[9px]"
                    onClick={() => setIsSplitOpen(true)}
                  >
                    <Split className="h-3 w-3 mr-1" /> Split Payment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cash Payment Dialog */}
      <Dialog open={isCashOpen} onOpenChange={setIsCashOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
              Cash Settlement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="text-center bg-muted/30 p-6 rounded-xl border border-dashed border-muted-foreground/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Total Amount Due
              </p>
              <p className="text-5xl font-black text-erp tracking-tighter">
                ${total.toLocaleString()}
              </p>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Amount Tendered
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-lg font-black text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  className="flex h-14 w-full rounded-xl border-none bg-muted/50 px-10 py-2 text-2xl font-black ring-offset-background placeholder:text-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-erp"
                  placeholder="0.00"
                  value={tendered}
                  autoFocus
                  onChange={(e) => {
                    setTendered(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                      setChange(val - total);
                    } else {
                      setChange(0);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && parseFloat(tendered) >= total) {
                      handleCheckout("cash");
                    }
                  }}
                />
              </div>
            </div>
            <div
              className={`p-4 rounded-xl flex justify-between items-center ${change >= 0 ? "bg-erp/10 text-erp" : "bg-red-500/10 text-red-500"} border border-current/10`}
            >
              <span className="text-[10px] font-black uppercase tracking-widest">
                Change Due
              </span>
              <span className="text-2xl font-black tracking-tighter">
                ${change > 0 ? change.toFixed(2) : "0.00"}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              className="w-full bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest h-14 shadow-lg shadow-erp/20"
              disabled={parseFloat(tendered) < total || isProcessing}
              onClick={() => handleCheckout("cash")}
            >
              Finalize Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
              Apply Price Adjustment
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-2 py-6">
            <Select
              value={discountType}
              onValueChange={(v: "percent" | "amount") => setDiscountType(v)}
            >
              <SelectTrigger className="w-[140px] h-12 bg-muted/50 border-none font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent (%)</SelectItem>
                <SelectItem value="amount">Amount ($)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Value"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
              className="h-12 bg-muted/50 border-none font-black text-lg"
            />
          </div>
          <DialogFooter>
            <Button
              onClick={applyDiscount}
              className="w-full h-12 bg-primary font-black uppercase tracking-widest"
            >
              Apply Adjustment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
          <DialogHeader className="items-center">
            <div className="rounded-full bg-erp/10 p-4 mb-2">
              <CheckCircle2 className="h-10 w-10 text-erp" />
            </div>
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
              Sale Authorized
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-6 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30 font-mono text-[10px] whitespace-pre overflow-auto max-h-[300px] printable-area leading-relaxed">
            {receipt}
          </div>
          <DialogFooter className="mt-6 flex flex-col gap-2">
            <Button
              className="w-full gap-2 bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-erp/20 transition-all active:scale-95"
              onClick={() => window.print()}
            >
              <Printer className="h-4 w-4" /> Print Receipt
            </Button>
            <Button
              variant="ghost"
              className="w-full font-bold uppercase text-[10px] tracking-widest"
              onClick={() => setIsReceiptOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ModifierModal
        product={selectedProductForModifier}
        isOpen={isModifierOpen}
        onClose={() => setIsModifierOpen(false)}
        onConfirm={(p, v) => addToCart(p, v)}
      />
      {/* Split Payment Dialog */}
      <Dialog open={isSplitOpen} onOpenChange={setIsSplitOpen}>
        <DialogContent className="max-w-md bg-background border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
              Split Payment
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center bg-muted/50 p-4 rounded-xl">
              <span className="font-black uppercase text-xs tracking-widest">
                Total Due
              </span>
              <span className="font-black text-2xl">${total.toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              {splitPayments.map((p, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <span className="capitalize font-bold text-sm">
                    {p.method}
                  </span>
                  <span className="font-mono">${p.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 text-erp">
                <span className="font-black uppercase text-xs tracking-widest">
                  Remaining
                </span>
                <span className="font-black text-xl">
                  $
                  {(
                    total - splitPayments.reduce((acc, p) => acc + p.amount, 0)
                  ).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <div className="space-y-1 flex-1">
                <Label className="text-[10px] uppercase font-black text-muted-foreground">
                  Amount
                </Label>
                <Input
                  type="number"
                  value={splitAmount}
                  onChange={(e) => setSplitAmount(e.target.value)}
                  className="font-black"
                />
              </div>
              <Button
                onClick={() => addSplitPayment("cash")}
                variant="outline"
                className="font-bold"
              >
                Cash
              </Button>
              <Button
                onClick={() => addSplitPayment("card")}
                variant="outline"
                className="font-bold"
              >
                Card
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleSplitPayment}
              className="w-full bg-erp text-white font-black uppercase tracking-widest"
              disabled={
                splitPayments.reduce((acc, p) => acc + p.amount, 0) < total
              }
            >
              Finalize Split
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Z-Report Dialog Trigger (Hidden in UI normally, but adding to sidebar footer) */}

      {/* Line Item Modal */}
      <LineItemModal
        item={selectedCartIndex !== null ? cart[selectedCartIndex] : null}
        isOpen={isLineItemOpen}
        onClose={() => setIsLineItemOpen(false)}
        onSave={(note) => {
          if (selectedCartIndex !== null) {
            const newCart = [...cart];
            newCart[selectedCartIndex].note = note;
            setCart(newCart);
          }
        }}
        onDelete={() => {
          if (selectedCartIndex !== null) {
            removeFromCart(selectedCartIndex);
          }
        }}
      />

      {/* Parked Orders Modal */}
      <Dialog open={isParkedListOpen} onOpenChange={setIsParkedListOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Parked Orders</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {parkedOrders.length === 0 && (
              <p className="text-center text-muted-foreground opacity-50">
                No parked orders.
              </p>
            )}
            {parkedOrders.map((order, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 border rounded-lg bg-card hover:bg-muted/50 cursor-pointer"
                onClick={() => restoreParkedOrder(i)}
              >
                <div>
                  <p className="font-bold">{order.name}</p>
                  <p className="text-xs text-muted-foreground">{order.date}</p>
                </div>
                <Badge variant="outline">{order.cart.length} Items</Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* PIN Modal */}
      <Dialog open={isPinOpen} onOpenChange={setIsPinOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle className="text-center">Enter Manager PIN</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center py-4">
            <input
              type="password"
              className="text-4xl text-center w-full font-black tracking-widest border-none focus:outline-none bg-transparent"
              placeholder="••••"
              maxLength={4}
              value={pinInput}
              autoFocus
              onChange={(e) => setPinInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitPin()}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <Button
                key={n}
                variant="outline"
                className="h-12 text-xl font-black"
                onClick={() => setPinInput((prev) => (prev + n).slice(0, 4))}
              >
                {n}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="h-12"
              onClick={() => setPinInput("")}
            >
              C
            </Button>
            <Button
              variant="outline"
              className="h-12 text-xl font-black"
              onClick={() => setPinInput((prev) => (prev + "0").slice(0, 4))}
            >
              0
            </Button>
            <Button className="h-12 bg-erp text-white" onClick={submitPin}>
              Go
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Drawer Ops Modal */}
      <Dialog open={isDrawerOpsOpen} onOpenChange={setIsDrawerOpsOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Drawer Operations</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant={drawerOpType === "in" ? "default" : "outline"}
              onClick={() => setDrawerOpType("in")}
              className="gap-2"
            >
              <LogIn className="w-4 h-4" /> Pay In
            </Button>
            <Button
              variant={drawerOpType === "out" ? "destructive" : "outline"}
              onClick={() => setDrawerOpType("out")}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" /> Pay Out
            </Button>
          </div>
          <Input
            type="number"
            placeholder="Amount"
            value={drawerAmount}
            onChange={(e) => setDrawerAmount(e.target.value)}
            className="text-2xl font-black h-14"
            autoFocus
          />
          <Button
            className="w-full h-12 text-lg font-black uppercase mt-4"
            onClick={handleDrawerLog}
          >
            Log Transaction
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
