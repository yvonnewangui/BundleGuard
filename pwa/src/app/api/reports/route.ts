import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/reports - Get all reports for current user
export async function GET(request: NextRequest) {
  try {
    // In production, get user from session and fetch their reports
    
    const mockReports = [
      {
        id: '1',
        createdAt: '2026-01-03T10:30:00+03:00',
        payload: {
          date: '2026-01-03',
          network: 'mobile',
          totalUsage: 680000000,
          topApps: [
            { package: 'com.instagram.android', bytes: 320000000 },
            { package: 'com.whatsapp', bytes: 180000000 },
          ],
          bundleInfo: {
            operator: 'Safaricom',
            type: 'Weekly',
            totalBytes: 2147483648,
            usedBytes: 1395864371,
          },
          likelyCauses: [
            'Instagram auto-play videos consuming high data',
            'WhatsApp media auto-download enabled',
          ],
          recommendations: [
            'Disable auto-play videos in Instagram settings',
            'Turn off WhatsApp media auto-download on mobile data',
          ],
        },
      },
    ];

    return NextResponse.json({
      reports: mockReports,
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json(
      { error: 'Failed to get reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Save a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { payload } = body;

    if (!payload) {
      return NextResponse.json(
        { error: 'Report payload required' },
        { status: 400 }
      );
    }

    // In production:
    // 1. Get user from session
    // 2. Create report record with payload

    const newReport = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      payload,
    };

    return NextResponse.json({
      success: true,
      report: newReport,
    });
  } catch (error) {
    console.error('Save report error:', error);
    return NextResponse.json(
      { error: 'Failed to save report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports?id=XXX - Delete a report
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reportId = searchParams.get('id');

  if (!reportId) {
    return NextResponse.json(
      { error: 'Report ID required' },
      { status: 400 }
    );
  }

  try {
    // In production, delete from database

    return NextResponse.json({
      success: true,
      message: 'Report deleted',
    });
  } catch (error) {
    console.error('Delete report error:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
