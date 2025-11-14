import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chemical from '@/models/Chemical';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Build query
    let query: any = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { formula: { $regex: search, $options: 'i' } },
        { batchNo: { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const [chemicals, total] = await Promise.all([
      Chemical.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Chemical.countDocuments(query)
    ]);
    
    // Map _id to id for frontend compatibility
    const chemicalsWithId = chemicals.map((chemical: any) => ({
      ...chemical,
      id: chemical._id.toString()
    }));
    
    return NextResponse.json({
      success: true,
      data: chemicalsWithId,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching chemicals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chemicals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Create new chemical
    const chemical = new Chemical(body);
    await chemical.save();
    
    // Convert to plain object and map _id to id
    const chemicalObj = chemical.toObject();
    const chemicalWithId = {
      ...chemicalObj,
      id: chemicalObj._id.toString()
    };
    
    return NextResponse.json({
      success: true,
      data: chemicalWithId,
      message: 'Chemical created successfully'
    }, { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating chemical:', error);
    
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
      { success: false, error: 'Failed to create chemical' },
      { status: 500 }
    );
  }
}
