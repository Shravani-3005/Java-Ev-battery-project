import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Zap,
  Flame,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Send,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  Droplets
} from 'lucide-react';
import { batteriesApi, thermalApi, sensorsApi } from '../api/client';

export default function ThermalSimulatorPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');

  const [form, setForm] = useState({
    batteryTemp: 35.0,
    minCellTemp: 32.5,
    maxCellTemp: 38.5,
    voltage: 380.0,
    current: 120.0,
    coolantInletTemp: 24.0,
    coolantOutletTemp: 28.5,
    coolantFlowRate: 3.5,
    stateOfCharge: 75.0,
    stateOfHealth: 98.0,
    testScenario: 'What-If Simulation Run',
  });

  const [aiResult, setAiResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data);
      if (data.length > 0) setSelectedPackId(data[0].id);
    });
  }, []);

  const runSimulation = async (customForm = form) => {
    if (!selectedPackId) return;
    setIsSimulating(true);
    try {
      const payload = {
        ...customForm,
        batteryPackId: Number(selectedPackId),
      };
      const result = await thermalApi.analyze(payload);
      setAiResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedPackId) runSimulation(form);
  }, [selectedPackId]);

  const handleChange = (field, val) => {
    const updated = { ...form, [field]: val };
    if (field === 'maxCellTemp' || field === 'minCellTemp') {
      const max = field === 'maxCellTemp' ? val : form.maxCellTemp;
      const min = field === 'minCellTemp' ? val : form.minCellTemp;
      updated.batteryTemp = Math.round(((max + min) / 2) * 10) / 10;
    }
    setForm(updated);
    runSimulation(updated);
  };

  const applyPreset = (key) => {
    let preset = {};
    if (key === 'eco') {
      preset = {
        batteryTemp: 30.5,
        minCellTemp: 29.5,
        maxCellTemp: 31.5,
        current: 45.0,
        voltage: 395.0,
        coolantFlowRate: 2.0,
        coolantInletTemp: 22.0,
        coolantOutletTemp: 24.5,
        testScenario: 'Simulation: Eco City Cruise',
      };
    } else if (key === 'sprint') {
      preset = {
        batteryTemp: 41.0,
        minCellTemp: 38.0,
        maxCellTemp: 44.5,
        current: 220.0,
        voltage: 370.0,
        coolantFlowRate: 5.5,
        coolantInletTemp: 24.0,
        coolantOutletTemp: 30.0,
        testScenario: 'Simulation: Track Sprint High-Load',
      };
    } else if (key === 'fastcharge') {
      preset = {
        batteryTemp: 46.5,
        minCellTemp: 41.0,
        maxCellTemp: 51.5,
        current: -240.0, // Charging
        voltage: 415.0,
        coolantFlowRate: 7.0,
        coolantInletTemp: 26.0,
        coolantOutletTemp: 34.0,
        testScenario: 'Simulation: Summer 350kW Fast-Charge',
      };
    } else if (key === 'pumpfail') {
      preset = {
        batteryTemp: 52.0,
        minCellTemp: 43.0,
        maxCellTemp: 57.5,
        current: 130.0,
        voltage: 360.0,
        coolantFlowRate: 0.0, // Failed
        coolantInletTemp: 32.0,
        coolantOutletTemp: 45.0,
        testScenario: 'Simulation: Micro-Channel Pump Failure',
      };
    }

    const merged = { ...form, ...preset };
    setForm(merged);
    runSimulation(merged);
  };

  const handleCommitToDatabase = async () => {
    if (!selectedPackId) return;
    try {
      await sensorsApi.ingestReading({
        ...form,
        batteryPackId: Number(selectedPackId),
      });
      setCommitSuccess(true);
      setTimeout(() => setCommitSuccess(false), 3500);
    } catch (e) {
      alert('Error saving observation: ' + e.message);
    }
  };

  const activePack = packs.find(p => p.id === Number(selectedPackId));

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#FF7900]" />
            What-If Scenario Simulator &amp; Thermal Risk Sandbox
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Test edge-case thermal dynamics (DC fast charging, pump stalls, high summer ambient) with live AI inference
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            className="bg-[#1B1B1F] border border-[#FF7900] text-[#F5F5F5] rounded px-3 py-1.5 focus:outline-none"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>{p.packCode} ({p.vehicleModel})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick Presets Strip */}
      <div className="flex flex-wrap items-center gap-2.5 p-3 rounded bg-[#1B1B1F] border border-[#34343A]">
        <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">Quick Scenario Presets:</span>
        <button
          onClick={() => applyPreset('eco')}
          className="px-2.5 py-1 rounded bg-[#141416] text-[#22C55E] hover:border-[#22C55E] border border-[#34343A] transition-colors"
        >
          Eco City Cruise
        </button>
        <button
          onClick={() => applyPreset('sprint')}
          className="px-2.5 py-1 rounded bg-[#141416] text-[#FF7900] hover:border-[#FF7900] border border-[#34343A] transition-colors"
        >
          Track Sprint (High Load)
        </button>
        <button
          onClick={() => applyPreset('fastcharge')}
          className="px-2.5 py-1 rounded bg-[#141416] text-[#EF4444] hover:border-[#EF4444] border border-[#34343A] transition-colors"
        >
          Summer Fast-Charge (ΔT 10.5°)
        </button>
        <button
          onClick={() => applyPreset('pumpfail')}
          className="px-2.5 py-1 rounded bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-black border border-[#EF4444]/50 transition-colors font-bold"
        >
          Pump Failure (0 L/min)
        </button>
      </div>

      {/* Main Grid: Controls vs Live AI Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Col: Parameter Sliders */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] space-y-4">
          <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center justify-between">
            <span>Simulated Sensor Parameters</span>
            <span className="text-[10px] text-[#A1A1AA] font-normal">Real-time reactive</span>
          </h3>

          {/* Max Cell Temp */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Peak Cell Temp (T_max):</span>
              <span className="font-bold text-[#EF4444]">{form.maxCellTemp}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="0.5"
              value={form.maxCellTemp}
              onChange={(e) => handleChange('maxCellTemp', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Min Cell Temp */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Min Cell Temp (T_min):</span>
              <span className="font-bold text-[#C0C0C0]">{form.minCellTemp}°C</span>
            </div>
            <input
              type="range"
              min="18"
              max="65"
              step="0.5"
              value={form.minCellTemp}
              onChange={(e) => handleChange('minCellTemp', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Current */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Pack Current (A):</span>
              <span className="font-bold text-[#FF7900]">{form.current} A</span>
            </div>
            <input
              type="range"
              min="-280"
              max="320"
              step="5"
              value={form.current}
              onChange={(e) => handleChange('current', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Coolant Flow */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Coolant Pump Flow Rate (L/min):</span>
              <span className="font-bold text-[#38BDF8]">{form.coolantFlowRate} L/min</span>
            </div>
            <input
              type="range"
              min="0"
              max="14"
              step="0.2"
              value={form.coolantFlowRate}
              onChange={(e) => handleChange('coolantFlowRate', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8]"
            />
          </div>

          {/* Coolant Delta */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-[#A1A1AA] text-[10px] block mb-1">INLET TEMP (°C)</label>
              <input
                type="number"
                step="0.5"
                value={form.coolantInletTemp}
                onChange={(e) => handleChange('coolantInletTemp', parseFloat(e.target.value))}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#F5F5F5] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#A1A1AA] text-[10px] block mb-1">OUTLET TEMP (°C)</label>
              <input
                type="number"
                step="0.5"
                value={form.coolantOutletTemp}
                onChange={(e) => handleChange('coolantOutletTemp', parseFloat(e.target.value))}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#F5F5F5] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#34343A] flex items-center justify-between">
            <button
              onClick={handleCommitToDatabase}
              className="px-4 py-2 rounded bg-[#FF7900] hover:bg-[#FF922B] text-black font-bold uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(255,121,0,0.3)] transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Commit Test Observation to DB</span>
            </button>
            {commitSuccess && (
              <span className="text-[#22C55E] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Persisted!
              </span>
            )}
          </div>
        </div>

        {/* Right Col: AI Inference Result & Physical Actuation Directives */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF7900]" />
                Thermal Intelligence Rule-Engine Output
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#222226] text-[#A1A1AA] border border-[#34343A]">
                KJS-CES-02 BTMS
              </span>
            </div>

            {/* Risk Badge */}
            <div className="p-4 rounded-lg bg-[#141416] border border-[#34343A] flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-[#A1A1AA] uppercase">Assessed Thermal Risk Score</span>
                <div className="text-3xl font-black mt-1 flex items-baseline gap-1">
                  <span className={
                    aiResult?.riskLevel === 'CRITICAL' ? 'text-[#EF4444]' :
                    aiResult?.riskLevel === 'HIGH' ? 'text-[#EF4444]' :
                    aiResult?.riskLevel === 'MODERATE' ? 'text-[#FF7900]' : 'text-[#22C55E]'
                  }>
                    {aiResult?.riskScore || 0}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">/ 100</span>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${
                aiResult?.riskLevel === 'CRITICAL' ? 'bg-[#EF4444] text-black font-extrabold animate-pulse' :
                aiResult?.riskLevel === 'HIGH' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold' :
                aiResult?.riskLevel === 'MODERATE' ? 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40 font-bold' :
                'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold'
              }`}>
                {aiResult?.riskLevel || 'EVALUATING'}
              </span>
            </div>

            {/* Key AI Physics Calculations */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">HOTSPOT GRADIENT (ΔT)</span>
                <span className="font-bold text-[#F5F5F5] text-base mt-0.5 block">
                  {aiResult?.tempGradient}°C {aiResult?.isHotspotDetected ? '⚠️ HOTSPOT' : '✓ UNIFORM'}
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">JOULEAN HEAT (P = I²R)</span>
                <span className="font-bold text-[#FF7900] text-base mt-0.5 block">
                  {aiResult?.calculatedHeatGenWatts} W
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">C-RATE STRESS INDEX</span>
                <span className="font-bold text-[#C0C0C0] text-base mt-0.5 block">
                  {aiResult?.cRate} C
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">COOLING SUFFICIENCY</span>
                <span className="font-bold text-[#38BDF8] text-base mt-0.5 block">
                  {aiResult?.coolingSufficiencyStatus}
                </span>
              </div>
            </div>

            {/* Prescribed Actuation */}
            <div className="p-4 rounded bg-[#141416] border border-[#FF7900]/40 space-y-2">
              <span className="text-[10px] text-[#FF7900] uppercase font-bold tracking-wider block">
                Prescribed BTMS Micro-Channel Directives
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Cooling Pump Flow:</span>
                <span className="font-bold text-[#38BDF8]">{aiResult?.recommendedCoolantFlowLpm} L/min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Radiator Fan Duty:</span>
                <span className="font-bold text-[#C0C0C0]">{aiResult?.recommendedRadiatorSpeedPercent}%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Powertrain Derate:</span>
                <span className="font-bold text-[#EF4444]">
                  {aiResult?.powertrainDeratePercent > 0 ? `-${aiResult?.powertrainDeratePercent}% Throttling` : '0% (Full Power)'}
                </span>
              </div>
              <div className="text-[11px] text-[#F5F5F5] font-sans pt-2 border-t border-[#34343A]">
                <strong>Action:</strong> {aiResult?.recommendedAction}
              </div>
            </div>
          </div>

          {/* Diagnostic Log */}
          <div className="space-y-1 text-[11px] text-[#A1A1AA]">
            {aiResult?.diagnostics?.map((d, i) => (
              <div key={i} className="flex items-start gap-1.5">
                <span className="text-[#FF7900]">&bull;</span>
                <span>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
