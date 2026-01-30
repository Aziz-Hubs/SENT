import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { Omnibar } from "./Omnibar";

interface MasterLayoutProps {
  children: React.ReactNode;

  activeDivision: string;

  onDivisionChange: (division: string) => void;

  contextSidebar?: React.ReactNode;
}

/**

 * MasterLayout provides the main structural framework for the application.

 * It includes the collapsible Sidebar and the persistent TopBar.

 * 

 * @param children - The main content area.

 * @param activeDivision - The currently selected workspace identifier.

 * @param onDivisionChange - Callback to switch workspaces.

 * @param contextSidebar - Optional right-hand sidebar for contextual details.

 */

export function MasterLayout({
  children,
  activeDivision,
  onDivisionChange,
  contextSidebar,
}: MasterLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div
      className="grid h-screen w-full overflow-hidden bg-background text-foreground selection:bg-primary/20 transition-[grid-template-columns] duration-300 ease-in-out"
      style={{
        gridTemplateColumns: sidebarCollapsed ? "auto 1fr" : "auto 1fr",
        gridTemplateRows: "1fr",
      }}
    >
      <Omnibar />

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

      <div className="flex flex-col overflow-hidden min-w-0">
        <TopBar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <div className="flex flex-1 overflow-hidden min-w-0">
          <main className="flex-1 overflow-y-auto p-6 bg-muted/30 dark:bg-muted/10 scroll-smooth min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeDivision}
                initial={{ opacity: 0, y: 10, filter: "blur(5px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="min-h-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>

          {contextSidebar}
        </div>
      </div>
    </div>
  );
}
