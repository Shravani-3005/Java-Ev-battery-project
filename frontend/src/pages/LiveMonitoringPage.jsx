import React, { useState, useEffect } from 'react';
import {
  Activity,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Zap,
  Flame,
  Droplets,
  AlertOctagon,
  Gauge,
  Thermometer,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { batteriesApi, sensorsApi, simulationApi } from '../api/client';

const SCENARIOS = [
  { id: 'NORMAL_DRIVING', label: 'Normal Driving', desc: 'Typical cruise cycle (30-33°C, 35A)' },
  { id: 'HIGH_LOAD_ACCELERATION', label: 'Sprint / Hill Climb', desc: 'High discharge (180-250A, rising ΔT)' },
  { id: 'RAPID_CHARGING', label: 'DC Fast-Charging', desc: '150-230A charging current with high thermal generation' },
  { id: 'HOT_WEATHER', label: 'Extreme Ambient (42°C)', desc: 'High ambient heat with reduced radiator efficiency' },
  { id: 'COOLANT_FLOW_REDUCTION', label: 'Coolant Flow Restriction', desc: 'Micro-channel flow throttled to < 1.0 L/min' },
  { id: 'COOLANT_PUMP_FAILURE', label: 'Coolant Pump Failure (0 L/min)', desc: 'Zero coolant circulation & rapid thermal runaway danger' },
  { id: 'CELL_OVERHEATING', label: 'Single Cell Hotspot Runaway', desc: 'Isolated cell anomaly (ΔT > 10°C)' },
];

export default function LiveMonitoringPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [currentReading, setCurrentReading] = useState(null);
  const [cellTemps, setCellTemps] = useState([]);
  const [simStatus, setSimStatus] = useState({ isRunning: true, isPaused: false, activeScenario: 'NORMAL_DRIVING', speedMultiplier: 1.0 });
  const [isActionPending, setIsActionPending] = useState(false);

  const fetchPacksAndStatus = async () => {
    try {
      const [packsData, statusData] = await Promise.all([
        batteriesApi.getAll(),
        simulationApi.getStatus(),
      ]);
      setPacks(packsData);
      setSimStatus(statusData);
      if (!selectedPackId && packsData.length > 0) {
        setSelectedPackId(packsData[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLiveTelemetry = async () => {
    if (!selectedPackId) return;
    try {
      const reading = await sensorsApi.getLatestForBattery(selectedPackId);
      if (reading) {
        setCurrentReading(reading);
        const cells = await sensorsApi.getCellTemps(reading.id);
        setCellTemps(cells || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPacksAndStatus();
  }, []);

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 2500);
    return () => clearInterval(interval);
  }, [selectedPackId]);

  const handleSimControl = async (action, arg) => {
    setIsActionPending(true);
    try {
      if (action === 'start') await simulationApi.start();
      else if (action === 'stop') await simulationApi.stop();
      else if (action === 'pause') await simulationApi.pause();
      else if (action === 'resume') await simulationApi.resume();
      else if (action === 'speed') await simulationApi.setSpeed(arg);
      else if (action === 'scenario') await simulationApi.setScenario(arg);
      else if (action === 'tick') await simulationApi.tick();

      const updated = await simulationApi.getStatus();
      setSimStatus(updated);
      await fetchLiveTelemetry();
    } catch (e) {
      alert('Simulation error: ' + e.message);
    } finally {
      setIsActionPending(false);
    }
  };

  const activePack = packs.find(p => p.id === Number(selectedPackId));

  return (
    <div className="space-y-6">
      {/* Simulation Command Center Bar */}
      <div className="p-5 rounded-lg bg-[#141416] border border-[#34343A] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#1B1B1F] border border-[#FF7900] flex items-center justify-center text-[#FF7900]">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider font-mono">
                  Sensor Simulation Command Engine
                </h2>
                <span className={`px-2 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                  simStatus.isRunning && !simStatus.isPaused
                    ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/40'
                    : 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/40'
                }`}>
                  {simStatus.isRunning && !simStatus.isPaused ? 'TRANSMITTING' : 'STREAM PAUSED'}
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
                Physics-based micro-channel battery thermal generator (3.5s update cycle)
              </p>
            </div>
          </div>

          {/* Target Pack Selector */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[#A1A1AA] uppercase">Active Pack:</span>
            <select
              value={selectedPackId}
              onChange={(e) => setSelectedPackId(e.target.value)}
              className="bg-[#1B1B1F] border border-[#FF7900] text-[#F5F5F5] rounded px-3 py-1.5 focus:outline-none"
            >
              {packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.packCode} ({p.vehicleModel})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Control Buttons & Scenario Triggers */}
        <div className="pt-3 border-t border-[#34343A] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          {/* Main Controls */}
          <div className="flex items-center gap-2">
            {simStatus.isPaused || !simStatus.isRunning ? (
              <button
                onClick={() => handleSimControl('resume')}
                disabled={isActionPending}
                className="px-3.5 py-1.5 rounded bg-[#22C55E] text-black font-bold flex items-center gap-1.5 hover:bg-[#16A34A] transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Resume Stream</span>
              </button>
            ) : (
              <button
                onClick={() => handleSimControl('pause')}
                disabled={isActionPending}
                className="px-3.5 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#FF7900] hover:border-[#FF7900] flex items-center gap-1.5 transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Stream</span>
              </button>
            )}

            <button
              onClick={() => handleSimControl('tick')}
              disabled={isActionPending}
              className="px-3 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#C0C0C0] hover:text-[#F5F5F5] flex items-center gap-1 transition-colors"
              title="Trigger single sensor observation reading immediately"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Step 1-Tick</span>
            </button>
          </div>

          {/* Speed Multiplier */}
          <div className="flex items-center gap-1 bg-[#1B1B1F] p-1 rounded border border-[#34343A]">
            <span className="text-[10px] text-[#A1A1AA] px-1.5 uppercase">Speed:</span>
            {[0.5, 1.0, 2.0, 5.0].map((s) => (
              <button
                key={s}
                onClick={() => handleSimControl('speed', s)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  simStatus.speedMultiplier === s
                    ? 'bg-[#FF7900] text-black'
                    : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Predefined Scenario Injections */}
        <div className="pt-3 border-t border-[#34343A]">
          <div className="text-[11px] font-mono text-[#A1A1AA] uppercase tracking-wider mb-2">
            Inject Predefined Operating Scenarios:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-xs font-mono">
            {SCENARIOS.map((sc) => {
              const isActive = simStatus.activeScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => handleSimControl('scenario', sc.id)}
                  disabled={isActionPending}
                  className={`p-2.5 rounded text-left border transition-all ${
                    isActive
                      ? 'bg-[#FF7900]/15 border-[#FF7900] text-[#FF7900] shadow-[0_0_12px_rgba(255,121,0,0.2)]'
                      : 'bg-[#1B1B1F] border-[#34343A] text-[#C0C0C0] hover:border-[#FF7900]/50 hover:text-[#F5F5F5]'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between text-[11px]">
                    <span>{sc.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FF7900]"></span>}
                  </div>
                  <div className="text-[10px] text-[#A1A1AA] mt-1 line-clamp-1">{sc.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Pack Temperature</span>
          <div className="text-2xl font-bold text-[#F5F5F5] mt-1">
            {currentReading?.batteryTemp?.toFixed(1) || '--'}°C
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">
            Safe Limit: {activePack?.maxSafeTemp || 45}°C
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Max Cell (Gradient ΔT)</span>
          <div className="text-2xl font-bold text-[#EF4444] mt-1">
            {currentReading?.maxCellTemp?.toFixed(1) || '--'}°C
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">
            ΔT: <span className={currentReading?.tempGradient >= 5 ? 'text-[#EF4444] font-bold' : 'text-[#FF7900]'}>{currentReading?.tempGradient?.toFixed(1)}°C</span> (Threshold: 5.0°C)
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Voltage & Current</span>
          <div className="text-2xl font-bold text-[#F5F5F5] mt-1">
            {currentReading?.voltage?.toFixed(0) || '--'}V
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">
            Current: <span className="text-[#FF7900]">{currentReading?.current?.toFixed(1)}A</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Coolant Flow Rate</span>
          <div className="text-2xl font-bold text-[#38BDF8] mt-1">
            {currentReading?.coolantFlowRate?.toFixed(1) || '--'} L/min
          </div>
          <div className="text-[10px] text-[#A1A1AA] mt-1">
            In: {currentReading?.coolantInletTemp?.toFixed(1)}°C | Out: {currentReading?.coolantOutletTemp?.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* 12-Cell Physical Thermal Matrix View */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider font-mono flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FF7900]" />
              Battery Module Cell Thermal Matrix (Physical Heat Map)
            </h3>
            <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
              Individual cell sensors across micro-channel cooling plates. Blue/Green (&lt;35°C), Amber (35-42°C), Red (&gt;45°C)
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#22C55E]"></span> &lt;35°C Optimal
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#FF7900]"></span> 35-44°C Warning
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#EF4444]"></span> &gt;45°C Hotspot
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 font-mono">
          {cellTemps.length > 0 ? (
            cellTemps.map((cell) => {
              const temp = cell.temperature;
              let bgColor = 'bg-[#141416] border-[#34343A] text-[#F5F5F5]';
              let badgeColor = 'text-[#22C55E]';
              if (temp >= 50.0 || cell.isHotspot) {
                bgColor = 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse';
                badgeColor = 'text-[#EF4444]';
              } else if (temp >= 42.0) {
                bgColor = 'bg-[#FF7900]/15 border-[#FF7900] text-[#FF7900]';
                badgeColor = 'text-[#FF7900]';
              } else if (temp >= 35.0) {
                bgColor = 'bg-[#FF922B]/10 border-[#FF922B]/50 text-[#F5F5F5]';
                badgeColor = 'text-[#FF922B]';
              }

              return (
                <div
                  key={cell.id || cell.cellIndex}
                  className={`p-3.5 rounded-lg border ${bgColor} transition-all flex flex-col justify-between`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A1A1AA]">{cell.cellLabel}</span>
                    {cell.isHotspot && (
                      <span className="text-[9px] font-bold px-1 rounded bg-[#EF4444] text-black">
                        HOTSPOT
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold my-1">{temp?.toFixed(1)}°C</div>
                  <div className="text-[10px] text-[#A1A1AA] flex items-center justify-between">
                    <span>Δ from avg:</span>
                    <span className={`font-semibold ${cell.deltaFromAvg > 0 ? badgeColor : 'text-[#C0C0C0]'}`}>
                      {cell.deltaFromAvg > 0 ? `+${cell.deltaFromAvg?.toFixed(1)}` : cell.deltaFromAvg?.toFixed(1)}°C
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center text-[#A1A1AA] text-xs">
              Awaiting cell sensor arrays...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
