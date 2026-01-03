'use client';

import { Wallet, TrendingDown, Clock } from 'lucide-react';
import { formatBytes, calculatePercentage, estimateTimeRemaining, calculateBurnRate } from '@/lib/utils';

interface BundleWalletProps {
  bundleType: string;
  operator: string;
  totalBytes: number;
  usedBytes: number;
  boughtAt: Date;
  expiresAt: Date;
}

export function BundleWallet({
  bundleType,
  operator,
  totalBytes,
  usedBytes,
  boughtAt,
  expiresAt,
}: BundleWalletProps) {
  const remainingBytes = totalBytes - usedBytes;
  const usagePercent = calculatePercentage(usedBytes, totalBytes);
  
  const daysElapsed = Math.max(1, Math.ceil((new Date().getTime() - boughtAt.getTime()) / (1000 * 60 * 60 * 24)));
  const dailyBurnRate = calculateBurnRate(usedBytes, daysElapsed);
  const eta = estimateTimeRemaining(remainingBytes, dailyBurnRate);
  
  const daysUntilExpiry = Math.ceil((expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine status color
  const getStatusColor = () => {
    if (usagePercent >= 90) return 'text-red-500';
    if (usagePercent >= 70) return 'text-orange-500';
    return 'text-primary-600';
  };

  const getProgressColor = () => {
    if (usagePercent >= 90) return 'bg-red-500';
    if (usagePercent >= 70) return 'bg-orange-500';
    return 'bg-primary-500';
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 card-hover">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-primary-100 rounded-lg">
            <Wallet className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Bundle Wallet</h3>
            <p className="text-xs text-gray-500">{operator} • {bundleType}</p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          daysUntilExpiry <= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
        }`}>
          {daysUntilExpiry <= 0 ? 'Expired' : `${daysUntilExpiry}d left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Used</span>
          <span className={`font-semibold ${getStatusColor()}`}>
            {formatBytes(usedBytes)} / {formatBytes(totalBytes)}
          </span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${getProgressColor()} progress-bar rounded-full`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between text-sm">
        <div className="flex items-center space-x-1 text-gray-600">
          <TrendingDown className="w-4 h-4" />
          <span>{formatBytes(dailyBurnRate)}/day</span>
        </div>
        <div className="flex items-center space-x-1 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>ETA: {eta}</span>
        </div>
      </div>
    </div>
  );
}

// Empty state for when no bundle is configured
export function BundleWalletEmpty({ onAddBundle }: { onAddBundle?: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-dashed">
      <div className="text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <Wallet className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">No Bundle Added</h3>
        <p className="text-sm text-gray-500 mb-4">
          Add your current data bundle to track usage
        </p>
        <button
          onClick={onAddBundle}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Add Bundle
        </button>
      </div>
    </div>
  );
}
