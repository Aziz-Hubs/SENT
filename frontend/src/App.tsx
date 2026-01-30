import { useState, useEffect } from "react";
import { MasterLayout } from "./components/layout/MasterLayout";
import { Dashboard } from "./pages/Dashboard";
import { Capital } from "./pages/Capital";
import { Vault } from "./pages/Vault";
import { Optic } from "./pages/Optic";
import { Stock } from "./pages/Stock";
import { Kiosk } from "./pages/Kiosk";
import { Tax } from "./pages/Tax";
import { Admin } from "./pages/Admin";
import { Pilot } from "./pages/Pilot";
import PulsePage from "./pages/Pulse";
import ControlPage from "./pages/Control";
import PeoplePage from "./pages/PeoplePage";
import EmployeePage from "./pages/EmployeePage";
import GridPage from "./pages/GridPage";
import HorizonPage from "./pages/HorizonPage";
import NexusApp from "./apps/Nexus";
import WaveApp from "./apps/Wave";
import { Login } from "./pages/Login";
import { IsAuthenticated, GetUserProfile } from "../wailsjs/go/auth/AuthBridge";
import { useAppStore } from "./store/useAppStore";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const {
    isAuthenticated,
    setAuth,
    setUser,
    activeDivision,
    setDivision,
    contextContent,
    isContextOpen,
  } = useAppStore();

  useEffect(() => {
    // Audit/Dev Bypass: Expose auth actions to window
    if (import.meta.env.DEV) {
      (window as any).bypassAuth = () => {
        setAuth(true);
        setUser({
          sub: "dev-audit-user",
          name: "Audit Administrator",
          email: "audit@sent.localhost",
          picture: "",
          given_name: "Audit",
          family_name: "Admin",
          tenantId: 1,
          role: "admin",
          seniority: "expert",
        });

        // Ensure window.go.vault exists for audit
        if (!(window as any).go) (window as any).go = {};
        if (!(window as any).go.vault) {
          (window as any).go.vault = {
            VaultBridge: {
              ListFiles: () => Promise.resolve([]),
              SaveFile: () => Promise.resolve(),
              ReadFile: () => Promise.resolve(""),
              CreateFolder: () => Promise.resolve(),
              DeleteFile: () => Promise.resolve(),
            },
          };
        }
      };
    }

    const initKernel = async () => {
      try {
        if (window["go"]) {
          const auth = await IsAuthenticated();
          setAuth(auth);
          if (auth) {
            const profile = await GetUserProfile();
            setUser(profile);
          }
        }
      } catch (err) {
        console.error("Kernel initialization failed", err);
      }
    };
    initKernel();
  }, [setAuth, setUser]);

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setAuth(true)} />;
  }

  const renderContent = () => {
    switch (activeDivision) {
      case "dashboard":
        return <Dashboard />;
      case "erp":
        return <Capital />;
      case "people":
        return <PeoplePage />;
      case "employee":
        return <EmployeePage />;
      case "grid":
        return <GridPage />;
      case "horizon":
        return <HorizonPage />;
      case "vault":
        return <Vault />;
      case "optic":
        return <Optic />;
      case "nexus":
        return <NexusApp />;
      case "wave":
        return <WaveApp />;
      case "stock":
        return <Stock />;
      case "kiosk":
        return <Kiosk />;
      case "tax":
        return <Tax />;
      case "pilot":
        return <Pilot />;
      case "admin":
        return <Admin />;
      case "pulse":
        return <PulsePage />;
      case "control":
        return <ControlPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4 text-center">
            <h2 className="text-2xl font-bold">Division Under Construction</h2>
            <p className="text-muted-foreground max-w-md">
              The {activeDivision.toUpperCase()} workspace is mapped in the SENT
              Ecosystem but has not yet been initialized.
            </p>
          </div>
        );
    }
  };

  return (
    <MasterLayout
      activeDivision={activeDivision}
      onDivisionChange={setDivision}
      contextSidebar={isContextOpen ? contextContent : null}
    >
      {renderContent()}
      <Toaster />
    </MasterLayout>
  );
}

export default App;
