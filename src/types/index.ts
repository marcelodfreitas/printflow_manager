export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  createdAt: string;
}

export interface Printer {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  type: "FDM" | "SLA" | "SLS" | "DLP";
  status: "active" | "maintenance" | "idle" | "offline";
  nozzleSize?: number;
  buildVolume: string;
  lastMaintenance: string;
  imageUrl?: string;
  powerConsumption?: number;
  costPerHour: number;
}

export interface Filament {
  id: string;
  name: string;
  type: "PLA" | "ABS" | "PETG" | "TPU" | "Nylon" | "Polycarbonate" | "Outro";
  color: string;
  colorHex: string;
  manufacturer: string;
  diameter: number;
  weight: number;
  quantity: number;
  costPerKg: number;
}

export type OrderStatus =
  | "pending"
  | "approved"
  | "printing"
  | "paused"
  | "completed"
  | "delivered"
  | "cancelled";

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  printerId: string;
  printerName: string;
  filamentId: string;
  filamentName: string;
  filamentColor: string;
  status: OrderStatus;
  quantity: number;
  totalHours: number;
  filamentGrams: number;
  cost: number;
  price: number;
  notes?: string;
  createdAt: string;
  deadline?: string;
}

export type QuoteStatus = "draft" | "sent" | "approved" | "rejected" | "converted";

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  status: QuoteStatus;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  validUntil: string;
  createdAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DashboardStats {
  totalClients: number;
  totalPrinters: number;
  activePrinters: number;
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  filamentStock: number;
}
