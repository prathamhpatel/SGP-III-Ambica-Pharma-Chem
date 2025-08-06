// Types for the inventory management system

export interface Chemical {
  id: string;
  name: string;
  formula?: string;
  category: string;
  quantity: number;
  unit: string;
  batchNo: string;
  expiryDate: string;
  reorderThreshold: number;
  supplier: string;
  costPerUnit: number;
  location: string;
  lastUpdated: string;
  status: 'active' | 'expired' | 'low_stock' | 'out_of_stock';
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  rating: number;
  chemicals: string[];
  lastOrderDate?: string;
  totalOrders: number;
  status: 'active' | 'inactive';
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: string;
  chemicals: {
    chemicalId: string;
    chemicalName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  totalAmount: number;
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  category: 'stock_update' | 'purchase_order' | 'supplier' | 'alert' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiry_warning' | 'out_of_stock' | 'system';
  title: string;
  message: string;
  chemicalId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  timestamp: string;
  actionRequired: boolean;
}

export interface DashboardStats {
  totalChemicals: number;
  lowStockItems: number;
  expiringSoon: number;
  ordersThisMonth: number;
  totalValue: number;
  activeSuppliers: number;
  pendingOrders: number;
  criticalAlerts: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'operator';
  department: string;
  lastLogin: string;
}