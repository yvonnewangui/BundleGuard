'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Clock, Zap, History, Settings } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/timeline', icon: Clock, label: 'Timeline' },
  { href: '/actions', icon: Zap, label: 'Actions' },
];

const topNavItems = [
  { href: '/history', icon: History, label: 'History' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function TopNav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">BG</span>
          </div>
          <span className="font-semibold text-gray-900">BundleGuard</span>
        </div>
        <div className="flex items-center space-x-2">
          {topNavItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`p-2 rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-600'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
                aria-label={label}
              >
                <Icon size={20} />
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
