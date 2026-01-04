-- BundleGuard Demo Data (No Auth Required)
-- This bypasses RLS for testing purposes only
-- DO NOT USE IN PRODUCTION

-- ============================================
-- Drop RLS policies temporarily
-- ============================================
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;

-- Remove foreign key constraint temporarily for demo user
-- (Only needed if you haven't created a real auth user)

-- Clean up existing demo data
DELETE FROM public.usage_items WHERE batch_id IN (
  SELECT id FROM public.usage_batches WHERE device_id IN (
    SELECT id FROM public.devices WHERE token_hash LIKE 'demo_%'
  )
);
DELETE FROM public.usage_batches WHERE device_id IN (
  SELECT id FROM public.devices WHERE token_hash LIKE 'demo_%'
);
DELETE FROM public.reports WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.bundles WHERE user_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM public.devices WHERE token_hash LIKE 'demo_%';
DELETE FROM public.users WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================
-- INSERT DEMO DATA
-- ============================================

-- Demo User
INSERT INTO public.users (id, created_at) VALUES 
('00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '30 days');

-- Demo Device
INSERT INTO public.devices (id, user_id, token_hash, platform, model, os_version, last_seen_at, created_at) VALUES 
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 'demo_token_samsung_a54', 'android', 'Samsung Galaxy A54', 'Android 14', NOW() - INTERVAL '2 minutes', NOW() - INTERVAL '14 days');

-- ============================================
-- BUNDLES
-- ============================================

-- Active daily bundle (50% used)
INSERT INTO public.bundles (id, user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active) VALUES 
('b0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Safaricom', 'Daily', 1073741824, 536870912, NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours', TRUE);

-- Active weekly bundle (50% used)
INSERT INTO public.bundles (id, user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active) VALUES 
('b0000002-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Safaricom', 'Weekly', 3221225472, 1610612736, NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', TRUE);

-- Expired bundle
INSERT INTO public.bundles (id, user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active) VALUES 
('b0000003-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Safaricom', 'Daily', 536870912, 536870912, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', FALSE);

-- Another expired bundle
INSERT INTO public.bundles (id, user_id, operator, type, size_bytes, used_bytes, bought_at, expires_at, is_active) VALUES 
('b0000004-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Airtel', 'Weekly', 2147483648, 1932735283, NOW() - INTERVAL '10 days', NOW() - INTERVAL '3 days', FALSE);

-- ============================================
-- USAGE DATA - 7 days
-- ============================================

-- Today's usage (moderate)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000001-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '1 hour');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000001-0000-0000-0000-000000000001', 'com.whatsapp', 52428800, 10485760),
('ub000001-0000-0000-0000-000000000001', 'com.google.android.youtube', 157286400, 5242880),
('ub000001-0000-0000-0000-000000000001', 'com.instagram.android', 83886080, 20971520),
('ub000001-0000-0000-0000-000000000001', 'com.twitter.android', 31457280, 5242880),
('ub000001-0000-0000-0000-000000000001', 'com.spotify.music', 62914560, 1048576),
('ub000001-0000-0000-0000-000000000001', 'com.google.android.gm', 10485760, 5242880),
('ub000001-0000-0000-0000-000000000001', 'com.android.chrome', 41943040, 10485760);

-- Yesterday's usage (HIGH - spike day!)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000002-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '1 day');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000002-0000-0000-0000-000000000001', 'com.whatsapp', 73400320, 15728640),
('ub000002-0000-0000-0000-000000000001', 'com.google.android.youtube', 524288000, 10485760),
('ub000002-0000-0000-0000-000000000001', 'com.instagram.android', 209715200, 41943040),
('ub000002-0000-0000-0000-000000000001', 'com.tiktok', 314572800, 5242880),
('ub000002-0000-0000-0000-000000000001', 'com.netflix.mediaclient', 419430400, 2097152),
('ub000002-0000-0000-0000-000000000001', 'com.twitter.android', 41943040, 10485760),
('ub000002-0000-0000-0000-000000000001', 'com.android.chrome', 52428800, 15728640);

-- 2 days ago (normal)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000003-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '2 days');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000003-0000-0000-0000-000000000001', 'com.whatsapp', 41943040, 10485760),
('ub000003-0000-0000-0000-000000000001', 'com.google.android.youtube', 104857600, 5242880),
('ub000003-0000-0000-0000-000000000001', 'com.instagram.android', 62914560, 15728640),
('ub000003-0000-0000-0000-000000000001', 'com.twitter.android', 20971520, 5242880),
('ub000003-0000-0000-0000-000000000001', 'com.spotify.music', 52428800, 1048576),
('ub000003-0000-0000-0000-000000000001', 'com.facebook.katana', 31457280, 10485760);

-- 3 days ago (low)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000004-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '3 days');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000004-0000-0000-0000-000000000001', 'com.whatsapp', 31457280, 5242880),
('ub000004-0000-0000-0000-000000000001', 'com.google.android.youtube', 52428800, 2097152),
('ub000004-0000-0000-0000-000000000001', 'com.instagram.android', 41943040, 10485760),
('ub000004-0000-0000-0000-000000000001', 'com.google.android.gm', 10485760, 5242880),
('ub000004-0000-0000-0000-000000000001', 'com.android.chrome', 20971520, 5242880);

-- 4 days ago (moderate)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000005-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '4 days');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000005-0000-0000-0000-000000000001', 'com.whatsapp', 62914560, 15728640),
('ub000005-0000-0000-0000-000000000001', 'com.google.android.youtube', 125829120, 5242880),
('ub000005-0000-0000-0000-000000000001', 'com.instagram.android', 73400320, 20971520),
('ub000005-0000-0000-0000-000000000001', 'com.twitter.android', 31457280, 5242880);

-- 5 days ago (WiFi)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000006-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'wifi', NULL, NOW() - INTERVAL '5 days');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000006-0000-0000-0000-000000000001', 'com.google.android.youtube', 1073741824, 10485760),
('ub000006-0000-0000-0000-000000000001', 'com.netflix.mediaclient', 2147483648, 5242880),
('ub000006-0000-0000-0000-000000000001', 'com.whatsapp', 52428800, 20971520),
('ub000006-0000-0000-0000-000000000001', 'com.android.vending', 209715200, 10485760);

-- 6 days ago (moderate)
INSERT INTO public.usage_batches (id, device_id, network, operator, captured_at) VALUES 
('ub000007-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'mobile', 'Safaricom', NOW() - INTERVAL '6 days');

INSERT INTO public.usage_items (batch_id, package, rx_bytes, tx_bytes) VALUES
('ub000007-0000-0000-0000-000000000001', 'com.whatsapp', 52428800, 10485760),
('ub000007-0000-0000-0000-000000000001', 'com.google.android.youtube', 94371840, 5242880),
('ub000007-0000-0000-0000-000000000001', 'com.instagram.android', 52428800, 15728640),
('ub000007-0000-0000-0000-000000000001', 'com.twitter.android', 20971520, 5242880);

-- ============================================
-- SAMPLE REPORT
-- ============================================
INSERT INTO public.reports (user_id, payload_json, created_at) VALUES 
('00000000-0000-0000-0000-000000000001', 
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
    {"package": "com.tiktok", "bytes": 314572800},
    {"package": "com.instagram.android", "bytes": 209715200},
    {"package": "com.whatsapp", "bytes": 73400320}
  ],
  "totalUsage": 1635778560,
  "likelyCauses": ["Video streaming apps consumed most data", "Auto-play videos enabled"],
  "recommendations": ["Disable auto-play on social media", "Download videos on WiFi"]
}'::jsonb,
NOW() - INTERVAL '1 day');

-- ============================================
-- VERIFY DATA
-- ============================================
SELECT 'Data inserted successfully!' as status;

SELECT 'Users' as table_name, COUNT(*) as count FROM public.users
UNION ALL SELECT 'Devices', COUNT(*) FROM public.devices
UNION ALL SELECT 'Bundles', COUNT(*) FROM public.bundles
UNION ALL SELECT 'Usage Batches', COUNT(*) FROM public.usage_batches
UNION ALL SELECT 'Usage Items', COUNT(*) FROM public.usage_items
UNION ALL SELECT 'Reports', COUNT(*) FROM public.reports;

-- ============================================
-- Show sample data
-- ============================================

-- Show bundles
SELECT operator, type, 
  pg_size_pretty(size_bytes::bigint) as total_size,
  pg_size_pretty(used_bytes::bigint) as used,
  ROUND(used_bytes::numeric / size_bytes * 100, 1) as percent_used,
  is_active,
  expires_at
FROM public.bundles 
ORDER BY is_active DESC, expires_at DESC;

-- Show daily usage totals
SELECT 
  DATE(captured_at) as date,
  network,
  pg_size_pretty(SUM(rx_bytes + tx_bytes)::bigint) as total_data
FROM public.usage_batches ub
JOIN public.usage_items ui ON ui.batch_id = ub.id
GROUP BY DATE(captured_at), network
ORDER BY date DESC;
