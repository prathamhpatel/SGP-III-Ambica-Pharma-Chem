import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import PurchaseOrder from '@/models/PurchaseOrder';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const supplier = searchParams.get('supplier');
    
    // Build query
    let query: any = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (supplier) {
      query.supplier = { $regex: supplier, $options: 'i' };
    }
    
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PurchaseOrder.countDocuments(query)
    ]);
    
    // Map _id to id for frontend compatibility
    const ordersWithId = orders.map((order: any) => ({
      ...order,
      id: order._id.toString()
    }));
    
    return NextResponse.json({
      success: true,
      data: ordersWithId,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Generate PO number if not provided
    if (!body.poNumber) {
      const count = await PurchaseOrder.countDocuments();
      body.poNumber = `PO-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
    }
    
    // Create new purchase order
    const order = new PurchaseOrder(body);
    await order.save();
    
    // Convert to plain object and map _id to id
    const orderObj = order.toObject();
    const orderWithId = {
      ...orderObj,
      id: orderObj._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: orderWithId,
      message: 'Purchase order created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating purchase order:', error);
    
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
      { success: false, error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}

