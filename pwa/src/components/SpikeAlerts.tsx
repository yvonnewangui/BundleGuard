'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, X, ChevronRight, Shield, TrendingUp, Zap } from 'lucide-react';
import { SpikeAlert } from '@/lib/spikeDetection';

interface SpikeAlertsProps {
  deviceId?: string;
  userId?: string;
  onAlertClick?: (alert: SpikeAlert) => void;
}

const severityConfig = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    title: 'text-red-900',
  },
  high: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: AlertCircle,
    iconColor: 'text-orange-600',
    badge: 'bg-orange-100 text-orange-700',
    title: 'text-orange-900',
  },
  medium: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: TrendingUp,
    iconColor: 'text-yellow-600',
    badge: 'bg-yellow-100 text-yellow-700',
    title: 'text-yellow-900',
  },
  low: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: Info,
    iconColor: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    title: 'text-blue-900',
  },
};

export default function SpikeAlerts({ deviceId, userId, onAlertClick }: SpikeAlertsProps) {
  const [alerts, setAlerts] = useState<SpikeAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [deviceId, userId]);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (deviceId) params.set('deviceId', deviceId);
      if (userId) params.set('userId', userId);
      
      const response = await fetch(`/api/alerts?${params}`);
      const data = await response.json();
      
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set([...prev, alertId]));
  };

  const visibleAlerts = alerts.filter(a => !dismissed.has(a.id));

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
          <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
          <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (visibleAlerts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Usage Alerts</h3>
            <p className="text-sm text-gray-500">Real-time spike detection</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-green-700 font-medium">All clear!</p>
          <p className="text-green-600 text-sm mt-1">No unusual usage patterns detected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Zap className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Usage Alerts</h3>
            <p className="text-sm text-gray-500">
              {visibleAlerts.length} alert{visibleAlerts.length !== 1 ? 's' : ''} detected
            </p>
          </div>
        </div>
        {visibleAlerts.length > 0 && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            severityConfig[visibleAlerts[0].severity].badge
          }`}>
            {visibleAlerts[0].severity.toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {visibleAlerts.map((alert) => {
          const config = severityConfig[alert.severity];
          const Icon = config.icon;
          const isExpanded = expandedAlert === alert.id;

          return (
            <div
              key={alert.id}
              className={`${config.bg} ${config.border} border rounded-xl overflow-hidden transition-all duration-200`}
            >
              <div
                className="p-4 cursor-pointer"
                onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`font-medium ${config.title} truncate`}>
                        {alert.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        +{alert.percentageIncrease}%
                      </span>
                      <span>
                        {new Date(alert.detectedAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/50">
                  <div className="pt-3">
                    <p className="text-xs font-medium text-gray-700 mb-2">Recommendations:</p>
                    <ul className="space-y-1.5">
                      {alert.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                    {onAlertClick && (
                      <button
                        onClick={() => onAlertClick(alert)}
                        className="mt-3 w-full py-2 text-sm font-medium text-indigo-600 bg-white rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
