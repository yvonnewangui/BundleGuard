import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/bundles - Get all bundles for current user
export async function GET(request: NextRequest) {
  try {
    // In production, get user from session and fetch their bundles
    
    const mockBundles = [
      {
        id: '1',
        operator: 'Safaricom',
        type: 'weekly',
        sizeBytes: 2 * 1024 * 1024 * 1024, // 2GB
        usedBytes: 1.3 * 1024 * 1024 * 1024, // 1.3GB
        boughtAt: '2026-01-01T10:00:00+03:00',
        expiresAt: '2026-01-07T23:59:59+03:00',
        isActive: true,
      },
    ];

    return NextResponse.json({
      bundles: mockBundles,
    });
  } catch (error) {
    console.error('Get bundles error:', error);
    return NextResponse.json(
      { error: 'Failed to get bundles' },
      { status: 500 }
    );
  }
}

// POST /api/bundles - Add a new bundle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operator, type, sizeBytes, expiresAt } = body;

    if (!operator || !type || !sizeBytes || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production:
    // 1. Get user from session
    // 2. Create bundle record
    // 3. Return the created bundle

    const newBundle = {
      id: crypto.randomUUID(),
      operator,
      type,
      sizeBytes,
      usedBytes: 0,
      boughtAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
    };

    return NextResponse.json({
      success: true,
      bundle: newBundle,
    });
  } catch (error) {
    console.error('Add bundle error:', error);
    return NextResponse.json(
      { error: 'Failed to add bundle' },
      { status: 500 }
    );
  }
}

// PUT /api/bundles - Update a bundle
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, usedBytes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Bundle ID required' },
        { status: 400 }
      );
    }

    // In production, update the bundle in database

    return NextResponse.json({
      success: true,
      message: 'Bundle updated',
    });
  } catch (error) {
    console.error('Update bundle error:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle' },
      { status: 500 }
    );
  }
}

// DELETE /api/bundles?id=XXX - Delete a bundle
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const bundleId = searchParams.get('id');

  if (!bundleId) {
    return NextResponse.json(
      { error: 'Bundle ID required' },
      { status: 400 }
    );
  }

  try {
    // In production, delete from database

    return NextResponse.json({
      success: true,
      message: 'Bundle deleted',
    });
  } catch (error) {
    console.error('Delete bundle error:', error);
    return NextResponse.json(
      { error: 'Failed to delete bundle' },
      { status: 500 }
    );
  }
}
