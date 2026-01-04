'use client';

import { FileText, Share2, Copy, Save, X, AlertTriangle, TrendingUp, Smartphone, Check, Download, Image, FileJson } from 'lucide-react';
import { formatBytes, getAppDisplayName, formatDate } from '@/lib/utils';
import { useRef, useState } from 'react';
import {
  copyReportToClipboard,
  shareReport,
  shareReportAsImage,
  saveReportAsImage,
  saveReportAsText,
  saveReportAsJson,
  saveReportAsPdf,
  ReportData,
} from '@/lib/reportExport';

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
  data: ReportData;
  onClose: () => void;
  onShare?: () => void;
  onCopy?: () => void;
  onSave?: () => void;
}

export function ProofReport({ data, onClose }: ProofReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const showMessage = (message: string) => {
    setActionMessage(message);
    setTimeout(() => setActionMessage(null), 2000);
  };

  const handleCopy = async () => {
    const success = await copyReportToClipboard(data);
    if (success) {
      setCopied(true);
      showMessage('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    // Check if native share is available
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      const success = await shareReport(data);
      if (success) {
        showMessage('Shared successfully!');
      } else {
        // Fallback to share menu if native share failed
        setShowShareMenu(true);
      }
    } else {
      setShowShareMenu(true);
    }
  };

  const handleShareAsImage = async () => {
    if (reportRef.current) {
      const success = await shareReportAsImage(reportRef.current, data);
      if (success) {
        showMessage('Image shared!');
      }
      setShowShareMenu(false);
    }
  };

  const handleShareAsText = async () => {
    const success = await shareReport(data);
    if (success) {
      showMessage('Report shared!');
    }
    setShowShareMenu(false);
  };

  const handleSaveAsImage = async () => {
    if (reportRef.current) {
      const success = await saveReportAsImage(reportRef.current, data);
      if (success) {
        showMessage('Image saved!');
      }
      setShowSaveMenu(false);
    }
  };

  const handleSaveAsText = () => {
    const success = saveReportAsText(data);
    if (success) {
      showMessage('Text file saved!');
    }
    setShowSaveMenu(false);
  };

  const handleSaveAsJson = () => {
    const success = saveReportAsJson(data);
    if (success) {
      showMessage('JSON file saved!');
    }
    setShowSaveMenu(false);
  };

  const handleSaveAsPdf = async () => {
    const success = await saveReportAsPdf(data);
    if (success) {
      showMessage('Opening print dialog...');
    }
    setShowSaveMenu(false);
  };

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
            aria-label="Close report"
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
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 rounded-b-2xl">
          {/* Action message toast */}
          {actionMessage && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
              {actionMessage}
            </div>
          )}

          <div className="flex space-x-3">
            {/* Share button with menu */}
            <div className="relative flex-1">
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              {showShareMenu && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                  <button
                    onClick={handleShareAsText}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Share as Text</span>
                  </button>
                  <button
                    onClick={handleShareAsImage}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Share as Image</span>
                  </button>
                  <button
                    onClick={() => setShowShareMenu(false)}
                    className="w-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>

            {/* Save button with menu */}
            <div className="relative">
              <button
                onClick={() => setShowSaveMenu(!showSaveMenu)}
                className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                title="Save report"
              >
                <Download className="w-5 h-5" />
              </button>
              
              {showSaveMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                  <button
                    onClick={handleSaveAsImage}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                  >
                    <Image className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Save as Image</span>
                  </button>
                  <button
                    onClick={handleSaveAsPdf}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Save as PDF</span>
                  </button>
                  <button
                    onClick={handleSaveAsText}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <Save className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Save as Text</span>
                  </button>
                  <button
                    onClick={handleSaveAsJson}
                    className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    <FileJson className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Export Data (JSON)</span>
                  </button>
                  <button
                    onClick={() => setShowSaveMenu(false)}
                    className="w-full px-4 py-2 text-sm text-gray-400 hover:bg-gray-50 transition-colors border-t border-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Click outside to close menus */}
        {(showShareMenu || showSaveMenu) && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => { setShowShareMenu(false); setShowSaveMenu(false); }}
          />
        )}
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
