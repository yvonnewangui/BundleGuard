'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { formatBytes, formatDate, getAppDisplayName } from '@/lib/utils';
import { FileText, Share2, Trash2, ChevronRight, Search } from 'lucide-react';

// Mock saved reports
const mockReports = [
  {
    id: '1',
    createdAt: new Date('2026-01-03T10:30:00'),
    totalUsage: 680000000,
    network: 'mobile' as const,
    topApp: 'com.instagram.android',
  },
  {
    id: '2',
    createdAt: new Date('2026-01-02T15:45:00'),
    totalUsage: 1200000000,
    network: 'all' as const,
    topApp: 'com.google.android.youtube',
  },
  {
    id: '3',
    createdAt: new Date('2026-01-01T09:00:00'),
    totalUsage: 450000000,
    network: 'mobile' as const,
    topApp: 'com.whatsapp',
  },
];

export default function HistoryPage() {
  const [reports, setReports] = useState(mockReports);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredReports = reports.filter(report => {
    if (!searchQuery) return true;
    const appName = getAppDisplayName(report.topApp).toLowerCase();
    return appName.includes(searchQuery.toLowerCase());
  });

  const handleDelete = (id: string) => {
    setReports(reports.filter(r => r.id !== id));
  };

  return (
    <AppShell>
      <div className="py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Report History</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and share your saved proof reports
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Reports list */}
        {filteredReports.length > 0 ? (
          <div className="space-y-3">
            {filteredReports.map(report => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-gray-100 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <FileText className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {formatDate(report.createdAt)}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          report.network === 'mobile' 
                            ? 'bg-orange-100 text-orange-700'
                            : report.network === 'wifi'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                        }`}>
                          {report.network === 'all' ? 'All Networks' : report.network}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatBytes(report.totalUsage)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        Top: {getAppDisplayName(report.topApp)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(report.id)}
                      className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button className="w-full mt-3 pt-3 border-t border-gray-100 flex items-center justify-center space-x-1 text-sm text-primary-600 hover:text-primary-700">
                  <span>View full report</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">No reports yet</h3>
            <p className="text-sm text-gray-500">
              Generate a proof report from the home screen to save it here
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
