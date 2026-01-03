import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface User {
  id: string;
  created_at: string;
}

export interface Device {
  id: string;
  user_id: string;
  token_hash: string;
  model: string;
  os_version: string;
  last_seen_at: string;
}

export interface UsageBatch {
  id: string;
  device_id: string;
  network: 'mobile' | 'wifi';
  operator: string | null;
  captured_at: string;
}

export interface UsageItem {
  id: string;
  batch_id: string;
  package: string;
  rx_bytes: number;
  tx_bytes: number;
}

export interface Bundle {
  id: string;
  user_id: string;
  operator: string;
  type: string;
  size_bytes: number;
  used_bytes: number;
  bought_at: string;
  expires_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  payload_json: object;
  created_at: string;
}

export interface AppUsageSummary {
  package: string;
  app_name: string;
  icon_url?: string;
  total_bytes: number;
  rx_bytes: number;
  tx_bytes: number;
  network: 'mobile' | 'wifi';
}
