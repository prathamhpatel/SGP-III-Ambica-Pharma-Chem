import ActivityLog from '@/models/ActivityLog';

interface LogActivityParams {
  action: string;
  category: 'stock_update' | 'purchase_order' | 'supplier' | 'alert' | 'user' | 'system';
  severity?: 'info' | 'warning' | 'error' | 'success';
  user?: string;
  details: string;
  metadata?: {
    chemicalId?: string;
    chemicalName?: string;
    poNumber?: string;
    supplierId?: string;
    quantityChange?: number;
    oldValue?: any;
    newValue?: any;
    [key: string]: any;
  };
}

/**
 * Logs an activity to the database
 * @param params Activity log parameters
 * @returns Promise<void>
 */
export async function logActivity(params: LogActivityParams): Promise<void> {
  try {
    const log = new ActivityLog({
      action: params.action,
      category: params.category,
      severity: params.severity || 'info',
      user: params.user || 'System',
      details: params.details,
      metadata: params.metadata || {},
      timestamp: new Date()
    });
    
    await log.save();
    console.log(`✅ Activity logged: ${params.action}`);
  } catch (error) {
    console.error('❌ Failed to log activity:', error);
    // Don't throw error - logging should not break the main flow
  }
}

/**
 * Logs multiple activities in bulk
 * @param activities Array of activity log parameters
 * @returns Promise<void>
 */
export async function logActivitiesBulk(activities: LogActivityParams[]): Promise<void> {
  try {
    const logs = activities.map(params => ({
      action: params.action,
      category: params.category,
      severity: params.severity || 'info',
      user: params.user || 'System',
      details: params.details,
      metadata: params.metadata || {},
      timestamp: new Date()
    }));
    
    await ActivityLog.insertMany(logs);
    console.log(`✅ Bulk logged ${activities.length} activities`);
  } catch (error) {
    console.error('❌ Failed to bulk log activities:', error);
    // Don't throw error - logging should not break the main flow
  }
}

/**
 * Helper functions for common log types
 */

export const ActivityLogger = {
  // Purchase Order logs
  poCreated: (poNumber: string, supplier: string, totalAmount: number, user: string = 'System') =>
    logActivity({
      action: 'Purchase Order Created',
      category: 'purchase_order',
      severity: 'success',
      user,
      details: `Created PO ${poNumber} for supplier ${supplier} with total amount ₹${totalAmount.toLocaleString()}`,
      metadata: { poNumber, supplier, totalAmount }
    }),
  
  poDelivered: (poNumber: string, itemCount: number, user: string = 'System') =>
    logActivity({
      action: 'Purchase Order Delivered',
      category: 'purchase_order',
      severity: 'success',
      user,
      details: `PO ${poNumber} marked as delivered with ${itemCount} item(s)`,
      metadata: { poNumber, itemCount }
    }),
  
  // Stock update logs
  stockIncreased: (chemicalName: string, chemicalId: string, oldQty: number, newQty: number, reason: string, user: string = 'System') =>
    logActivity({
      action: 'Stock Increased',
      category: 'stock_update',
      severity: 'success',
      user,
      details: `${chemicalName}: Stock increased from ${oldQty} to ${newQty} (${reason})`,
      metadata: { chemicalId, chemicalName, oldValue: oldQty, newValue: newQty, quantityChange: newQty - oldQty, reason }
    }),
  
  priceUpdated: (chemicalName: string, chemicalId: string, oldPrice: number, newPrice: number, user: string = 'System') =>
    logActivity({
      action: 'Price Updated',
      category: 'stock_update',
      severity: 'info',
      user,
      details: `${chemicalName}: Price updated from ₹${oldPrice} to ₹${newPrice}`,
      metadata: { chemicalId, chemicalName, oldValue: oldPrice, newValue: newPrice }
    }),
  
  expiryExtended: (chemicalName: string, chemicalId: string, oldExpiry: Date, newExpiry: Date, user: string = 'System') =>
    logActivity({
      action: 'Expiry Date Extended',
      category: 'stock_update',
      severity: 'info',
      user,
      details: `${chemicalName}: Expiry extended from ${oldExpiry.toLocaleDateString()} to ${newExpiry.toLocaleDateString()}`,
      metadata: { chemicalId, chemicalName, oldValue: oldExpiry, newValue: newExpiry }
    }),
  
  statusChanged: (chemicalName: string, chemicalId: string, oldStatus: string, newStatus: string, user: string = 'System') =>
    logActivity({
      action: 'Chemical Status Changed',
      category: 'stock_update',
      severity: oldStatus === 'expired' || oldStatus === 'out_of_stock' ? 'success' : 'info',
      user,
      details: `${chemicalName}: Status changed from "${oldStatus}" to "${newStatus}"`,
      metadata: { chemicalId, chemicalName, oldValue: oldStatus, newValue: newStatus }
    }),
  
  // Alert logs
  alertCreated: (alertType: string, chemicalName: string, severity: string, user: string = 'System') =>
    logActivity({
      action: 'Alert Created',
      category: 'alert',
      severity: 'warning',
      user,
      details: `${severity.toUpperCase()} alert created: ${alertType} for ${chemicalName}`,
      metadata: { alertType, chemicalName, alertSeverity: severity }
    }),
  
  alertCleared: (alertType: string, chemicalName: string, reason: string, user: string = 'System') =>
    logActivity({
      action: 'Alert Cleared',
      category: 'alert',
      severity: 'success',
      user,
      details: `Alert cleared: ${alertType} for ${chemicalName} (${reason})`,
      metadata: { alertType, chemicalName, reason }
    }),
  
  // Supplier logs
  supplierAdded: (supplierName: string, user: string = 'System') =>
    logActivity({
      action: 'Supplier Added',
      category: 'supplier',
      severity: 'success',
      user,
      details: `New supplier added: ${supplierName}`,
      metadata: { supplierName }
    })
};

