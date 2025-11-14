import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chemical from '@/models/Chemical';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const chemical = await Chemical.findById(params.id).lean();
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: 'Chemical not found' },
        { status: 404 }
      );
    }
    
    // Map _id to id for frontend compatibility
    const chemicalData = chemical as any; // Type assertion for lean() result
    const chemicalWithId = {
      ...chemicalData,
      id: chemicalData._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: chemicalWithId
    });
    
  } catch (error) {
    console.error('Error fetching chemical:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chemical' },
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
    
    const chemical = await Chemical.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    ).lean();
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: 'Chemical not found' },
        { status: 404 }
      );
    }
    
    // Update or re-evaluate alerts for this chemical
    const Alert = (await import('@/models/Alert')).default;
    
    // Delete old alerts for this chemical
    const deletedAlerts = await Alert.deleteMany({ chemicalId: params.id });
    
    // Re-create alerts based on new chemical status
    const now = new Date();
    const chemicalData = chemical as any; // Type assertion for lean() result
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
        chemicalId: params.id,
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
        chemicalId: params.id,
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
        chemicalId: params.id,
        actionRequired: true,
        isRead: false,
        timestamp: now
      });
    }
    // Check for expiring soon (1-30 days) - MEDIUM/HIGH
    else if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
      const severity = daysUntilExpiry <= 7 ? 'high' : 'medium';
      newAlerts.push({
        type: 'expiry_warning',
        severity: severity,
        title: `Expiring Soon: ${chemicalData.name}`,
        message: `${chemicalData.name} (Batch: ${chemicalData.batchNo}) will expire in ${daysUntilExpiry} days on ${expiryDate.toLocaleDateString()}. Plan usage or disposal.`,
        chemicalId: params.id,
        actionRequired: daysUntilExpiry <= 7,
        isRead: false,
        timestamp: now
      });
    }
    
    // Insert new alerts if any
    let createdAlerts = 0;
    if (newAlerts.length > 0) {
      const result = await Alert.insertMany(newAlerts);
      createdAlerts = result.length;
    }
    
    console.log(`Updated chemical ${params.id}: deleted ${deletedAlerts.deletedCount} old alerts, created ${createdAlerts} new alerts`);
    
    // Map _id to id for frontend compatibility
    const chemicalWithId = {
      ...chemicalData,
      id: chemicalData._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: chemicalWithId,
      message: 'Chemical updated successfully',
      alertsUpdated: {
        deleted: deletedAlerts.deletedCount,
        created: createdAlerts
      }
    });
    
  } catch (error: any) {
    console.error('Error updating chemical:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Batch number already exists' },
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
      { success: false, error: 'Failed to update chemical' },
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
    
    const chemical = await Chemical.findByIdAndDelete(params.id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: 'Chemical not found' },
        { status: 404 }
      );
    }
    
    // Delete all alerts related to this chemical (cascade delete)
    const Alert = (await import('@/models/Alert')).default;
    const deletedAlerts = await Alert.deleteMany({ chemicalId: params.id });
    
    console.log(`Deleted chemical ${params.id} and ${deletedAlerts.deletedCount} related alerts`);
    
    return NextResponse.json({
      success: true,
      message: 'Chemical deleted successfully',
      deletedAlerts: deletedAlerts.deletedCount
    });
    
  } catch (error) {
    console.error('Error deleting chemical:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chemical' },
      { status: 500 }
    );
  }
}
