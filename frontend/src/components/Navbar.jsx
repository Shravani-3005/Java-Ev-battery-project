import React from 'react';
import { Bell, LogOut, Sun, Moon } from 'lucide-react';
import { authApi } from '../api/client';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({
  title = 'Overview',
  packs = [],
  selectedPackId,
  onSelectPack,
  unreadAlerts = 0,
}) {
  const user = authApi.getCurrentUser();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    authApi.logout();
    window.location.reload();
  };

  return (
    <header className="h-14 bg-white dark:bg-[#1E293B] border-b border-[#E5E7EB] dark:border-[#334155] px-6 flex items-center justify-between sticky top-0 z-20 transition-colors">
      {/* Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-[#202938] dark:text-[#CBD5E1] tracking-tight">
          {title}
        </h1>
        {packs && packs.length > 0 && onSelectPack && (
          <div className="flex items-center gap-2 pl-4 border-l border-[#E5E7EB] dark:border-[#334155]">
            <label className="text-xs font-medium text-[#6B7280] dark:text-[#94A3B8]">Battery Pack</label>
            <select
              value={selectedPackId}
              onChange={(e) => onSelectPack(e.target.value)}
              className="text-xs bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-2.5 py-1 focus:outline-none focus:border-[#2563A6]"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.packName} ({p.packCode})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5">
        {/* Dark / Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-1.5 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#202938] dark:hover:text-[#CBD5E1] rounded hover:bg-[#F3F4F6] dark:hover:bg-[#334155] transition-colors"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-[#D69A32]" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Alerts Link */}
        <Link
          to="/alerts"
          className="relative p-1.5 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#202938] dark:hover:text-[#CBD5E1] rounded hover:bg-[#F3F4F6] dark:hover:bg-[#334155] transition-colors"
          title="Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-[#C34848] text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </Link>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2.5 border-l border-[#E5E7EB] dark:border-[#334155] text-xs">
          <div className="w-7 h-7 rounded-full bg-[#E5E7EB] dark:bg-[#334155] text-[#202938] dark:text-[#CBD5E1] flex items-center justify-center font-semibold text-[11px]">
            {user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-[#202938] dark:text-[#CBD5E1] font-medium hidden sm:inline truncate max-w-[140px]">
            {user?.email || 'Operator'}
          </span>
          <button
            onClick={handleLogout}
            title="Log out"
            className="p-1 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#C34848] rounded hover:bg-[#F3F4F6] dark:hover:bg-[#334155] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
