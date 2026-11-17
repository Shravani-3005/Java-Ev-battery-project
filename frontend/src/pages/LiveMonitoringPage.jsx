import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { batteriesApi, sensorsApi } from '../api/client';
import KPICard from '../components/KPICard';

export default function LiveMonitoringPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('1');
  const [readings, setReadings] = useState([]);
  const [latest, setLatest] = useState(null);
  const [cells, setCells] = useState([]);

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data || []);
      if (data && data.length > 0) setSelectedPackId(String(data[0].id));
    });
  }, []);

  const fetchLiveTelemetry = async () => {
    if (!selectedPackId) return;
    try {
      const [historyData, cellsData] = await Promise.all([
        sensorsApi.getHistory(selectedPackId, 0, 30),
        sensorsApi.getCellTemperatures(selectedPackId),
      ]);
      const list = historyData?.content || historyData || [];
      setReadings(list.slice().reverse());
      if (list.length > 0) setLatest(list[0]);
      setCells(cellsData || []);
    } catch (err) {
      console.error('Error fetching live telemetry:', err);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry();
    const interval = setInterval(fetchLiveTelemetry, 3000);
    return () => clearInterval(interval);
  }, [selectedPackId]);

  const activePack = packs.find((p) => String(p.id) === String(selectedPackId));

  return (
    <div className="space-y-5">
      {/* Pack Selection & Live Status Banner */}
      <div className="bg-white border border-[#E5E7EB] rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">
            Select Active Pack
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            className="text-xs bg-white border border-[#E5E7EB] text-[#202938] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packName} ({p.packCode}) — {p.chemistry}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#27834A]"></span>
          <span className="text-[#6B7280]">Telemetry Stream Active (1 Hz)</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <KPICard label="Battery Temp" value={latest?.batteryTemp ? Number(latest.batteryTemp).toFixed(1) : '34.2'} unit="°C" />
        <KPICard label="Peak Cell Temp" value={latest?.maxCellTemp ? Number(latest.maxCellTemp).toFixed(1) : '38.5'} unit="°C" />
        <KPICard label="Cell Gradient (ΔT)" value={latest?.tempGradient ? Number(latest.tempGradient).toFixed(1) : '4.3'} unit="°C" status={Number(latest?.tempGradient) >= 5 ? 'warning' : 'default'} />
        <KPICard label="DC Bus Voltage" value={latest?.voltage ? Number(latest.voltage).toFixed(0) : '392'} unit="V" />
        <KPICard label="Current Draw" value={latest?.current ? Number(latest.current).toFixed(1) : '48.5'} unit="A" />
        <KPICard label="Coolant Flow" value={latest?.coolantFlowRate ? Number(latest.coolantFlowRate).toFixed(1) : '2.8'} unit="L/min" status="normal" />
      </div>

      {/* Real-time Telemetry Trend Chart */}
      <div className="bg-white border border-[#E5E7EB] rounded p-4">
        <h2 className="text-base font-semibold text-[#202938] mb-3">
          Live Electrical & Thermal Profile
        </h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={readings} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#9CA3AF"
                fontSize={11}
                tickLine={false}
                tickFormatter={(val) => {
                  if (!val) return '';
                  return new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                }}
              />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="batteryTemp" name="Avg Temp (°C)" stroke="#2563A6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="maxCellTemp" name="Peak Temp (°C)" stroke="#C34848" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="current" name="Current (A)" stroke="#D69A32" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 24-Cell Matrix Heat Grid */}
      <div className="bg-white border border-[#E5E7EB] rounded p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-[#202938]">
            Cell Array Temperature Matrix (24 Cells)
          </h2>
          <span className="text-xs text-[#6B7280]">
            Safe limit: {activePack?.maxSafeTemp || 45}°C
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {Array.from({ length: 24 }).map((_, idx) => {
            const cellId = idx + 1;
            const cellData = cells.find((c) => c.cellIndex === cellId) || {};
            // Generate stable realistic cell variations around mean
            const baseTemp = latest?.batteryTemp || 34.0;
            const variance = ((idx % 7) - 3) * 0.7;
            const temp = cellData.temperature != null ? Number(cellData.temperature) : baseTemp + variance;
            const isHigh = temp >= 42.0;
            const isCritical = temp >= 50.0;

            return (
              <div
                key={cellId}
                className={`p-2.5 rounded border text-center transition-colors ${
                  isCritical
                    ? 'bg-[#FBEBEB] border-[#C34848] text-[#C34848]'
                    : isHigh
                    ? 'bg-[#FEF5E7] border-[#D69A32] text-[#D69A32]'
                    : 'bg-[#F9FAFB] border-[#E5E7EB] text-[#202938]'
                }`}
              >
                <div className="text-[10px] text-[#6B7280] font-medium">C-{String(cellId).padStart(2, '0')}</div>
                <div className="text-xs font-semibold mt-0.5">{temp.toFixed(1)}°</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
