import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ActivityLog from '@/models/ActivityLog';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const category = searchParams.get('category');
    const severity = searchParams.get('severity');
    const user = searchParams.get('user');
    const dateRange = searchParams.get('dateRange'); // days
    
    // Build query
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    if (user && user !== 'all') {
      query.user = user;
    }
    
    if (dateRange && dateRange !== 'all') {
      const daysAgo = parseInt(dateRange);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      query.timestamp = { $gte: cutoffDate };
    }
    
    const skip = (page - 1) * limit;
    
    const [logs, total] = await Promise.all([
      ActivityLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ActivityLog.countDocuments(query)
    ]);
    
    // Map _id to id for frontend compatibility
    const logsWithId = logs.map((log: any) => ({
      ...log,
      id: log._id.toString()
    }));
    
    return NextResponse.json({
      success: true,
      data: logsWithId,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new activity log
    const log = new ActivityLog(body);
    await log.save();
    
    // Convert to plain object and map _id to id
    const logObj = log.toObject();
    const logWithId = {
      ...logObj,
      id: logObj._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: logWithId,
      message: 'Activity log created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating activity log:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create activity log' },
      { status: 500 }
    );
  }
}

