
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart3, 
  Mic, 
  Users, 
  Settings, 
  LogOut, 
  Home, 
  Headphones 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/user";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "./ThemeToggle";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <Home className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.COACH, UserRole.AGENT],
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.COACH, UserRole.AGENT],
    },
    {
      title: "Voice Analysis",
      href: "/voice-analysis",
      icon: <Mic className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.COACH, UserRole.AGENT],
    },
    {
      title: "Live Monitoring",
      href: "/monitoring",
      icon: <Headphones className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN, UserRole.TEAM_LEADER, UserRole.COACH],
    },
    {
      title: "Users",
      href: "/users",
      icon: <Users className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN, UserRole.TEAM_LEADER],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      allowedRoles: [UserRole.ADMIN],
    },
  ];
  
  // Filter items based on user role
  const filteredItems = navigationItems.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );

  return (
    <div className={cn("flex flex-col h-screen border-r", className)}>
      <div className="flex h-16 items-center justify-between px-4 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-vocality-600 flex items-center justify-center">
            <Mic className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-vocality-500 to-vocality-700 bg-clip-text text-transparent">
            Vocality
          </span>
        </Link>
        <ThemeToggle />
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col gap-2 py-2">
          {filteredItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "justify-start gap-2 hover:bg-muted",
                location.pathname === item.href ? "bg-secondary" : "bg-transparent"
              )}
              asChild
            >
              <Link to={item.href}>
                {item.icon}
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      
      <div className="p-4 mt-auto">
        <Separator className="mb-4" />
        {user && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <img 
                  src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} 
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
