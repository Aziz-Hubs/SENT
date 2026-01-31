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
  GetAccounts,
  CreateTransaction,
  ExportTrialBalance,
  ExportProfitLoss,
  GetTransactions,
  ApproveTransaction,
} from "../../wailsjs/go/capital/CapitalBridge";
import {
  Landmark,
  Plus,
  ReceiptText,
  Wallet,
  Trash2,
  Loader2,
  Copy,
  History,
  FileText,
  TrendingUp,
  Users,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  Search,
  Send,
  Printer,
  MoreVertical,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Account, TransactionRequest, TransactionDTO } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAppStore } from "@/store/useAppStore";
import { ContextSidebar } from "@/components/layout/ContextSidebar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Mock Data for Commercial Invoices
const MOCK_INVOICES = [
  {
    id: "INV-2024-001",
    customer: "Acme Corp",
    date: "2014-01-15",
    due: "2024-02-15",
    amount: 12500.0,
    status: "paid",
  },
  {
    id: "INV-2024-002",
    customer: "Globex Inc",
    date: "2014-01-20",
    due: "2024-02-20",
    amount: 4500.5,
    status: "sent",
  },
  {
    id: "INV-2024-003",
    customer: "Soylent Corp",
    date: "2014-01-22",
    due: "2024-02-22",
    amount: 8900.0,
    status: "overdue",
  },
];

export function Capital() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const { setContextSidebar, toggleContext, isContextOpen } = useAppStore();

  const [accountFilter, setAccountFilter] = useState<
    "all" | "asset" | "revenue" | "expense"
  >("all");
  const [selectedTxIds, setSelectedTxIds] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState("coa");

  // Transaction Form State
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState<
    { accountId: string; amount: string; direction: "debit" | "credit" }[]
  >([
    { accountId: "", amount: "", direction: "debit" },
    { accountId: "", amount: "", direction: "credit" },
  ]);

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await GetAccounts();
      setAccounts(res || []);
    } catch (err) {
      toast.error("Failed to load accounts");
    } finally {
      setTimeout(() => setLoading(false), 600);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await GetTransactions();
      setTransactions((res || []) as any);
    } catch (err) {
      toast.error("Failed to load transactions");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const msg = await ApproveTransaction(id);
      toast.success(msg);
      fetchAccounts();
      fetchTransactions();
    } catch (err: any) {
      toast.error("Approval failed: " + err);
    }
  };

  const handleBatchApprove = async () => {
    try {
      if (selectedTxIds.size === 0) return;
      const promises = Array.from(selectedTxIds).map((id) =>
        ApproveTransaction(id),
      );
      await Promise.all(promises);
      toast.success(`Approved ${selectedTxIds.size} transactions`);
      setSelectedTxIds(new Set());
      fetchAccounts();
      fetchTransactions();
    } catch (err: any) {
      toast.error("Batch approval failed: " + err);
    }
  };

  const toggleTxSelection = (id: number) => {
    const newSet = new Set(selectedTxIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedTxIds(newSet);
  };

  const toggleAllTx = (checked: boolean) => {
    if (checked) {
      const pendingIds = transactions
        .filter((t) => t.approval_status === "PENDING")
        .map((t) => t.id);
      setSelectedTxIds(new Set(pendingIds));
    } else {
      setSelectedTxIds(new Set());
    }
  };

  const handleAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setContextSidebar(<AccountDetails account={account} />);
    toggleContext(true);
  };

  const handleDownloadReport = async (type: "tb" | "pl") => {
    try {
      const b64 =
        type === "tb" ? await ExportTrialBalance() : await ExportProfitLoss();
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${b64}`;
      link.download = `SENTcapital_${type}_${new Date().toISOString().split("T")[0]}.pdf`;
      link.click();
      toast.success("Report downloaded");
    } catch (err) {
      toast.error("Export failed: " + err);
    }
  };

  const handleAddEntry = () => {
    setEntries([...entries, { accountId: "", amount: "", direction: "debit" }]);
  };

  const handleRemoveEntry = (index: number) => {
    if (entries.length <= 2) {
      toast.warning("Transaction must have at least 2 entries");
      return;
    }
    const newEntries = [...entries];
    newEntries.splice(index, 1);
    setEntries(newEntries);
  };

  const handleEntryChange = (
    index: number,
    field: keyof (typeof entries)[0],
    value: string,
  ) => {
    const newEntries = [...entries];
    // @ts-ignore
    newEntries[index][field] = value;
    setEntries(newEntries);
  };

  const handleCloneLast = () => {
    setDescription("Monthly Infrastructure Retainer");
    setEntries([
      { accountId: "1", amount: "2500", direction: "debit" },
      { accountId: "2", amount: "2500", direction: "credit" },
    ]);
    toast.info("Template applied");
  };

  const handleSubmit = async () => {
    if (!description) return toast.error("Description required");
    if (entries.some((e) => !e.accountId || !e.amount))
      return toast.error("All fields required");

    const totalDebits = entries
      .filter((e) => e.direction === "debit")
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalCredits = entries
      .filter((e) => e.direction === "credit")
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return toast.error(
        `Unbalanced Entry! Debits: $${totalDebits.toFixed(2)} vs Credits: $${totalCredits.toFixed(2)}`,
      );
    }

    setSubmitting(true);
    try {
      const payload: TransactionRequest = {
        description: description,
        date: new Date().toISOString(),
        entries: entries.map((e) => ({
          account_id: parseInt(e.accountId),
          amount: parseFloat(e.amount),
          direction: e.direction,
        })),
      };

      await CreateTransaction(payload as any);
      toast.success("Transaction posted successfully");
      setIsDialogOpen(false);
      setDescription("");
      setEntries([
        { accountId: "", amount: "", direction: "debit" },
        { accountId: "", amount: "", direction: "credit" },
      ]);
      fetchAccounts();
    } catch (err: any) {
      toast.error("Transaction failed: " + err);
    } finally {
      setSubmitting(false);
    }
  };

  const totalAssets = accounts
    .filter((a) => a.type === "asset")
    .reduce((acc, a) => acc + a.balance, 0);
  const totalRevenue = accounts
    .filter((a) => a.type === "revenue")
    .reduce((acc, a) => acc + a.balance, 0);
  const totalExpense = accounts
    .filter((a) => a.type === "expense")
    .reduce((acc, a) => acc + a.balance, 0);

  const filteredAccounts =
    accountFilter === "all"
      ? accounts
      : accounts.filter((a) => a.type === accountFilter);

  const breadcrumbs = [{ label: "Business" }, { label: "SENTcapital ERP" }];

  if (loading && accounts.length === 0) {
    return (
      <div className="space-y-6 fade-in">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
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
        title="SENTcapital"
        description="Global Financial Operations (ERP)"
        icon={Wallet}
        breadcrumbs={breadcrumbs}
        primaryAction={{
          label: "New Journal Entry",
          icon: Plus,
          onClick: () => setIsDialogOpen(true),
        }}
      >
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 flex-1 sm:flex-none justify-center"
            onClick={() => handleDownloadReport("pl")}
          >
            <FileText className="h-3 w-3" /> P&L
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[10px] uppercase font-black tracking-widest gap-2 flex-1 sm:flex-none justify-center"
            onClick={() => handleDownloadReport("tb")}
          >
            <TrendingUp className="h-3 w-3" /> Trial Balance
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <SummaryCard
          title="TOTAL ASSETS"
          icon={Wallet}
          amount={totalAssets}
          color="text-blue-500"
          onClick={() => {
            setAccountFilter(accountFilter === "asset" ? "all" : "asset");
            setActiveTab("coa");
          }}
          isActive={accountFilter === "asset"}
        />
        <SummaryCard
          title="REVENUE (MTD)"
          icon={Landmark}
          amount={totalRevenue}
          color="text-emerald-500"
          onClick={() => {
            setAccountFilter(accountFilter === "revenue" ? "all" : "revenue");
            setActiveTab("coa");
          }}
          isActive={accountFilter === "revenue"}
        />
        <SummaryCard
          title="EXPENSES (MTD)"
          icon={ReceiptText}
          amount={totalExpense}
          color="text-red-500"
          onClick={() => {
            setAccountFilter(accountFilter === "expense" ? "all" : "expense");
            setActiveTab("coa");
          }}
          isActive={accountFilter === "expense"}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-xl mb-8 mx-auto md:mx-0">
          <TabsTrigger value="coa" className="gap-2">
            <ReceiptText className="h-4 w-4" />
            Chart of Accounts
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <History className="h-4 w-4" />
            General Ledger
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <DollarSign className="h-4 w-4" />
            Commercial
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="coa"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="pl-6 h-9">Code</TableHead>
                    <TableHead className="h-9">Account Name</TableHead>
                    <TableHead className="h-9">Type</TableHead>
                    <TableHead className="text-right pr-6 h-9">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((acc) => (
                    <TableRow
                      key={acc.id}
                      className="hover:bg-muted/50 transition-colors group cursor-pointer"
                      onClick={() => handleAccountClick(acc)}
                    >
                      <TableCell className="font-mono text-primary font-bold pl-6">
                        {acc.number}
                      </TableCell>
                      <TableCell className="font-semibold text-sm">
                        {acc.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="capitalize text-[10px] h-5"
                        >
                          {acc.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-mono font-medium pr-6 text-sm tabular-nums tracking-tight",
                          acc.balance < 0 ? "text-red-500" : "text-primary/90",
                        )}
                      >
                        {acc.balance < 0 ? "-" : ""}$
                        {Math.abs(acc.balance).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="ledger"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          {transactions.length === 0 ? (
            <EmptyState
              icon={History}
              title="Ledger is Empty"
              description="No transactions have been recorded for the current fiscal period. Post a journal entry to start tracking."
              action={{
                label: "Record Transaction",
                onClick: () => setIsDialogOpen(true),
              }}
            />
          ) : (
            <Card className="border-none shadow-md overflow-hidden">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-[50px] pl-6 h-9">
                        <Checkbox
                          onCheckedChange={toggleAllTx}
                          checked={
                            transactions.some(
                              (t) => t.approval_status === "PENDING",
                            ) &&
                            selectedTxIds.size ===
                              transactions.filter(
                                (t) => t.approval_status === "PENDING",
                              ).length
                          }
                        />
                      </TableHead>
                      <TableHead className="h-9">Date</TableHead>
                      <TableHead className="h-9">
                        <div className="flex items-center gap-2">
                          Description
                          {selectedTxIds.size > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleBatchApprove}
                              className="h-6 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all ml-2"
                            >
                              Approve Selected ({selectedTxIds.size})
                            </Button>
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="h-9">Status</TableHead>
                      <TableHead className="text-right h-9">Amount</TableHead>
                      <TableHead className="text-right pr-6 h-9">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className={cn(
                          "hover:bg-muted/50 transition-colors h-10",
                          selectedTxIds.has(tx.id) && "bg-muted/30",
                        )}
                      >
                        <TableCell className="pl-6 py-2">
                          <Checkbox
                            checked={selectedTxIds.has(tx.id)}
                            onCheckedChange={() => toggleTxSelection(tx.id)}
                            disabled={tx.approval_status !== "PENDING"}
                          />
                        </TableCell>
                        <TableCell className="text-xs font-mono py-2 tabular-nums">
                          {new Date(tx.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-semibold text-sm py-2">
                          {tx.description}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            {tx.approval_status === "PENDING" ? (
                              <Badge
                                variant="outline"
                                className="text-amber-500 border-amber-500/20 bg-amber-500/10 gap-1 text-[10px] h-5"
                              >
                                <Clock className="h-3 w-3" /> STAGED
                              </Badge>
                            ) : tx.approval_status === "APPROVED" ? (
                              <Badge
                                variant="outline"
                                className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 gap-1 text-[10px] h-5"
                              >
                                <CheckCircle2 className="h-3 w-3" /> APPROVED
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-red-500 border-red-500/20 bg-red-500/10 gap-1 text-[10px] h-5"
                              >
                                <XCircle className="h-3 w-3" /> REJECTED
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-medium text-sm py-2 tabular-nums tracking-tight">
                          $
                          {tx.total_amount.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell className="text-right pr-6 py-2">
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

        <TabsContent
          value="invoices"
          className="animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <CommercialInvoices />
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[650px] bg-background">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center text-2xl font-black italic tracking-tighter">
              RECORD TRANSACTION
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 text-[10px] font-bold uppercase"
                onClick={handleCloneLast}
              >
                <Copy className="h-3 w-3" /> Clone Last
              </Button>
            </DialogTitle>
            <DialogDescription className="font-medium">
              Post a balanced double-entry transaction to the authoritative
              ledger.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Description / Memo
              </Label>
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
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Ledger Entries
                </Label>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Balance Verification Active
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {entries.map((entry, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-start animate-in fade-in slide-in-from-left-2 duration-300"
                  >
                    <Select
                      value={entry.accountId}
                      onValueChange={(val) =>
                        handleEntryChange(index, "accountId", val)
                      }
                    >
                      <SelectTrigger className="w-[220px] bg-muted/20 border-none h-10 font-medium">
                        <SelectValue placeholder="Select Account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((acc) => (
                          <SelectItem key={acc.id} value={acc.id.toString()}>
                            <span className="font-mono text-[10px] mr-2 opacity-50">
                              {acc.number}
                            </span>{" "}
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={entry.direction}
                      onValueChange={(val) =>
                        handleEntryChange(index, "direction", val as any)
                      }
                    >
                      <SelectTrigger className="w-[110px] bg-muted/20 border-none h-10 font-bold uppercase text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="debit"
                          className="text-blue-600 font-bold"
                        >
                          DEBIT
                        </SelectItem>
                        <SelectItem
                          value="credit"
                          className="text-emerald-600 font-bold"
                        >
                          CREDIT
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={entry.amount}
                        onChange={(e) =>
                          handleEntryChange(index, "amount", e.target.value)
                        }
                        className="pl-6 bg-muted/20 border-none h-10 font-mono font-bold"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveEntry(index)}
                      className="h-10 w-10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleAddEntry}
                className="w-full border-dashed h-10 text-[10px] font-black uppercase tracking-widest"
              >
                <Plus className="h-3 w-3 mr-2" /> Add Ledger Line
              </Button>
            </div>
          </div>

          <DialogFooter className="bg-muted/30 -mx-6 -mb-6 p-6 mt-2 border-t">
            <Button
              variant="ghost"
              onClick={() => setIsDialogOpen(false)}
              className="font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-primary/20"
            >
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="mr-2 h-4 w-4" />
              )}
              Post to Authoritative Ledger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isContextOpen && (
        <ContextSidebar
          isOpen={isContextOpen}
          onClose={() => toggleContext(false)}
          title={
            selectedAccount
              ? `Account ${selectedAccount.number}`
              : "Financial Context"
          }
        >
          {selectedAccount ? (
            <AccountDetails account={selectedAccount} />
          ) : null}
        </ContextSidebar>
      )}
    </div>
  );
}

function AccountDetails({ account }: { account: Account | null }) {
  if (!account) return null;
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">
            {account.number}
          </span>
          <Badge variant="outline" className="capitalize">
            {account.type}
          </Badge>
        </div>
        <h2 className="text-xl font-bold mt-2">{account.name}</h2>
        <div className="text-3xl font-black tracking-tighter mt-2">
          $
          {account.balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
          })}
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
          Linked Context (Phase 3)
        </span>
        <div className="grid gap-2">
          <div
            className="group flex items-center justify-between p-2.5 rounded-lg border bg-muted/20 hover:border-indigo-500/50 transition-colors cursor-pointer"
            onClick={() => toast.info("Deep-linking to Employee Profile")}
          >
            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-indigo-500" />
              <div className="flex flex-col">
                <span className="text-[11px] font-black">
                  Authorized Signatory
                </span>
                <span className="text-[9px] text-muted-foreground">
                  Aziz (Lead Architect)
                </span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  amount,
  trend,
  icon: Icon,
  color,
  onClick,
  isActive,
}: any) {
  return (
    <Card
      className={cn(
        "border-none shadow-sm relative overflow-hidden group cursor-pointer transition-all",
        isActive ? "ring-2 ring-primary" : "hover:shadow-md",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-y-0 pb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={cn("h-4 w-4", color)} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">
            ${(amount || 0).toLocaleString()}
          </div>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-0 w-full h-1 opacity-20",
            color.replace("text", "bg"),
          )}
        />
      </CardContent>
    </Card>
  );
}

function CommercialInvoices() {
  const [invoices] = useState(MOCK_INVOICES);
  const { setContextSidebar, toggleContext } = useAppStore();

  const handleInvoiceClick = (invoice: any) => {
    setContextSidebar(<InvoiceEditor invoice={invoice} />);
    toggleContext(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-500/15 text-emerald-600 border-emerald-200";
      case "overdue":
        return "bg-red-500/15 text-red-600 border-red-200";
      case "sent":
        return "bg-blue-500/15 text-blue-600 border-blue-200";
      default:
        return "bg-slate-500/15 text-slate-600 border-slate-200";
    }
  };

  return (
    <Card className="border-none shadow-md overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">
            Commercial Invoices
          </CardTitle>
          <CardDescription>Billing and Accounts Receivable.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              className="pl-9 h-9 bg-background"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow
                key={inv.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleInvoiceClick(inv)}
              >
                <TableCell className="font-mono font-medium text-primary">
                  {inv.id}
                </TableCell>
                <TableCell className="font-semibold">{inv.customer}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {inv.date}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-sm",
                    inv.status === "overdue"
                      ? "text-red-500 font-bold"
                      : "text-muted-foreground",
                  )}
                >
                  {inv.due}
                </TableCell>
                <TableCell className="text-right font-mono font-medium">
                  $
                  {inv.amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn(
                      "capitalize border",
                      getStatusColor(inv.status),
                    )}
                  >
                    {inv.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function InvoiceEditor({ invoice }: any) {
  if (!invoice) return null;
  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-2 pb-4 border-b">
        <Button size="sm" className="gap-2">
          <Send className="h-3.5 w-3.5" /> Send Invoice
        </Button>
        <Button size="sm" variant="outline" className="gap-2">
          <Printer className="h-3.5 w-3.5" /> Print
        </Button>
      </div>

      <div className="bg-white text-slate-900 rounded-sm shadow-sm border p-8 min-h-[600px] text-sm">
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="h-8 w-8 bg-black rounded-full mb-2" />
            <h3 className="font-bold text-lg">SENTinel Systems</h3>
            <p className="text-slate-500">123 Tech Boulevard</p>
          </div>
          <div className="text-right">
            <h1 className="text-3xl font-light text-slate-300 uppercase tracking-widest mb-2">
              Invoice
            </h1>
            <p className="font-mono font-bold text-lg">{invoice.id}</p>
            <p className="text-slate-500">Date: {invoice.date}</p>
          </div>
        </div>

        <div className="mb-10">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Bill To
          </h4>
          <h3 className="font-bold text-lg">{invoice.customer}</h3>
        </div>

        <div className="flex justify-end">
          <div className="flex justify-between font-bold text-lg w-1/2">
            <span>Total</span>
            <span>
              $
              {invoice.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
