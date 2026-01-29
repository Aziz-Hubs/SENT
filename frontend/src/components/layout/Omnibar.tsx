import React, { useEffect, useState } from "react"
import { Command } from "cmdk"
import { 
  Search, 
  User, 
  Ticket, 
  Cpu, 
  Shield, 
  Video, 
  FileText, 
  Activity,
  History,
  Settings,
  Wallet,
  Package,
  Landmark,
  ShieldAlert,
  ShoppingCart
} from "lucide-react"
import { useAppStore } from "@/store/useAppStore"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function Omnibar() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { setDivision } = useAppStore()

  // Simulated search results for SENT Ecosystem
  const results = search ? [
    { id: 1, type: "Employee", title: "Aziz", sub: "Lead Architect", app: "people", icon: User },
    { id: 2, type: "Ticket", title: "Network Delay in Floor 4", sub: "#T-402 - Open", app: "pilot", icon: Ticket },
    { id: 3, type: "Asset", title: "Aziz MacBook Pro", sub: "192.168.1.45", app: "nexus", icon: Shield },
    { id: 4, type: "Invoice", title: "INV-42420", sub: "$2,500.00 - Gold Master Corp", app: "erp", icon: Landmark },
    { id: 5, type: "Product", title: "SENT-CORE-NODE", sub: "Stock: 42 - Aisle 4", app: "stock", icon: Package },
    // Verification case for XSS payload
    { id: 6, type: "Invoice", title: "<script>alert('XSS')</script> Payload", sub: "Adversarial Test Case", app: "erp", icon: ShieldAlert },
  ].filter(r => r.title.toLowerCase().includes(search.toLowerCase())) : []

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    setSearch("")
    command()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border-none max-w-2xl bg-transparent">
        <Command className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-popover/95 backdrop-blur-md text-popover-foreground border shadow-2xl">
          <div className="flex items-center border-b px-4 py-2">
            <Search className="mr-3 h-5 w-5 shrink-0 opacity-50 text-primary" />
            <Command.Input 
              placeholder="Search Employees, Assets, or Tickets (Cmd+K)..." 
              value={search}
              onValueChange={setSearch}
              className="flex h-12 w-full rounded-md bg-transparent py-3 text-lg outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[450px] overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
            {search && results.length > 0 && (
              <Command.Group heading="Global Results">
                {results.map((res) => (
                  <Command.Item
                    key={res.id}
                    onSelect={() => runCommand(() => setDivision(res.app as any))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <res.icon className="h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{res.title}</span>
                      <span className="text-[10px] opacity-70">{res.type} • {res.sub}</span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}

            {!search && (
              <>
                <Command.Group heading="Infrastructure (MSP)">
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("pulse"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Activity className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTpulse</span>
                        <span className="text-[10px] opacity-70">Real-time RMM & Telemetry Ingest</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("nexus"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Shield className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTnexus</span>
                        <span className="text-[10px] opacity-70">Documentation, Asset Graph & Vault</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("optic"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Video className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENToptic</span>
                        <span className="text-[10px] opacity-70">NVR Surveillance & AI Inference</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("grid"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Cpu className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTgrid</span>
                        <span className="text-[10px] opacity-70">Network Orchestration & Automation</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("pilot"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Ticket className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTpilot</span>
                        <span className="text-[10px] opacity-70">ITSM Cockpit & Professional Services</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("horizon"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Activity className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENThorizon</span>
                        <span className="text-[10px] opacity-70">vCIO Strategy & Budget Roadmaps</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("control"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Shield className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTcontrol</span>
                        <span className="text-[10px] opacity-70">SaaS Management & License Optimization</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("wave"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Activity className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTwave</span>
                        <span className="text-[10px] opacity-70">Cloud VoIP & SIP Communications</span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="my-2" />

                <Command.Group heading="Business (ERP)">
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("people"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <User className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTpeople</span>
                        <span className="text-[10px] opacity-70">HRIS, Payroll & Succession Planning</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("erp"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Landmark className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTcapital</span>
                        <span className="text-[10px] opacity-70">General Ledger & Financial Operations</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("stock"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Package className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTstock</span>
                        <span className="text-[10px] opacity-70">Inventory Control & Warehouse Management</span>
                    </div>
                  </Command.Item>
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("kiosk"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <div className="flex flex-col">
                        <span className="font-semibold">SENTkiosk</span>
                        <span className="text-[10px] opacity-70">Point of Sale & Retail Interface</span>
                    </div>
                  </Command.Item>
                </Command.Group>

                <Command.Separator className="my-2" />

                <Command.Group heading="Settings & Admin">
                  <Command.Item 
                    onSelect={() => runCommand(() => setDivision("admin"))}
                    className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Global System Configuration</span>
                  </Command.Item>
                  <Command.Item className="flex cursor-pointer select-none items-center rounded-lg px-3 py-2.5 text-sm outline-none aria-selected:bg-primary aria-selected:text-primary-foreground transition-all gap-3">
                    <History className="h-4 w-4" />
                    <span>Ecosystem Audit Logs</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>
          
          <div className="flex items-center justify-between border-t px-4 py-2 text-[10px] text-muted-foreground bg-muted/30">
            <div className="flex gap-4">
                <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border shadow-sm font-sans">↑↓</kbd> Navigate</span>
                <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border shadow-sm font-sans">Enter</kbd> Select</span>
            </div>
            <span className="flex items-center gap-1"><kbd className="px-1 bg-muted rounded border shadow-sm font-sans">Esc</kbd> Close</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
