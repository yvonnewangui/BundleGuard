import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// POST /api/devices/register - Register a new device
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pairingCode, device } = body;

    if (!pairingCode || !device) {
      return NextResponse.json(
        { error: 'Pairing code and device info required' },
        { status: 400 }
      );
    }

    const { platform, model, osVersion } = device;

    if (!platform || !model || !osVersion) {
      return NextResponse.json(
        { error: 'Device platform, model, and OS version required' },
        { status: 400 }
      );
    }

    // Generate a unique token for this device
    const deviceToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(deviceToken).digest('hex');

    // In production:
    // 1. Validate the pairing code exists and isn't expired
    // 2. Get the user_id associated with the pairing code
    // 3. Create the device record
    // 4. Mark the pairing code as used

    // For now, return success with the token
    return NextResponse.json({
      success: true,
      deviceToken,
      deviceId: crypto.randomUUID(),
      message: 'Device registered successfully',
    });
  } catch (error) {
    console.error('Device registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register device' },
      { status: 500 }
    );
  }
}

// GET /api/devices - Get all devices for current user
export async function GET(request: NextRequest) {
  try {
    // In production, get user from session and fetch their devices
    
    return NextResponse.json({
      devices: [],
    });
  } catch (error) {
    console.error('Get devices error:', error);
    return NextResponse.json(
      { error: 'Failed to get devices' },
      { status: 500 }
    );
  }
}

// DELETE /api/devices?id=XXX - Remove a device
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const deviceId = searchParams.get('id');

  if (!deviceId) {
    return NextResponse.json(
      { error: 'Device ID required' },
      { status: 400 }
    );
  }

  try {
    // In production, verify ownership and delete device
    
    return NextResponse.json({
      success: true,
      message: 'Device removed',
    });
  } catch (error) {
    console.error('Delete device error:', error);
    return NextResponse.json(
      { error: 'Failed to remove device' },
      { status: 500 }
    );
  }
}
