import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  Bell,
  LogOut,
  Settings as SettingsIcon,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logout } from "../../../wailsjs/go/auth/AuthBridge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppStore } from "@/store/useAppStore";

interface TopBarProps {
  onMenuClick?: () => void;
}

/**
 * TopBar component displays the global header.
 * It includes the search bar, notifications, and user profile menu.
 */
export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout } = useAppStore();

  const handleLogout = async () => {
    try {
      await Logout();
      logout();
      // Force reload to clear any residual Wails/Go state if necessary
      window.location.reload();
    } catch (err) {
      console.error("Logout failed:", err);
      toast.error("Failed to logout");
    }
  };

  const getInitials = () => {
    if (!user) return "??";
    if (user.given_name && user.family_name)
      return `${user.given_name[0]}${user.family_name[0]}`.toUpperCase();
    // Fallback for non-standard OIDC claims
    if (user.firstName && user.lastName)
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    if (user.name) return user.name.substring(0, 2).toUpperCase();
    return "U";
  };

  const getName = () => {
    if (!user) return "Guest";
    if (user.given_name) return `${user.given_name} ${user.family_name}`;
    if (user.firstName) return `${user.firstName} ${user.lastName}`;
    return user.name;
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 -ml-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-muted-foreground bg-muted/50 font-normal"
          onClick={() => {
            // Trigger Omnibar via keyboard event since we don't have direct access to its state here
            // but Cmd+K is the standard way.
            const e = new KeyboardEvent("keydown", {
              key: "k",
              metaKey: true,
              ctrlKey: true,
            });
            document.dispatchEvent(e);
          }}
        >
          <Search className="mr-2 h-4 w-4" />
          <span>Search ecosystem...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <NotificationDialog />
        <SettingsDialog />

        <div className="flex items-center space-x-3 border-l pl-4 ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-none">{getName()}</p>
            <p className="text-xs text-muted-foreground">
              {user?.email || "..."}
            </p>
          </div>

          <Avatar className="h-9 w-9 border cursor-pointer hover:ring-2 hover:ring-ring transition-all">
            <AvatarImage src={user?.picture} alt="User" />
            <AvatarFallback className="bg-blue-600 text-white font-bold">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            title="Logout"
            className="text-muted-foreground hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

function NotificationDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notifications</DialogTitle>
          <DialogDescription>System alerts and messages.</DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-bold">System Update</p>
            <p className="text-muted-foreground">Kernel updated to v1.4.2</p>
          </div>
          <div className="p-3 bg-muted rounded-md text-sm">
            <p className="font-bold">Backup Complete</p>
            <p className="text-muted-foreground">
              Vault backup finished successfully.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Preferences and configurations.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button variant="outline" className="justify-start">
            Appearance
          </Button>
          <Button variant="outline" className="justify-start">
            Account
          </Button>
          <Button variant="outline" className="justify-start">
            Keybindings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
