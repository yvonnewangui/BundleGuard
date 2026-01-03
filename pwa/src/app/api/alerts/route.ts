import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  analyzeUsageForSpikes,
  SpikeAlert,
  UsageDataPoint,
  SpikeDetectionConfig,
} from '@/lib/spikeDetection';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const userId = searchParams.get('userId');
    
    if (!deviceId && !userId) {
      return NextResponse.json(
        { error: 'Device ID or User ID required' },
        { status: 400 }
      );
    }

    // Get device IDs for the user
    let deviceIds: string[] = [];
    if (userId) {
      const { data: devices } = await supabase
        .from('devices')
        .select('id')
        .eq('user_id', userId);
      deviceIds = devices?.map(d => d.id) || [];
    } else if (deviceId) {
      deviceIds = [deviceId];
    }

    if (deviceIds.length === 0) {
      return NextResponse.json({ alerts: [], analyzed: false });
    }

    // Get current day's usage (hourly)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data: currentUsageData } = await supabase
      .from('usage_records')
      .select('*')
      .in('device_id', deviceIds)
      .gte('timestamp', today.toISOString())
      .order('timestamp', { ascending: true });

    // Get historical usage (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const { data: historicalUsageData } = await supabase
      .from('usage_records')
      .select('*')
      .in('device_id', deviceIds)
      .gte('timestamp', weekAgo.toISOString())
      .lt('timestamp', today.toISOString())
      .order('timestamp', { ascending: true });

    if (!currentUsageData || currentUsageData.length === 0) {
      return NextResponse.json({ 
        alerts: [], 
        analyzed: true,
        message: 'No usage data for today' 
      });
    }

    // Transform to UsageDataPoint format
    const currentUsage: UsageDataPoint[] = currentUsageData.map(record => ({
      timestamp: new Date(record.timestamp),
      bytesUsed: (record.rx_bytes || 0) + (record.tx_bytes || 0),
      appName: record.app_name,
    }));

    const historicalUsage: UsageDataPoint[] = (historicalUsageData || []).map(record => ({
      timestamp: new Date(record.timestamp),
      bytesUsed: (record.rx_bytes || 0) + (record.tx_bytes || 0),
      appName: record.app_name,
    }));

    // Calculate daily and hourly totals
    const dailyTotal = currentUsage.reduce((sum, p) => sum + p.bytesUsed, 0);
    
    const currentHour = new Date();
    currentHour.setMinutes(0, 0, 0);
    const currentHourTotal = currentUsage
      .filter(p => p.timestamp >= currentHour)
      .reduce((sum, p) => sum + p.bytesUsed, 0);

    // Build app usage maps
    const appUsageHistory = new Map<string, number[]>();
    const currentAppUsage = new Map<string, number>();

    historicalUsage.forEach(point => {
      if (point.appName) {
        if (!appUsageHistory.has(point.appName)) {
          appUsageHistory.set(point.appName, []);
        }
        appUsageHistory.get(point.appName)!.push(point.bytesUsed);
      }
    });

    currentUsage.forEach(point => {
      if (point.appName) {
        const existing = currentAppUsage.get(point.appName) || 0;
        currentAppUsage.set(point.appName, existing + point.bytesUsed);
      }
    });

    // Custom config from query params
    const config: Partial<SpikeDetectionConfig> = {};
    if (searchParams.get('threshold')) {
      config.criticalDailyThreshold = parseInt(searchParams.get('threshold')!) * 1024 * 1024;
    }
    if (searchParams.get('sensitivity')) {
      const sensitivity = searchParams.get('sensitivity');
      if (sensitivity === 'high') {
        config.stdDevMultiplier = 1.5;
        config.minPercentageIncrease = 30;
      } else if (sensitivity === 'low') {
        config.stdDevMultiplier = 3.0;
        config.minPercentageIncrease = 100;
      }
    }

    // Run spike detection
    const alerts = analyzeUsageForSpikes(
      currentUsage,
      historicalUsage,
      dailyTotal,
      currentHourTotal,
      appUsageHistory,
      currentAppUsage,
      config
    );

    return NextResponse.json({
      alerts,
      analyzed: true,
      stats: {
        dailyTotal,
        currentHourTotal,
        recordsAnalyzed: currentUsage.length,
        historicalRecords: historicalUsage.length,
      }
    });

  } catch (error) {
    console.error('Spike detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze usage data' },
      { status: 500 }
    );
  }
}

// POST endpoint to manually trigger analysis with custom data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      currentUsage, 
      historicalUsage, 
      dailyTotal, 
      currentHourTotal,
      config 
    } = body;

    if (!currentUsage || !Array.isArray(currentUsage)) {
      return NextResponse.json(
        { error: 'Current usage data required' },
        { status: 400 }
      );
    }

    // Parse dates
    const parsedCurrent: UsageDataPoint[] = currentUsage.map((p: any) => ({
      ...p,
      timestamp: new Date(p.timestamp),
    }));

    const parsedHistorical: UsageDataPoint[] = (historicalUsage || []).map((p: any) => ({
      ...p,
      timestamp: new Date(p.timestamp),
    }));

    const alerts = analyzeUsageForSpikes(
      parsedCurrent,
      parsedHistorical,
      dailyTotal || 0,
      currentHourTotal || 0,
      undefined,
      undefined,
      config
    );

    return NextResponse.json({ alerts, analyzed: true });

  } catch (error) {
    console.error('Spike detection error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze usage data' },
      { status: 500 }
    );
  }
}
