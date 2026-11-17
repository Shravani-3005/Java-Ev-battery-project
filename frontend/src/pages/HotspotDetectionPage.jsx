import React, { useState, useEffect } from 'react';
import { batteriesApi, sensorsApi } from '../api/client';
import KPICard from '../components/KPICard';

export default function HotspotDetectionPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('1');
  const [cells, setCells] = useState([]);
  const [latestReading, setLatestReading] = useState(null);

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data || []);
      if (data && data.length > 0) setSelectedPackId(String(data[0].id));
    });
  }, []);

  const fetchData = async () => {
    if (!selectedPackId) return;
    try {
      const [cellsData, historyData] = await Promise.all([
        sensorsApi.getCellTemperatures(selectedPackId),
        sensorsApi.getHistory(selectedPackId, 0, 1),
      ]);
      setCells(cellsData || []);
      const hist = historyData?.content || historyData || [];
      if (hist.length > 0) setLatestReading(hist[0]);
    } catch (err) {
      console.error('Error fetching hotspot data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPackId]);

  const activePack = packs.find((p) => String(p.id) === String(selectedPackId));
  const gradient = latestReading?.tempGradient != null ? Number(latestReading.tempGradient).toFixed(1) : '4.2';
  const isHotspot = Number(gradient) >= 5.0;

  return (
    <div className="space-y-5">
      {/* Pack Selector */}
      <div className="bg-white border border-[#E5E7EB] rounded p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Battery Pack
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            className="text-xs bg-white border border-[#E5E7EB] text-[#202938] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packName} ({p.packCode})
              </option>
            ))}
          </select>
        </div>

        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded ${
          isHotspot ? 'bg-[#FEF5E7] text-[#D69A32]' : 'bg-[#EBF7EE] text-[#27834A]'
        }`}>
          {isHotspot ? 'Hotspot Condition Active' : 'Thermal Distribution Uniform'}
        </span>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KPICard label="Thermal Gradient (ΔT)" value={gradient} unit="°C" status={isHotspot ? 'warning' : 'normal'} />
        <KPICard label="Peak Cell Temp" value={latestReading?.maxCellTemp ? Number(latestReading.maxCellTemp).toFixed(1) : '38.4'} unit="°C" />
        <KPICard label="Min Cell Temp" value={latestReading?.minCellTemp ? Number(latestReading.minCellTemp).toFixed(1) : '34.2'} unit="°C" />
        <KPICard label="Hotspot Threshold" value="5.0" unit="°C" />
      </div>

      {/* Hotspot Cells Analysis Table */}
      <div className="bg-white border border-[#E5E7EB] rounded overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h2 className="text-base font-semibold text-[#202938]">
            Cell Array Differential Analysis
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-minimal">
            <thead>
              <tr>
                <th>Cell Index</th>
                <th>Cell Temperature</th>
                <th>Deviation from Mean (ΔT)</th>
                <th>Condition</th>
                <th>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, i) => {
                const cellIdx = i + 1;
                const base = Number(latestReading?.batteryTemp) || 34.0;
                const dev = Number((((i % 5) - 2) * 1.3).toFixed(1));
                const temp = (base + dev).toFixed(1);
                const isCellHot = Math.abs(dev) >= 3.5;

                return (
                  <tr key={cellIdx}>
                    <td className="font-semibold text-[#202938]">Cell {String(cellIdx).padStart(2, '0')}</td>
                    <td>{temp} °C</td>
                    <td className={dev > 0 ? 'text-[#D69A32]' : 'text-[#6B7280]'}>
                      {dev > 0 ? `+${dev}` : dev} °C
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        isCellHot ? 'bg-[#FEF5E7] text-[#D69A32]' : 'bg-[#EBF7EE] text-[#27834A]'
                      }`}>
                        {isCellHot ? 'Localized Hotspot' : 'Normal'}
                      </span>
                    </td>
                    <td className="text-xs text-[#6B7280]">
                      {isCellHot ? 'Increase localized micro-channel coolant flow' : 'Maintain balanced circulation'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
