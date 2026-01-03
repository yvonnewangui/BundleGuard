'use client';

import { FileText, Share2, Copy, Save, X, AlertTriangle, TrendingUp, Smartphone } from 'lucide-react';
import { formatBytes, getAppDisplayName, formatDate } from '@/lib/utils';
import { useRef } from 'react';

interface ProofReportData {
  date: Date;
  network: 'mobile' | 'wifi' | 'all';
  bundleInfo?: {
    operator: string;
    type: string;
    totalBytes: number;
    usedBytes: number;
  };
  topApps: Array<{
    package: string;
    bytes: number;
  }>;
  totalUsage: number;
  likelyCauses: string[];
  recommendations: string[];
}

interface ProofReportProps {
  data: ProofReportData;
  onClose: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
}

export function ProofReport({ data, onClose, onShare, onCopy, onSave }: ProofReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Proof Report</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Report content */}
        <div ref={reportRef} className="p-4 space-y-4">
          {/* Report header */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-primary-100 text-sm">BundleGuard Report</span>
              <span className="text-primary-100 text-sm">{formatDate(data.date)}</span>
            </div>
            <div className="text-2xl font-bold mb-1">{formatBytes(data.totalUsage)}</div>
            <div className="text-primary-100 text-sm capitalize">
              {data.network === 'all' ? 'All Networks' : data.network} Usage
            </div>
          </div>

          {/* Bundle info */}
          {data.bundleInfo && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-medium text-gray-900 mb-2">Bundle Status</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Operator:</span>
                  <span className="ml-2 font-medium">{data.bundleInfo.operator}</span>
                </div>
                <div>
                  <span className="text-gray-500">Type:</span>
                  <span className="ml-2 font-medium">{data.bundleInfo.type}</span>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="ml-2 font-medium">{formatBytes(data.bundleInfo.totalBytes)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Used:</span>
                  <span className="ml-2 font-medium">{formatBytes(data.bundleInfo.usedBytes)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Top apps */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
              Top Data Consumers
            </h3>
            <div className="space-y-2">
              {data.topApps.slice(0, 5).map((app, index) => (
                <div
                  key={app.package}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-gray-900">{getAppDisplayName(app.package)}</span>
                  </div>
                  <span className="font-medium text-gray-900">{formatBytes(app.bytes)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Likely causes */}
          {data.likelyCauses.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-orange-500" />
                Likely Causes
              </h3>
              <ul className="space-y-2">
                {data.likelyCauses.map((cause, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {data.recommendations.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Smartphone className="w-4 h-4 mr-2 text-primary-500" />
                What To Do Next
              </h3>
              <ul className="space-y-2">
                {data.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 pt-2">
            Generated by BundleGuard • {formatDate(new Date())}
          </div>
        </div>

        {/* Action buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex space-x-3 rounded-b-2xl">
          <button
            onClick={onShare}
            className="flex-1 flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
          <button
            onClick={onCopy}
            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-5 h-5" />
          </button>
          <button
            onClick={onSave}
            className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Save className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Button to trigger report generation
interface GenerateReportButtonProps {
  onClick: () => void;
}

export function GenerateReportButton({ onClick }: GenerateReportButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full py-4 bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-shadow flex items-center justify-center space-x-2"
    >
      <FileText className="w-5 h-5" />
      <span>Generate Proof Report</span>
    </button>
  );
}
