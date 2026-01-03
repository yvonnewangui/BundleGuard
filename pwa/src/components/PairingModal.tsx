'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Smartphone, Copy, Check, RefreshCw } from 'lucide-react';
import { generatePairingCode } from '@/lib/utils';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaired?: (deviceId: string) => void;
}

type PairingState = 'code' | 'waiting' | 'success' | 'error';

export function PairingModal({ isOpen, onClose, onPaired }: PairingModalProps) {
  const [pairingCode, setPairingCode] = useState(generatePairingCode());
  const [state, setState] = useState<PairingState>('code');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefreshCode = () => {
    setPairingCode(generatePairingCode());
    setState('code');
  };

  // QR code contains pairing URL
  const pairingUrl = `bundleguard://pair?code=${pairingCode}`;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm">
        {/* Header */}
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900">Connect Device</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {state === 'code' && (
            <>
              {/* Instructions */}
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm">
                  Scan this QR code with the BundleGuard Android app to connect your device.
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-white border-2 border-gray-100 rounded-2xl">
                  <QRCodeSVG
                    value={pairingUrl}
                    size={180}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </div>

              {/* Or use code */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or enter code manually</span>
                </div>
              </div>

              {/* Pairing code */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="px-4 py-3 bg-gray-100 rounded-xl font-mono text-xl font-bold tracking-wider text-gray-900">
                  {pairingCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-primary-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>

              {/* Refresh code */}
              <button
                onClick={handleRefreshCode}
                className="w-full flex items-center justify-center space-x-2 text-sm text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate new code</span>
              </button>

              {/* Download app link */}
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-800 text-center">
                  Don't have the app?{' '}
                  <a href="#" className="font-medium underline">
                    Download BundleGuard for Android
                  </a>
                </p>
              </div>
            </>
          )}

          {state === 'waiting' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary-600 animate-spin" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Waiting for device...</h3>
              <p className="text-sm text-gray-500">
                Open the BundleGuard app on your Android device and scan the QR code
              </p>
            </div>
          )}

          {state === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Device Connected!</h3>
              <p className="text-sm text-gray-500">
                Your Android device is now connected and will start syncing data.
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
