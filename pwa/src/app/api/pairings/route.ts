import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generatePairingCode } from '@/lib/utils';

// POST /api/pairings - Generate a new pairing code
export async function POST(request: NextRequest) {
  try {
    const pairingCode = generatePairingCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 min expiry

    // In production, store this in the database
    // For now, return the generated code
    
    return NextResponse.json({
      pairingCode,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Pairing error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pairing code' },
      { status: 500 }
    );
  }
}

// GET /api/pairings?code=XXX - Check pairing status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json(
      { error: 'Pairing code required' },
      { status: 400 }
    );
  }

  try {
    // Check if device has paired with this code
    // In production, query the database
    
    return NextResponse.json({
      code,
      status: 'pending', // 'pending' | 'paired' | 'expired'
      device: null,
    });
  } catch (error) {
    console.error('Pairing check error:', error);
    return NextResponse.json(
      { error: 'Failed to check pairing status' },
      { status: 500 }
    );
  }
}
