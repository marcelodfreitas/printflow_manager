"use client";

import { Mail, MoreVertical, Pencil, Phone, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import type { Client } from "@/types";

interface ClientMobileCardProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
}

function getInitials(name?: string | null) {
  if (!name) return "CL";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

export function ClientMobileCard({
  client,
  onEdit,
  onDelete,
}: ClientMobileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative overflow-visible rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition-all duration-200 hover:border-white/15 hover:bg-white/[0.045]">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl accent-bg text-sm font-semibold accent-text ring-1 ring-[var(--accent)]/20">
          {getInitials(client.name)}
        </div>

        {/* Informações */}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold text-white">
            {client.name || "Cliente sem nome"}
          </h3>

          {client.company && (
            <p className="mt-0.5 truncate text-xs text-white/40">
              {client.company}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/10 hover:text-white"
            aria-label="Ações do cliente"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />

              <div className="absolute right-0 top-10 z-50 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#0a1120] p-1 shadow-2xl shadow-black/50">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-white/70 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Editar
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-red-400 transition hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Dados */}
      <div className="mt-4 space-y-2.5 border-t border-white/5 pt-3">
        {client.email && (
          <div className="flex min-w-0 items-center gap-2.5">
            <Mail className="h-3.5 w-3.5 shrink-0 text-white/30" />

            <span className="truncate text-xs text-white/55">
              {client.email}
            </span>
          </div>
        )}

        {client.phone && (
          <div className="flex min-w-0 items-center gap-2.5">
            <Phone className="h-3.5 w-3.5 shrink-0 text-white/30" />

            <span className="text-xs text-white/55">
              {client.phone}
            </span>
          </div>
        )}

        {!client.email && !client.phone && (
          <div className="flex items-center gap-2 text-xs text-white/30">
            <UserRound className="h-3.5 w-3.5" />
            Nenhum contato cadastrado
          </div>
        )}
      </div>
    </div>
  );
}