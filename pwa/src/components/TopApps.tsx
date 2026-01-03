'use client';

import { useState } from 'react';
import { BarChart3, ChevronRight, Smartphone, Wifi } from 'lucide-react';
import { formatBytes, getAppDisplayName } from '@/lib/utils';

interface AppUsage {
  package: string;
  totalBytes: number;
  mobileBytes: number;
  wifiBytes: number;
}

interface TopAppsProps {
  apps: AppUsage[];
  onViewAll?: () => void;
  onAppClick?: (packageName: string) => void;
}

export function TopApps({ apps, onViewAll, onAppClick }: TopAppsProps) {
  const [filter, setFilter] = useState<'all' | 'mobile' | 'wifi'>('all');

  const filteredApps = apps
    .map(app => ({
      ...app,
      displayBytes: filter === 'mobile' 
        ? app.mobileBytes 
        : filter === 'wifi' 
          ? app.wifiBytes 
          : app.totalBytes,
    }))
    .filter(app => app.displayBytes > 0)
    .sort((a, b) => b.displayBytes - a.displayBytes)
    .slice(0, 5);

  const maxBytes = filteredApps.length > 0 ? filteredApps[0].displayBytes : 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Top Apps</h3>
        </div>
        <button
          onClick={onViewAll}
          className="text-sm text-primary-600 font-medium flex items-center hover:text-primary-700"
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Filter toggle */}
      <div className="flex space-x-2 mb-4">
        {(['all', 'mobile', 'wifi'] as const).map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === option
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option === 'mobile' && <Smartphone className="w-3 h-3" />}
            {option === 'wifi' && <Wifi className="w-3 h-3" />}
            <span className="capitalize">{option}</span>
          </button>
        ))}
      </div>

      {/* App list */}
      <div className="space-y-3">
        {filteredApps.length > 0 ? (
          filteredApps.map((app, index) => (
            <button
              key={app.package}
              onClick={() => onAppClick?.(app.package)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Rank */}
              <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                {index + 1}
              </span>

              {/* App icon placeholder */}
              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {getAppDisplayName(app.package).substring(0, 2).toUpperCase()}
                </span>
              </div>

              {/* App info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 truncate">
                    {getAppDisplayName(app.package)}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatBytes(app.displayBytes)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${(app.displayBytes / maxBytes) * 100}%` }}
                  />
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No usage data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
