"use client";

import { useState } from "react";
import {
  Bell,
  CheckCheck,
  FileText,
  Menu,
  Package,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileNav } from "@/contexts/MobileNavContext";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/types";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  className?: string;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "agora mesmo";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} hora${hours > 1 ? "s" : ""}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days > 1 ? "s" : ""}`;
  return new Date(iso).toLocaleDateString("pt-BR");
}

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  const iconMap = {
    order: Package,
    maintenance: Wrench,
    system: FileText,
  };
  const Icon = iconMap[type] ?? FileText;
  return <Icon className="h-4 w-4" />;
}

export function Header({ title, className }: HeaderProps) {
  const { user } = useAuth();
  const { toggle } = useMobileNav();
  const { notifications, unreadCount, refresh, markAllRead } = useNotifications();
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className={cn("sticky top-0 z-30 flex min-h-[56px] items-center gap-3 px-4 sm:px-6", className)}>
      <button
        onClick={toggle}
        aria-label="Abrir menu"
        className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="min-w-0 flex-1">
        {title && (
          <h1 className="truncate text-base font-semibold text-white sm:text-lg">{title}</h1>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => {
            refresh();
            setNotificationsOpen((current) => !current);
          }}
          aria-label="Notificações"
          className="relative rounded-lg p-2 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#fd6401] px-1 text-[10px] font-semibold text-white ring-2 ring-[#050914]">
              {unreadCount}
            </span>
          )}
        </button>

        {notificationsOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setNotificationsOpen(false)}
            />
            <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0a1120]/95 shadow-2xl shadow-black/50 backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <h3 className="text-sm font-semibold text-white">
                  Notificações
                </h3>
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-xs font-medium text-[#fd6401] transition hover:text-[#ff7b24]"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Marcar todas
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-white/40">
                    Nenhuma notificação
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 border-b border-white/5 px-4 py-3 transition hover:bg-white/5"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[#fd6401] ring-1 ring-white/10">
                        <NotificationIcon type={notification.type} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">
                          {notification.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-5 text-white/45">
                          {notification.description}
                        </p>
                        <p className="mt-1 text-[11px] text-white/30">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>

                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#fd6401]" />
                      )}
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 p-2">
                <button className="w-full rounded-xl px-3 py-2 text-center text-xs font-medium text-white/60 transition hover:bg-white/5 hover:text-white">
                  Ver todas
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="flex min-w-0 items-center gap-3 border-l border-white/10 pl-3 sm:pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#0d1a35] to-[#071124] text-sm font-medium text-[#fd6401] ring-1 ring-white/10">
          {user?.email?.charAt(0).toUpperCase()}
        </div>
        <div className="hidden min-w-0 text-sm sm:block">
          <p className="truncate font-medium text-white/90">{user?.user_metadata?.name as string}</p>
          <p className="max-w-[180px] truncate text-xs text-white/40">{user?.email}</p>
        </div>
      </div>
    </header>
  );
}
