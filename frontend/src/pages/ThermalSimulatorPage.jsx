import React, { useState, useEffect } from 'react';
import { batteriesApi, thermalApi, sensorsApi } from '../api/client';
import KPICard from '../components/KPICard';

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
    testScenario: 'Simulation',
  });

  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [persistedHistory, setPersistedHistory] = useState([]);
  const [isEvaluatingAndSaving, setIsEvaluatingAndSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

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
      setPacks(data || []);
      if (data && data.length > 0) {
        setSelectedPackId(String(data[0].id));
        loadEvaluations(data[0].id);
      }
    });
  }, []);

  const runSimulation = async (customForm = form) => {
    if (!selectedPackId) return;
    setIsSimulating(true);
    try {
      const result = await thermalApi.analyze({
        ...customForm,
        batteryPackId: Number(selectedPackId),
      });
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
        testScenario: 'Eco Cruise (30°C)',
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
        testScenario: 'Sprint (220A)',
      };
    } else if (key === 'fastcharge') {
      preset = {
        batteryTemp: 46.5,
        minCellTemp: 41.0,
        maxCellTemp: 51.5,
        current: -240.0,
        voltage: 415.0,
        coolantFlowRate: 7.0,
        coolantInletTemp: 26.0,
        coolantOutletTemp: 34.0,
        testScenario: 'DC Fast-Charge (350kW)',
      };
    } else if (key === 'pumpfail') {
      preset = {
        batteryTemp: 52.0,
        minCellTemp: 43.0,
        maxCellTemp: 57.5,
        current: 130.0,
        voltage: 360.0,
        coolantFlowRate: 0.0,
        coolantInletTemp: 32.0,
        coolantOutletTemp: 45.0,
        testScenario: 'Pump Failure (0 L/min)',
      };
    }
    const merged = { ...form, ...preset };
    setForm(merged);
    runSimulation(merged);
  };

  const handleRunAndPersist = async () => {
    if (!selectedPackId) return;
    setIsEvaluatingAndSaving(true);
    setFeedback(null);
    try {
      const res = await thermalApi.evaluate({
        ...form,
        batteryPackId: Number(selectedPackId),
      });
      setAnalysisResult(res);
      setFeedback({
        type: 'success',
        message: `Evaluation #${res.id || 'new'} saved to database. Risk level: ${res.riskLevel}`,
      });
      loadEvaluations(selectedPackId);
    } catch (e) {
      setFeedback({
        type: 'error',
        message: e.response?.data?.message || e.message || 'Evaluation request failed.',
      });
    } finally {
      setIsEvaluatingAndSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Controls: Pack Selector & Scenario Presets */}
      <div className="bg-white border border-[#E5E7EB] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Battery Pack
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            disabled={packs.length === 0}
            className="text-xs bg-white border border-[#E5E7EB] text-[#202938] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6] disabled:opacity-60"
          >
            {packs.length === 0 ? (
              <option value="">No battery packs registered</option>
            ) : (
              packs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.packName} ({p.packCode})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[#6B7280] mr-1">Presets:</span>
          <button
            onClick={() => applyPreset('eco')}
            className="px-2.5 py-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202938] rounded font-medium"
          >
            Eco Cruise
          </button>
          <button
            onClick={() => applyPreset('sprint')}
            className="px-2.5 py-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#202938] rounded font-medium"
          >
            Sprint (220A)
          </button>
          <button
            onClick={() => applyPreset('fastcharge')}
            className="px-2.5 py-1 bg-[#FEF5E7] hover:bg-[#FDEED5] text-[#D69A32] rounded font-medium"
          >
            DC Fast-Charge
          </button>
          <button
            onClick={() => applyPreset('pumpfail')}
            className="px-2.5 py-1 bg-[#FBEBEB] hover:bg-[#F8D7D7] text-[#C34848] rounded font-medium"
          >
            Pump Failure
          </button>
        </div>
      </div>

      {/* Main Grid: Input Sliders vs. Calculated Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input Parameters Form */}
        <div className="bg-white border border-[#E5E7EB] rounded p-4 space-y-4 text-xs">
          <h2 className="text-base font-semibold text-[#202938]">
            Simulated Sensor Parameters
          </h2>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#6B7280]">Peak Cell Temp (T_max)</span>
              <span className="font-semibold text-[#202938]">{form.maxCellTemp} °C</span>
            </div>
            <input
              type="range"
              min="20"
              max="70"
              step="0.5"
              value={form.maxCellTemp}
              onChange={(e) => handleChange('maxCellTemp', parseFloat(e.target.value))}
              className="w-full accent-[#2563A6]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#6B7280]">Min Cell Temp (T_min)</span>
              <span className="font-semibold text-[#202938]">{form.minCellTemp} °C</span>
            </div>
            <input
              type="range"
              min="15"
              max="60"
              step="0.5"
              value={form.minCellTemp}
              onChange={(e) => handleChange('minCellTemp', parseFloat(e.target.value))}
              className="w-full accent-[#2563A6]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#6B7280]">Current Draw / Charge</span>
              <span className="font-semibold text-[#202938]">{form.current} A</span>
            </div>
            <input
              type="range"
              min="-250"
              max="250"
              step="5"
              value={form.current}
              onChange={(e) => handleChange('current', parseFloat(e.target.value))}
              className="w-full accent-[#2563A6]"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="text-[#6B7280]">Coolant Flow Rate</span>
              <span className="font-semibold text-[#202938]">{form.coolantFlowRate} L/min</span>
            </div>
            <input
              type="range"
              min="0"
              max="12"
              step="0.5"
              value={form.coolantFlowRate}
              onChange={(e) => handleChange('coolantFlowRate', parseFloat(e.target.value))}
              className="w-full accent-[#2563A6]"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleRunAndPersist}
              disabled={isEvaluatingAndSaving}
              className="w-full py-2 bg-[#2563A6] hover:bg-[#1D4F85] text-white rounded font-medium text-xs transition-colors disabled:opacity-50"
            >
              {isEvaluatingAndSaving ? 'Evaluating and saving...' : 'Run & Save Thermal Diagnostic'}
            </button>
            {feedback && (
              <div className={`mt-2 p-2 rounded text-xs border ${
                feedback.type === 'success' ? 'bg-[#EBF7EE] border-[#BCE4C7] text-[#27834A]' : 'bg-[#FBEBEB] border-[#F4C5C5] text-[#C34848]'
              }`}>
                {feedback.message}
              </div>
            )}
          </div>
        </div>

        {/* Right: Calculated Physics & Prescribed Directives */}
        <div className="bg-white border border-[#E5E7EB] rounded p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-base font-semibold text-[#202938]">
                  Intelligent Risk Evaluation
                </h2>
                <div className="text-xs text-[#6B7280] mt-0.5">
                  Multi-factor electro-thermal calculation
                </div>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                analysisResult?.riskLevel === 'CRITICAL'
                  ? 'bg-[#FBEBEB] text-[#C34848]'
                  : analysisResult?.riskLevel === 'HIGH'
                  ? 'bg-[#FBEBEB] text-[#C34848]'
                  : analysisResult?.riskLevel === 'MODERATE'
                  ? 'bg-[#FEF5E7] text-[#D69A32]'
                  : 'bg-[#EBF7EE] text-[#27834A]'
              }`}>
                {analysisResult?.riskLevel || 'NORMAL'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                <span className="text-xs text-[#6B7280] block">Risk Score</span>
                <span className="text-xl font-semibold text-[#202938] mt-0.5 block">
                  {analysisResult?.riskScore != null ? `${analysisResult.riskScore} / 100` : '18 / 100'}
                </span>
              </div>
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                <span className="text-xs text-[#6B7280] block">Cell Gradient (ΔT)</span>
                <span className="text-xl font-semibold text-[#202938] mt-0.5 block">
                  {analysisResult?.tempGradient != null ? `${analysisResult.tempGradient} °C` : '4.2 °C'}
                </span>
              </div>
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                <span className="text-xs text-[#6B7280] block">Joulean Heat</span>
                <span className="text-xl font-semibold text-[#202938] mt-0.5 block">
                  {analysisResult?.calculatedHeatGenWatts != null ? `${analysisResult.calculatedHeatGenWatts} W` : '120 W'}
                </span>
              </div>
              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded">
                <span className="text-xs text-[#6B7280] block">Cooling Sufficiency</span>
                <span className="text-xl font-semibold text-[#27834A] mt-0.5 block">
                  {analysisResult?.coolingSufficiencyStatus || 'Adequate'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded space-y-1.5 text-xs">
              <span className="font-semibold text-[#202938] block">Prescribed Action Directive</span>
              <div className="flex justify-between text-[#6B7280]">
                <span>Coolant Flow Target:</span>
                <span className="font-medium text-[#202938]">{analysisResult?.recommendedCoolantFlowLpm || 2.5} L/min</span>
              </div>
              <div className="flex justify-between text-[#6B7280]">
                <span>Action:</span>
                <span className="font-medium text-[#202938]">{analysisResult?.recommendedAction || 'PASSIVE_ECO_CIRCULATION'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persisted History Table */}
      <div className="bg-white border border-[#E5E7EB] rounded overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#202938]">
            Persisted Evaluation History
          </h2>
          <button
            onClick={() => loadEvaluations(selectedPackId)}
            className="text-xs font-medium text-[#2563A6] hover:underline"
          >
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left table-minimal">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Pack</th>
                <th>Peak Temp / ΔT</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Joulean Heat</th>
                <th>Prescribed Directive</th>
              </tr>
            </thead>
            <tbody>
              {persistedHistory.map((item) => (
                <tr key={item.id}>
                  <td className="text-xs text-[#6B7280]">
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="font-semibold text-[#202938]">{item.packCode || 'BP-01'}</td>
                  <td>
                    {item.maxCellTemp}°C / <span className="text-[#6B7280]">Δ{item.deltaT}°C</span>
                  </td>
                  <td className="font-medium">{item.riskScore} / 100</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#EBF7EE] text-[#27834A]">
                      {item.riskLevel}
                    </span>
                  </td>
                  <td>{item.calculatedHeatGenWatts != null ? `${item.calculatedHeatGenWatts} W` : '—'}</td>
                  <td className="text-xs text-[#202938] font-mono">{item.coolingRecommendation || 'STANDARD'}</td>
                </tr>
              ))}
              {persistedHistory.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-6 text-center text-sm text-[#6B7280]">
                    No evaluations persisted yet.
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
