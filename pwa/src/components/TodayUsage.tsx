'use client';

import { Activity, Wifi, Smartphone, RefreshCw } from 'lucide-react';
import { formatBytes, getRelativeTime } from '@/lib/utils';

interface TodayUsageProps {
  mobileBytes: number;
  wifiBytes: number;
  lastSyncAt: Date | null;
  onSync?: () => void;
  isSyncing?: boolean;
}

export function TodayUsage({
  mobileBytes,
  wifiBytes,
  lastSyncAt,
  onSync,
  isSyncing = false,
}: TodayUsageProps) {
  const totalBytes = mobileBytes + wifiBytes;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Today's Usage</h3>
            <p className="text-xs text-gray-500">
              {lastSyncAt ? `Synced ${getRelativeTime(lastSyncAt)}` : 'Not synced yet'}
            </p>
          </div>
        </div>
        <button
          onClick={onSync}
          disabled={isSyncing}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
          aria-label="Sync now"
        >
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Total usage */}
      <div className="text-center mb-4">
        <span className="text-3xl font-bold text-gray-900">{formatBytes(totalBytes)}</span>
        <p className="text-sm text-gray-500">Total today</p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-orange-50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Smartphone className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-orange-700">Mobile</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{formatBytes(mobileBytes)}</span>
        </div>
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Wifi className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-blue-700">Wi-Fi</span>
          </div>
          <span className="text-lg font-semibold text-gray-900">{formatBytes(wifiBytes)}</span>
        </div>
      </div>
    </div>
  );
}
