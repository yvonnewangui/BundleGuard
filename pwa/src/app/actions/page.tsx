'use client';

import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { 
  MessageCircle, 
  Youtube, 
  Download, 
  Wifi, 
  Moon, 
  ChevronDown, 
  ChevronUp,
  Smartphone,
  Apple,
  ExternalLink 
} from 'lucide-react';

interface ActionGuide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  androidSteps: string[];
  iosSteps: string[];
  dataSaved: string;
}

const actionGuides: ActionGuide[] = [
  {
    id: 'whatsapp-autodownload',
    title: 'Disable WhatsApp Auto-Download',
    description: 'Stop WhatsApp from automatically downloading photos, videos, and documents',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Messaging',
    androidSteps: [
      'Open WhatsApp',
      'Tap the three dots menu → Settings',
      'Go to Storage and data',
      'Under Media auto-download:',
      '• When using mobile data: Uncheck all',
      '• When connected on Wi-Fi: Keep or adjust as needed',
      '• When roaming: Uncheck all',
    ],
    iosSteps: [
      'Open WhatsApp',
      'Go to Settings → Storage and Data',
      'Under Media Auto-Download:',
      '• Photos: Set to Wi-Fi only or Never',
      '• Audio: Set to Wi-Fi only or Never',
      '• Videos: Set to Wi-Fi only or Never',
      '• Documents: Set to Wi-Fi only or Never',
    ],
    dataSaved: 'Up to 500MB/week',
  },
  {
    id: 'youtube-quality',
    title: 'Reduce YouTube Video Quality',
    description: 'Set default video quality to save data on mobile',
    icon: <Youtube className="w-5 h-5" />,
    category: 'Streaming',
    androidSteps: [
      'Open YouTube app',
      'Tap your profile picture',
      'Go to Settings → Video quality preferences',
      'Under "Video quality on mobile networks":',
      '• Select "Data saver" or "Advanced"',
      '• If Advanced: Choose 480p or lower',
      'Under "Video quality on Wi-Fi": Keep as preferred',
    ],
    iosSteps: [
      'Open YouTube app',
      'Tap your profile picture',
      'Go to Settings → Video quality preferences',
      'Under "On mobile networks":',
      '• Select "Data saver"',
      'This limits quality to 480p on mobile data',
    ],
    dataSaved: 'Up to 1GB/week',
  },
  {
    id: 'app-updates',
    title: 'Disable Auto App Updates',
    description: 'Prevent apps from updating on mobile data',
    icon: <Download className="w-5 h-5" />,
    category: 'System',
    androidSteps: [
      'Open Google Play Store',
      'Tap your profile icon',
      'Go to Settings → Network preferences',
      'Tap "Auto-update apps"',
      'Select "Over Wi-Fi only"',
      '',
      'Also check individual app settings for in-app updates',
    ],
    iosSteps: [
      'Open Settings',
      'Go to App Store',
      'Under "Mobile Data":',
      '• Turn OFF "Automatic Downloads"',
      '• Turn OFF "App Downloads"',
      '',
      'Apps will only update on Wi-Fi',
    ],
    dataSaved: 'Up to 2GB/month',
  },
  {
    id: 'hotspot-checklist',
    title: 'Hotspot Security Checklist',
    description: 'Ensure your hotspot isn\'t being used by others',
    icon: <Wifi className="w-5 h-5" />,
    category: 'Security',
    androidSteps: [
      '1. Check connected devices:',
      '   • Settings → Network → Hotspot → Connected devices',
      '   • Remove any unknown devices',
      '',
      '2. Change hotspot password:',
      '   • Make it complex (12+ characters)',
      '   • Mix letters, numbers, symbols',
      '',
      '3. Enable WPA3 if available:',
      '   • Settings → Hotspot → Security → WPA3',
      '',
      '4. Disable auto hotspot when not in use',
    ],
    iosSteps: [
      '1. Check connected devices:',
      '   • Settings → Personal Hotspot',
      '   • See "Connections" count',
      '',
      '2. Change hotspot password:',
      '   • Tap Wi-Fi Password',
      '   • Use a strong password',
      '',
      '3. Turn off when not needed:',
      '   • Toggle Personal Hotspot off',
      '',
      '4. Enable "Family Sharing" only for trusted devices',
    ],
    dataSaved: 'Prevents unauthorized usage',
  },
  {
    id: 'night-bundle',
    title: 'Night Bundle Tips',
    description: 'Maximize your night bundle usage (11PM - 6AM)',
    icon: <Moon className="w-5 h-5" />,
    category: 'Bundles',
    androidSteps: [
      '1. Schedule large downloads:',
      '   • Use Download Manager apps',
      '   • Queue app updates for night',
      '',
      '2. Pre-download content:',
      '   • Netflix: Download shows at night',
      '   • Spotify: Download playlists',
      '   • YouTube: Save videos offline',
      '',
      '3. Set backup schedules:',
      '   • Google Photos backup: Night only',
      '   • WhatsApp backup: Schedule for 2AM',
      '',
      '4. Update apps at night:',
      '   • Disable auto-update during day',
      '   • Manually update after 11PM',
    ],
    iosSteps: [
      '1. Download content at night:',
      '   • Netflix/Apple TV+: Download shows',
      '   • Apple Music: Download playlists',
      '',
      '2. Schedule iCloud backup:',
      '   • Happens automatically when plugged in',
      '   • Keep phone charging at night',
      '',
      '3. Use Low Data Mode during day:',
      '   • Settings → Cellular → Cellular Data Options',
      '   • Enable Low Data Mode',
      '',
      '4. App updates:',
      '   • Disable automatic',
      '   • Update manually at night',
    ],
    dataSaved: 'Shift 50%+ usage to night bundles',
  },
  {
    id: 'instagram-data',
    title: 'Reduce Instagram Data Usage',
    description: 'Minimize data consumption from photos and videos',
    icon: <MessageCircle className="w-5 h-5" />,
    category: 'Social Media',
    androidSteps: [
      'Open Instagram',
      'Go to Profile → Menu (☰) → Settings',
      'Tap "Account" → "Cellular Data Use"',
      'Enable "Use Less Data"',
      '',
      'Additional tips:',
      '• Disable auto-play in feed',
      '• Preload posts on Wi-Fi only',
      '• Avoid watching Reels on mobile data',
    ],
    iosSteps: [
      'Open Instagram',
      'Go to Profile → Menu (☰) → Settings',
      'Tap "Account" → "Cellular Data Use"',
      'Enable "Use Less Data"',
      '',
      'Additional tips:',
      '• Same settings work for iOS',
      '• Consider viewing Stories on Wi-Fi',
    ],
    dataSaved: 'Up to 300MB/week',
  },
];

const categories = ['All', ...new Set(actionGuides.map(g => g.category))];

export default function ActionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [platform, setPlatform] = useState<'android' | 'ios'>('android');

  const filteredGuides = selectedCategory === 'All' 
    ? actionGuides 
    : actionGuides.filter(g => g.category === selectedCategory);

  return (
    <AppShell>
      <div className="py-4 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">Data Saving Actions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Step-by-step guides to reduce your data usage
          </p>
        </div>

        {/* Category filter */}
        <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Platform toggle */}
        <div className="flex items-center justify-center space-x-2 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setPlatform('android')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === 'android'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setPlatform('ios')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              platform === 'ios'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone</span>
          </button>
        </div>

        {/* Guides list */}
        <div className="space-y-3">
          {filteredGuides.map(guide => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
            >
              {/* Guide header */}
              <button
                onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
                    {guide.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-gray-900">{guide.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{guide.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-1 rounded-full">
                    {guide.dataSaved}
                  </span>
                  {expandedGuide === guide.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {expandedGuide === guide.id && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-4">
                    <div className="flex items-center space-x-2 mb-3">
                      {platform === 'android' ? (
                        <Smartphone className="w-4 h-4 text-green-600" />
                      ) : (
                        <Apple className="w-4 h-4 text-gray-600" />
                      )}
                      <span className="text-sm font-medium text-gray-700">
                        {platform === 'android' ? 'Android' : 'iPhone'} Steps
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <ul className="space-y-2">
                        {(platform === 'android' ? guide.androidSteps : guide.iosSteps).map((step, index) => (
                          <li
                            key={index}
                            className={`text-sm ${
                              step.startsWith('•') || step.startsWith('   ')
                                ? 'text-gray-600 pl-4'
                                : step === ''
                                  ? 'h-2'
                                  : 'text-gray-800 font-medium'
                            }`}
                          >
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Help link */}
        <div className="text-center pt-4">
          <a
            href="#"
            className="inline-flex items-center space-x-1 text-sm text-primary-600 hover:text-primary-700"
          >
            <span>Need more help?</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </AppShell>
  );
}
