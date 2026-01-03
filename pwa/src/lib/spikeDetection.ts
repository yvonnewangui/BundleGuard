// Spike Detection Algorithm for BundleGuard
// Detects unusual data usage patterns by analyzing historical data

export interface UsageDataPoint {
  timestamp: Date;
  bytesUsed: number;
  appName?: string;
}

export interface SpikeAlert {
  id: string;
  type: 'spike' | 'anomaly' | 'threshold';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: Date;
  appName?: string;
  currentUsage: number;
  expectedUsage: number;
  percentageIncrease: number;
  recommendations: string[];
}

export interface SpikeDetectionConfig {
  // Standard deviation multiplier for spike detection (default: 2.0)
  stdDevMultiplier: number;
  // Minimum percentage increase to trigger alert (default: 50%)
  minPercentageIncrease: number;
  // Minimum bytes to consider as spike (default: 50MB)
  minBytesThreshold: number;
  // Rolling window size in days for baseline calculation (default: 7)
  baselineWindowDays: number;
  // Daily threshold for critical alerts (default: 1GB)
  criticalDailyThreshold: number;
  // Hourly threshold for high alerts (default: 200MB)
  highHourlyThreshold: number;
}

const DEFAULT_CONFIG: SpikeDetectionConfig = {
  stdDevMultiplier: 2.0,
  minPercentageIncrease: 50,
  minBytesThreshold: 50 * 1024 * 1024, // 50MB
  baselineWindowDays: 7,
  criticalDailyThreshold: 1024 * 1024 * 1024, // 1GB
  highHourlyThreshold: 200 * 1024 * 1024, // 200MB
};

/**
 * Calculate mean of an array of numbers
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Calculate standard deviation of an array of numbers
 */
function calculateStdDev(values: number[], mean?: number): number {
  if (values.length < 2) return 0;
  const m = mean ?? calculateMean(values);
  const squaredDiffs = values.map(val => Math.pow(val - m, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
}

/**
 * Calculate percentile value from sorted array
 */
function calculatePercentile(sortedValues: number[], percentile: number): number {
  if (sortedValues.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
}

/**
 * Generate a unique alert ID
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Determine severity based on percentage increase and absolute values
 */
function determineSeverity(
  percentageIncrease: number,
  currentUsage: number,
  config: SpikeDetectionConfig
): SpikeAlert['severity'] {
  if (currentUsage >= config.criticalDailyThreshold || percentageIncrease >= 500) {
    return 'critical';
  }
  if (currentUsage >= config.highHourlyThreshold || percentageIncrease >= 200) {
    return 'high';
  }
  if (percentageIncrease >= 100) {
    return 'medium';
  }
  return 'low';
}

/**
 * Generate recommendations based on spike characteristics
 */
function generateRecommendations(
  severity: SpikeAlert['severity'],
  appName?: string,
  percentageIncrease?: number
): string[] {
  const recommendations: string[] = [];
  
  if (appName) {
    recommendations.push(`Check ${appName} for auto-updates or background downloads`);
    recommendations.push(`Review ${appName}'s data usage settings`);
  }
  
  if (severity === 'critical' || severity === 'high') {
    recommendations.push('Check for malware or unauthorized apps');
    recommendations.push('Review all background app refresh settings');
    recommendations.push('Consider enabling data saver mode');
  }
  
  if (percentageIncrease && percentageIncrease >= 200) {
    recommendations.push('Verify no unexpected video streaming occurred');
    recommendations.push('Check for large file downloads');
  }
  
  recommendations.push('Monitor usage over the next few hours');
  
  return recommendations.slice(0, 4); // Limit to 4 recommendations
}

/**
 * Format bytes for display
 */
export function formatBytesForAlert(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  if (bytes >= 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${bytes} B`;
}

/**
 * Main spike detection function using Z-score method
 * Detects data points that deviate significantly from the baseline
 */
export function detectSpikes(
  currentUsage: UsageDataPoint[],
  historicalUsage: UsageDataPoint[],
  config: Partial<SpikeDetectionConfig> = {}
): SpikeAlert[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const alerts: SpikeAlert[] = [];
  
  if (currentUsage.length === 0) return alerts;
  
  // Group historical data by hour of day for better baseline
  const hourlyBaselines = new Map<number, number[]>();
  
  historicalUsage.forEach(point => {
    const hour = point.timestamp.getHours();
    if (!hourlyBaselines.has(hour)) {
      hourlyBaselines.set(hour, []);
    }
    hourlyBaselines.get(hour)!.push(point.bytesUsed);
  });
  
  // Calculate overall baseline stats
  const allHistoricalValues = historicalUsage.map(p => p.bytesUsed);
  const overallMean = calculateMean(allHistoricalValues);
  const overallStdDev = calculateStdDev(allHistoricalValues, overallMean);
  
  // Analyze current usage for spikes
  currentUsage.forEach(point => {
    const hour = point.timestamp.getHours();
    const hourlyData = hourlyBaselines.get(hour) || allHistoricalValues;
    
    const baselineMean = hourlyData.length > 0 ? calculateMean(hourlyData) : overallMean;
    const baselineStdDev = hourlyData.length > 1 ? calculateStdDev(hourlyData) : overallStdDev;
    
    // Skip if baseline is too low (not enough historical data)
    if (baselineMean < 1000) return;
    
    // Calculate Z-score
    const zScore = baselineStdDev > 0 
      ? (point.bytesUsed - baselineMean) / baselineStdDev 
      : 0;
    
    // Calculate percentage increase
    const percentageIncrease = baselineMean > 0 
      ? ((point.bytesUsed - baselineMean) / baselineMean) * 100 
      : 0;
    
    // Check if this is a spike
    const isStatisticalSpike = zScore > cfg.stdDevMultiplier;
    const isPercentageSpike = percentageIncrease >= cfg.minPercentageIncrease;
    const meetsMinThreshold = point.bytesUsed >= cfg.minBytesThreshold;
    
    if ((isStatisticalSpike || isPercentageSpike) && meetsMinThreshold) {
      const severity = determineSeverity(percentageIncrease, point.bytesUsed, cfg);
      
      alerts.push({
        id: generateAlertId(),
        type: 'spike',
        severity,
        title: point.appName 
          ? `Unusual usage from ${point.appName}` 
          : 'Unusual data usage detected',
        description: `Data usage of ${formatBytesForAlert(point.bytesUsed)} is ${percentageIncrease.toFixed(0)}% higher than your typical ${formatBytesForAlert(baselineMean)} at this time.`,
        detectedAt: new Date(),
        appName: point.appName,
        currentUsage: point.bytesUsed,
        expectedUsage: baselineMean,
        percentageIncrease: Math.round(percentageIncrease),
        recommendations: generateRecommendations(severity, point.appName, percentageIncrease),
      });
    }
  });
  
  return alerts;
}

/**
 * Detect threshold breaches (absolute limits)
 */
export function detectThresholdBreaches(
  dailyUsage: number,
  hourlyUsage: number,
  config: Partial<SpikeDetectionConfig> = {}
): SpikeAlert[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const alerts: SpikeAlert[] = [];
  
  if (dailyUsage >= cfg.criticalDailyThreshold) {
    alerts.push({
      id: generateAlertId(),
      type: 'threshold',
      severity: 'critical',
      title: 'Daily data limit exceeded',
      description: `You've used ${formatBytesForAlert(dailyUsage)} today, exceeding the ${formatBytesForAlert(cfg.criticalDailyThreshold)} threshold.`,
      detectedAt: new Date(),
      currentUsage: dailyUsage,
      expectedUsage: cfg.criticalDailyThreshold,
      percentageIncrease: Math.round((dailyUsage / cfg.criticalDailyThreshold - 1) * 100),
      recommendations: [
        'Consider pausing non-essential downloads',
        'Enable data saver mode',
        'Check for apps using excessive background data',
        'Review your data plan limits',
      ],
    });
  }
  
  if (hourlyUsage >= cfg.highHourlyThreshold) {
    alerts.push({
      id: generateAlertId(),
      type: 'threshold',
      severity: 'high',
      title: 'High hourly usage detected',
      description: `${formatBytesForAlert(hourlyUsage)} used in the last hour, which is unusually high.`,
      detectedAt: new Date(),
      currentUsage: hourlyUsage,
      expectedUsage: cfg.highHourlyThreshold,
      percentageIncrease: Math.round((hourlyUsage / cfg.highHourlyThreshold - 1) * 100),
      recommendations: [
        'Check what apps are currently active',
        'Look for ongoing downloads or updates',
        'Verify no video streaming is running',
      ],
    });
  }
  
  return alerts;
}

/**
 * Detect anomalies in app-specific usage patterns
 */
export function detectAppAnomalies(
  appUsageHistory: Map<string, number[]>,
  currentAppUsage: Map<string, number>,
  config: Partial<SpikeDetectionConfig> = {}
): SpikeAlert[] {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const alerts: SpikeAlert[] = [];
  
  currentAppUsage.forEach((currentBytes, appName) => {
    const history = appUsageHistory.get(appName) || [];
    
    if (history.length < 3) return; // Need enough history
    
    const sortedHistory = [...history].sort((a, b) => a - b);
    const median = calculatePercentile(sortedHistory, 50);
    const p90 = calculatePercentile(sortedHistory, 90);
    
    // Check if current usage significantly exceeds historical P90
    if (currentBytes > p90 * 2 && currentBytes >= cfg.minBytesThreshold) {
      const percentageIncrease = median > 0 
        ? ((currentBytes - median) / median) * 100 
        : 0;
      
      const severity = determineSeverity(percentageIncrease, currentBytes, cfg);
      
      alerts.push({
        id: generateAlertId(),
        type: 'anomaly',
        severity,
        title: `${appName} using more data than usual`,
        description: `${appName} has used ${formatBytesForAlert(currentBytes)}, compared to typical ${formatBytesForAlert(median)}.`,
        detectedAt: new Date(),
        appName,
        currentUsage: currentBytes,
        expectedUsage: median,
        percentageIncrease: Math.round(percentageIncrease),
        recommendations: generateRecommendations(severity, appName, percentageIncrease),
      });
    }
  });
  
  return alerts;
}

/**
 * Comprehensive spike analysis combining all detection methods
 */
export function analyzeUsageForSpikes(
  currentHourlyUsage: UsageDataPoint[],
  historicalHourlyUsage: UsageDataPoint[],
  dailyTotal: number,
  currentHourTotal: number,
  appUsageHistory?: Map<string, number[]>,
  currentAppUsage?: Map<string, number>,
  config?: Partial<SpikeDetectionConfig>
): SpikeAlert[] {
  const allAlerts: SpikeAlert[] = [];
  
  // 1. Detect statistical spikes in hourly data
  const spikeAlerts = detectSpikes(currentHourlyUsage, historicalHourlyUsage, config);
  allAlerts.push(...spikeAlerts);
  
  // 2. Detect threshold breaches
  const thresholdAlerts = detectThresholdBreaches(dailyTotal, currentHourTotal, config);
  allAlerts.push(...thresholdAlerts);
  
  // 3. Detect app-specific anomalies
  if (appUsageHistory && currentAppUsage) {
    const appAlerts = detectAppAnomalies(appUsageHistory, currentAppUsage, config);
    allAlerts.push(...appAlerts);
  }
  
  // Sort by severity (critical first) and deduplicate
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  allAlerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  
  // Deduplicate by app name (keep highest severity)
  const seen = new Set<string>();
  return allAlerts.filter(alert => {
    const key = alert.appName || alert.type;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
