'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, AlertTriangle, Check, X } from 'lucide-react';
import { 
  isNotificationSupported, 
  getNotificationPermission, 
  requestNotificationPermission 
} from '@/lib/notifications';

interface NotificationSettingsProps {
  onClose?: () => void;
}

export function NotificationSettings({ onClose }: NotificationSettingsProps) {
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [loading, setLoading] = useState(false);
  const [spikeAlerts, setSpikeAlerts] = useState(true);
  const [bundleAlerts, setBundleAlerts] = useState(true);
  const [thresholdPercent, setThresholdPercent] = useState(50);

  useEffect(() => {
    setSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    
    // Load saved preferences
    const savedPrefs = localStorage.getItem('notification_prefs');
    if (savedPrefs) {
      const prefs = JSON.parse(savedPrefs);
      setSpikeAlerts(prefs.spikeAlerts ?? true);
      setBundleAlerts(prefs.bundleAlerts ?? true);
      setThresholdPercent(prefs.thresholdPercent ?? 50);
    }
  }, []);

  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
    } catch (error) {
      console.error('Error requesting permission:', error);
    }
    setLoading(false);
  };

  const handleSavePreferences = () => {
    const prefs = {
      spikeAlerts,
      bundleAlerts,
      thresholdPercent,
    };
    localStorage.setItem('notification_prefs', JSON.stringify(prefs));
    onClose?.();
  };

  const handleTestNotification = async () => {
    if (permission !== 'granted') return;
    
    new Notification('🔔 BundleGuard Test', {
      body: 'Notifications are working! You\'ll receive alerts when data spikes are detected.',
      icon: '/icon-192x192.png',
    });
  };

  if (!supported) {
    return (
      <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
        <div className="flex items-center space-x-3 text-amber-600 mb-4">
          <AlertTriangle className="w-6 h-6" />
          <h3 className="font-semibold">Notifications Not Supported</h3>
        </div>
        <p className="text-gray-600 text-sm">
          Your browser doesn't support notifications. Try using a modern browser like Chrome, Firefox, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 rounded-xl">
            <Bell className="w-5 h-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900">Notification Settings</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Permission Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            {permission === 'granted' ? (
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="w-4 h-4 text-green-600" />
              </div>
            ) : permission === 'denied' ? (
              <div className="p-2 bg-red-100 rounded-lg">
                <BellOff className="w-4 h-4 text-red-600" />
              </div>
            ) : (
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {permission === 'granted' && 'Notifications Enabled'}
                {permission === 'denied' && 'Notifications Blocked'}
                {permission === 'default' && 'Notifications Not Set'}
              </p>
              <p className="text-xs text-gray-500">
                {permission === 'granted' && 'You\'ll receive spike alerts'}
                {permission === 'denied' && 'Enable in browser settings'}
                {permission === 'default' && 'Allow to receive alerts'}
              </p>
            </div>
          </div>
          
          {permission !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              disabled={loading || permission === 'denied'}
              className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Enabling...' : 'Enable'}
            </button>
          )}
        </div>

        {permission === 'denied' && (
          <p className="mt-2 text-xs text-gray-500">
            To enable notifications, click the lock icon in your browser's address bar and allow notifications for this site.
          </p>
        )}
      </div>

      {/* Alert Types */}
      {permission === 'granted' && (
        <>
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-medium text-gray-700">Alert Types</h4>
            
            {/* Spike Alerts Toggle */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 text-sm">Data Spike Alerts</p>
                <p className="text-xs text-gray-500">When an app uses more data than usual</p>
              </div>
              <button
                onClick={() => setSpikeAlerts(!spikeAlerts)}
                aria-label={spikeAlerts ? 'Disable spike alerts' : 'Enable spike alerts'}
                className={`w-12 h-6 rounded-full transition-colors ${
                  spikeAlerts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    spikeAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Bundle Alerts Toggle */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-xl">
              <div>
                <p className="font-medium text-gray-900 text-sm">Bundle Depletion Alerts</p>
                <p className="text-xs text-gray-500">When your bundle is running low</p>
              </div>
              <button
                onClick={() => setBundleAlerts(!bundleAlerts)}
                aria-label={bundleAlerts ? 'Disable bundle alerts' : 'Enable bundle alerts'}
                className={`w-12 h-6 rounded-full transition-colors ${
                  bundleAlerts ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                    bundleAlerts ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sensitivity Threshold */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Alert Sensitivity</h4>
            <div className="p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Spike threshold</span>
                <span className="text-sm font-medium text-primary-600">{thresholdPercent}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="100"
                step="5"
                value={thresholdPercent}
                onChange={(e) => setThresholdPercent(Number(e.target.value))}
                aria-label="Spike threshold percentage"
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>More sensitive</span>
                <span>Less sensitive</span>
              </div>
              <p className="mt-3 text-xs text-gray-500">
                Alert when usage is {thresholdPercent}% higher than your average
              </p>
            </div>
          </div>

          {/* Test & Save Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleTestNotification}
              className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Test Notification
            </button>
            <button
              onClick={handleSavePreferences}
              className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationSettings;
