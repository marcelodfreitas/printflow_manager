import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function translateStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendente",
    approved: "Aprovado",
    printing: "Imprimindo",
    paused: "Pausado",
    completed: "Concluído",
    delivered: "Entregue",
    cancelled: "Cancelado",
    draft: "Rascunho",
    sent: "Enviado",
    rejected: "Rejeitado",
    converted: "Convertido",
    active: "Ativo",
    maintenance: "Manutenção",
    idle: "Ociosa",
    offline: "Offline",
  };
  return map[status] || status;
}
