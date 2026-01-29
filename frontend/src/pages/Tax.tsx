import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GetTaxConfig, CalculateTax } from "../../wailsjs/go/tax/TaxBridge"
import { Scale, Calculator, ShieldCheck, Globe, Printer } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PageHeader } from "@/components/layout/PageHeader"

// TaxConfig represents the tax rules for a region
interface TaxConfig {
    countryCode: string
    defaultRate: number
    isFiscal: boolean
}

// TaxResult represents the outcome of a calculation
interface TaxResult {
    subtotal: number
    taxRate: number
    taxAmount: number
    total: number
}

/**
 * Tax page handles fiscal compliance, tax configuration viewing, and simulation.
 */
export function Tax() {
  const [configs, setConfigs] = useState<TaxConfig[]>([])
  const [amount, setAmount] = useState<string>("1000")
  const [country, setCountry] = useState<string>("JO")
  const [result, setResult] = useState<TaxResult | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
      try {
        const res = await GetTaxConfig()
        setConfigs(res || [])
      } catch (err) {
        toast.error("Failed to load tax configurations")
      }
  }

  const handleCalculate = async () => {
    if (!amount || isNaN(parseFloat(amount))) {
        toast.error("Invalid amount")
        return
    }
    
    try {
      const res = await CalculateTax(parseFloat(amount), country)
      setResult(res)
      toast.success("Calculation complete")
    } catch (err) {
      toast.error("Error: " + err)
    }
  }

  const breadcrumbs = [
    { label: "Business" },
    { label: "SENTbridge Tax" }
  ]

  return (
    <div className="space-y-6 fade-in">
      <PageHeader 
        title="SENTbridge" 
        description="Fiscal Compliance, Tax Calculation & Regulatory Ingest"
        icon={Scale}
        breadcrumbs={breadcrumbs}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest italic">
                <Globe className="h-4 w-4 text-erp" /> Active Tax Configurations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="pl-6">Country</TableHead>
                  <TableHead>Default Rate</TableHead>
                  <TableHead className="text-right pr-6">Compliance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {configs.map((c) => (
                  <TableRow key={c.countryCode} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-bold pl-6 text-erp">{c.countryCode}</TableCell>
                    <TableCell className="font-mono text-xs">{(c.defaultRate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-right pr-6">
                        {c.isFiscal ? (
                            <Badge className="bg-erp/10 text-erp hover:bg-erp/20 border-erp/20 text-[10px] font-black uppercase">
                                <ShieldCheck className="h-3 w-3 mr-1" /> Fiscal (ZATCA/Jo)
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold">Standard</Badge>
                        )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest italic">
                <Calculator className="h-4 w-4 text-purple-500" /> Tax Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Base Amount</label>
                    <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">$</span>
                        <Input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="font-mono text-xl font-black bg-muted/30 border-none pl-7 h-11" 
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Jurisdiction</label>
                    <Select value={country} onValueChange={setCountry}>
                        <SelectTrigger className="bg-muted/30 border-none h-11 font-bold">
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="JO">Jordan (JO)</SelectItem>
                            <SelectItem value="SA">Saudi Arabia (SA)</SelectItem>
                            <SelectItem value="AE">UAE (AE)</SelectItem>
                            <SelectItem value="US">United States (US)</SelectItem>
                            <SelectItem value="GB">United Kingdom (GB)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Button className="w-full gap-2 bg-erp hover:bg-erp/90 h-12 font-black uppercase tracking-widest text-white shadow-lg shadow-erp/20 transition-all active:scale-95" onClick={handleCalculate}>
                <Scale className="h-4 w-4" /> Calculate Authoritative Tax
            </Button>

            {result && (
                <div className="mt-6 p-6 rounded-xl bg-muted/20 border-2 border-dashed border-muted-foreground/20 space-y-4 relative group animate-in zoom-in-95 duration-300">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                    </Button>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-black uppercase tracking-widest">Subtotal</span>
                        <span className="font-mono font-bold">${result.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-black uppercase tracking-widest">Calculated Tax ({(result.taxRate * 100).toFixed(0)}%)</span>
                        <span className="font-mono text-red-500 font-bold">+${result.taxAmount.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-muted-foreground/10" />
                    <div className="flex justify-between items-center font-black text-2xl tracking-tighter italic">
                        <span>ESTIMATED TOTAL</span>
                        <span className="text-erp">${result.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
