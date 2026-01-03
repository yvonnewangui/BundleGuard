'use client';

import { useState } from 'react';
import { Bell, BellOff, TrendingUp, AlertTriangle, Info } from 'lucide-react';

export interface AlertSettings {
  enabled: boolean;
  sensitivity: 'low' | 'medium' | 'high';
  dailyThresholdMB: number;
  hourlyThresholdMB: number;
  notifyOnSpike: boolean;
  notifyOnThreshold: boolean;
  notifyOnAppAnomaly: boolean;
}

interface AlertSettingsProps {
  settings: AlertSettings;
  onSettingsChange: (settings: AlertSettings) => void;
}

const sensitivityOptions = [
  { value: 'low', label: 'Low', description: 'Only major spikes (>100% increase)' },
  { value: 'medium', label: 'Medium', description: 'Moderate spikes (>50% increase)' },
  { value: 'high', label: 'High', description: 'All unusual patterns (>30% increase)' },
] as const;

export default function AlertSettingsPanel({ settings, onSettingsChange }: AlertSettingsProps) {
  const updateSetting = <K extends keyof AlertSettings>(key: K, value: AlertSettings[K]) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* Master toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {settings.enabled ? (
            <Bell className="w-5 h-5 text-indigo-600" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
          <div>
            <p className="font-medium text-gray-900">Spike Detection</p>
            <p className="text-sm text-gray-500">Get alerts for unusual usage</p>
          </div>
        </div>
        <button
          onClick={() => updateSetting('enabled', !settings.enabled)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            settings.enabled ? 'bg-indigo-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
              settings.enabled ? 'translate-x-5' : ''
            }`}
          />
        </button>
      </div>

      {settings.enabled && (
        <>
          {/* Sensitivity */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Detection Sensitivity</label>
            <div className="space-y-2">
              {sensitivityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => updateSetting('sensitivity', option.value)}
                  className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                    settings.sensitivity === option.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">{option.label}</span>
                    {settings.sensitivity === option.value && (
                      <span className="w-2 h-2 bg-indigo-600 rounded-full" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Thresholds */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Usage Thresholds</label>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Daily limit alert</span>
                  <span className="text-sm font-medium text-gray-900">{settings.dailyThresholdMB} MB</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  value={settings.dailyThresholdMB}
                  onChange={(e) => updateSetting('dailyThresholdMB', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>100 MB</span>
                  <span>5 GB</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Hourly limit alert</span>
                  <span className="text-sm font-medium text-gray-900">{settings.hourlyThresholdMB} MB</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={settings.hourlyThresholdMB}
                  onChange={(e) => updateSetting('hourlyThresholdMB', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10 MB</span>
                  <span>500 MB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification types */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Alert Types</label>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Usage Spikes</p>
                    <p className="text-xs text-gray-500">Sudden increases in data usage</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnSpike', !settings.notifyOnSpike)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.notifyOnSpike ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings.notifyOnSpike ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Threshold Breaches</p>
                    <p className="text-xs text-gray-500">Daily/hourly limits exceeded</p>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('notifyOnThreshold', !settings.notifyOnThreshold)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.notifyOnThreshold ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings.notifyOnThreshold ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">App Anomalies</p>
                    <p className="text-xs text-gray-500">Unusual app-specific patterns</p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={`Toggle app anomaly alerts ${settings.notifyOnAppAnomaly ? 'off' : 'on'}`}
                  onClick={() => updateSetting('notifyOnAppAnomaly', !settings.notifyOnAppAnomaly)}
                  className={`w-10 h-6 rounded-full transition-colors ${
                    settings.notifyOnAppAnomaly ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                      settings.notifyOnAppAnomaly ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
