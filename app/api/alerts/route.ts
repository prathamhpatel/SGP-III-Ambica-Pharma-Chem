import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Alert from '@/models/Alert';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');
    const severity = searchParams.get('severity');
    const isRead = searchParams.get('isRead');
    
    // Build query
    let query: any = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (severity && severity !== 'all') {
      query.severity = severity;
    }
    
    if (isRead !== null && isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const skip = (page - 1) * limit;
    
    const [alerts, total] = await Promise.all([
      Alert.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alert.countDocuments(query)
    ]);
    
    return NextResponse.json({
      success: true,
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new alert
    const alert = new Alert(body);
    await alert.save();
    
    return NextResponse.json({
      success: true,
      data: alert,
      message: 'Alert created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating alert:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: errors.join(', ') },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}

