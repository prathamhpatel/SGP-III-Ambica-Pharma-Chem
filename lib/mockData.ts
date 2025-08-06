import { Chemical, Supplier, PurchaseOrder, ActivityLog, Alert, DashboardStats } from '@/types';

// Mock Chemicals Data
export const mockChemicals: Chemical[] = [
  {
    id: '1',
    name: 'Sodium Chloride',
    formula: 'NaCl',
    category: 'Inorganic Salt',
    quantity: 150,
    unit: 'kg',
    batchNo: 'NaCl-2024-001',
    expiryDate: '2025-12-31',
    reorderThreshold: 50,
    supplier: 'ChemCorp Ltd',
    costPerUnit: 25.50,
    location: 'Warehouse A-1',
    lastUpdated: '2024-01-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'Sulfuric Acid',
    formula: 'H2SO4',
    category: 'Acid',
    quantity: 25,
    unit: 'L',
    batchNo: 'H2SO4-2024-003',
    expiryDate: '2024-06-30',
    reorderThreshold: 50,
    supplier: 'Industrial Chemicals Inc',
    costPerUnit: 45.00,
    location: 'Warehouse B-3',
    lastUpdated: '2024-01-10',
    status: 'low_stock'
  },
  {
    id: '3',
    name: 'Acetone',
    formula: 'C3H6O',
    category: 'Organic Solvent',
    quantity: 0,
    unit: 'L',
    batchNo: 'ACE-2024-002',
    expiryDate: '2024-08-15',
    reorderThreshold: 30,
    supplier: 'Solvent Solutions',
    costPerUnit: 35.75,
    location: 'Warehouse C-2',
    lastUpdated: '2024-01-12',
    status: 'out_of_stock'
  },
  {
    id: '4',
    name: 'Ethanol',
    formula: 'C2H5OH',
    category: 'Alcohol',
    quantity: 200,
    unit: 'L',
    batchNo: 'ETH-2024-004',
    expiryDate: '2026-03-20',
    reorderThreshold: 75,
    supplier: 'Pure Chemicals Co',
    costPerUnit: 28.90,
    location: 'Warehouse A-2',
    lastUpdated: '2024-01-14',
    status: 'active'
  },
  {
    id: '5',
    name: 'Calcium Carbonate',
    formula: 'CaCO3',
    category: 'Inorganic Salt',
    quantity: 300,
    unit: 'kg',
    batchNo: 'CaCO3-2024-001',
    expiryDate: '2025-09-10',
    reorderThreshold: 100,
    supplier: 'Mineral Corp',
    costPerUnit: 18.25,
    location: 'Warehouse A-3',
    lastUpdated: '2024-01-13',
    status: 'active'
  },
  {
    id: '6',
    name: 'Hydrochloric Acid',
    formula: 'HCl',
    category: 'Acid',
    quantity: 15,
    unit: 'L',
    batchNo: 'HCl-2023-012',
    expiryDate: '2024-03-15',
    reorderThreshold: 40,
    supplier: 'ChemCorp Ltd',
    costPerUnit: 22.50,
    location: 'Warehouse B-1',
    lastUpdated: '2024-01-11',
    status: 'expired'
  }
];

// Mock Suppliers Data
export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'ChemCorp Ltd',
    contact: 'Rajesh Kumar',
    email: 'rajesh@chemcorp.com',
    phone: '+91-9876543210',
    address: '123 Industrial Estate, Mumbai, Maharashtra 400001',
    rating: 4.5,
    chemicals: ['1', '6'],
    lastOrderDate: '2024-01-10',
    totalOrders: 45,
    status: 'active'
  },
  {
    id: '2',
    name: 'Industrial Chemicals Inc',
    contact: 'Priya Sharma',
    email: 'priya@indchem.com',
    phone: '+91-9876543211',
    address: '456 Chemical Park, Pune, Maharashtra 411001',
    rating: 4.2,
    chemicals: ['2'],
    lastOrderDate: '2024-01-08',
    totalOrders: 32,
    status: 'active'
  },
  {
    id: '3',
    name: 'Solvent Solutions',
    contact: 'Amit Patel',
    email: 'amit@solventsol.com',
    phone: '+91-9876543212',
    address: '789 Chemical Complex, Ahmedabad, Gujarat 380001',
    rating: 3.8,
    chemicals: ['3'],
    lastOrderDate: '2023-12-25',
    totalOrders: 28,
    status: 'active'
  },
  {
    id: '4',
    name: 'Pure Chemicals Co',
    contact: 'Sneha Gupta',
    email: 'sneha@purechem.com',
    phone: '+91-9876543213',
    address: '321 Industrial Zone, Delhi 110001',
    rating: 4.8,
    chemicals: ['4'],
    lastOrderDate: '2024-01-12',
    totalOrders: 67,
    status: 'active'
  },
  {
    id: '5',
    name: 'Mineral Corp',
    contact: 'Vikram Singh',
    email: 'vikram@mineralcorp.com',
    phone: '+91-9876543214',
    address: '654 Mining District, Jaipur, Rajasthan 302001',
    rating: 4.1,
    chemicals: ['5'],
    lastOrderDate: '2024-01-05',
    totalOrders: 23,
    status: 'active'
  }
];

// Mock Purchase Orders Data
export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1',
    poNumber: 'PO-2024-001',
    supplier: 'ChemCorp Ltd',
    chemicals: [
      {
        chemicalId: '1',
        chemicalName: 'Sodium Chloride',
        quantity: 100,
        unitPrice: 25.50,
        total: 2550
      }
    ],
    totalAmount: 2550,
    orderDate: '2024-01-10',
    expectedDelivery: '2024-01-20',
    actualDelivery: '2024-01-18',
    status: 'delivered',
    priority: 'medium',
    notes: 'Regular monthly order'
  },
  {
    id: '2',
    poNumber: 'PO-2024-002',
    supplier: 'Solvent Solutions',
    chemicals: [
      {
        chemicalId: '3',
        chemicalName: 'Acetone',
        quantity: 50,
        unitPrice: 35.75,
        total: 1787.50
      }
    ],
    totalAmount: 1787.50,
    orderDate: '2024-01-12',
    expectedDelivery: '2024-01-22',
    status: 'pending',
    priority: 'urgent',
    notes: 'Emergency order - out of stock'
  },
  {
    id: '3',
    poNumber: 'PO-2024-003',
    supplier: 'Industrial Chemicals Inc',
    chemicals: [
      {
        chemicalId: '2',
        chemicalName: 'Sulfuric Acid',
        quantity: 100,
        unitPrice: 45.00,
        total: 4500
      }
    ],
    totalAmount: 4500,
    orderDate: '2024-01-14',
    expectedDelivery: '2024-01-25',
    status: 'approved',
    priority: 'high'
  }
];

// Mock Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2024-01-15T10:30:00Z',
    user: 'John Doe',
    action: 'Stock Updated',
    details: 'Updated Sodium Chloride quantity from 100kg to 150kg',
    category: 'stock_update',
    severity: 'info'
  },
  {
    id: '2',
    timestamp: '2024-01-15T09:15:00Z',
    user: 'System',
    action: 'Low Stock Alert',
    details: 'Sulfuric Acid dropped below reorder threshold (25L < 50L)',
    category: 'alert',
    severity: 'warning'
  },
  {
    id: '3',
    timestamp: '2024-01-14T16:45:00Z',
    user: 'Jane Smith',
    action: 'Purchase Order Created',
    details: 'Created PO-2024-003 for Sulfuric Acid (100L)',
    category: 'purchase_order',
    severity: 'success'
  },
  {
    id: '4',
    timestamp: '2024-01-14T14:20:00Z',
    user: 'System',
    action: 'Out of Stock Alert',
    details: 'Acetone is completely out of stock',
    category: 'alert',
    severity: 'error'
  },
  {
    id: '5',
    timestamp: '2024-01-13T11:10:00Z',
    user: 'Mike Johnson',
    action: 'Supplier Added',
    details: 'Added new supplier: Pure Chemicals Co',
    category: 'supplier',
    severity: 'info'
  }
];

// Mock Alerts
export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'out_of_stock',
    title: 'Critical: Acetone Out of Stock',
    message: 'Acetone (C3H6O) is completely out of stock. Immediate reorder required.',
    chemicalId: '3',
    severity: 'critical',
    isRead: false,
    timestamp: '2024-01-15T08:30:00Z',
    actionRequired: true
  },
  {
    id: '2',
    type: 'low_stock',
    title: 'Low Stock Warning: Sulfuric Acid',
    message: 'Sulfuric Acid (H2SO4) is below reorder threshold. Current stock: 25L, Threshold: 50L',
    chemicalId: '2',
    severity: 'high',
    isRead: false,
    timestamp: '2024-01-15T09:15:00Z',
    actionRequired: true
  },
  {
    id: '3',
    type: 'expiry_warning',
    title: 'Expiry Alert: Hydrochloric Acid',
    message: 'Hydrochloric Acid (HCl) batch HCl-2023-012 expires on 2024-03-15',
    chemicalId: '6',
    severity: 'medium',
    isRead: true,
    timestamp: '2024-01-14T10:00:00Z',
    actionRequired: false
  },
  {
    id: '4',
    type: 'low_stock',
    title: 'Low Stock Warning: Hydrochloric Acid',
    message: 'Hydrochloric Acid (HCl) is below reorder threshold. Current stock: 15L, Threshold: 40L',
    chemicalId: '6',
    severity: 'high',
    isRead: false,
    timestamp: '2024-01-14T11:30:00Z',
    actionRequired: true
  }
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalChemicals: 6,
  lowStockItems: 3,
  expiringSoon: 1,
  ordersThisMonth: 3,
  totalValue: 45750.25,
  activeSuppliers: 5,
  pendingOrders: 1,
  criticalAlerts: 3
};