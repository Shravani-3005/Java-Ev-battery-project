import React, { useState, useEffect } from 'react';
import {
  Flame,
  AlertTriangle,
  Droplets,
  Layers,
  Thermometer,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { batteriesApi, sensorsApi, thermalApi } from '../api/client';

export default function HotspotDetectionPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [latestReading, setLatestReading] = useState(null);
  const [cellTemps, setCellTemps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPacks = async () => {
    try {
      const data = await batteriesApi.getAll();
      setPacks(data);
      if (data.length > 0 && !selectedPackId) {
        setSelectedPackId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHotspotData = async () => {
    if (!selectedPackId) return;
    setIsLoading(true);
    try {
      const [analysisData, readingData] = await Promise.all([
        thermalApi.getStatus(selectedPackId),
        sensorsApi.getLatestForBattery(selectedPackId),
      ]);
      setAnalysis(analysisData);
      setLatestReading(readingData);

      if (readingData) {
        const cells = await sensorsApi.getCellTemps(readingData.id);
        setCellTemps(cells || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  useEffect(() => {
    fetchHotspotData();
    const interval = setInterval(fetchHotspotData, 4000);
    return () => clearInterval(interval);
  }, [selectedPackId]);

  const activePack = packs.find(p => p.id === Number(selectedPackId));

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Target Pack */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Flame className="w-4 h-4 text-[#FF7900]" />
            Hotspot &amp; Thermal Gradient Diagnostic Engine
          </h2>
          <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
            Inter-cell temperature variance (ΔT = T_max - T_min) and localized micro-channel heat dissipation
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
                {p.packCode} ({p.vehicleModel})
              </option>
            ))}
          </select>
          <button
            onClick={fetchHotspotData}
            className="p-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#C0C0C0] hover:text-[#FF7900]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Gradient & Hotspot Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Thermal Gradient (ΔT)</span>
          <div className="text-2xl font-bold mt-1 text-[#F5F5F5] flex items-baseline gap-1">
            <span className={analysis?.tempGradient >= 5 ? 'text-[#EF4444]' : 'text-[#FF7900]'}>
              {analysis?.tempGradient?.toFixed(1) || '--'}
            </span>
            <span className="text-xs text-[#A1A1AA]">°C</span>
          </div>
          <span className="text-[10px] text-[#A1A1AA] mt-1 block">
            Hotspot Threshold: 5.0°C | Severe: 8.0°C
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Hotspot Status</span>
          <div className="text-base font-bold mt-2">
            {analysis?.isHotspotDetected ? (
              <span className="px-2 py-0.5 rounded bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold inline-flex items-center gap-1.5 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                HOTSPOT DETECTED
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40 font-bold inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                UNIFORM THERMAL GRADIENT
              </span>
            )}
          </div>
          <span className="text-[10px] text-[#A1A1AA] mt-1.5 block">
            {analysis?.isHotspotDetected ? 'Non-uniform heat extraction' : 'Balanced heat conduction'}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Joulean Heat Generation</span>
          <div className="text-2xl font-bold mt-1 text-[#FF7900]">
            {analysis?.calculatedHeatGenWatts?.toFixed(1) || '--'} W
          </div>
          <span className="text-[10px] text-[#A1A1AA] mt-1 block">
            P = I²R_pack + Entropic Heat
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Actuation Recommendation</span>
          <div className="text-xs font-bold mt-1 text-[#F5F5F5] truncate">
            {analysis?.recommendedAction || 'PASSIVE_ECO_CIRCULATION'}
          </div>
          <span className="text-[10px] text-[#38BDF8] mt-1 block">
            Target Flow: {analysis?.recommendedCoolantFlowLpm || 1.5} L/min
          </span>
        </div>
      </div>

      {/* Detected Hotspot Cells Table */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-2 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#FF7900]" />
          Identified Hotspot Cell Clusters
        </h3>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Cells deviating significantly from pack average temperature (ΔT &ge; 3.5°C)
        </p>

        {analysis?.hotspots && analysis.hotspots.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#34343A] text-[10px] text-[#A1A1AA] uppercase">
                  <th className="py-2.5 px-3">Cell ID</th>
                  <th className="py-2.5 px-3">Temperature</th>
                  <th className="py-2.5 px-3">Delta from Average</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Recommended Mitigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34343A]/40">
                {analysis.hotspots.map((h, i) => (
                  <tr key={i} className="hover:bg-[#141416]">
                    <td className="py-2.5 px-3 font-bold text-[#FF7900]">{h.cellLabel}</td>
                    <td className="py-2.5 px-3 font-bold text-[#EF4444]">{h.temperature?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3 text-[#FF7900]">+{h.deltaFromAvg?.toFixed(1)}°C</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        h.severity === 'CRITICAL'
                          ? 'bg-[#EF4444] text-black font-extrabold'
                          : 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40'
                      }`}>
                        {h.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#C0C0C0]">{h.recommendedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-[#22C55E] bg-[#141416] rounded border border-[#34343A]">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-[#22C55E]" />
            All cell blocks are uniformly cooled within safe thermal tolerances. Zero hotspots detected.
          </div>
        )}
      </div>

      {/* Physics Diagnostic Log */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
          Diagnostic Audit Factors (Rule-Engine Output)
        </h3>
        <div className="space-y-1.5 mt-3">
          {analysis?.diagnostics && analysis.diagnostics.length > 0 ? (
            analysis.diagnostics.map((d, i) => (
              <div key={i} className="p-2.5 rounded bg-[#141416] border border-[#34343A] text-xs text-[#C0C0C0] flex items-start gap-2">
                <span className="text-[#FF7900] font-bold">&bull;</span>
                <span>{d}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-[#A1A1AA]">Awaiting diagnostic factors...</div>
          )}
        </div>
      </div>
    </div>
  );
}
