import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

interface TopBarProps {
  onMenuClick?: () => void;
}

export const TopBar = ({ onMenuClick }: TopBarProps) => {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 left-0 lg:left-64 right-0 h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 z-40">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden touch-target"
        onClick={onMenuClick}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex items-center gap-2 lg:gap-3 ml-auto">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2 touch-target">
                <User className="h-4 w-4" />
                <span className="max-w-[100px] lg:max-w-[150px] truncate hidden sm:inline">
                  {user.email}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover backdrop-blur-sm shadow-lg border-border z-50 min-w-[200px]">
              <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            variant="default" 
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold transition-smooth touch-target"
            asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        )}
      </div>
    </header>
  );
};
