'use client';

import { useEffect, useRef, useCallback } from 'react';
import { 
  isNotificationSupported,
  getNotificationPermission,
  showSpikeNotification,
  showMultipleSpikeNotification,
  showBundleDepletionNotification,
  SpikeNotificationData,
  BundleNotificationData
} from '@/lib/notifications';
import { SpikeAlert } from '@/lib/spikeDetection';

interface NotificationPrefs {
  spikeAlerts: boolean;
  bundleAlerts: boolean;
  thresholdPercent: number;
}

const DEFAULT_PREFS: NotificationPrefs = {
  spikeAlerts: true,
  bundleAlerts: true,
  thresholdPercent: 50,
};

/**
 * Hook for managing spike notifications in the PWA
 */
export function useSpikeNotifications() {
  const lastCheckRef = useRef<number>(0);
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Get saved preferences
  const getPrefs = useCallback((): NotificationPrefs => {
    if (typeof window === 'undefined') return DEFAULT_PREFS;
    
    try {
      const saved = localStorage.getItem('notification_prefs');
      return saved ? { ...DEFAULT_PREFS, ...JSON.parse(saved) } : DEFAULT_PREFS;
    } catch {
      return DEFAULT_PREFS;
    }
  }, []);

  // Check if notifications are enabled
  const canNotify = useCallback((): boolean => {
    if (!isNotificationSupported()) return false;
    if (getNotificationPermission() !== 'granted') return false;
    return true;
  }, []);

  // Convert SpikeAlert to SpikeNotificationData
  const convertAlert = useCallback((alert: SpikeAlert): SpikeNotificationData => {
    return {
      id: alert.id,
      appName: alert.appName || 'Unknown App',
      currentUsageBytes: alert.currentUsage,
      normalUsageBytes: alert.expectedUsage,
      percentageIncrease: Math.round(alert.percentageIncrease),
      severity: alert.severity,
      timestamp: alert.detectedAt,
    };
  }, []);

  // Notify about spikes
  const notifySpikes = useCallback(async (alerts: SpikeAlert[]) => {
    if (!canNotify()) return;
    
    const prefs = getPrefs();
    if (!prefs.spikeAlerts) return;

    // Filter out already notified alerts (within last hour)
    const newAlerts = alerts.filter(alert => {
      const alertKey = `${alert.appName || alert.id}-${Math.floor(alert.detectedAt.getTime() / 3600000)}`;
      if (notifiedAlertsRef.current.has(alertKey)) return false;
      notifiedAlertsRef.current.add(alertKey);
      return true;
    });

    if (newAlerts.length === 0) return;

    // Filter by threshold
    const significantAlerts = newAlerts.filter(
      alert => alert.percentageIncrease >= prefs.thresholdPercent
    );

    if (significantAlerts.length === 0) return;

    // Convert to notification format
    const notificationAlerts: SpikeNotificationData[] = significantAlerts.map(alert => 
      convertAlert(alert)
    );

    // Send notifications
    if (notificationAlerts.length === 1) {
      await showSpikeNotification(notificationAlerts[0]);
    } else {
      // Show individual notifications for critical/high
      const criticalAlerts = notificationAlerts.filter(
        a => a.severity === 'critical' || a.severity === 'high'
      );
      
      for (const alert of criticalAlerts.slice(0, 3)) {
        await showSpikeNotification(alert);
      }
      
      // Show summary for all
      if (notificationAlerts.length > 1) {
        await showMultipleSpikeNotification(notificationAlerts);
      }
    }
  }, [canNotify, getPrefs, convertAlert]);

  // Notify about bundle depletion
  const notifyBundleDepletion = useCallback(async (data: BundleNotificationData) => {
    if (!canNotify()) return;
    
    const prefs = getPrefs();
    if (!prefs.bundleAlerts) return;

    // Only notify at specific thresholds: 25%, 10%, 5%
    const notifyThresholds = [25, 10, 5];
    const shouldNotify = notifyThresholds.some(threshold => {
      // Check if we just crossed this threshold
      return data.remainingPercent <= threshold;
    });

    if (!shouldNotify) return;

    // Check if we already notified for this threshold
    const thresholdKey = `bundle-${data.bundleType}-${Math.floor(data.remainingPercent / 5) * 5}`;
    if (notifiedAlertsRef.current.has(thresholdKey)) return;
    notifiedAlertsRef.current.add(thresholdKey);

    await showBundleDepletionNotification(data);
  }, [canNotify, getPrefs]);

  // Clear notification history (useful when user dismisses)
  const clearNotificationHistory = useCallback(() => {
    notifiedAlertsRef.current.clear();
  }, []);

  // Clean up old notification keys periodically
  useEffect(() => {
    const interval = setInterval(() => {
      // Clear notification history every hour
      notifiedAlertsRef.current.clear();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  return {
    canNotify: canNotify(),
    notifySpikes,
    notifyBundleDepletion,
    clearNotificationHistory,
  };
}

export default useSpikeNotifications;
