"use client";

import { Bell, Menu, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  className?: string;
}

export function Header({ onMenuClick, title, className }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className={cn("sticky top-0 z-30 flex h-[50px] items-center gap-4 px-6", className)}>
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1">
        {title && (
          <h1 className="text-lg font-semibold text-white">{title}</h1>
        )}
      </div>

       <button className="relative rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#fd6401] ring-2 ring-[#050914]" />
      </button>

      <div className="flex items-center gap-3 border-l border-white/10 pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0d1a35] to-[#071124] text-sm font-medium text-[#fd6401] ring-1 ring-white/10">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden text-sm sm:block">
          <p className="font-medium text-white/90">{user?.user_metadata?.name as string}</p>
          <p className="text-xs text-white/40">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}