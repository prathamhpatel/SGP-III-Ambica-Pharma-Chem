import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';
import Chemical from '@/models/Chemical';

// This endpoint automatically updates PO statuses based on expected delivery dates
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    // Find all orders that should be delivered today (expected delivery date <= today)
    // and are not yet delivered or cancelled
    const ordersToDeliver = await PurchaseOrder.find({
      expectedDelivery: { $lte: now },
      status: { $nin: ['delivered', 'cancelled'] }
    });
    
    const updates = [];
    const stockUpdates = [];
    
    for (const order of ordersToDeliver) {
      // Update order status to 'delivered'
      order.status = 'delivered';
      order.actualDelivery = now;
      await order.save();
      
      updates.push({
        poNumber: order.poNumber,
        supplier: order.supplier,
        status: 'delivered'
      });
      
      // Update stock for each chemical in this order
      for (const chemical of order.chemicals) {
        try {
          const existingChemical = await Chemical.findById(chemical.chemicalId);
          
          if (existingChemical) {
            const oldQuantity = existingChemical.quantity;
            
            // Add the ordered quantity
            existingChemical.quantity += chemical.quantity;
            
            // Update cost per unit with the new price
            existingChemical.costPerUnit = chemical.unitPrice;
            
            // Extend expiry date by 2 months (new stock delivery)
            const currentExpiry = new Date(existingChemical.expiryDate);
            currentExpiry.setMonth(currentExpiry.getMonth() + 2);
            existingChemical.expiryDate = currentExpiry;
            
            // Recalculate status based on new quantity and expiry date
            const now = new Date();
            const daysUntilExpiry = Math.ceil((currentExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            
            if (existingChemical.quantity === 0) {
              existingChemical.status = 'out_of_stock';
            } else if (daysUntilExpiry <= 0) {
              existingChemical.status = 'expired';
            } else if (existingChemical.quantity <= existingChemical.reorderThreshold) {
              existingChemical.status = 'low_stock';
            } else if (daysUntilExpiry <= 30) {
              existingChemical.status = 'expiring_soon';
            } else {
              existingChemical.status = 'active';
            }
            
            // Update last updated timestamp
            existingChemical.lastUpdated = new Date();
            
            await existingChemical.save();
            
            stockUpdates.push({
              poNumber: order.poNumber,
              chemicalId: chemical.chemicalId,
              chemicalName: chemical.chemicalName,
              quantityAdded: chemical.quantity,
              oldQuantity,
              newQuantity: existingChemical.quantity
            });
            
            console.log(`Auto-delivered ${order.poNumber}: Updated ${chemical.chemicalName} stock: ${oldQuantity} -> ${existingChemical.quantity}`);
          }
        } catch (error) {
          console.error(`Error updating stock for chemical ${chemical.chemicalId}:`, error);
        }
      }
    }
    
    // Re-sync alerts after all stock updates
    if (stockUpdates.length > 0) {
      try {
        const Alert = (await import('@/models/Alert')).default;
        
        // Get unique chemical IDs
        const uniqueChemicalIds = Array.from(new Set(stockUpdates.map(s => s.chemicalId)));
        
        for (const chemicalId of uniqueChemicalIds) {
          const chemical = await Chemical.findById(chemicalId).lean();
          
          if (chemical) {
            const chemicalData = chemical as any;
            
            // Delete old alerts
            await Alert.deleteMany({ chemicalId });
            
            // Re-evaluate alerts
            const now = new Date();
            const expiryDate = new Date(chemicalData.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const newAlerts = [];
            
            if (chemicalData.quantity === 0) {
              newAlerts.push({
                type: 'out_of_stock',
                severity: 'critical',
                title: `OUT OF STOCK: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) is completely out of stock. Immediate reorder required.`,
                chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            } else if (daysUntilExpiry <= 0) {
              newAlerts.push({
                type: 'expiry_warning',
                severity: 'critical',
                title: `EXPIRED: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) has expired. Remove from inventory immediately.`,
                chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            } else if (chemicalData.quantity <= chemicalData.reorderThreshold) {
              newAlerts.push({
                type: 'low_stock',
                severity: 'high',
                title: `Low Stock: ${chemicalData.name}`,
                message: `${chemicalData.name} is running low. Current: ${chemicalData.quantity} ${chemicalData.unit}, Threshold: ${chemicalData.reorderThreshold} ${chemicalData.unit}.`,
                chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            } else if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
              const severity = daysUntilExpiry <= 7 ? 'high' : 'medium';
              newAlerts.push({
                type: 'expiry_warning',
                severity,
                title: `Expiring Soon: ${chemicalData.name}`,
                message: `${chemicalData.name} will expire in ${daysUntilExpiry} days.`,
                chemicalId,
                actionRequired: daysUntilExpiry <= 7,
                isRead: false,
                timestamp: now
              });
            }
            
            if (newAlerts.length > 0) {
              await Alert.insertMany(newAlerts);
            }
          }
        }
      } catch (error) {
        console.error('Error updating alerts:', error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Auto-updated ${updates.length} purchase orders to delivered status`,
      data: {
        ordersUpdated: updates.length,
        updates,
        stockUpdates
      }
    });
    
  } catch (error) {
    console.error('Error auto-updating purchase order statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to auto-update statuses' },
      { status: 500 }
    );
  }
}

