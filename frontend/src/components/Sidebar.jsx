import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Activity,
  LineChart,
  Flame,
  Bell,
  History,
  Sliders,
  Settings
} from 'lucide-react';

const navItems = [
  { name: 'Overview', path: '/', icon: LayoutDashboard },
  { name: 'Battery Packs', path: '/batteries', icon: Layers },
  { name: 'Live Monitoring', path: '/live', icon: Activity },
  { name: 'Thermal Analytics', path: '/analytics', icon: LineChart },
  { name: 'Hotspot Detection', path: '/hotspots', icon: Flame },
  { name: 'Alerts', path: '/alerts', icon: Bell },
  { name: 'Historical Records', path: '/history', icon: History },
  { name: 'Thermal Simulator', path: '/simulator', icon: Sliders },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ systemOnline = true }) {
  return (
    <aside className="w-56 bg-[#172235] text-white flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-14 px-5 flex items-center border-b border-[#223147]">
        <span className="text-[15px] font-semibold tracking-wider text-white">
          THERMOCORE
        </span>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2563A6] text-white'
                    : 'text-[#94A3B8] hover:text-white hover:bg-[#1E2C42]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 stroke-[1.75]" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Status */}
      <div className="p-3 border-t border-[#223147] text-[11px] text-[#94A3B8] flex items-center justify-between">
        <span>System Status</span>
        <span className={`inline-flex items-center gap-1.5 font-medium ${systemOnline ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${systemOnline ? 'bg-[#34D399]' : 'bg-[#F87171]'}`}></span>
          {systemOnline ? 'Online' : 'Offline'}
        </span>
      </div>
    </aside>
  );
}
