import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';
import { batteriesApi, analyticsApi } from '../api/client';
import KPICard from '../components/KPICard';

export default function ThermalAnalyticsPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('1');
  const [tempData, setTempData] = useState([]);
  const [coolantData, setCoolantData] = useState([]);
  const [electricalData, setElectricalData] = useState([]);

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data || []);
      if (data && data.length > 0) setSelectedPackId(String(data[0].id));
    });
  }, []);

  const fetchAnalytics = async () => {
    if (!selectedPackId) return;
    try {
      const [tData, cData, eData] = await Promise.all([
        analyticsApi.getTemperature(selectedPackId, 30),
        analyticsApi.getCoolant(selectedPackId, 30),
        analyticsApi.getCurrent(selectedPackId, 30),
      ]);
      setTempData(tData || []);
      setCoolantData(cData || []);
      setElectricalData(eData || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [selectedPackId]);

  return (
    <div className="space-y-5">
      {/* Pack Filter */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wide">
            Filter by Battery Pack
          </label>
          <select
            value={selectedPackId}
            onChange={(e) => setSelectedPackId(e.target.value)}
            disabled={packs.length === 0}
            className="text-xs bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6] disabled:opacity-60"
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
        <span className="text-xs text-[#6B7280] dark:text-[#94A3B8]">Historical comparison window: 30 cycles</span>
      </div>

      {/* Temperature Trends Chart */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4">
        <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1] mb-1">
          Cell Temperature Distribution & Gradient
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-4">
          Tracking mean pack temperature versus max cell temperature and inter-cell differential.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tempData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} unit="°C" />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px', color: '#CBD5E1' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="avgTemp" name="Mean Temp" stroke="#2563A6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="maxCellTemp" name="Max Cell Temp" stroke="#C34848" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="minCellTemp" name="Min Cell Temp" stroke="#9CA3AF" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Micro-channel Coolant Dynamics Chart */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4">
        <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1] mb-1">
          Cooling Heat Absorption (Inlet vs. Outlet)
        </h2>
        <p className="text-xs text-[#6B7280] dark:text-[#94A3B8] mb-4">
          Micro-channel coolant temperature delta (ΔT_coolant) and pump circulation flow rate.
        </p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={coolantData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#334155" opacity={0.3} vertical={false} />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '4px', fontSize: '12px', color: '#CBD5E1' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="coolantInletTemp" name="Inlet (°C)" stroke="#6B7280" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="coolantOutletTemp" name="Outlet (°C)" stroke="#D69A32" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="coolantFlowRate" name="Flow Rate (L/min)" stroke="#27834A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
