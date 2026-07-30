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
  Crown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";

const navSections = [
  {
    title: "GERAL",
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "GESTÃO",
    items: [
      { href: "/clientes", label: "Clientes", icon: Users },
      { href: "/pedidos", label: "Pedidos", icon: Package },
      { href: "/orcamentos", label: "Orçamentos", icon: FileText },
      { href: "/calculadora", label: "Calculadora de Custos", icon: Calculator },
      // { href: "/planos", label: "Planos de Assinatura", icon: Crown },
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

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
    className="
        group
        flex
        h-screen
        w-[72px]
        hover:w-[260px]
        shrink-0
        flex-col
        bg-[#050914]
        border-r
        border-white/10
        transition-[width]
        duration-300
        ease-in-out
    "
>
      {/* Logo */}
      <div className="border-b border-white/10 px-4 py-2">
        <div
          className="
            flex
            items-center
            justify-start
            gap-4
            group-hover:justify-start
            transition-all
            z-10
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-2xl
              bg-[#0f2347]
              
              ring-1
              ring-white/10
            "
          >
            <Image src={logo} alt="PrintFlow" className="rounded-xl" width={40} height={40} />
          </div>

          <div
            className="
              overflow-hidden
              whitespace-nowrap
              opacity-0
              transition-all
              duration-200
              group-hover:opacity-100
            "
          >
            <h1 className="text-base font-bold text-white">PrintFlow</h1>

            <p className="text-xs uppercase tracking-[0.25em] text-white/40">
              MANAGER 3D
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 py-3">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4 px-2">
            <p
              className="
                mb-2
                overflow-hidden
                whitespace-nowrap
                px-2
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-white/25
                opacity-0
                transition-opacity
                group-hover:opacity-100
              "
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
                    className={cn(
                      `
    relative
    flex
    h-12
    items-center
    rounded-xl
    transition-all
    duration-300
    `,
                      active
                        ? "bg-white/5 text-white"
                        : "text-white/60 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {active && (
                      <span
                        className="
        absolute
        left-0
        top-2
        bottom-2
        w-1
        rounded-r-full
        bg-[#fd6401]
      "
                      />
                    )}

                    {/* Ícone */}
                    <div
                      className="
    flex
    h-12
    w-full
    items-center
    justify-center
    group-hover:w-10
    group-hover:ml-3
    group-hover:justify-center
    shrink-0
    transition-all
    duration-300
  "
                    >
                      <item.icon className="h-5 w-5" />
                    </div>

                    {/* Texto */}
                    <span
                      className="
      whitespace-nowrap
      opacity-0
      group-hover:opacity-100
      transition-opacity
      duration-200
    "
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

      {/* Rodapé */}
      <div className="border-t border-white/10 p-3">
        <button
  onClick={logout}
  className="
    flex
    h-12
    w-full
    items-center
    rounded-xl
    text-white/60
    transition-all
    hover:bg-red-500/10
    hover:text-red-400
  "
>
  <div
  className="
    flex
    h-12
    w-12
    shrink-0
    items-center
    justify-center
    group-hover:w-10
    group-hover:ml-3
    transition-all
    duration-500
  "
>
  <LogOut className="h-5 w-5" />
</div>

  <span
    className="
      whitespace-nowrap
      opacity-0
      -translate-x-2
      transition-all
      duration-300
      group-hover:translate-x-0
      group-hover:opacity-100
    "
  >
    Sair
  </span>
</button>
      </div>
    </aside>
  );
}
