import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Layers,
  Activity,
  LineChart,
  Flame,
  BellRing,
  History,
  Sliders,
  Settings,
  Zap,
  Radio,
  Server
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Battery Packs', path: '/batteries', icon: Layers },
  { name: 'Live Monitoring', path: '/live', icon: Activity },
  { name: 'Thermal Analytics', path: '/analytics', icon: LineChart },
  { name: 'Hotspot Detection', path: '/hotspots', icon: Flame },
  { name: 'Alerts & Actions', path: '/alerts', icon: BellRing },
  { name: 'Historical Records', path: '/history', icon: History },
  { name: 'Thermal Simulator', path: '/simulator', icon: Sliders },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ systemOnline = true, activeSimulation = true }) {
  return (
    <aside className="w-64 bg-[#0B0B0D] border-r border-[#34343A] flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#34343A] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#1B1B1F] border border-[#FF7900] flex items-center justify-center text-[#FF7900] shadow-[0_0_12px_rgba(255,121,0,0.3)]">
            <Zap className="w-5 h-5 fill-[#FF7900]" />
          </div>
          <div>
            <div className="text-base font-extrabold tracking-wider text-[#F5F5F5] font-mono flex items-center gap-1.5">
              THERMO<span className="text-[#FF7900]">CORE</span>
            </div>
            <div className="text-[9px] font-semibold tracking-widest text-[#A1A1AA] uppercase">
              EV Thermal Intelligence
            </div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-bold text-[#A1A1AA] uppercase px-3 mb-2 tracking-wider">
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#1B1B1F] text-[#F5F5F5] border-l-2 border-[#FF7900] shadow-[inset_0_0_10px_rgba(255,121,0,0.1)] font-semibold'
                    : 'text-[#A1A1AA] hover:bg-[#141416] hover:text-[#C0C0C0]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-[#FF7900]' : 'text-[#A1A1AA]'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-3.5 border-t border-[#34343A] bg-[#141416]/60">
        <div className="bg-[#1B1B1F] rounded border border-[#34343A] p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <Server className="w-3 h-3 text-[#C0C0C0]" /> Spring Boot 3
            </span>
            <span className={`inline-flex items-center gap-1 font-bold ${systemOnline ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${systemOnline ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'}`}></span>
              {systemOnline ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#A1A1AA] flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#FF7900]" /> Sensor Stream
            </span>
            <span className="text-[#FF7900] font-semibold text-[9px] uppercase">
              {activeSimulation ? '3.5s Real-time' : 'Paused'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
