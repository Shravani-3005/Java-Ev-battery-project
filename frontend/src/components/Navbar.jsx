import React, { useState, useEffect } from 'react';
import { Bell, Play, Pause, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';
import { simulationApi } from '../api/client';
import { Link } from 'react-router-dom';

export default function Navbar({ title = 'Dashboard', breadcrumbs = [], unreadAlerts = 0 }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [simState, setSimState] = useState({ isRunning: true, isPaused: false, activeScenario: 'NORMAL_DRIVING' });
  const [isToggling, setIsToggling] = useState(false);

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
      <div className="flex items-center gap-4">
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

        {/* Operator Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#34343A]">
          <div className="w-8 h-8 rounded bg-[#1B1B1F] border border-[#FF7900] flex items-center justify-center font-mono text-xs font-bold text-[#FF7900]">
            TC
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-[#F5F5F5] leading-tight">Safety Operator</div>
            <div className="text-[10px] text-[#A1A1AA] font-mono leading-none">BTMS Engineering</div>
          </div>
        </div>
      </div>
    </header>
  );
}
