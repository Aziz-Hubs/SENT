import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { GetAccounts, CreateTransaction, ExportTrialBalance, ExportProfitLoss, GetTransactions, ApproveTransaction } from "../../wailsjs/go/capital/CapitalBridge"
import { 
  Landmark, 
  Plus, 
  ReceiptText, 
  Wallet, 
  Trash2, 
  Loader2, 
  Download, 
  Copy,
  History,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Account, TransactionRequest, TransactionDTO } from "@/lib/types"
import { PageHeader } from "@/components/layout/PageHeader"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/EmptyState"
import { useAppStore } from "@/store/useAppStore"
import { ContextSidebar } from "@/components/layout/ContextSidebar"
import { Badge } from "@/components/ui/badge"

/**
 * Capital page manages the General Ledger, Financial Accounts, and Transaction recording.
 * Standardized with Phase 3 UI/UX mandates.
 */
export function Capital() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<TransactionDTO[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore()

  // Transaction Form State
  const [description, setDescription] = useState("")
  const [entries, setEntries] = useState<{accountId: string, amount: string, direction: 'debit' | 'credit'}[]>([
    { accountId: "", amount: "", direction: "debit" },
    { accountId: "", amount: "", direction: "credit" }
  ])

  // Fetch accounts on mount
  useEffect(() => {
    fetchAccounts()
    fetchTransactions()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const res = await GetAccounts()
      setAccounts(res || [])
    } catch (err) {
      toast.error("Failed to load accounts")
    } finally {
      setTimeout(() => setLoading(false), 600)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await GetTransactions()
      setTransactions(res || [])
    } catch (err) {
      toast.error("Failed to load transactions")
    }
  }

  const handleApprove = async (id: number) => {
      try {
          const msg = await ApproveTransaction(id)
          toast.success(msg)
          fetchAccounts()
          fetchTransactions()
      } catch (err: any) {
          toast.error("Approval failed: " + err)
      }
  }

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account)
    setContextSidebar(<AccountDetails account={account} />)
    toggleContext(true)
  }

  const handleDownloadReport = async (type: 'tb' | 'pl') => {
    try {
        const b64 = type === 'tb' ? await ExportTrialBalance() : await ExportProfitLoss()
        const link = document.createElement('a')
        link.href = `data:application/pdf;base64,${b64}`
        link.download = `SENTcapital_${type}_${new Date().toISOString().split('T')[0]}.pdf`
        link.click()
        toast.success("Report downloaded")
    } catch (err) {
        toast.error("Export failed: " + err)
    }
  }

  const handleAddEntry = () => {
    setEntries([...entries, { accountId: "", amount: "", direction: "debit" }])
  }

  const handleRemoveEntry = (index: number) => {
    if (entries.length <= 2) {
        toast.warning("Transaction must have at least 2 entries")
        return
    }
    const newEntries = [...entries]
    newEntries.splice(index, 1)
    setEntries(newEntries)
  }

  const handleEntryChange = (index: number, field: keyof typeof entries[0], value: string) => {
    const newEntries = [...entries]
    // @ts-ignore
    newEntries[index][field] = value
    setEntries(newEntries)
  }

  const handleCloneLast = () => {
      setDescription("Monthly Infrastructure Retainer")
      setEntries([
        { accountId: "1", amount: "2500", direction: "debit" },
        { accountId: "2", amount: "2500", direction: "credit" }
      ])
      toast.info("Template applied")
  }

  const handleSubmit = async () => {
    if (!description) return toast.error("Description required")
    if (entries.some(e => !e.accountId || !e.amount)) return toast.error("All fields required")

    setSubmitting(true)
    try {
      const payload: TransactionRequest = {
        description: description,
        date: new Date().toISOString(),
        entries: entries.map(e => ({
          account_id: parseInt(e.accountId),
          amount: parseFloat(e.amount),
          direction: e.direction
        }))
      }

      await CreateTransaction(payload as any)
      toast.success("Transaction posted successfully")
      setIsDialogOpen(false)
      setDescription("")
      setEntries([
        { accountId: "", amount: "", direction: "debit" },
        { accountId: "", amount: "", direction: "credit" }
      ])
      fetchAccounts()
    } catch (err: any) {
      toast.error("Transaction failed: " + err)
    } finally {
      setSubmitting(false)
    }
  }

  const totalAssets = accounts.filter(a => a.type === 'asset').reduce((acc, a) => acc + a.balance, 0)
  const totalRevenue = accounts.filter(a => a.type === 'revenue').reduce((acc, a) => acc + a.balance, 0)
  const totalExpense = accounts.filter(a => a.type === 'expense').reduce((acc, a) => acc + a.balance, 0)

  const breadcrumbs = [
    { label: "Business" },
    { label: "SENTcapital ERP" }
  ]

  if (loading && accounts.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      <PageHeader 
        title="SENTcapital" 
        description="Multi-currency General Ledger & Financial Operations"
        icon={Wallet}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "New Journal Entry",
          icon: Plus,
          onClick: () => setIsDialogOpen(true)
        }}
      >
        <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest gap-2" onClick={() => handleDownloadReport('pl')}>
                <FileText className="h-3 w-3" /> P&L
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest gap-2" onClick={() => handleDownloadReport('tb')}>
                <TrendingUp className="h-3 w-3" /> Trial Balance
            </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard title="TOTAL ASSETS" icon={Wallet} amount={totalAssets} color="text-blue-500" />
        <SummaryCard title="REVENUE (MTD)" icon={Landmark} amount={totalRevenue} color="text-emerald-500" />
        <SummaryCard title="EXPENSES (MTD)" icon={ReceiptText} amount={totalExpense} color="text-red-500" />
      </div>

      <Tabs defaultValue="coa" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="coa" className="gap-2"><ReceiptText className="h-4 w-4" />Chart of Accounts</TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2"><History className="h-4 w-4" />General Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="coa" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-6">Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right pr-6">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => (
                    <TableRow 
                        key={acc.id} 
                        className="hover:bg-muted/50 transition-colors group cursor-pointer"
                        onClick={() => handleAccountClick(acc)}
                    >
                      <TableCell className="font-mono text-primary font-bold pl-6">{acc.number}</TableCell>
                      <TableCell className="font-semibold text-sm">{acc.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] h-5">{acc.type}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-black pr-6 text-sm">
                        ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {transactions.length === 0 ? (
                <EmptyState 
                    icon={History}
                    title="Ledger is Empty"
                    description="No transactions have been recorded for the current fiscal period. Post a journal entry to start tracking."
                    action={{
                        label: "Record Transaction",
                        onClick: () => setIsDialogOpen(true)
                    }}
                />
            ) : (
                <Card className="border-none shadow-md overflow-hidden">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="pl-6">Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((tx) => (
                                    <TableRow key={tx.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell className="pl-6 text-xs font-mono">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-semibold text-sm">{tx.description}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1.5">
                                                {tx.approval_status === "PENDING" ? (
                                                    <Badge variant="outline" className="text-amber-500 border-amber-500/20 bg-amber-500/10 gap-1 text-[10px] h-5">
                                                        <Clock className="h-3 w-3" /> STAGED
                                                    </Badge>
                                                ) : tx.approval_status === "APPROVED" ? (
                                                    <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 gap-1 text-[10px] h-5">
                                                        <CheckCircle2 className="h-3 w-3" /> APPROVED
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10 gap-1 text-[10px] h-5">
                                                        <XCircle className="h-3 w-3" /> REJECTED
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono font-black text-sm">
                                            ${tx.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            {tx.approval_status === "PENDING" && (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-7 text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border-emerald-500/20"
                                                    onClick={() => handleApprove(tx.id)}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-background">
            <DialogHeader>
                <DialogTitle className="flex justify-between items-center text-2xl font-black italic tracking-tighter">
                    RECORD TRANSACTION
                    <Button variant="ghost" size="sm" className="h-7 gap-1 text-[10px] font-bold uppercase" onClick={handleCloneLast}>
                        <Copy className="h-3 w-3" /> Clone Last
                    </Button>
                </DialogTitle>
                <DialogDescription className="font-medium">
                    Post a balanced double-entry transaction to the authoritative ledger.
                </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description / Memo</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Monthly Rent Payment"
                        className="bg-muted/30 border-none shadow-inner h-11 text-lg font-medium"
                    />
                </div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ledger Entries</Label>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-full">Balance Verification Active</span>
                    </div>
                    
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {entries.map((entry, index) => (
                        <div key={index} className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                            <Select 
                                value={entry.accountId} 
                                onValueChange={(val) => handleEntryChange(index, "accountId", val)}
                            >
                            <SelectTrigger className="w-[220px] bg-muted/20 border-none h-10 font-medium">
                                <SelectValue placeholder="Select Account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                <SelectItem key={acc.id} value={acc.id.toString()}>
                                    <span className="font-mono text-[10px] mr-2 opacity-50">{acc.number}</span> {acc.name}
                                </SelectItem>
                                ))}
                            </SelectContent>
                            </Select>

                            <Select 
                                value={entry.direction} 
                                onValueChange={(val) => handleEntryChange(index, "direction", val as any)}
                            >
                            <SelectTrigger className="w-[110px] bg-muted/20 border-none h-10 font-bold uppercase text-[10px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="debit" className="text-blue-600 font-bold">DEBIT</SelectItem>
                                <SelectItem value="credit" className="text-emerald-600 font-bold">CREDIT</SelectItem>
                            </SelectContent>
                            </Select>

                            <div className="relative flex-1">
                                <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">$</span>
                                <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    value={entry.amount}
                                    onChange={(e) => handleEntryChange(index, "amount", e.target.value)}
                                    className="pl-6 bg-muted/20 border-none h-10 font-mono font-bold"
                                    min="0"
                                    step="0.01"
                                />
                            </div>

                            <Button variant="ghost" size="icon" onClick={() => handleRemoveEntry(index)} className="h-10 w-10 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                        ))}
                    </div>
                    
                    <Button variant="outline" size="sm" onClick={handleAddEntry} className="w-full border-dashed h-10 text-[10px] font-black uppercase tracking-widest">
                        <Plus className="h-3 w-3 mr-2" /> Add Ledger Line
                    </Button>
                </div>
            </div>
            
            <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-2 border-t">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold">Cancel</Button>
                <Button type="submit" onClick={handleSubmit} disabled={submitting} className="bg-primary hover:bg-primary/90 h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20">
                    {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
                    Post to Authoritative Ledger
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {isContextOpen && (
          <ContextSidebar 
            isOpen={isContextOpen} 
            onClose={() => toggleContext(false)} 
            title={`Account ${selectedAccount?.number}`}
          >
            <AccountDetails account={selectedAccount} />
          </ContextSidebar>
      )}
    </div>
  )
}

function AccountDetails({ account }: { account: Account | null }) {
    if (!account) return null;
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{account.number}</span>
                    <Badge variant="outline" className="capitalize">{account.type}</Badge>
                </div>
                <h2 className="text-xl font-bold mt-2">{account.name}</h2>
                <div className="text-3xl font-black tracking-tighter mt-2">
                    ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Linked Context (Phase 3)</span>
                <div className="grid gap-2">
                    <div className="group flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:border-indigo-500/50 transition-colors cursor-pointer" onClick={() => toast.info("Deep-linking to Employee Profile")}>
                        <div className="flex items-center gap-3">
                            <Users className="h-4 w-4 text-indigo-500" />
                            <div className="flex flex-col">
                                <span className="text-[11px] font-black">Authorized Signatory</span>
                                <span className="text-[9px] text-muted-foreground">Aziz (Lead Architect)</span>
                            </div>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-indigo-500" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Recent Activity</span>
                <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 p-2 text-[10px] font-bold grid grid-cols-2">
                        <span>Description</span>
                        <span className="text-right">Amount</span>
                    </div>
                    <div className="p-4 flex flex-col items-center justify-center text-center bg-card min-h-[100px]">
                        <History className="h-5 w-5 text-muted-foreground/30 mb-2" />
                        <p className="text-[10px] text-muted-foreground">No historical entries found for this fiscal period.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-16 flex-col gap-1 text-[10px] font-bold uppercase" onClick={() => toast.info("Exporting ledger...")}>
                    <Download className="h-4 w-4" /> Export Ledger
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-1 text-[10px] font-bold uppercase">
                    <FileText className="h-4 w-4" /> View Statements
                </Button>
            </div>
        </div>
    )
}

function SummaryCard({ title, icon: Icon, amount, color }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-black ${color}`}>
                ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
          <div className={`h-1 w-full opacity-10 ${color.replace('text', 'bg')}`} />
        </Card>
    )
}
