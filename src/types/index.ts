
export type UserRole = 'admin' | 'seller' | 'physical' | 'juridical';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  document?: string;
  photo?: string;
}

export interface Client {
  id: string;
  name: string;
  document: string;
  type: 'physical' | 'juridical';
  address?: string;
  phone?: string;
  email?: string;
  createdBy: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  document: string;
  phone?: string;
  photo?: string;
}

export interface ServiceType {
  id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface OrderStatus {
  id: string;
  name: string;
  order: number;
  color: string;
  active: boolean;
}

export interface Order {
  id: string;
  clientId: string;
  client?: Client;
  createdBy: string;
  seller?: User;
  serviceTypeId: string;
  serviceType?: ServiceType;
  statusId: string;
  status?: OrderStatus;
  licensePlate: string;
  value: number;
  createdAt: string;
}

export interface DashboardStats {
  totalOrders: number;
  monthlyRevenue: number;
  ordersByStatus: { statusName: string; count: number }[];
  ordersByServiceType: { serviceName: string; count: number }[];
  ordersByMonth: { month: string; count: number }[];
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  category: string;
  status: 'adequate' | 'low' | 'critical';
}

export interface InventoryHistory {
  id: string;
  date: string;
  item: string;
  movement: 'in' | 'out';
  quantity: number;
  order?: string;
  responsible: string;
  notes?: string;
}
