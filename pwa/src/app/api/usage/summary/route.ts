import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/usage/summary - Get usage summary for a date
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const network = searchParams.get('network'); // 'mobile' | 'wifi' | null (all)

    // In production, fetch from database
    // For now, return mock data

    const mockSummary = {
      date,
      mobileBytes: 680000000,
      wifiBytes: 2400000000,
      topApps: [
        { package: 'com.instagram.android', bytes: 320000000, network: 'mobile' },
        { package: 'com.google.android.youtube', bytes: 450000000, network: 'wifi' },
        { package: 'com.whatsapp', bytes: 180000000, network: 'mobile' },
        { package: 'com.spotify.music', bytes: 220000000, network: 'wifi' },
        { package: 'com.twitter.android', bytes: 95000000, network: 'mobile' },
      ],
      hourlyBreakdown: [
        { hour: 0, bytes: 50000000 },
        { hour: 1, bytes: 20000000 },
        { hour: 2, bytes: 10000000 },
        { hour: 3, bytes: 5000000 },
        { hour: 4, bytes: 5000000 },
        { hour: 5, bytes: 10000000 },
        { hour: 6, bytes: 30000000 },
        { hour: 7, bytes: 80000000 },
        { hour: 8, bytes: 150000000 },
        { hour: 9, bytes: 200000000 },
        { hour: 10, bytes: 180000000 },
        { hour: 11, bytes: 250000000 },
        { hour: 12, bytes: 300000000 },
        { hour: 13, bytes: 280000000 },
        { hour: 14, bytes: 220000000 },
        { hour: 15, bytes: 200000000 },
        { hour: 16, bytes: 180000000 },
        { hour: 17, bytes: 200000000 },
        { hour: 18, bytes: 250000000 },
        { hour: 19, bytes: 300000000 },
        { hour: 20, bytes: 280000000 },
        { hour: 21, bytes: 200000000 },
        { hour: 22, bytes: 150000000 },
        { hour: 23, bytes: 100000000 },
      ],
    };

    // Filter by network if specified
    if (network) {
      mockSummary.topApps = mockSummary.topApps.filter(app => app.network === network);
    }

    return NextResponse.json(mockSummary);
  } catch (error) {
    console.error('Summary fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}
