import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Box,
  SunIcon,
  Factory,
  Clock,
  FileText,
  Settings,
  Zap,
} from "lucide-react";

type SidebarLink = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

export default function Sidebar() {
  const [location] = useLocation();

  const links: SidebarLink[] = [
    {
      href: "/",
      label: "Dashboard",
      icon: <BarChart3 className="h-5 w-5 mr-3" />,
    },
    {
      href: "/engines",
      label: "Engine Management",
      icon: <Box className="h-5 w-5 mr-3" />,
    },
    {
      href: "/solar",
      label: "Solar Production",
      icon: <SunIcon className="h-5 w-5 mr-3" />,
    },
    {
      href: "/consumption",
      label: "Consumption",
      icon: <Factory className="h-5 w-5 mr-3" />,
    },
    {
      href: "/simulation",
      label: "Simulation",
      icon: <Clock className="h-5 w-5 mr-3" />,
    },
    {
      href: "/reports",
      label: "Reports",
      icon: <FileText className="h-5 w-5 mr-3" />,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-border-color flex flex-col">
      <div className="p-4 border-b border-border-color">
        <h1 className="text-xl font-semibold text-neutral flex items-center">
          <Zap className="h-6 w-6 mr-2 text-primary" />
          Energy Station
        </h1>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              <a
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md",
                  location === link.href
                    ? "bg-primary text-white"
                    : "text-neutral hover:bg-bg-light"
                )}
              >
                {link.icon}
                {link.label}
              </a>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-border-color">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            AD
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-neutral">Admin User</p>
            <p className="text-xs text-neutral-light">Operations Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
