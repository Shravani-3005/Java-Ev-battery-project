import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Sliders, Shield, Droplets, Bell } from 'lucide-react';
import { settingsApi } from '../api/client';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    normalThreshold: 35.0,
    moderateThreshold: 40.0,
    highThreshold: 45.0,
    criticalThreshold: 55.0,
    hotspotGradientThreshold: 5.0,
    simulationTickSeconds: 3,
    coolantFluidType: '50/50 Water-Ethylene Glycol',
    autoActuateCooling: true,
    emailNotificationsEnabled: false,
  });

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    settingsApi.getSettings().then(data => {
      if (data) setConfig(data);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await settingsApi.updateSettings(config);
      setConfig(updated);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (e) {
      alert('Error saving system settings: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs max-w-4xl">
      {/* Header Bar */}
      <div className="p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
          <Settings className="w-4 h-4 text-[#FF7900]" />
          THERMOCORE System Configuration &amp; Safety Thresholds
        </h2>
        <p className="text-xs text-[#A1A1AA] mt-0.5">
          Tune rule-engine thermal boundaries, micro-channel simulation tick rates, and actuator parameters
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Thermal Safety Boundaries */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] space-y-4">
          <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#FF7900]" />
            Electrochemical Safety Thresholds (°C)
          </h3>
          <p className="text-xs text-[#A1A1AA]">
            Defines boundaries for the rule-based classification engine and hazard alert generator.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-[#A1A1AA] block mb-1">NORMAL UPPER LIMIT (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.normalThreshold}
                onChange={(e) => setConfig({ ...config, normalThreshold: parseFloat(e.target.value) })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#22C55E] font-bold focus:border-[#FF7900] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#A1A1AA] block mb-1">MODERATE WARNING (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.moderateThreshold}
                onChange={(e) => setConfig({ ...config, moderateThreshold: parseFloat(e.target.value) })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#FF922B] font-bold focus:border-[#FF7900] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#A1A1AA] block mb-1">HIGH DANGER (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.highThreshold}
                onChange={(e) => setConfig({ ...config, highThreshold: parseFloat(e.target.value) })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#FF7900] font-bold focus:border-[#FF7900] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[#A1A1AA] block mb-1">CRITICAL RUNAWAY (°C)</label>
              <input
                type="number"
                step="0.5"
                value={config.criticalThreshold}
                onChange={(e) => setConfig({ ...config, criticalThreshold: parseFloat(e.target.value) })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#EF4444] font-bold focus:border-[#FF7900] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="text-[#A1A1AA] block mb-1">HOTSPOT GRADIENT THRESHOLD (ΔT = T_max - T_min)</label>
            <input
              type="number"
              step="0.5"
              value={config.hotspotGradientThreshold}
              onChange={(e) => setConfig({ ...config, hotspotGradientThreshold: parseFloat(e.target.value) })}
              className="w-full max-w-xs bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#F5F5F5] font-bold focus:border-[#FF7900] focus:outline-none"
            />
            <span className="text-[10px] text-[#A1A1AA] block mt-1">
              Triggers localized cell cooling directive if adjacent cell variance exceeds this value.
            </span>
          </div>
        </div>

        {/* Simulator & Fluid Configuration */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] space-y-4">
          <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#38BDF8]" />
            Cooling &amp; Simulation Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[#A1A1AA] block mb-1">COOLANT FLUID TYPE</label>
              <select
                value={config.coolantFluidType}
                onChange={(e) => setConfig({ ...config, coolantFluidType: e.target.value })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
              >
                <option value="50/50 Water-Ethylene Glycol">50/50 Water-Ethylene Glycol</option>
                <option value="Dielectric Immersion Fluid (Engineered Hydrocarbon)">Dielectric Immersion Fluid (Engineered Hydrocarbon)</option>
                <option value="Deionized Water">Deionized Water</option>
                <option value="Phase Change Slurry (Micro-encapsulated)">Phase Change Slurry (Micro-encapsulated)</option>
              </select>
            </div>

            <div>
              <label className="text-[#A1A1AA] block mb-1">SIMULATION TICK INTERVAL (SECONDS)</label>
              <input
                type="number"
                min="1"
                max="30"
                value={config.simulationTickSeconds}
                onChange={(e) => setConfig({ ...config, simulationTickSeconds: parseInt(e.target.value) })}
                className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-1.5 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <input
              type="checkbox"
              id="autoActuate"
              checked={config.autoActuateCooling}
              onChange={(e) => setConfig({ ...config, autoActuateCooling: e.target.checked })}
              className="accent-[#FF7900] w-4 h-4 rounded"
            />
            <label htmlFor="autoActuate" className="text-[#F5F5F5] cursor-pointer">
              Enable Automatic Closed-Loop Micro-Channel Cooling Actuation Directives
            </label>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-4 rounded bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-xs text-[#A1A1AA]">
            Configuration changes take effect immediately across all background simulation threads.
          </span>
          <div className="flex items-center gap-3">
            {isSaved && (
              <span className="text-[#22C55E] flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-4 h-4" /> Changes Applied
              </span>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded bg-[#FF7900] hover:bg-[#FF922B] text-black font-bold uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(255,121,0,0.3)] transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
