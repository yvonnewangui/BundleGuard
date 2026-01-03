'use client';

import { useState, useMemo } from 'react';
import { AppShell } from '@/components/AppShell';
import { formatBytes, getAppDisplayName, formatDate } from '@/lib/utils';
import { Calendar, Filter, Smartphone, Wifi, ChevronRight, ArrowUpDown, X } from 'lucide-react';

// Mock data
const mockUsageData = [
  { date: '2026-01-03', package: 'com.instagram.android', rxBytes: 280000000, txBytes: 40000000, network: 'mobile' as const },
  { date: '2026-01-03', package: 'com.instagram.android', rxBytes: 35000000, txBytes: 5000000, network: 'wifi' as const },
  { date: '2026-01-03', package: 'com.whatsapp', rxBytes: 140000000, txBytes: 40000000, network: 'mobile' as const },
  { date: '2026-01-03', package: 'com.whatsapp', rxBytes: 25000000, txBytes: 5000000, network: 'wifi' as const },
  { date: '2026-01-03', package: 'com.google.android.youtube', rxBytes: 90000000, txBytes: 10000000, network: 'mobile' as const },
  { date: '2026-01-03', package: 'com.google.android.youtube', rxBytes: 320000000, txBytes: 30000000, network: 'wifi' as const },
  { date: '2026-01-03', package: 'com.twitter.android', rxBytes: 80000000, txBytes: 15000000, network: 'mobile' as const },
  { date: '2026-01-03', package: 'com.spotify.music', rxBytes: 45000000, txBytes: 5000000, network: 'mobile' as const },
  { date: '2026-01-03', package: 'com.spotify.music', rxBytes: 160000000, txBytes: 10000000, network: 'wifi' as const },
  { date: '2026-01-02', package: 'com.instagram.android', rxBytes: 200000000, txBytes: 30000000, network: 'mobile' as const },
  { date: '2026-01-02', package: 'com.whatsapp', rxBytes: 100000000, txBytes: 20000000, network: 'mobile' as const },
  { date: '2026-01-02', package: 'com.netflix.mediaclient', rxBytes: 800000000, txBytes: 10000000, network: 'wifi' as const },
  { date: '2026-01-01', package: 'com.instagram.android', rxBytes: 150000000, txBytes: 25000000, network: 'mobile' as const },
  { date: '2026-01-01', package: 'com.tiktok', rxBytes: 400000000, txBytes: 50000000, network: 'mobile' as const },
];

type NetworkFilter = 'all' | 'mobile' | 'wifi';
type SortBy = 'usage' | 'time';

export default function TimelinePage() {
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('usage');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  // Get unique dates
  const dates = useMemo(() => {
    const uniqueDates = [...new Set(mockUsageData.map(d => d.date))];
    return uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  }, []);

  // Filter and aggregate data
  const filteredData = useMemo(() => {
    let data = mockUsageData;

    // Filter by date
    if (dateFilter) {
      data = data.filter(d => d.date === dateFilter);
    }

    // Filter by network
    if (networkFilter !== 'all') {
      data = data.filter(d => d.network === networkFilter);
    }

    // Aggregate by app
    const appMap = new Map<string, {
      package: string;
      totalBytes: number;
      mobileBytes: number;
      wifiBytes: number;
      dates: Set<string>;
    }>();

    data.forEach(item => {
      const existing = appMap.get(item.package);
      const bytes = item.rxBytes + item.txBytes;
      
      if (existing) {
        existing.totalBytes += bytes;
        if (item.network === 'mobile') existing.mobileBytes += bytes;
        else existing.wifiBytes += bytes;
        existing.dates.add(item.date);
      } else {
        appMap.set(item.package, {
          package: item.package,
          totalBytes: bytes,
          mobileBytes: item.network === 'mobile' ? bytes : 0,
          wifiBytes: item.network === 'wifi' ? bytes : 0,
          dates: new Set([item.date]),
        });
      }
    });

    let result = Array.from(appMap.values());

    // Sort
    if (sortBy === 'usage') {
      result.sort((a, b) => b.totalBytes - a.totalBytes);
    }

    return result;
  }, [dateFilter, networkFilter, sortBy]);

  // Get app detail data
  const appDetailData = useMemo(() => {
    if (!selectedApp) return null;

    const appData = mockUsageData.filter(d => d.package === selectedApp);
    const byDate = new Map<string, { mobile: number; wifi: number }>();

    appData.forEach(item => {
      const bytes = item.rxBytes + item.txBytes;
      const existing = byDate.get(item.date) || { mobile: 0, wifi: 0 };
      
      if (item.network === 'mobile') existing.mobile += bytes;
      else existing.wifi += bytes;
      
      byDate.set(item.date, existing);
    });

    return Array.from(byDate.entries())
      .map(([date, usage]) => ({ date, ...usage, total: usage.mobile + usage.wifi }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedApp]);

  const totalUsage = filteredData.reduce((sum, app) => sum + app.totalBytes, 0);

  return (
    <AppShell>
      <div className="py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Usage Timeline</h1>
          <span className="text-sm text-gray-500">
            Total: {formatBytes(totalUsage)}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Date filter */}
          <div className="relative">
            <select
              value={dateFilter || ''}
              onChange={(e) => setDateFilter(e.target.value || null)}
              className="appearance-none pl-9 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">All dates</option>
              {dates.map(date => (
                <option key={date} value={date}>
                  {formatDate(date)}
                </option>
              ))}
            </select>
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          {/* Network filter */}
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {(['all', 'mobile', 'wifi'] as NetworkFilter[]).map(option => (
              <button
                key={option}
                onClick={() => setNetworkFilter(option)}
                className={`px-3 py-2 text-sm font-medium flex items-center space-x-1 transition-colors ${
                  networkFilter === option
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {option === 'mobile' && <Smartphone className="w-3.5 h-3.5" />}
                {option === 'wifi' && <Wifi className="w-3.5 h-3.5" />}
                <span className="capitalize">{option}</span>
              </button>
            ))}
          </div>

          {/* Sort */}
          <button
            onClick={() => setSortBy(sortBy === 'usage' ? 'time' : 'usage')}
            className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{sortBy === 'usage' ? 'By usage' : 'By time'}</span>
          </button>
        </div>

        {/* App list */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {filteredData.length > 0 ? (
            filteredData.map((app, index) => (
              <button
                key={app.package}
                onClick={() => setSelectedApp(app.package)}
                className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              >
                {/* Rank */}
                <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 mr-3">
                  {index + 1}
                </span>

                {/* App icon placeholder */}
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center mr-3">
                  <span className="text-sm font-bold text-gray-600">
                    {getAppDisplayName(app.package).substring(0, 2).toUpperCase()}
                  </span>
                </div>

                {/* App info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-gray-900 truncate">
                    {getAppDisplayName(app.package)}
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500 mt-0.5">
                    {app.mobileBytes > 0 && (
                      <span className="flex items-center space-x-1">
                        <Smartphone className="w-3 h-3 text-orange-500" />
                        <span>{formatBytes(app.mobileBytes)}</span>
                      </span>
                    )}
                    {app.wifiBytes > 0 && (
                      <span className="flex items-center space-x-1">
                        <Wifi className="w-3 h-3 text-blue-500" />
                        <span>{formatBytes(app.wifiBytes)}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="text-right mr-2">
                  <span className="font-semibold text-gray-900">
                    {formatBytes(app.totalBytes)}
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No usage data found</p>
            </div>
          )}
        </div>
      </div>

      {/* App Detail Modal */}
      {selectedApp && appDetailData && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-600">
                    {getAppDisplayName(selectedApp).substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getAppDisplayName(selectedApp)}
                  </h2>
                  <p className="text-xs text-gray-500">{selectedApp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Usage by day */}
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-3">Daily Usage</h3>
              <div className="space-y-3">
                {appDetailData.map(day => (
                  <div key={day.date} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(day.date)}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {formatBytes(day.total)}
                      </span>
                    </div>
                    <div className="flex space-x-4 text-xs">
                      <span className="flex items-center space-x-1 text-orange-600">
                        <Smartphone className="w-3 h-3" />
                        <span>{formatBytes(day.mobile)}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-blue-600">
                        <Wifi className="w-3 h-3" />
                        <span>{formatBytes(day.wifi)}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Suggested fixes */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Suggested Fixes</h3>
                <div className="space-y-2">
                  {selectedApp.includes('instagram') && (
                    <>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Disable auto-play videos in Settings → Account → Cellular Data Use
                      </div>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Enable "Use Less Data" in video settings
                      </div>
                    </>
                  )}
                  {selectedApp.includes('whatsapp') && (
                    <>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Disable media auto-download in Settings → Storage and Data
                      </div>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Enable "Low Data Usage" for calls
                      </div>
                    </>
                  )}
                  {selectedApp.includes('youtube') && (
                    <>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Set default video quality to 480p or lower on mobile data
                      </div>
                      <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                        • Enable "Remind me to take a break" to limit usage
                      </div>
                    </>
                  )}
                  {!['instagram', 'whatsapp', 'youtube'].some(app => selectedApp.includes(app)) && (
                    <div className="p-3 bg-primary-50 rounded-xl text-sm text-primary-800">
                      • Check app settings for data saver or low bandwidth options
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
