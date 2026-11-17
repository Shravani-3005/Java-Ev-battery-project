import React, { useState, useEffect } from 'react';
import { settingsApi } from '../api/client';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    normalUpperTemp: 35.0,
    warningTemp: 40.0,
    dangerTemp: 45.0,
    runawayTemp: 55.0,
    hotspotDeltaT: 5.0,
    coolantFluidType: '50/50 Water-Ethylene Glycol',
    tickIntervalMs: 3000,
    closedLoopEnabled: true,
  });
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    settingsApi.get().then((data) => {
      if (data) setConfig((prev) => ({ ...prev, ...data }));
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await settingsApi.update(config);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err) {
      alert('Error updating settings');
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-[#E5E7EB] rounded p-5 space-y-4 text-xs">
      <div>
        <h2 className="text-base font-semibold text-[#202938]">
          System Safety Thresholds & Configuration
        </h2>
        <p className="text-xs text-[#6B7280] mt-0.5">
          Configure temperature setpoints and closed-loop micro-channel actuation parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-[#202938]">Normal Upper Threshold (°C)</label>
            <input
              type="number"
              step="0.5"
              value={config.normalUpperTemp || 35.0}
              onChange={(e) => setConfig({ ...config, normalUpperTemp: parseFloat(e.target.value) })}
              className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#202938]">Warning Threshold (°C)</label>
            <input
              type="number"
              step="0.5"
              value={config.warningTemp || 40.0}
              onChange={(e) => setConfig({ ...config, warningTemp: parseFloat(e.target.value) })}
              className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#202938]">Danger Threshold (°C)</label>
            <input
              type="number"
              step="0.5"
              value={config.dangerTemp || 45.0}
              onChange={(e) => setConfig({ ...config, dangerTemp: parseFloat(e.target.value) })}
              className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-[#202938]">Thermal Runaway Trigger (°C)</label>
            <input
              type="number"
              step="0.5"
              value={config.runawayTemp || 55.0}
              onChange={(e) => setConfig({ ...config, runawayTemp: parseFloat(e.target.value) })}
              className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#202938]">Max Inter-Cell Gradient (ΔT Threshold)</label>
          <input
            type="number"
            step="0.5"
            value={config.hotspotDeltaT || 5.0}
            onChange={(e) => setConfig({ ...config, hotspotDeltaT: parseFloat(e.target.value) })}
            className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium text-[#202938]">Coolant Fluid Type</label>
          <select
            value={config.coolantFluidType || '50/50 Water-Ethylene Glycol'}
            onChange={(e) => setConfig({ ...config, coolantFluidType: e.target.value })}
            className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
          >
            <option value="50/50 Water-Ethylene Glycol">50/50 Water-Ethylene Glycol</option>
            <option value="Dielectric Immersion Fluid">Dielectric Immersion Fluid</option>
            <option value="Deionized Water">Deionized Water</option>
            <option value="Phase Change Material Slurry">Phase Change Material Slurry</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="px-4 py-2 bg-[#2563A6] hover:bg-[#1D4F85] text-white rounded text-xs font-medium transition-colors"
          >
            Save Configuration
          </button>
          {savedMessage && (
            <span className="text-xs text-[#27834A] font-medium">
              Configuration saved successfully.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
