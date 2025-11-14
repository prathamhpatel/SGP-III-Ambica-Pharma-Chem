import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Alert from '@/models/Alert';
import Chemical from '@/models/Chemical';

// This endpoint syncs alerts based on current chemical stock status
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all chemicals
    const chemicals = await Chemical.find({}).lean();
    
    const newAlerts = [];
    const now = new Date();
    
    for (const chemical of chemicals) {
      const chemicalId = chemical._id.toString();
      
      // Calculate days until expiry
      const expiryDate = new Date(chemical.expiryDate);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check for out of stock - CRITICAL
      if (chemical.quantity === 0) {
        const existingAlert = await Alert.findOne({
          type: 'out_of_stock',
          chemicalId: chemicalId,
          isRead: false
        });
        
        if (!existingAlert) {
          newAlerts.push({
            type: 'out_of_stock',
            severity: 'critical',
            title: `OUT OF STOCK: ${chemical.name}`,
            message: `${chemical.name} (Batch: ${chemical.batchNo}) is completely out of stock. Immediate reorder required.`,
            chemicalId: chemicalId,
            actionRequired: true,
            isRead: false,
            timestamp: now
          });
        }
      }
      // Check for expired - CRITICAL
      else if (daysUntilExpiry <= 0) {
        const existingAlert = await Alert.findOne({
          type: 'expiry_warning',
          chemicalId: chemicalId,
          isRead: false,
          message: { $regex: 'expired' }
        });
        
        if (!existingAlert) {
          newAlerts.push({
            type: 'expiry_warning',
            severity: 'critical',
            title: `EXPIRED: ${chemical.name}`,
            message: `${chemical.name} (Batch: ${chemical.batchNo}) has expired on ${expiryDate.toLocaleDateString()}. Remove from inventory immediately.`,
            chemicalId: chemicalId,
            actionRequired: true,
            isRead: false,
            timestamp: now
          });
        }
      }
      // Check for low stock - HIGH
      else if (chemical.quantity <= chemical.reorderThreshold) {
        const existingAlert = await Alert.findOne({
          type: 'low_stock',
          chemicalId: chemicalId,
          isRead: false
        });
        
        if (!existingAlert) {
          const percentageRemaining = (chemical.quantity / chemical.reorderThreshold) * 100;
          newAlerts.push({
            type: 'low_stock',
            severity: 'high',
            title: `Low Stock: ${chemical.name}`,
            message: `${chemical.name} (Batch: ${chemical.batchNo}) is running low. Current: ${chemical.quantity} ${chemical.unit}, Threshold: ${chemical.reorderThreshold} ${chemical.unit}. Reorder recommended.`,
            chemicalId: chemicalId,
            actionRequired: true,
            isRead: false,
            timestamp: now
          });
        }
      }
      // Check for expiring soon (1-30 days) - MEDIUM/HIGH
      else if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
        const existingAlert = await Alert.findOne({
          type: 'expiry_warning',
          chemicalId: chemicalId,
          isRead: false,
          message: { $regex: 'expiring' }
        });
        
        if (!existingAlert) {
          const severity = daysUntilExpiry <= 7 ? 'high' : 'medium';
          newAlerts.push({
            type: 'expiry_warning',
            severity: severity,
            title: `Expiring Soon: ${chemical.name}`,
            message: `${chemical.name} (Batch: ${chemical.batchNo}) will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}. Plan usage or disposal.`,
            chemicalId: chemicalId,
            actionRequired: daysUntilExpiry <= 7,
            isRead: false,
            timestamp: now
          });
        }
      }
    }
    
    // Bulk insert new alerts
    if (newAlerts.length > 0) {
      await Alert.insertMany(newAlerts);
    }
    
    // Get updated alerts count by severity
    const [critical, high, medium, low] = await Promise.all([
      Alert.countDocuments({ severity: 'critical', isRead: false }),
      Alert.countDocuments({ severity: 'high', isRead: false }),
      Alert.countDocuments({ severity: 'medium', isRead: false }),
      Alert.countDocuments({ severity: 'low', isRead: false })
    ]);
    
    return NextResponse.json({
      success: true,
      data: {
        newAlerts: newAlerts.length,
        summary: {
          critical,
          high,
          medium,
          low,
          total: critical + high + medium + low
        }
      },
      message: `Alert sync completed. ${newAlerts.length} new alerts created.`
    });
    
  } catch (error) {
    console.error('Error syncing alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to sync alerts' },
      { status: 500 }
    );
  }
}

