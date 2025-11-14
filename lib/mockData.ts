import { Chemical, Supplier, PurchaseOrder, ActivityLog, Alert, DashboardStats } from '@/types';

// Empty data arrays - database will be used instead
export const mockChemicals: Chemical[] = [];

export const mockSuppliers: Supplier[] = [];

export const mockPurchaseOrders: PurchaseOrder[] = [];

export const mockActivityLogs: ActivityLog[] = [];

export const mockAlerts: Alert[] = [];

// Empty dashboard stats - will be calculated from actual database data
export const mockDashboardStats: DashboardStats = {
  totalChemicals: 0,
  lowStockItems: 0,
  expiringSoon: 0,
  ordersThisMonth: 0,
  totalValue: 0,
  activeSuppliers: 0,
  pendingOrders: 0,
  criticalAlerts: 0
};