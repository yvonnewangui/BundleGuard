-- BundleGuard Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up your database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices table
CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL DEFAULT 'android',
  model TEXT NOT NULL,
  os_version TEXT NOT NULL,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pairing codes table
CREATE TABLE IF NOT EXISTS public.pairing_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  device_id UUID REFERENCES public.devices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage batches table
CREATE TABLE IF NOT EXISTS public.usage_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  network TEXT NOT NULL CHECK (network IN ('mobile', 'wifi')),
  operator TEXT,
  captured_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage items table
CREATE TABLE IF NOT EXISTS public.usage_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES public.usage_batches(id) ON DELETE CASCADE,
  package TEXT NOT NULL,
  rx_bytes BIGINT NOT NULL DEFAULT 0,
  tx_bytes BIGINT NOT NULL DEFAULT 0
);

-- Bundles table
CREATE TABLE IF NOT EXISTS public.bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  operator TEXT NOT NULL,
  type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  bought_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payload_json JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_devices_user_id ON public.devices(user_id);
CREATE INDEX IF NOT EXISTS idx_devices_token_hash ON public.devices(token_hash);
CREATE INDEX IF NOT EXISTS idx_pairing_codes_code ON public.pairing_codes(code);
CREATE INDEX IF NOT EXISTS idx_pairing_codes_user_id ON public.pairing_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_batches_device_id ON public.usage_batches(device_id);
CREATE INDEX IF NOT EXISTS idx_usage_batches_captured_at ON public.usage_batches(captured_at);
CREATE INDEX IF NOT EXISTS idx_usage_items_batch_id ON public.usage_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_usage_items_package ON public.usage_items(package);
CREATE INDEX IF NOT EXISTS idx_bundles_user_id ON public.bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_bundles_is_active ON public.bundles(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Devices policies
CREATE POLICY "Users can view own devices" ON public.devices
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own devices" ON public.devices
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own devices" ON public.devices
  FOR DELETE USING (auth.uid() = user_id);

-- Pairing codes policies
CREATE POLICY "Users can view own pairing codes" ON public.pairing_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pairing codes" ON public.pairing_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usage batches policies
CREATE POLICY "Users can view own usage batches" ON public.usage_batches
  FOR SELECT USING (
    device_id IN (SELECT id FROM public.devices WHERE user_id = auth.uid())
  );

-- Usage items policies  
CREATE POLICY "Users can view own usage items" ON public.usage_items
  FOR SELECT USING (
    batch_id IN (
      SELECT ub.id FROM public.usage_batches ub
      JOIN public.devices d ON ub.device_id = d.id
      WHERE d.user_id = auth.uid()
    )
  );

-- Bundles policies
CREATE POLICY "Users can view own bundles" ON public.bundles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bundles" ON public.bundles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bundles" ON public.bundles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bundles" ON public.bundles
  FOR DELETE USING (auth.uid() = user_id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON public.reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON public.reports
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to get daily usage summary
CREATE OR REPLACE FUNCTION get_daily_usage_summary(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_mobile_bytes BIGINT,
  total_wifi_bytes BIGINT,
  app_usage JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN ub.network = 'mobile' THEN ui.rx_bytes + ui.tx_bytes ELSE 0 END), 0) AS total_mobile_bytes,
    COALESCE(SUM(CASE WHEN ub.network = 'wifi' THEN ui.rx_bytes + ui.tx_bytes ELSE 0 END), 0) AS total_wifi_bytes,
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'package', ui.package,
          'bytes', ui.rx_bytes + ui.tx_bytes,
          'network', ub.network
        )
      ),
      '[]'::jsonb
    ) AS app_usage
  FROM public.devices d
  JOIN public.usage_batches ub ON d.id = ub.device_id
  JOIN public.usage_items ui ON ub.id = ui.batch_id
  WHERE d.user_id = p_user_id
    AND DATE(ub.captured_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample comment for documentation
COMMENT ON TABLE public.users IS 'User profiles extending Supabase Auth';
COMMENT ON TABLE public.devices IS 'Connected Android devices for data collection';
COMMENT ON TABLE public.usage_batches IS 'Batches of usage data uploaded from devices';
COMMENT ON TABLE public.usage_items IS 'Individual app usage entries within a batch';
COMMENT ON TABLE public.bundles IS 'User data bundle tracking';
COMMENT ON TABLE public.reports IS 'Generated proof reports';
