'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import AlertSettingsPanel, { AlertSettings } from '@/components/AlertSettings';
import { 
  Smartphone, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Moon,
  Globe,
  Trash2,
  Info,
  ExternalLink,
  Zap
} from 'lucide-react';

interface Device {
  id: string;
  model: string;
  lastSeen: Date;
  isConnected: boolean;
}

export default function SettingsPage() {
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      model: 'Pixel 7',
      lastSeen: new Date(),
      isConnected: true,
    },
  ]);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showAlertSettings, setShowAlertSettings] = useState(false);
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    enabled: true,
    sensitivity: 'medium',
    dailyThresholdMB: 1000,
    hourlyThresholdMB: 200,
    notifyOnSpike: true,
    notifyOnThreshold: true,
    notifyOnAppAnomaly: true,
  });

  const handleRemoveDevice = (id: string) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  return (
    <AppShell>
      <div className="py-4 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Connected Devices */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Connected Devices
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {devices.length > 0 ? (
              devices.map((device, index) => (
                <div
                  key={device.id}
                  className={`p-4 flex items-center justify-between ${
                    index > 0 ? 'border-t border-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <Smartphone className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{device.model}</p>
                      <p className="text-xs text-gray-500">
                        {device.isConnected ? (
                          <span className="text-primary-600">● Connected</span>
                        ) : (
                          `Last seen ${device.lastSeen.toLocaleDateString()}`
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDevice(device.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <p className="text-gray-500 text-sm">No devices connected</p>
                <button className="mt-2 text-primary-600 text-sm font-medium">
                  Connect a device
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Preferences
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Spike Detection Settings */}
            <button 
              onClick={() => setShowAlertSettings(!showAlertSettings)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-xl">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Spike Detection</p>
                  <p className="text-xs text-gray-500">
                    {alertSettings.enabled ? `${alertSettings.sensitivity} sensitivity` : 'Disabled'}
                  </p>
                </div>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showAlertSettings ? 'rotate-90' : ''}`} />
            </button>

            {showAlertSettings && (
              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <AlertSettingsPanel 
                  settings={alertSettings} 
                  onSettingsChange={setAlertSettings} 
                />
              </div>
            )}

            {/* Notifications */}
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-xl">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notifications</p>
                  <p className="text-xs text-gray-500">Usage alerts and reminders</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={(e) => setNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Dark mode */}
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-800 rounded-xl">
                  <Moon className="w-5 h-5 text-gray-200" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-500">Coming soon</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer opacity-50">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                  disabled
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Language */}
            <button className="w-full p-4 flex items-center justify-between border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-xl">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Language</p>
                  <p className="text-xs text-gray-500">English</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* Privacy & Security */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Privacy & Security
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-xl">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Privacy Policy</p>
                  <p className="text-xs text-gray-500">How we handle your data</p>
                </div>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full p-4 flex items-center justify-between border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-xl">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Delete All Data</p>
                  <p className="text-xs text-gray-500">Remove all stored information</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* Support */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Support
          </h2>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <HelpCircle className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">Help & FAQ</p>
                  <p className="text-xs text-gray-500">Get answers to common questions</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full p-4 flex items-center justify-between border-t border-gray-100 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <Info className="w-5 h-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">About BundleGuard</p>
                  <p className="text-xs text-gray-500">Version 1.0.0</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </section>

        {/* Sign out */}
        <button className="w-full p-4 bg-white rounded-2xl border border-gray-100 flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          BundleGuard v1.0.0 • Made with ❤️ in Kenya
        </p>
      </div>
    </AppShell>
  );
}
