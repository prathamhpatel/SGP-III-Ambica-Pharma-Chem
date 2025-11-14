import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';
import Chemical from '@/models/Chemical';
import { ActivityLogger } from '@/lib/activityLogger';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await PurchaseOrder.findById(params.id).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    // Map _id to id for frontend compatibility
    const orderData = order as any;
    const orderWithId = {
      ...orderData,
      id: orderData._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: orderWithId
    });
    
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Check if status is being updated to 'delivered'
    const oldOrder = await PurchaseOrder.findById(params.id);
    
    if (!oldOrder) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    const wasDelivered = oldOrder.status === 'delivered';
    const isBeingDelivered = body.status === 'delivered' && !wasDelivered;
    
    // If being marked as delivered, set actualDelivery date
    if (isBeingDelivered && !body.actualDelivery) {
      body.actualDelivery = new Date();
    }
    
    // Update the purchase order
    const order = await PurchaseOrder.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    const orderData = order as any;
    
    // If status changed to 'delivered', update stock for each chemical
    if (isBeingDelivered) {
      const stockUpdates = [];
      
      for (const chemical of orderData.chemicals) {
        try {
          // Find the chemical by ID
          const existingChemical = await Chemical.findById(chemical.chemicalId);
          
          if (existingChemical) {
            // Store old values for logging
            const oldQuantity = existingChemical.quantity;
            const oldPrice = existingChemical.costPerUnit;
            const oldExpiry = new Date(existingChemical.expiryDate);
            const oldStatus = existingChemical.status;
            
            // Update quantity (add the ordered quantity)
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
            
            // Log all changes
            await ActivityLogger.stockIncreased(
              chemical.chemicalName,
              chemical.chemicalId,
              oldQuantity,
              existingChemical.quantity,
              `PO ${orderData.poNumber} delivered`,
              'System'
            );
            
            if (oldPrice !== chemical.unitPrice) {
              await ActivityLogger.priceUpdated(
                chemical.chemicalName,
                chemical.chemicalId,
                oldPrice,
                chemical.unitPrice,
                'System'
              );
            }
            
            await ActivityLogger.expiryExtended(
              chemical.chemicalName,
              chemical.chemicalId,
              oldExpiry,
              currentExpiry,
              'System'
            );
            
            if (oldStatus !== existingChemical.status) {
              await ActivityLogger.statusChanged(
                chemical.chemicalName,
                chemical.chemicalId,
                oldStatus,
                existingChemical.status,
                'System'
              );
            }
            
            stockUpdates.push({
              chemicalId: chemical.chemicalId,
              chemicalName: chemical.chemicalName,
              quantityAdded: chemical.quantity,
              newQuantity: existingChemical.quantity
            });
            
            console.log(`Updated stock for ${chemical.chemicalName}: +${chemical.quantity} (new total: ${existingChemical.quantity})`);
          } else {
            console.warn(`Chemical ${chemical.chemicalId} not found in inventory`);
          }
        } catch (error) {
          console.error(`Error updating stock for chemical ${chemical.chemicalId}:`, error);
        }
      }
      
      // Re-sync alerts after stock update
      const Alert = (await import('@/models/Alert')).default;
      
      // For each chemical, re-evaluate alerts
      for (const chemical of orderData.chemicals) {
        try {
          const updatedChemical = await Chemical.findById(chemical.chemicalId).lean();
          
          if (updatedChemical) {
            const chemicalData = updatedChemical as any;
            
            // Delete old alerts for this chemical
            await Alert.deleteMany({ chemicalId: chemical.chemicalId });
            
            // Re-create alerts based on new status
            const now = new Date();
            const expiryDate = new Date(chemicalData.expiryDate);
            const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            const newAlerts = [];
            
            // Check for out of stock - CRITICAL
            if (chemicalData.quantity === 0) {
              newAlerts.push({
                type: 'out_of_stock',
                severity: 'critical',
                title: `OUT OF STOCK: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) is completely out of stock. Immediate reorder required.`,
                chemicalId: chemical.chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            }
            // Check for expired - CRITICAL
            else if (daysUntilExpiry <= 0) {
              newAlerts.push({
                type: 'expiry_warning',
                severity: 'critical',
                title: `EXPIRED: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) has expired on ${expiryDate.toLocaleDateString()}. Remove from inventory immediately.`,
                chemicalId: chemical.chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            }
            // Check for low stock - HIGH
            else if (chemicalData.quantity <= chemicalData.reorderThreshold) {
              newAlerts.push({
                type: 'low_stock',
                severity: 'high',
                title: `Low Stock: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) is running low. Current: ${chemicalData.quantity} ${chemicalData.unit}, Threshold: ${chemicalData.reorderThreshold} ${chemicalData.unit}. Reorder recommended.`,
                chemicalId: chemical.chemicalId,
                actionRequired: true,
                isRead: false,
                timestamp: now
              });
            }
            // Check for expiring soon
            else if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
              const severity = daysUntilExpiry <= 7 ? 'high' : 'medium';
              newAlerts.push({
                type: 'expiry_warning',
                severity: severity,
                title: `Expiring Soon: ${chemicalData.name}`,
                message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}. Plan usage or disposal.`,
                chemicalId: chemical.chemicalId,
                actionRequired: daysUntilExpiry <= 7,
                isRead: false,
                timestamp: now
              });
            }
            
            if (newAlerts.length > 0) {
              await Alert.insertMany(newAlerts);
            }
          }
        } catch (error) {
          console.error(`Error updating alerts for chemical ${chemical.chemicalId}:`, error);
        }
      }
      
      // Log PO delivery
      await ActivityLogger.poDelivered(
        orderData.poNumber,
        orderData.chemicals.length,
        'System'
      );
      
      // Map _id to id for frontend compatibility
      const orderWithId = {
        ...orderData,
        id: orderData._id.toString(),
        stockUpdates
      };
      
      return NextResponse.json({
        success: true,
        data: orderWithId,
        message: 'Purchase order marked as delivered and stock updated',
        stockUpdates
      });
    }
    
    // Map _id to id for frontend compatibility
    const orderWithId = {
      ...orderData,
      id: orderData._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: orderWithId,
      message: 'Purchase order updated successfully'
    });
    
  } catch (error: any) {
    console.error('Error updating purchase order:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'PO number already exists' },
        { status: 400 }
      );
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update purchase order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const order = await PurchaseOrder.findByIdAndDelete(params.id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Purchase order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting purchase order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete purchase order' },
      { status: 500 }
    );
  }
}

