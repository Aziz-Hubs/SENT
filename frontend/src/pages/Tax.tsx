import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GetTaxConfig, GetTaxSummary } from "../../wailsjs/go/tax/TaxBridge";
import {
  Scale,
  ShieldCheck,
  Globe,
  FileText,
  Lock,
  Unlock,
  ChevronRight,
  Info,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface TaxConfig {
  countryCode: string;
  defaultRate: number;
  isFiscal: boolean;
}

interface TaxBox {
  id: string;
  label: string;
  description: string;
  amount: number;
  category: "output" | "input" | "adjustment" | "total";
}

interface Transaction {
  id: string;
  date: string;
  reference: string;
  entity: string;
  amount: number;
  taxAmount: number;
  taxCode: string;
}

const MOCK_TRANSACTIONS: Record<string, Transaction[]> = {
  box1: [
    {
      id: "TX-1001",
      date: "2026-01-15",
      reference: "INV-2026-001",
      entity: "Acme Corp",
      amount: 10000,
      taxAmount: 1600,
      taxCode: "JO-S16",
    },
    {
      id: "TX-1002",
      date: "2026-01-18",
      reference: "INV-2026-002",
      entity: "Global Tech",
      amount: 5000,
      taxAmount: 800,
      taxCode: "JO-S16",
    },
    {
      id: "TX-1003",
      date: "2026-02-05",
      reference: "INV-2026-015",
      entity: "Retail Giant",
      amount: 25000,
      taxAmount: 4000,
      taxCode: "JO-S16",
    },
  ],
  box4: [
    {
      id: "TX-2001",
      date: "2026-01-10",
      reference: "PUR-2026-005",
      entity: "Server Provider",
      amount: 2000,
      taxAmount: 320,
      taxCode: "JO-P16",
    },
    {
      id: "TX-2002",
      date: "2026-02-12",
      reference: "PUR-2026-012",
      entity: "Office Supplies",
      amount: 500,
      taxAmount: 80,
      taxCode: "JO-P16",
    },
  ],
};

export function Tax() {
  const [configs, setConfigs] = useState<TaxConfig[]>([]);
  const [period, setPeriod] = useState("2026-Q1");
  const [status, setStatus] = useState<"open" | "locked" | "filed">("open");
  const [selectedBox, setSelectedBox] = useState<TaxBox | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);

  const fetchSummary = async () => {
    try {
      const res = await GetTaxSummary(period);
      setSummary(res);
    } catch (err) {
      console.error("Failed to load tax summary:", err);
    }
  };

  useEffect(() => {
    fetchConfigs();
    fetchSummary();
  }, [period]);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const res = await GetTaxConfig();
      setConfigs(res || []);
    } catch (err) {
      toast.error("Failed to load tax configurations");
    } finally {
      setLoading(false);
    }
  };

  const boxes: TaxBox[] = [
    {
      id: "box1",
      label: "Box 1",
      description: "Tax due in this period on sales and other outputs",
      amount: summary?.box1 || 0,
      category: "output",
    },
    {
      id: "box2",
      label: "Box 2",
      description: "Tax due on acquisitions from other jurisdictions",
      amount: 0.0,
      category: "output",
    },
    {
      id: "box3",
      label: "Box 3",
      description: "Total output tax (Box 1 + Box 2)",
      amount: summary?.box1 || 0,
      category: "total",
    },
    {
      id: "box4",
      label: "Box 4",
      description: "VAT reclaimed in this period on purchases and other inputs",
      amount: summary?.box4 || 0,
      category: "input",
    },
    {
      id: "box5",
      label: "Box 5",
      description:
        "Net tax to be paid to or (reclaimed from) the tax authority",
      amount: summary?.box5 || 0,
      category: "total",
    },
  ];

  const handleLock = () => {
    setStatus("locked");
    toast.info("Period locked. Transactions in this period are now immutable.");
  };

  const handleFile = () => {
    setStatus("filed");
    toast.success(
      "Tax Return Filed Successfully. Token: SENT-VAT-2026-Q1-99812",
    );
  };

  const breadcrumbs = [
    { label: "Systems" },
    { label: "SENTtax" },
    { label: "Compliance Center" },
  ];

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto pb-20">
      <PageHeader
        title="Compliance Center"
        description="Regulatory reporting, period locking, and automated tax filing."
        icon={ShieldCheck}
        breadcrumbs={breadcrumbs}
      />

      {loading ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-full rounded-xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="lg:col-span-2 h-[600px] rounded-xl" />
            <div className="space-y-6">
              <Skeleton className="h-40 rounded-xl" />
              <Skeleton className="h-60 rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-muted/30 p-4 rounded-xl border border-muted-foreground/10">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[180px] bg-background border-none shadow-sm font-bold">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025-Q4">2025 Q4</SelectItem>
                    <SelectItem value="2026-Q1">2026 Q1</SelectItem>
                    <SelectItem value="2026-Q2">2026 Q2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md shadow-sm border border-muted-foreground/5">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">
                  Status:
                </span>
                {status === "open" && (
                  <Badge
                    variant="outline"
                    className="text-blue-500 border-blue-500/20 bg-blue-500/5 gap-1"
                  >
                    <Unlock className="h-3 w-3" /> OPEN
                  </Badge>
                )}
                {status === "locked" && (
                  <Badge
                    variant="outline"
                    className="text-amber-500 border-amber-500/20 bg-amber-500/5 gap-1"
                  >
                    <Lock className="h-3 w-3" /> LOCKED
                  </Badge>
                )}
                {status === "filed" && (
                  <Badge
                    variant="outline"
                    className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" /> FILED
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {status === "open" && (
                <Button
                  variant="outline"
                  className="gap-2 font-bold uppercase text-[10px] tracking-widest bg-background"
                  onClick={handleLock}
                >
                  <Lock className="h-3 w-3" /> Lock Transactions
                </Button>
              )}
              {status === "locked" && (
                <Button
                  className="gap-2 font-bold uppercase text-[10px] tracking-widest bg-erp hover:bg-erp/90"
                  onClick={handleFile}
                >
                  <FileText className="h-3 w-3" /> Submit Digital Return
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => window.print()}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form Skeuomorphism */}
            <div className="lg:col-span-2 space-y-6">
              <div
                className={`paper-form p-8 relative overflow-hidden ${status === "filed" ? "opacity-90 saturate-[0.8]" : ""}`}
              >
                {status === "filed" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03] -rotate-12">
                    <span className="text-[120px] font-black tracking-tighter border-20 border-black p-10 uppercase">
                      ARCHIVED - FILED
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-start mb-12">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic tracking-tighter text-erp">
                      SENTtax FORM VAT-100
                    </h2>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Digital Tax Compliance Declaration
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase">
                      Period: {period}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      HASH: 0xFD...221B
                    </p>
                  </div>
                </div>

                <div className="space-y-px border-t border-l border-black/10 dark:border-white/10">
                  {boxes.map((box) => (
                    <div
                      key={box.id}
                      className={`group flex items-stretch hover:bg-erp/5 transition-colors cursor-pointer ${box.category === "total" ? "bg-muted/30 font-bold" : ""}`}
                      onClick={() => setSelectedBox(box)}
                    >
                      <div className="w-20 audit-cell text-xs font-black flex items-center justify-center bg-muted/20">
                        {box.label}
                      </div>
                      <div className="flex-1 audit-cell py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-xs font-black uppercase tracking-tight">
                              {box.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground italic leading-tight">
                              Regulatory Ref: VAT-2024-SEC-{box.id.slice(-1)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 pr-4">
                            <span className="mono-audit text-lg font-bold">
                              ${" "}
                              {box.amount.toLocaleString(undefined, {
                                minimumFractionDigits: 4,
                                maximumFractionDigits: 4,
                              })}
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex justify-between items-end border-t-4 border-erp pt-6">
                  <div className="max-w-[300px] space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest block">
                        Authorized Signature
                      </label>
                      <div className="h-10 border-b border-black/20 italic font-serif text-lg pt-1 bg-transparent">
                        SentBot Automata (AI-01)
                      </div>
                    </div>
                    <div className="p-3 bg-muted/50 rounded text-[10px] leading-relaxed text-muted-foreground border-l-2 border-erp">
                      <p>
                        I declare that the information given above is true and
                        complete. A full audit trail for all{" "}
                        {boxes[4].amount > 0 ? "reclamations" : "payments"} is
                        available in the SENTledger.
                      </p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                      Calculated Net Payable
                    </p>
                    <p className="text-4xl font-black italic tracking-tighter text-erp mono-audit">
                      ${" "}
                      {boxes[4].amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Configs & Tools */}
            <div className="space-y-6">
              <Card className="border-none shadow-xl overflow-hidden bg-muted/20">
                <CardHeader className="bg-muted/40 border-b">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <Globe className="h-3 w-3 text-erp" /> Active Tax
                    Jurisdictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableBody>
                      {configs.map((c) => (
                        <TableRow
                          key={c.countryCode}
                          className="hover:bg-muted/30 border-none transition-colors"
                        >
                          <TableCell className="font-bold pl-6 text-erp">
                            {c.countryCode}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {(c.defaultRate * 100).toFixed(0)}% Rate
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            {c.isFiscal && (
                              <Badge className="bg-erp/10 text-erp border-erp/20 text-[8px] font-black h-5">
                                ZATCA/JO
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-muted/20 overflow-hidden">
                <CardHeader className="bg-muted/40 border-b">
                  <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                    <AlertCircle className="h-3 w-3 text-amber-500" />{" "}
                    Compliance Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-erp mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black uppercase">
                        Ledger Reconciliation
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        All journal entries for Q1 are matched to tax codes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-erp mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black uppercase">
                        Exchange Rate Sync
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        OANDA Daily averages synced for non-base currencies.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 grayscale opacity-50">
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-black uppercase">
                        Digital Certificate
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Awaiting ZATCA Phase 2 E-Invoicing Signature.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-6 rounded-xl bg-erp/5 border-2 border-dashed border-erp/20 space-y-3">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-erp" />
                  <h4 className="text-xs font-black uppercase tracking-widest">
                    Auditor's Note
                  </h4>
                </div>
                <p className="text-[10px] leading-relaxed italic text-muted-foreground font-medium">
                  The "Audit Trail" is maintained at the transaction level.
                  Clicking any cell in the VAT-100 form will expose the
                  underlying Ledger entries, showing the exact Timestamp,
                  Invoice ID, and calculated VAT at the 4-decimal level.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Drill Down Sheet */}
      <Sheet
        open={!!selectedBox}
        onOpenChange={(open) => !open && setSelectedBox(null)}
      >
        <SheetContent
          side="right"
          className="sm:max-w-2xl bg-background border-l-2 p-0 flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b bg-muted/10">
            <SheetHeader className="space-y-1">
              <div className="flex justify-between items-start">
                <Badge
                  variant="outline"
                  className="text-erp border-erp/20 uppercase font-black text-[10px] mb-2"
                >
                  Audit Trail: {selectedBox?.label}
                </Badge>
                <span className="mono-audit font-bold text-erp">
                  $
                  {selectedBox?.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              <SheetTitle className="text-xl font-black italic tracking-tighter leading-tight">
                {selectedBox?.description}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Verifying constituent ledger entries for period {period}.
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search transactions, entities, or references..."
                  className="pl-9 h-9 text-xs border-muted-foreground/20 rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 px-3 gap-2">
                <FileText className="h-3.5 w-3.5" /> Export Manifest
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-0">
            <Table>
              <TableHeader className="bg-muted/50 sticky top-0 z-10 border-b">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-[10px] font-black uppercase py-2 pl-6">
                    Reference
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase py-2">
                    Entity
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase py-2 text-right">
                    Tax Code
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase py-2 text-right">
                    Base Amt
                  </TableHead>
                  <TableHead className="text-[10px] font-black uppercase py-2 text-right pr-6">
                    VAT (16%)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_TRANSACTIONS[selectedBox?.id || ""] ? (
                  MOCK_TRANSACTIONS[selectedBox?.id || ""]
                    .filter(
                      (tx) =>
                        tx.reference
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        tx.entity
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                    )
                    .map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="hover:bg-muted/30 transition-colors border-b/5 cursor-default"
                      >
                        <TableCell className="pl-6">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold">{tx.reference}</p>
                            <p className="text-[9px] text-muted-foreground mono-audit">
                              {tx.date}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-medium">
                          {tx.entity}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="secondary"
                            className="text-[8px] font-black font-mono px-1.5 h-4"
                          >
                            {tx.taxCode}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right mono-audit text-xs">
                          ${tx.amount.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right pr-6 mono-audit text-xs font-bold text-erp">
                          ${tx.taxAmount.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 opacity-50">
                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs font-medium">
                          No ledger entries found for this box in {period}.
                        </p>
                        <p className="text-[10px]">
                          Ensure all journal entries are appropriately tagged.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 border-t bg-muted/5 flex justify-between items-center text-[10px]">
            <div className="flex gap-4">
              <span className="text-muted-foreground font-black uppercase">
                Total Records:{" "}
                <span className="text-foreground">
                  {MOCK_TRANSACTIONS[selectedBox?.id || ""]?.length || 0}
                </span>
              </span>
              <span className="text-muted-foreground font-black uppercase">
                Verified: <span className="text-erp font-bold">100%</span>
              </span>
            </div>
            <p className="text-muted-foreground font-mono">
              ID: {selectedBox?.id.toUpperCase()}-0xBF22
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
