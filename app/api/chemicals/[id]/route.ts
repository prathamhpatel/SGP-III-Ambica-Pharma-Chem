import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Chemical from '@/models/Chemical';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const chemical = await Chemical.findById(params.id);
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: 'Chemical not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: chemical
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
    );
    
    if (!chemical) {
      return NextResponse.json(
        { success: false, error: 'Chemical not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: chemical,
      message: 'Chemical updated successfully'
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
    
    return NextResponse.json({
      success: true,
      message: 'Chemical deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting chemical:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete chemical' },
      { status: 500 }
    );
  }
}
