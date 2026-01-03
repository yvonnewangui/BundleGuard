import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST /api/usage/batches - Upload usage data from Android app
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const deviceToken = authHeader.substring(7);
    const body = await request.json();

    const { capturedAt, network, operator, apps } = body;

    if (!capturedAt || !network || !apps || !Array.isArray(apps)) {
      return NextResponse.json(
        { error: 'Invalid payload format' },
        { status: 400 }
      );
    }

    // Validate each app entry
    for (const app of apps) {
      if (!app.package || typeof app.rxBytes !== 'number' || typeof app.txBytes !== 'number') {
        return NextResponse.json(
          { error: 'Invalid app data format' },
          { status: 400 }
        );
      }
    }

    // In production:
    // 1. Validate device token
    // 2. Create usage_batch record
    // 3. Create usage_items records
    // 4. Update device last_seen_at

    console.log('Received usage batch:', {
      capturedAt,
      network,
      operator,
      appCount: apps.length,
      totalBytes: apps.reduce((sum: number, app: any) => sum + app.rxBytes + app.txBytes, 0),
    });

    return NextResponse.json({
      success: true,
      message: 'Usage data received',
      itemsProcessed: apps.length,
    });
  } catch (error) {
    console.error('Usage upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process usage data' },
      { status: 500 }
    );
  }
}
