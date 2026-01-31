import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { PrimarySidebar } from "./PrimarySidebar";
import { TopBar } from "./TopBar";
import { Omnibar } from "./Omnibar";

interface MasterLayoutProps {
  children: React.ReactNode;
  activeDivision: string;
  onDivisionChange: (division: string) => void;
  contextSidebar?: React.ReactNode;
}

export function MasterLayout({
  children,
  activeDivision,
  onDivisionChange,
  contextSidebar,
}: MasterLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/20">
      <Omnibar />

      {/* Tier 1: Primary Sidebar (Slim) */}
      <PrimarySidebar />

      {/* Tier 2: Secondary Sidebar (Contextual) */}
      <Sidebar
        activeDivision={activeDivision}
        onDivisionChange={(div) => {
          onDivisionChange(div);
          setMobileMenuOpen(false);
        }}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div className="flex flex-1 overflow-hidden min-w-0 relative">
          <main className="flex-1 overflow-y-auto p-8 bg-muted/30 dark:bg-muted/10 scroll-smooth min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDivision}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="min-h-full max-w-[1600px] mx-auto"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {contextSidebar && (
            <aside className="w-80 border-l border-white/5 bg-black/20 backdrop-blur-md overflow-y-auto">
              {contextSidebar}
            </aside>
          )}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
