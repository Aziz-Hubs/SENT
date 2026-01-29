import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GetProducts } from "../../wailsjs/go/stock/StockBridge"
import { Checkout, OpenDrawer, PrintReceipt } from "../../wailsjs/go/stock/KioskBridge"
import { ShoppingCart, Trash2, Banknote, CreditCard, Eraser, Printer, CheckCircle2, PauseCircle, Percent } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Product } from "@/lib/types"
import { PageHeader } from "@/components/layout/PageHeader"

// CartItem extends Product with sales-specific fields
interface CartItem extends Product {
  qty: number
}

/**
 * Kiosk page handles Point of Sale (POS) operations.
 * Supports cart management, discounts, holding carts, and checkout.
 */
export function Kiosk() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  
  // Receipt State
  const [receipt, setReceipt] = useState<string | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Cash State
  const [isCashOpen, setIsCashOpen] = useState(false)
  const [tendered, setTendered] = useState("")
  const [change, setChange] = useState(0)

  // Discount State
  const [isDiscountOpen, setIsDiscountOpen] = useState(false)
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent")
  const [discountValue, setDiscountValue] = useState("")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
      try {
        const res = await GetProducts()
        setProducts(res || [])
      } catch (err) {
        toast.error("Failed to load products")
      }
  }

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id)
    const currentQty = existing ? existing.qty : 0
    
    if (currentQty + 1 > product.quantity) {
        toast.error(`Insufficient stock! Only ${product.quantity} available.`)
        return
    }

    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      ))
    } else {
      setCart([...cart, { ...product, qty: 1 }])
    }
  }

  const decrementCart = (index: number) => {
    const item = cart[index]
    if (item.qty > 1) {
        const newCart = [...cart]
        newCart[index].qty--
        setCart(newCart)
    } else {
        removeFromCart(index)
    }
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const applyDiscount = () => {
      const val = parseFloat(discountValue)
      if (isNaN(val) || val <= 0) return

      let newCart = [...cart]
      if (discountType === "percent") {
          newCart = newCart.map(item => ({ ...item, unitCost: item.unitCost * (1 - val / 100) }))
      } else {
          // Distribute amount discount across items proportionally
          const totalBefore = cart.reduce((acc, i) => acc + (i.unitCost * i.qty), 0)
          if (totalBefore > 0) {
            newCart = newCart.map(item => ({ 
                ...item, 
                unitCost: item.unitCost - (val * (item.unitCost * item.qty / totalBefore) / item.qty)
            }))
          }
      }
      setCart(newCart)
      setIsDiscountOpen(false)
      setDiscountValue("")
      toast.success("Discount applied")
  }

  const holdCart = () => {
      if (cart.length === 0) {
          // Try to restore
          const saved = localStorage.getItem("held_cart")
          if (saved) {
              setCart(JSON.parse(saved))
              localStorage.removeItem("held_cart")
              toast.success("Cart restored from hold.")
          } else {
              toast.error("No held cart found.")
          }
          return
      }
      localStorage.setItem("held_cart", JSON.stringify(cart))
      setCart([])
      toast.success("Cart placed on hold.")
  }

  const total = cart.reduce((acc, item) => acc + (item.unitCost * item.qty), 0)

  const initiateCheckout = (method: string) => {
      if (cart.length === 0) return
      if (method === "cash") {
          setTendered("")
          setChange(0)
          setIsCashOpen(true)
      } else {
          handleCheckout("card")
      }
  }

  const handleCheckout = async (method: string) => {
    setIsProcessing(true)
    try {
      const payload = {
        items: cart.map(i => ({ productId: i.id, quantity: i.qty, price: i.unitCost })),
        total: total,
        paymentMethod: method
      }
      
      // @ts-ignore - bridge types
      await Checkout(payload)
      // @ts-ignore - bridge types
      const text = await PrintReceipt(payload)
      
      setReceipt(text)
      setIsReceiptOpen(true)
      setCart([])
      setIsCashOpen(false)
      
      // Refresh inventory
      fetchProducts()
      
      if (method === "cash") await OpenDrawer()
      toast.success("Sale successful")
    } catch (err: any) {
      toast.error(err.toString())
    } finally {
      setIsProcessing(false)
    }
  }

  const breadcrumbs = [
    { label: "Business" },
    { label: "SENTkiosk POS" }
  ]

  return (
    <div className="flex flex-col h-full space-y-6 fade-in">
      <PageHeader 
        title="SENTkiosk" 
        description="Authoritative Point of Sale & Retail Ingest"
        icon={Banknote}
        breadcrumbs={breadcrumbs}
      />

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-10">
                {products.map(p => (
                    <Card 
                        key={p.id} 
                        className={`group cursor-pointer hover:border-erp transition-all active:scale-95 touch-none bg-card shadow-sm hover:shadow-md ${p.quantity <= 0 ? 'opacity-50 grayscale pointer-events-none' : ''}`}
                        onClick={() => p.quantity > 0 && addToCart(p)}
                    >
                        <CardHeader className="p-4 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-tight truncate group-hover:text-erp transition-colors" title={p.name}>{p.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <p className="text-[10px] text-muted-foreground font-mono font-bold">{p.sku}</p>
                            <div className="flex justify-between items-end mt-4">
                                <p className="text-xl font-black text-erp">${p.unitCost.toLocaleString()}</p>
                                <Badge variant="outline" className={`text-[8px] font-black ${p.quantity < 5 ? 'text-red-500 border-red-500/20' : 'text-muted-foreground opacity-50'}`}>{p.quantity} Units</Badge>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>

        {/* Cart Sidebar */}
        <Card className="w-[400px] flex flex-col shadow-xl border-erp/10 h-full overflow-hidden">
            <CardHeader className="border-b bg-muted/30 py-4">
            <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-erp" /> 
                    <span className="text-sm font-black uppercase tracking-widest italic">Current Order</span>
                </div>
                <Badge className="bg-erp text-white font-black">{cart.reduce((acc, i) => acc + i.qty, 0)} Items</Badge>
            </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-card">
            <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground opacity-20">
                        <ShoppingCart className="h-20 w-20 mb-4" />
                        <p className="font-black uppercase tracking-widest text-xs">Awaiting Input</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-xs font-black uppercase truncate">{item.name}</p>
                                    <p className="text-[10px] font-mono text-muted-foreground">${item.unitCost.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-muted rounded-md p-0.5">
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-background" onClick={() => decrementCart(i)}>-</Button>
                                        <span className="font-mono w-6 text-center text-[10px] font-black">{item.qty}</span>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-sm hover:bg-background" onClick={() => addToCart(item)}>+</Button>
                                    </div>
                                    <div className="w-16 text-right">
                                        <p className="font-mono font-black text-xs text-erp">${(item.qty * item.unitCost).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-6 bg-muted/30 border-t space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Subtotal</span>
                    <span className="font-mono font-bold text-sm">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-3xl font-black tracking-tighter">
                    <span>TOTAL</span>
                    <span className="text-erp">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 py-2">
                    <Button variant="outline" size="sm" className="h-10 text-[9px] font-black uppercase tracking-widest" onClick={() => setIsDiscountOpen(true)}>
                        <Percent className="h-3 w-3 mr-1.5" /> Disc
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 text-[9px] font-black uppercase tracking-widest" onClick={holdCart}>
                        <PauseCircle className="h-3 w-3 mr-1.5" /> Hold
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5" onClick={() => setCart([])}>
                        <Eraser className="h-3 w-3 mr-1.5" /> Void
                    </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button size="lg" className="h-14 flex-col gap-1 bg-slate-800 hover:bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]" onClick={() => initiateCheckout("cash")} disabled={isProcessing}>
                        <Banknote className="h-4 w-4" /> Cash
                    </Button>
                    <Button size="lg" className="h-14 flex-col gap-1 bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-erp/20" onClick={() => initiateCheckout("card")} disabled={isProcessing}>
                        <CreditCard className="h-4 w-4" /> Card
                    </Button>
                </div>
            </div>
            </CardContent>
        </Card>
      </div>

      {/* Cash Payment Dialog */}
      <Dialog open={isCashOpen} onOpenChange={setIsCashOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
            <DialogHeader>
                <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">Cash Settlement</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
                <div className="text-center bg-muted/30 p-6 rounded-xl border border-dashed border-muted-foreground/20">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Amount Due</p>
                    <p className="text-5xl font-black text-erp tracking-tighter">${total.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Tendered</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-lg font-black text-muted-foreground">$</span>
                        <input 
                            type="number" 
                            className="flex h-14 w-full rounded-xl border-none bg-muted/50 px-10 py-2 text-2xl font-black ring-offset-background placeholder:text-muted-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-erp"
                            placeholder="0.00"
                            value={tendered}
                            autoFocus
                            onChange={(e) => {
                                setTendered(e.target.value)
                                const val = parseFloat(e.target.value)
                                if (!isNaN(val)) {
                                    setChange(val - total)
                                } else {
                                    setChange(0)
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && parseFloat(tendered) >= total) {
                                    handleCheckout("cash")
                                }
                            }}
                        />
                    </div>
                </div>
                <div className={`p-4 rounded-xl flex justify-between items-center ${change >= 0 ? 'bg-erp/10 text-erp' : 'bg-red-500/10 text-red-500'} border border-current/10`}>
                    <span className="text-[10px] font-black uppercase tracking-widest">Change Due</span>
                    <span className="text-2xl font-black tracking-tighter">${change > 0 ? change.toFixed(2) : "0.00"}</span>
                </div>
            </div>
            <DialogFooter>
                <Button className="w-full bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest h-14 shadow-lg shadow-erp/20" disabled={parseFloat(tendered) < total || isProcessing} onClick={() => handleCheckout("cash")}>
                    Finalize Transaction
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Dialog */}
      <Dialog open={isDiscountOpen} onOpenChange={setIsDiscountOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
            <DialogHeader><DialogTitle className="text-xl font-black uppercase italic tracking-tighter">Apply Price Adjustment</DialogTitle></DialogHeader>
            <div className="flex gap-2 py-6">
                <Select value={discountType} onValueChange={(v: "percent" | "amount") => setDiscountType(v)}>
                    <SelectTrigger className="w-[140px] h-12 bg-muted/50 border-none font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="percent">Percent (%)</SelectItem>
                        <SelectItem value="amount">Amount ($)</SelectItem>
                    </SelectContent>
                </Select>
                <Input type="number" placeholder="Value" value={discountValue} onChange={e => setDiscountValue(e.target.value)} className="h-12 bg-muted/50 border-none font-black text-lg" />
            </div>
            <DialogFooter><Button onClick={applyDiscount} className="w-full h-12 bg-primary font-black uppercase tracking-widest">Apply Adjustment</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-sm bg-background border-none shadow-2xl">
            <DialogHeader className="items-center">
                <div className="rounded-full bg-erp/10 p-4 mb-2">
                    <CheckCircle2 className="h-10 w-10 text-erp" />
                </div>
                <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">Sale Authorized</DialogTitle>
            </DialogHeader>
            <div className="mt-4 p-6 bg-muted/30 rounded-xl border border-dashed border-muted-foreground/30 font-mono text-[10px] whitespace-pre overflow-auto max-h-[300px] printable-area leading-relaxed">
                {receipt}
            </div>
            <DialogFooter className="mt-6 flex flex-col gap-2">
                <Button className="w-full gap-2 bg-erp hover:bg-erp/90 text-white font-black uppercase tracking-widest h-12 shadow-lg shadow-erp/20 transition-all active:scale-95" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" /> Print Receipt
                </Button>
                <Button variant="ghost" className="w-full font-bold uppercase text-[10px] tracking-widest" onClick={() => setIsReceiptOpen(false)}>
                    Close
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
    </div>
  )
}