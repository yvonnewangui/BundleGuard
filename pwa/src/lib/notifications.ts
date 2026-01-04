/**
 * Push Notification Manager for BundleGuard PWA
 * Handles browser notifications for spike alerts
 */

export interface SpikeNotificationData {
  id: string;
  appName: string;
  currentUsageBytes: number;
  normalUsageBytes: number;
  percentageIncrease: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export interface BundleNotificationData {
  bundleType: string;
  remainingPercent: number;
  remainingBytes: number;
  estimatedHoursLeft: number;
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    console.warn('Notification permission was denied');
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

/**
 * Format bytes for display in notifications
 */
function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) {
    return `${(bytes / 1073741824).toFixed(2)} GB`;
  } else if (bytes >= 1048576) {
    return `${(bytes / 1048576).toFixed(1)} MB`;
  } else if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${bytes} B`;
}

/**
 * Get notification icon and badge based on severity
 */
function getSeverityIcon(severity: SpikeNotificationData['severity']): { icon: string; badge: string } {
  const baseUrl = '/icons';
  
  switch (severity) {
    case 'critical':
      return { icon: `${baseUrl}/spike-critical.png`, badge: `${baseUrl}/badge-red.png` };
    case 'high':
      return { icon: `${baseUrl}/spike-high.png`, badge: `${baseUrl}/badge-orange.png` };
    case 'medium':
      return { icon: `${baseUrl}/spike-medium.png`, badge: `${baseUrl}/badge-yellow.png` };
    default:
      return { icon: `${baseUrl}/spike-low.png`, badge: `${baseUrl}/badge-blue.png` };
  }
}

/**
 * Show a spike alert notification
 */
export async function showSpikeNotification(data: SpikeNotificationData): Promise<void> {
  if (!isNotificationSupported()) return;
  
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  const usageText = formatBytes(data.currentUsageBytes);
  const normalText = formatBytes(data.normalUsageBytes);
  
  let title: string;
  let urgency: 'low' | 'normal' | 'high' = 'normal';
  
  switch (data.severity) {
    case 'critical':
      title = '🚨 Critical Data Spike!';
      urgency = 'high';
      break;
    case 'high':
      title = '⚠️ High Data Usage Alert';
      urgency = 'high';
      break;
    case 'medium':
      title = '📊 Data Spike Detected';
      break;
    default:
      title = 'ℹ️ Usage Update';
      urgency = 'low';
  }

  const body = `${data.appName} used ${usageText} today - ${data.percentageIncrease}% more than usual (${normalText})`;

  const { icon, badge } = getSeverityIcon(data.severity);

  const options: NotificationOptions = {
    body,
    icon: '/icon-192x192.png', // Fallback to app icon
    badge: '/icon-72x72.png',
    tag: `spike-${data.id}`,
    requireInteraction: data.severity === 'critical' || data.severity === 'high',
    data: {
      type: 'spike',
      ...data,
    },
  };

  try {
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      // Navigate to alerts page
      window.location.href = '/alerts';
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show multiple spike alerts as a summary notification
 */
export async function showMultipleSpikeNotification(alerts: SpikeNotificationData[]): Promise<void> {
  if (!isNotificationSupported() || alerts.length === 0) return;
  
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  const highestSeverity = alerts.reduce((highest, alert) => {
    const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return severityOrder[alert.severity] > severityOrder[highest] ? alert.severity : highest;
  }, alerts[0].severity);

  const title = highestSeverity === 'critical' 
    ? `🚨 ${alerts.length} Critical Data Spikes!`
    : `⚠️ ${alerts.length} Data Spikes Detected`;

  const appNames = alerts.slice(0, 3).map(a => a.appName).join(', ');
  const moreText = alerts.length > 3 ? ` and ${alerts.length - 3} more` : '';
  const body = `${appNames}${moreText} are using more data than usual`;

  const options: NotificationOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'spike-summary',
    requireInteraction: highestSeverity === 'critical',
    data: {
      type: 'spike-summary',
      alertCount: alerts.length,
      alerts,
    },
  };

  try {
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      window.location.href = '/alerts';
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show bundle depletion warning notification
 */
export async function showBundleDepletionNotification(data: BundleNotificationData): Promise<void> {
  if (!isNotificationSupported()) return;
  
  if (Notification.permission !== 'granted') {
    const granted = await requestNotificationPermission();
    if (!granted) return;
  }

  let title: string;
  let requireInteraction = false;
  
  if (data.remainingPercent <= 10) {
    title = '🚨 Bundle Almost Depleted!';
    requireInteraction = true;
  } else if (data.remainingPercent <= 25) {
    title = '⚠️ Bundle Running Low';
  } else {
    title = '📊 Bundle Usage Update';
  }

  const remainingText = formatBytes(data.remainingBytes);
  const timeText = data.estimatedHoursLeft > 24 
    ? `${Math.floor(data.estimatedHoursLeft / 24)} days`
    : `${data.estimatedHoursLeft} hours`;

  const body = `${data.bundleType} bundle: ${remainingText} remaining (${data.remainingPercent}%). Estimated ${timeText} left.`;

  const options: NotificationOptions = {
    body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    tag: 'bundle-depletion',
    requireInteraction,
    data: {
      type: 'bundle-depletion',
      ...data,
    },
  };

  try {
    const notification = new Notification(title, options);
    
    notification.onclick = () => {
      window.focus();
      window.location.href = '/';
      notification.close();
    };
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Check and notify about spikes (call this periodically)
 */
export async function checkAndNotifySpikes(
  currentUsage: Array<{ package: string; appName: string; bytes: number }>,
  historicalAverage: Map<string, number>,
  thresholdPercent: number = 50
): Promise<void> {
  const alerts: SpikeNotificationData[] = [];

  for (const app of currentUsage) {
    const avgBytes = historicalAverage.get(app.package);
    if (!avgBytes || avgBytes <= 0) continue;

    const percentageIncrease = Math.round(((app.bytes - avgBytes) / avgBytes) * 100);

    if (percentageIncrease >= thresholdPercent) {
      const excessBytes = app.bytes - avgBytes;
      
      let severity: SpikeNotificationData['severity'];
      if (excessBytes >= 500_000_000 || percentageIncrease >= 200) {
        severity = 'critical';
      } else if (excessBytes >= 200_000_000 || percentageIncrease >= 100) {
        severity = 'high';
      } else if (percentageIncrease >= 75) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      alerts.push({
        id: `${app.package}-${Date.now()}`,
        appName: app.appName,
        currentUsageBytes: app.bytes,
        normalUsageBytes: avgBytes,
        percentageIncrease,
        severity,
        timestamp: new Date(),
      });
    }
  }

  if (alerts.length === 0) return;

  // For single alerts or critical alerts, show individual notifications
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' || a.severity === 'high');
  
  if (alerts.length === 1) {
    await showSpikeNotification(alerts[0]);
  } else if (criticalAlerts.length > 0) {
    // Show individual notifications for critical/high alerts
    for (const alert of criticalAlerts.slice(0, 3)) {
      await showSpikeNotification(alert);
    }
    // Plus a summary
    if (alerts.length > 1) {
      await showMultipleSpikeNotification(alerts);
    }
  } else {
    // Just show summary for lower severity
    await showMultipleSpikeNotification(alerts);
  }
}

/**
 * Register service worker for background notifications (if needed)
 */
export async function registerNotificationServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/notification-sw.js');
    console.log('Notification service worker registered');
    return registration;
  } catch (error) {
    console.error('Service worker registration failed:', error);
    return null;
  }
}
