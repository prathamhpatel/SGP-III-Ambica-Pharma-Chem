import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Alert from '@/models/Alert';
import Chemical from '@/models/Chemical';

// Clean up orphaned alerts (alerts for chemicals that no longer exist)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Get all alerts
    const allAlerts = await Alert.find({});
    
    let deletedCount = 0;
    const orphanedAlerts = [];
    
    // Check each alert to see if its chemical still exists
    for (const alert of allAlerts) {
      const chemicalExists = await Chemical.findById(alert.chemicalId);
      
      if (!chemicalExists) {
        // Chemical doesn't exist, delete the alert
        await Alert.findByIdAndDelete(alert._id);
        deletedCount++;
        orphanedAlerts.push({
          alertId: alert._id.toString(),
          chemicalId: alert.chemicalId,
          title: alert.title
        });
      }
    }
    
    console.log(`Cleaned up ${deletedCount} orphaned alerts`);
    
    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedCount} orphaned alert(s)`,
      deletedCount,
      orphanedAlerts
    });
    
  } catch (error) {
    console.error('Error cleaning up alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clean up alerts' },
      { status: 500 }
    );
  }
}

// Delete ALL alerts (use with caution)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const result = await Alert.deleteMany({});
    
    console.log(`Deleted all ${result.deletedCount} alerts`);
    
    return NextResponse.json({
      success: true,
      message: `Deleted all ${result.deletedCount} alert(s)`,
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    console.error('Error deleting all alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete alerts' },
      { status: 500 }
    );
  }
}

