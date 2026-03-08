import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, LinkIcon, ClipboardList, Settings, X, Briefcase, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = true, onClose }: SidebarProps) => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Submit Jobs", path: "/submit-jobs", icon: LinkIcon },
    { name: "Applications", path: "/applications", icon: ClipboardList },
    { name: "Profile", path: "/profile", icon: User },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="p-2 bg-primary rounded-xl">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">LinkedIn Agent</span>
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-medium",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs font-medium text-primary">Private Build v0.1</p>
            <p className="text-xs text-muted-foreground mt-0.5">by Richard Ogundele</p>
          </div>
        </div>
      </aside>
    </>
  );
};
