'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { BundleWallet, BundleWalletEmpty } from '@/components/BundleWallet';
import { TodayUsage } from '@/components/TodayUsage';
import { TopApps } from '@/components/TopApps';
import { ProofReport, GenerateReportButton } from '@/components/ProofReport';
import { AddBundleModal } from '@/components/AddBundleModal';
import { PairingModal } from '@/components/PairingModal';
import SpikeAlerts from '@/components/SpikeAlerts';
import { Smartphone, Link } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data for demonstration
const mockBundle = {
  bundleType: 'Weekly',
  operator: 'Safaricom',
  totalBytes: 2 * 1024 * 1024 * 1024, // 2GB
  usedBytes: 1.3 * 1024 * 1024 * 1024, // 1.3GB
  boughtAt: new Date('2026-01-01'),
  expiresAt: new Date('2026-01-07'),
};

const mockUsage = {
  mobileBytes: 450 * 1024 * 1024, // 450MB
  wifiBytes: 1.2 * 1024 * 1024 * 1024, // 1.2GB
  lastSyncAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
};

const mockApps = [
  { package: 'com.instagram.android', totalBytes: 320000000, mobileBytes: 280000000, wifiBytes: 40000000 },
  { package: 'com.whatsapp', totalBytes: 180000000, mobileBytes: 150000000, wifiBytes: 30000000 },
  { package: 'com.google.android.youtube', totalBytes: 450000000, mobileBytes: 100000000, wifiBytes: 350000000 },
  { package: 'com.twitter.android', totalBytes: 95000000, mobileBytes: 85000000, wifiBytes: 10000000 },
  { package: 'com.spotify.music', totalBytes: 220000000, mobileBytes: 50000000, wifiBytes: 170000000 },
];

export default function HomePage() {
  const router = useRouter();
  const [hasBundle, setHasBundle] = useState(true);
  const [hasDevice, setHasDevice] = useState(true);
  const [showAddBundle, setShowAddBundle] = useState(false);
  const [showPairing, setShowPairing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    // Simulate sync delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSyncing(false);
  };

  const handleAddBundle = (bundle: any) => {
    console.log('Adding bundle:', bundle);
    setHasBundle(true);
  };

  const reportData = {
    date: new Date(),
    network: 'mobile' as const,
    bundleInfo: {
      operator: 'Safaricom',
      type: 'Weekly',
      totalBytes: mockBundle.totalBytes,
      usedBytes: mockBundle.usedBytes,
    },
    topApps: mockApps.map(app => ({ package: app.package, bytes: app.mobileBytes })),
    totalUsage: mockUsage.mobileBytes,
    likelyCauses: [
      'Instagram auto-play videos consuming high data',
      'WhatsApp media auto-download enabled',
      'Background app refresh active for multiple apps',
    ],
    recommendations: [
      'Disable auto-play videos in Instagram settings',
      'Turn off WhatsApp media auto-download on mobile data',
      'Review and restrict background data for high-usage apps',
    ],
  };

  return (
    <AppShell>
      <div className="space-y-4 py-4">
        {/* Device connection status */}
        {!hasDevice && (
          <button
            onClick={() => setShowPairing(true)}
            className="w-full p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-amber-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-amber-900">No device connected</p>
                <p className="text-sm text-amber-700">Tap to connect your Android phone</p>
              </div>
            </div>
            <Link className="w-5 h-5 text-amber-600" />
          </button>
        )}

        {/* Bundle Wallet */}
        {hasBundle ? (
          <BundleWallet {...mockBundle} />
        ) : (
          <BundleWalletEmpty onAddBundle={() => setShowAddBundle(true)} />
        )}

        {/* Today's Usage */}
        <TodayUsage
          {...mockUsage}
          onSync={handleSync}
          isSyncing={isSyncing}
        />

        {/* Spike Alerts */}
        <SpikeAlerts userId="demo-user" />

        {/* Top Apps */}
        <TopApps
          apps={mockApps}
          onViewAll={() => router.push('/timeline')}
          onAppClick={(pkg) => router.push(`/timeline?app=${pkg}`)}
        />

        {/* Generate Report Button */}
        <GenerateReportButton onClick={() => setShowReport(true)} />
      </div>

      {/* Modals */}
      <AddBundleModal
        isOpen={showAddBundle}
        onClose={() => setShowAddBundle(false)}
        onAdd={handleAddBundle}
      />

      <PairingModal
        isOpen={showPairing}
        onClose={() => setShowPairing(false)}
        onPaired={() => setHasDevice(true)}
      />

      {showReport && (
        <ProofReport
          data={reportData}
          onClose={() => setShowReport(false)}
          onShare={() => console.log('Share report')}
          onCopy={() => console.log('Copy report')}
          onSave={() => console.log('Save report')}
        />
      )}
    </AppShell>
  );
}
