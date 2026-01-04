-- BundleGuard Seed Data
-- Run this AFTER schema.sql to populate tables with demo data
-- Note: You need to create a test user in Supabase Auth first

-- ============================================
-- IMPORTANT: Replace this UUID with your actual user ID from Supabase Auth
-- You can find your user ID in: Supabase Dashboard > Authentication > Users
-- ============================================
-- For testing, we'll create a demo user record
-- First, sign up a user through the app or Supabase dashboard, then get their ID

-- Option 1: If you have a user already, replace the UUID below
-- Option 2: Use anonymous/public data (disable RLS temporarily for testing)

-- For development, let's disable RLS temporarily to insert seed data
-- IMPORTANT: Re-enable RLS in production!

-- Temporarily disable RLS for seeding
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Create a demo user (will need a real auth.users entry for production)
-- For now, we use a fixed UUID for demo purposes
DO $$
DECLARE
  demo_user_id UUID := '00000000-0000-0000-0000-000000000001';
  demo_device_id UUID;
  batch_id_1 UUID;
  batch_id_2 UUID;
  batch_id_3 UUID;
  batch_id_4 UUID;
  batch_id_5 UUID;
BEGIN
  -- Insert demo user (if not exists)
  INSERT INTO public.users (id, created_at)
  VALUES (demo_user_id, NOW() - INTERVAL '30 days')
  ON CONFLICT (id) DO NOTHING;

  -- Insert demo device
  INSERT INTO public.devices (id, user_id, token_hash, platform, model, os_version, last_seen_at, created_at)
  VALUES (
    uuid_generate_v4(),
    demo_user_id,
    'demo_token_hash_12345',
    'android',
    'Samsung Galaxy A54',
    'Android 14',
    NOW() - INTERVAL '5 minutes',
    NOW() - INTERVAL '14 days'
  )
  RETURNING id INTO demo_device_id;

  -- ============================================
  -- BUNDLES - Active and expired bundles
  -- ============================================
  
  -- Active Safaricom daily bundle
  INSERT INTO public.bundles (user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active)
  VALUES (
    demo_user_id,
    'Safaricom',
    'Daily',
    1073741824, -- 1GB
    536870912,  -- 512MB used
    NOW() - INTERVAL '6 hours',
    NOW() + INTERVAL '18 hours',
    TRUE
  );

  -- Active Safaricom weekly bundle
  INSERT INTO public.bundles (user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active)
  VALUES (
    demo_user_id,
    'Safaricom',
    'Weekly',
    3221225472, -- 3GB
    1610612736, -- 1.5GB used
    NOW() - INTERVAL '3 days',
    NOW() + INTERVAL '4 days',
    TRUE
  );

  -- Expired bundle (for history)
  INSERT INTO public.bundles (user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active)
  VALUES (
    demo_user_id,
    'Safaricom',
    'Daily',
    536870912, -- 500MB
    536870912, -- Fully used
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day',
    FALSE
  );

  -- Another expired bundle
  INSERT INTO public.bundles (user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active)
  VALUES (
    demo_user_id,
    'Airtel',
    'Weekly',
    2147483648, -- 2GB
    1932735283, -- 1.8GB used
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '3 days',
    FALSE
  );

  -- ============================================
  -- USAGE BATCHES AND ITEMS - Last 7 days of data
  -- ============================================
  
  -- Day 1: Today (moderate usage)
  INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at)
  VALUES (uuid_generate_v4(), demo_device_id, 'mobile', 'Safaricom', NOW() - INTERVAL '1 hour')
  RETURNING id INTO batch_id_1;

  INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
    (batch_id_1, 'com.whatsapp', 52428800, 10485760),        -- WhatsApp: 50MB rx, 10MB tx
    (batch_id_1, 'com.google.android.youtube', 157286400, 5242880), -- YouTube: 150MB rx, 5MB tx
    (batch_id_1, 'com.instagram.android', 83886080, 20971520),    -- Instagram: 80MB rx, 20MB tx
    (batch_id_1, 'com.twitter.android', 31457280, 5242880),       -- Twitter: 30MB rx, 5MB tx
    (batch_id_1, 'com.spotify.music', 62914560, 1048576),         -- Spotify: 60MB rx, 1MB tx
    (batch_id_1, 'com.google.android.gm', 10485760, 5242880),     -- Gmail: 10MB rx, 5MB tx
    (batch_id_1, 'com.android.chrome', 41943040, 10485760);       -- Chrome: 40MB rx, 10MB tx

  -- Day 2: Yesterday (high usage - spike day!)
  INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at)
  VALUES (uuid_generate_v4(), demo_device_id, 'mobile', 'Safaricom', NOW() - INTERVAL '1 day')
  RETURNING id INTO batch_id_2;

  INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
    (batch_id_2, 'com.whatsapp', 73400320, 15728640),          -- WhatsApp: 70MB rx, 15MB tx
    (batch_id_2, 'com.google.android.youtube', 524288000, 10485760), -- YouTube: 500MB rx (spike!)
    (batch_id_2, 'com.instagram.android', 209715200, 41943040),   -- Instagram: 200MB rx, 40MB tx
    (batch_id_2, 'com.tiktok.music', 314572800, 5242880),         -- TikTok: 300MB rx (spike!)
    (batch_id_2, 'com.netflix.mediaclient', 419430400, 2097152),  -- Netflix: 400MB rx (spike!)
    (batch_id_2, 'com.twitter.android', 41943040, 10485760),      -- Twitter: 40MB rx, 10MB tx
    (batch_id_2, 'com.android.chrome', 52428800, 15728640);       -- Chrome: 50MB rx, 15MB tx

  -- Day 3: 2 days ago (normal usage)
  INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at)
  VALUES (uuid_generate_v4(), demo_device_id, 'mobile', 'Safaricom', NOW() - INTERVAL '2 days')
  RETURNING id INTO batch_id_3;

  INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
    (batch_id_3, 'com.whatsapp', 41943040, 10485760),         -- WhatsApp: 40MB rx, 10MB tx
    (batch_id_3, 'com.google.android.youtube', 104857600, 5242880), -- YouTube: 100MB rx
    (batch_id_3, 'com.instagram.android', 62914560, 15728640),    -- Instagram: 60MB rx
    (batch_id_3, 'com.twitter.android', 20971520, 5242880),       -- Twitter: 20MB rx
    (batch_id_3, 'com.spotify.music', 52428800, 1048576),         -- Spotify: 50MB rx
    (batch_id_3, 'com.facebook.katana', 31457280, 10485760);      -- Facebook: 30MB rx

  -- Day 4: 3 days ago (low usage)
  INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at)
  VALUES (uuid_generate_v4(), demo_device_id, 'mobile', 'Safaricom', NOW() - INTERVAL '3 days')
  RETURNING id INTO batch_id_4;

  INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
    (batch_id_4, 'com.whatsapp', 31457280, 5242880),          -- WhatsApp: 30MB rx
    (batch_id_4, 'com.google.android.youtube', 52428800, 2097152), -- YouTube: 50MB rx
    (batch_id_4, 'com.instagram.android', 41943040, 10485760),    -- Instagram: 40MB rx
    (batch_id_4, 'com.google.android.gm', 10485760, 5242880),     -- Gmail: 10MB rx
    (batch_id_4, 'com.android.chrome', 20971520, 5242880);        -- Chrome: 20MB rx

  -- Day 5: 5 days ago (WiFi usage - different network)
  INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at)
  VALUES (uuid_generate_v4(), demo_device_id, 'wifi', NULL, NOW() - INTERVAL '5 days')
  RETURNING id INTO batch_id_5;

  INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
    (batch_id_5, 'com.google.android.youtube', 1073741824, 10485760), -- YouTube: 1GB rx (WiFi heavy)
    (batch_id_5, 'com.netflix.mediaclient', 2147483648, 5242880),     -- Netflix: 2GB rx (WiFi heavy)
    (batch_id_5, 'com.whatsapp', 52428800, 20971520),                 -- WhatsApp: 50MB
    (batch_id_5, 'com.android.vending', 209715200, 10485760);         -- Play Store: 200MB (app updates)

  -- ============================================
  -- SAMPLE REPORT
  -- ============================================
  INSERT INTO public.reports (user_id, payload_json, created_at)
  VALUES (
    demo_user_id,
    '{
      "date": "2026-01-02T10:30:00Z",
      "network": "mobile",
      "bundleInfo": {
        "operator": "Safaricom",
        "type": "Daily",
        "totalBytes": 1073741824,
        "usedBytes": 536870912
      },
      "topApps": [
        {"package": "com.google.android.youtube", "bytes": 524288000},
        {"package": "com.netflix.mediaclient", "bytes": 419430400},
        {"package": "com.tiktok.music", "bytes": 314572800},
        {"package": "com.instagram.android", "bytes": 209715200},
        {"package": "com.whatsapp", "bytes": 73400320}
      ],
      "totalUsage": 1635778560,
      "likelyCauses": ["Video streaming apps consumed most data", "Auto-play videos enabled"],
      "recommendations": ["Disable auto-play on social media", "Download videos on WiFi"]
    }'::jsonb,
    NOW() - INTERVAL '1 day'
  );

END $$;

-- ============================================
-- Re-enable RLS after seeding
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Verify data was inserted
-- ============================================
SELECT 'Users:' as table_name, COUNT(*) as count FROM public.users
UNION ALL
SELECT 'Devices:', COUNT(*) FROM public.devices
UNION ALL
SELECT 'Bundles:', COUNT(*) FROM public.bundles
UNION ALL
SELECT 'Usage Batches:', COUNT(*) FROM public.usage_batches
UNION ALL
SELECT 'Usage Items:', COUNT(*) FROM public.usage_items
UNION ALL
SELECT 'Reports:', COUNT(*) FROM public.reports;
