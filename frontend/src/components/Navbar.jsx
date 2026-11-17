import React, { useState, useEffect } from 'react';
import { Bell, Play, Pause, Clock, Sun, Moon, Lock, Unlock, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { simulationApi, authApi } from '../api/client';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ title = 'Dashboard', breadcrumbs = [], unreadAlerts = 0 }) {
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [simState, setSimState] = useState({ isRunning: true, isPaused: false, activeScenario: 'NORMAL_DRIVING' });
  const [isToggling, setIsToggling] = useState(false);
  const [user, setUser] = useState(authApi.getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ username: 'operator', password: 'operator123' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchSimStatus = async () => {
    try {
      const data = await simulationApi.getStatus();
      setSimState(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSimStatus();
    const interval = setInterval(fetchSimStatus, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSim = async () => {
    setIsToggling(true);
    try {
      if (simState.isPaused || !simState.isRunning) {
        await simulationApi.resume();
        await simulationApi.start();
      } else {
        await simulationApi.pause();
      }
      await fetchSimStatus();
    } catch (e) {
    } finally {
      setIsToggling(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      await authApi.login(authForm.username, authForm.password);
      setUser(authApi.getCurrentUser());
      setShowAuthModal(false);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Invalid username or password. Use operator / operator123');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <header className="h-16 bg-[#0B0B0D]/95 backdrop-blur border-b border-[#34343A] px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA] font-mono">
          <span>THERMOCORE</span>
          <span>/</span>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              <span className={i === breadcrumbs.length - 1 ? 'text-[#F5F5F5] font-semibold' : ''}>{b}</span>
              {i < breadcrumbs.length - 1 && <span>/</span>}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-base font-bold text-[#F5F5F5] tracking-tight">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Simulation Scenario Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-xs">
          <span className="text-[10px] text-[#A1A1AA] font-mono uppercase">Scenario:</span>
          <span className="font-mono font-semibold text-[#FF7900] text-[11px]">
            {simState.activeScenario?.replace(/_/g, ' ')}
          </span>
          <button
            onClick={handleToggleSim}
            disabled={isToggling}
            className={`p-1 rounded text-xs ml-1 border transition-colors ${
              simState.isPaused || !simState.isRunning
                ? 'bg-[#FF7900]/10 border-[#FF7900] text-[#FF7900] hover:bg-[#FF7900] hover:text-black'
                : 'bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E] hover:bg-[#22C55E] hover:text-black'
            }`}
            title={simState.isPaused ? 'Resume Sensor Stream' : 'Pause Sensor Stream'}
          >
            {simState.isPaused || !simState.isRunning ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
        </div>

        {/* Live Clock */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-[#C0C0C0] font-mono bg-[#141416] px-2.5 py-1.5 rounded border border-[#34343A]">
          <Clock className="w-3.5 h-3.5 text-[#FF7900]" />
          <span>{currentTime.toLocaleTimeString()}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#C0C0C0] hover:text-[#FF7900] hover:border-[#FF7900] transition-colors font-mono text-xs"
          title={isDark ? 'Switch to Light Theme (White & Blue)' : 'Switch to Dark Theme (Black & Orange)'}
        >
          {isDark ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#FF7900]" />
              <span className="text-[10px] font-semibold text-[#F5F5F5] hidden sm:inline">LIGHT</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-semibold text-[#0F172A] hidden sm:inline">DARK</span>
            </>
          )}
        </button>

        {/* Alerts Bell */}
        <Link
          to="/alerts"
          className="relative p-2 rounded bg-[#1B1B1F] border border-[#34343A] text-[#C0C0C0] hover:text-[#FF7900] hover:border-[#FF7900] transition-colors"
          title="View Alerts"
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center font-mono">
              {unreadAlerts}
            </span>
          )}
        </Link>

        {/* Operator / JWT Auth Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#34343A]">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-[#22C55E]/15 border border-[#22C55E] flex items-center justify-center font-mono text-xs font-bold text-[#22C55E]">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left font-mono">
                <div className="text-xs font-semibold text-[#F5F5F5] flex items-center gap-1">
                  <span>{user.username}</span>
                  <span className="text-[9px] px-1 py-0.2 rounded bg-[#22C55E]/20 text-[#22C55E] font-bold">JWT</span>
                </div>
                <div className="text-[10px] text-[#A1A1AA]">{user.role || 'ROLE_OPERATOR'}</div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout JWT session"
                className="p-1.5 rounded text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FF7900] hover:bg-[#ff8c1a] text-black font-bold font-mono text-xs transition-all shadow"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>JWT Login</span>
            </button>
          )}
        </div>
      </div>

      {/* JWT Login Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1B1B1F] border border-[#34343A] rounded-lg max-w-sm w-full p-6 shadow-2xl relative">
            <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider font-mono mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#FF7900]" />
              Operator JWT Authentication
            </h3>
            <p className="text-[11px] text-[#A1A1AA] mb-4 font-mono">
              Phase 3 Spring Security token gate. Default: <code className="text-[#FF7900]">operator</code> / <code className="text-[#FF7900]">operator123</code>
            </p>

            <form onSubmit={handleLogin} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#A1A1AA] block mb-1">USERNAME</label>
                <input
                  type="text"
                  required
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[#A1A1AA] block mb-1">PASSWORD</label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                />
              </div>

              {authError && (
                <div className="p-2 rounded bg-[#EF4444]/15 border border-[#EF4444]/40 text-[#EF4444] text-[11px]">
                  {authError}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-1/2 py-2 rounded bg-[#141416] text-[#A1A1AA] hover:text-[#F5F5F5] border border-[#34343A] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-1/2 py-2 rounded bg-[#FF7900] hover:bg-[#ff8c1a] text-black font-bold uppercase transition-all shadow"
                >
                  {authLoading ? 'Verifying...' : 'Sign In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
