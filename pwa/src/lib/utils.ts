// Utility functions for formatting data

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatBytesShort(bytes: number): string {
  if (bytes === 0) return '0';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))}${sizes[i]}`;
}

export function calculatePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, Math.round((used / total) * 100));
}

export function calculateBurnRate(usedBytes: number, daysElapsed: number): number {
  if (daysElapsed === 0) return usedBytes;
  return usedBytes / daysElapsed;
}

export function estimateTimeRemaining(remainingBytes: number, dailyBurnRate: number): string {
  if (dailyBurnRate === 0) return 'Unknown';
  
  const daysRemaining = remainingBytes / dailyBurnRate;
  
  if (daysRemaining < 1) {
    const hoursRemaining = daysRemaining * 24;
    return `${Math.round(hoursRemaining)} hours`;
  }
  
  return `${Math.round(daysRemaining)} days`;
}

export function getAppDisplayName(packageName: string): string {
  // Common app package name mappings
  const appNames: Record<string, string> = {
    'com.whatsapp': 'WhatsApp',
    'com.instagram.android': 'Instagram',
    'com.facebook.katana': 'Facebook',
    'com.facebook.orca': 'Messenger',
    'com.twitter.android': 'Twitter/X',
    'com.google.android.youtube': 'YouTube',
    'com.spotify.music': 'Spotify',
    'com.netflix.mediaclient': 'Netflix',
    'com.tiktok': 'TikTok',
    'com.snapchat.android': 'Snapchat',
    'com.google.android.gm': 'Gmail',
    'com.google.android.apps.maps': 'Google Maps',
    'com.android.chrome': 'Chrome',
    'org.mozilla.firefox': 'Firefox',
    'com.opera.browser': 'Opera',
    'com.brave.browser': 'Brave',
    'com.telegram.messenger': 'Telegram',
    'com.zhiliaoapp.musically': 'TikTok',
    'com.linkedin.android': 'LinkedIn',
    'com.pinterest': 'Pinterest',
    'com.amazon.mShop.android.shopping': 'Amazon',
    'com.jumia.android': 'Jumia',
    'com.safaricom.mpesa.customer': 'M-PESA',
  };
  
  if (appNames[packageName]) {
    return appNames[packageName];
  }
  
  // Extract app name from package name
  const parts = packageName.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
}

export function getNetworkColor(network: 'mobile' | 'wifi'): string {
  return network === 'mobile' ? 'text-orange-500' : 'text-blue-500';
}

export function getNetworkBgColor(network: 'mobile' | 'wifi'): string {
  return network === 'mobile' ? 'bg-orange-100' : 'bg-blue-100';
}

export function generatePairingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'BG-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return formatDate(d);
}
