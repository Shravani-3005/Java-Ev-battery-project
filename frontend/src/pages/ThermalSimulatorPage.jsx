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

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [commitSuccess, setCommitSuccess] = useState(false);
  const [persistedHistory, setPersistedHistory] = useState([]);
  const [isEvaluatingAndSaving, setIsEvaluatingAndSaving] = useState(false);
  const [evaluationFeedback, setEvaluationFeedback] = useState(null);

  const loadEvaluations = async (packId) => {
    try {
      const data = await thermalApi.getEvaluations(packId);
      if (Array.isArray(data)) setPersistedHistory(data);
    } catch (e) {
      console.warn('Could not load evaluation history', e);
    }
  };

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data);
      if (data.length > 0) {
        setSelectedPackId(data[0].id);
        loadEvaluations(data[0].id);
      }
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
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  useEffect(() => {
    if (selectedPackId) {
      runSimulation(form);
      loadEvaluations(selectedPackId);
    }
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

  const handleRunAndPersistEvaluation = async () => {
    if (!selectedPackId) return;
    setIsEvaluatingAndSaving(true);
    setEvaluationFeedback(null);
    try {
      const payload = {
        ...form,
        batteryPackId: Number(selectedPackId),
      };
      const res = await thermalApi.evaluate(payload);
      setAnalysisResult(res);
      setEvaluationFeedback({
        type: 'success',
        message: `Evaluation #${res.id || 'new'} saved to database! Risk: ${res.riskLevel} (Score: ${res.riskScore}/100)`
      });
      loadEvaluations(selectedPackId);
    } catch (e) {
      setEvaluationFeedback({
        type: 'error',
        message: e.response?.data?.message || e.message || 'Evaluation request failed.'
      });
    } finally {
      setIsEvaluatingAndSaving(false);
    }
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
            Test edge-case thermal dynamics (DC fast charging, pump stalls, high ambient heat) with real-time physics calculation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            className="bg-[#1B1B1F] border border-[#FF7900] text-[#F5F5F5] rounded px-3 py-1.5 focus:outline-none"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packName} ({p.packCode})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Preset Action Strip */}
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-[#141416] border border-[#34343A]">
        <span className="text-[10px] text-[#A1A1AA] uppercase font-bold mr-2">Quick Presets:</span>
        <button
          onClick={() => applyPreset('eco')}
          className="px-2.5 py-1 rounded bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E] hover:text-black border border-[#22C55E]/40 transition-colors font-medium"
        >
          Eco Cruise (30°C)
        </button>
        <button
          onClick={() => applyPreset('sprint')}
          className="px-2.5 py-1 rounded bg-[#FF7900]/10 text-[#FF7900] hover:bg-[#FF7900] hover:text-black border border-[#FF7900]/40 transition-colors font-medium"
        >
          Sprint (220A)
        </button>
        <button
          onClick={() => applyPreset('fastcharge')}
          className="px-2.5 py-1 rounded bg-[#FF7900]/20 text-[#FF7900] hover:bg-[#FF7900] hover:text-black border border-[#FF7900]/50 transition-colors font-bold"
        >
          DC Fast-Charge (350kW)
        </button>
        <button
          onClick={() => applyPreset('pumpfail')}
          className="px-2.5 py-1 rounded bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444] hover:text-black border border-[#EF4444]/50 transition-colors font-bold"
        >
          Pump Failure (0 L/min)
        </button>
      </div>

      {/* Main Grid: Controls vs Physics Output */}
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
              min="15"
              max="60"
              step="0.5"
              value={form.minCellTemp}
              onChange={(e) => handleChange('minCellTemp', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Pack Average Temp */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Mean Pack Temp (T_avg):</span>
              <span className="font-bold text-[#FF7900]">{form.batteryTemp}°C</span>
            </div>
            <input
              type="range"
              min="18"
              max="65"
              step="0.5"
              value={form.batteryTemp}
              onChange={(e) => handleChange('batteryTemp', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Current (Amps) */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Current Draw / Charge:</span>
              <span className="font-bold text-[#F5F5F5]">
                {form.current > 0 ? `+${form.current} A (Discharge)` : `${form.current} A (Charge)`}
              </span>
            </div>
            <input
              type="range"
              min="-280"
              max="350"
              step="5"
              value={form.current}
              onChange={(e) => handleChange('current', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Voltage */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Bus Voltage:</span>
              <span className="font-bold text-[#C0C0C0]">{form.voltage} V</span>
            </div>
            <input
              type="range"
              min="280"
              max="450"
              step="1"
              value={form.voltage}
              onChange={(e) => handleChange('voltage', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          {/* Coolant Flow Rate */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Micro-Channel Coolant Flow:</span>
              <span className="font-bold text-[#38BDF8]">{form.coolantFlowRate} L/min</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.2"
              value={form.coolantFlowRate}
              onChange={(e) => handleChange('coolantFlowRate', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8]"
            />
          </div>

          {/* Coolant Inlet Temp */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Coolant Inlet Temp:</span>
              <span className="font-bold text-[#38BDF8]">{form.coolantInletTemp}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="45"
              step="0.5"
              value={form.coolantInletTemp}
              onChange={(e) => handleChange('coolantInletTemp', parseFloat(e.target.value))}
              className="w-full accent-[#38BDF8]"
            />
          </div>

          {/* Coolant Outlet Temp */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[#A1A1AA]">Coolant Outlet Temp:</span>
              <span className="font-bold text-[#FF7900]">{form.coolantOutletTemp}°C</span>
            </div>
            <input
              type="range"
              min="15"
              max="55"
              step="0.5"
              value={form.coolantOutletTemp}
              onChange={(e) => handleChange('coolantOutletTemp', parseFloat(e.target.value))}
              className="w-full accent-[#FF7900]"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              onClick={handleRunAndPersistEvaluation}
              disabled={isEvaluatingAndSaving}
              className="w-full py-2.5 rounded bg-[#FF7900] hover:bg-[#ff8c1a] text-black font-extrabold uppercase transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-black" />
              {isEvaluatingAndSaving ? 'Evaluating via Spring Boot & Saving...' : 'Run & Persist AI Thermal Diagnostic'}
            </button>

            {evaluationFeedback && (
              <div className={`p-2.5 rounded text-xs border ${
                evaluationFeedback.type === 'success'
                  ? 'bg-[#22C55E]/15 border-[#22C55E]/50 text-[#22C55E]'
                  : 'bg-[#EF4444]/15 border-[#EF4444]/50 text-[#EF4444]'
              }`}>
                {evaluationFeedback.message}
              </div>
            )}

            <button
              onClick={handleCommitToDatabase}
              className="w-full py-2 rounded bg-[#141416] hover:bg-[#252529] text-[#A1A1AA] hover:text-[#F5F5F5] border border-[#34343A] font-semibold uppercase text-[11px] transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              Commit Raw Observation to Database
            </button>
            {commitSuccess && (
              <div className="mt-1 text-center text-[11px] text-[#22C55E] flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Raw observation saved.
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Diagnostics Output & Directives */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FF7900]" />
                BTMS Thermal Diagnostics &amp; Directives
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#222226] text-[#A1A1AA] border border-[#34343A]">
                KJS-CES-02 BTMS
              </span>
            </div>

            {/* Risk Badge */}
            <div className="p-4 rounded-lg bg-[#141416] border border-[#34343A] flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] text-[#A1A1AA] uppercase">Thermal Risk Index</span>
                <div className="text-3xl font-black mt-1 flex items-baseline gap-1">
                  <span className={
                    analysisResult?.riskLevel === 'CRITICAL' ? 'text-[#EF4444]' :
                    analysisResult?.riskLevel === 'HIGH' ? 'text-[#EF4444]' :
                    analysisResult?.riskLevel === 'MODERATE' ? 'text-[#FF7900]' : 'text-[#22C55E]'
                  }>
                    {analysisResult?.riskScore || 0}
                  </span>
                  <span className="text-xs text-[#A1A1AA]">/ 100</span>
                </div>
              </div>

              <span className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider ${
                analysisResult?.riskLevel === 'CRITICAL' ? 'bg-[#EF4444] text-white font-extrabold' :
                analysisResult?.riskLevel === 'HIGH' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold' :
                analysisResult?.riskLevel === 'MODERATE' ? 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40 font-bold' :
                'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold'
              }`}>
                {analysisResult?.riskLevel || 'EVALUATING'}
              </span>
            </div>

            {/* Key Thermal Physics Calculations */}
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">HOTSPOT GRADIENT (Delta-T)</span>
                <span className="font-bold text-[#F5F5F5] text-base mt-0.5 block">
                  {analysisResult?.tempGradient}°C {analysisResult?.isHotspotDetected ? '[HOTSPOT DETECTED]' : '[UNIFORM GRADIENT]'}
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">JOULEAN HEAT (P = I²R)</span>
                <span className="font-bold text-[#FF7900] text-base mt-0.5 block">
                  {analysisResult?.calculatedHeatGenWatts} W
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">C-RATE STRESS INDEX</span>
                <span className="font-bold text-[#C0C0C0] text-base mt-0.5 block">
                  {analysisResult?.cRate} C
                </span>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <span className="text-[10px] text-[#A1A1AA] block">COOLING SUFFICIENCY</span>
                <span className="font-bold text-[#38BDF8] text-base mt-0.5 block">
                  {analysisResult?.coolingSufficiencyStatus}
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
                <span className="font-bold text-[#38BDF8]">{analysisResult?.recommendedCoolantFlowLpm} L/min</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Recommended Action:</span>
                <span className="font-bold text-[#F5F5F5]">{analysisResult?.recommendedAction}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">Inverter Current Limit:</span>
                <span className="font-bold text-[#FF7900]">{analysisResult?.currentLimitAmps || 'Unlimited'} A</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Log */}
          <div className="p-3.5 rounded bg-[#141416] border border-[#34343A] space-y-1">
            <span className="text-[10px] text-[#A1A1AA] uppercase block mb-1">
              Active Evaluation Reasons:
            </span>
            {analysisResult?.diagnostics?.map((diag, i) => (
              <div key={i} className="text-[11px] text-[#C0C0C0] flex items-center gap-1.5">
                <span className="text-[#FF7900]">&bull;</span>
                <span>{diag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Persisted History Table for Phase 2 Checkpoint */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FF7900]" />
            <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
              Persisted AI Thermal Diagnostic History (PostgreSQL Database)
            </h3>
          </div>
          <button
            onClick={() => loadEvaluations(selectedPackId)}
            className="text-[11px] text-[#FF7900] hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Refresh History
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-[#34343A]">
            <thead className="bg-[#141416] text-[#A1A1AA] border-b border-[#34343A]">
              <tr>
                <th className="p-2.5">Time</th>
                <th className="p-2.5">Pack</th>
                <th className="p-2.5">Peak T / Delta-T</th>
                <th className="p-2.5">Risk Score</th>
                <th className="p-2.5">Risk Level</th>
                <th className="p-2.5">Heat (Joulean)</th>
                <th className="p-2.5">Prescribed Cooling Directive</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A30]">
              {persistedHistory.map((item) => (
                <tr key={item.id} className="hover:bg-[#141416]/50">
                  <td className="p-2.5 text-[#A1A1AA]">{new Date(item.createdAt).toLocaleTimeString()}</td>
                  <td className="p-2.5 font-bold text-[#F5F5F5]">{item.packCode || item.batteryPack?.packCode || 'BP-LFP-01'}</td>
                  <td className="p-2.5 text-[#F5F5F5]">
                    <span className="text-[#EF4444] font-semibold">{item.maxCellTemp}°C</span> / <span className="text-[#FF7900]">Δ{item.deltaT}°C</span>
                  </td>
                  <td className="p-2.5 font-bold">{item.riskScore} / 100</td>
                  <td className="p-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.riskLevel === 'CRITICAL' || item.riskLevel === 'CRITICAL_THERMAL_RUNAWAY'
                        ? 'bg-[#EF4444] text-white'
                        : item.riskLevel === 'HIGH'
                        ? 'bg-[#EF4444]/20 text-[#EF4444]'
                        : item.riskLevel === 'MODERATE'
                        ? 'bg-[#FF7900]/20 text-[#FF7900]'
                        : 'bg-[#22C55E]/20 text-[#22C55E]'
                    }`}>
                      {item.riskLevel}
                    </span>
                  </td>
                  <td className="p-2.5 text-[#A1A1AA]">{item.calculatedHeatGenWatts ? `${item.calculatedHeatGenWatts} W` : '—'}</td>
                  <td className="p-2.5 font-mono text-[11px] text-[#38BDF8]">{item.coolingRecommendation || item.recommendedAction}</td>
                </tr>
              ))}
              {persistedHistory.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-4 text-center text-[#A1A1AA]">
                    No evaluations recorded yet. Run a diagnostic above to store into database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
