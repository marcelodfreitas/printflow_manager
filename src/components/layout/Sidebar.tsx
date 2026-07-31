"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Printer,
  Pentagon,
  Package,
  FileText,
  Calculator,
  Boxes,
  LogOut,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileNav } from "@/contexts/MobileNavContext";
import logo from "@/assets/apple-touch-icon.png";

const navSections = [
  {
    title: "GERAL",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "GESTÃO",
    items: [
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/produtos", label: "Produtos", icon: Boxes },
      { href: "/pedidos", label: "Pedidos", icon: Package },
      { href: "/orcamentos", label: "Orçamentos", icon: FileText },
      {
        href: "/calculadora",
        label: "Calculadora de Custos",
        icon: Calculator,
      },
    ],
  },
  {
    title: "PRODUÇÃO",
    items: [
      { href: "/impressoras", label: "Impressoras", icon: Printer },
      { href: "/filamentos", label: "Filamentos", icon: Pentagon },
    ],
  },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function LogoBlock({
  mobile = false,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <div className="border-b border-white/10 px-4 py-3">
      <div className="flex items-center">
        <div className="flex h-12 w-12 items-center justify-center">
  <Image
    src={logo}
    alt="PrintFlow"
    width={44}
    height={44}
    className="object-contain"
  />
</div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-300",
            mobile
              ? "ml-3 flex-1 opacity-100"
              : "ml-0 w-0 opacity-0 group-hover:ml-3 group-hover:w-36 group-hover:opacity-100",
          )}
        >
          <h1 className="whitespace-nowrap text-base font-bold text-white">
            PrintFlow
          </h1>

          <p className="whitespace-nowrap text-xs uppercase tracking-[.25em] text-white/40">
            MANAGER 3D
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

function NavSections({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-3">
      {navSections.map((section) => (
        <div key={section.title} className="mb-4 px-2">
          <p
            className={cn(
              "mb-2 overflow-hidden whitespace-nowrap px-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25",
              !mobile && "opacity-0 transition-opacity group-hover:opacity-100",
            )}
          >
            {section.title}
          </p>

          <div className="space-y-1">
            {section.items.map((item) => {
              const active = isNavItemActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "relative flex items-center rounded-xl transition-all duration-300",
                    mobile ? "h-11 gap-3 px-3 text-sm font-medium" : "h-12",
                    active
                      ? "bg-white/5 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white",
                    mobile &&
                      active &&
                      "bg-[#fd6401] text-white shadow-lg shadow-[#fd6401]/20",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                      active
                        ? "bg-[#fd6401] text-white"
                        : "bg-white/5 text-white/70 group-hover:bg-white/10 group-hover:text-white",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>

                  <span
                    className={cn(
                      "whitespace-nowrap ml-2 transition-all duration-200",
                      !mobile && "opacity-0 group-hover:opacity-100",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function LogoutButton({ mobile = false }: { mobile?: boolean }) {
  const { logout } = useAuth();

  return (
    <div className="border-t border-white/10 p-3">
      <button
        onClick={logout}
        className={cn(
          "flex w-full items-center rounded-xl text-white/60 transition-all hover:bg-red-500/10 hover:text-red-400",
          mobile ? "h-11 gap-3 px-3 text-sm font-medium" : "h-12",
        )}
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center transition-all duration-500">
          <LogOut className="h-5 w-5" />
        </div>
        <span
          className={cn(
            "whitespace-nowrap",
            !mobile &&
              "opacity-0 -translate-x-2 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100",
          )}
        >
          Sair
        </span>
      </button>
    </div>
  );
}

export function Sidebar() {
  const { open, setOpen } = useMobileNav();

  return (
    <>
      <aside className="group hidden h-screen w-[60px] shrink-0 flex-col border-r border-white/10 bg-[#050914] transition-[width] duration-300 ease-in-out hover:w-[260px] lg:flex">
        <LogoBlock mobile={false} />

        <NavSections />

        <LogoutButton />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col border-r border-white/10 bg-[#050914] shadow-2xl">
            <LogoBlock mobile onClose={() => setOpen(false)} />

            <NavSections mobile onNavigate={() => setOpen(false)} />

            <LogoutButton mobile />
          </aside>
        </div>
      )}
    </>
  );
}
