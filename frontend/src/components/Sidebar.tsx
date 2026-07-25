"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus, History, Settings, Activity } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "New Deal", href: "/new-deal", icon: FilePlus },
    { name: "History", href: "/history", icon: History },
    { name: "Workflow", href: "/workflow", icon: Activity },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen border-r border-white/10 glass-panel fixed top-0 left-0 flex flex-col hidden md:flex">
      <div className="p-6">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
          AI Deal Brief
        </h1>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith('/deal') && item.href === '/history');
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" 
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 m-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
            SA
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Senior Analyst</p>
            <p className="text-xs text-slate-400">Enterprise Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
