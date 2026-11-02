import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { LineChart as AnalyticsIcon, Filter, Layers, RefreshCw } from 'lucide-react';
import { batteriesApi, analyticsApi } from '../api/client';

export default function ThermalAnalyticsPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [chartData, setChartData] = useState([]);
  const [limit, setLimit] = useState(40);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchAnalytics = async () => {
    if (!selectedPackId) return;
    setIsLoading(true);
    try {
      const data = await analyticsApi.getTemperature(selectedPackId, limit);
      setChartData(data || []);
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
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 4000);
    return () => clearInterval(interval);
  }, [selectedPackId, limit]);

  // Compute stats
  const temps = chartData.map(d => d.batteryTemp).filter(Boolean);
  const minTemp = temps.length ? Math.min(...temps).toFixed(1) : '--';
  const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : '--';
  const avgTemp = temps.length ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : '--';

  const currents = chartData.map(d => d.current).filter(Boolean);
  const peakCurrent = currents.length ? Math.max(...currents.map(Math.abs)).toFixed(1) : '--';

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <AnalyticsIcon className="w-4 h-4 text-[#FF7900]" />
            Deep Thermal Analytics &amp; Time-Series Correlation
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Electrochemical heat generation, voltage sag, C-rate correlation, and coolant absorption trends
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="bg-[#1B1B1F] border border-[#34343A] text-[#F5F5F5] rounded px-3 py-1.5 focus:outline-none"
          >
            <option value="20">Last 20 Observations</option>
            <option value="40">Last 40 Observations</option>
            <option value="80">Last 80 Observations</option>
          </select>

          <button
            onClick={fetchAnalytics}
            className="p-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#C0C0C0] hover:text-[#FF7900]"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Statistics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Minimum Temperature</span>
          <span className="text-2xl font-bold text-[#22C55E] mt-1 block">{minTemp}°C</span>
          <span className="text-[10px] text-[#A1A1AA]">Sample window min</span>
        </div>
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Average Temperature</span>
          <span className="text-2xl font-bold text-[#F5F5F5] mt-1 block">{avgTemp}°C</span>
          <span className="text-[10px] text-[#A1A1AA]">Arithmetic mean</span>
        </div>
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Peak Temperature</span>
          <span className="text-2xl font-bold text-[#EF4444] mt-1 block">{maxTemp}°C</span>
          <span className="text-[10px] text-[#A1A1AA]">Recorded peak</span>
        </div>
        <div className="p-4 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <span className="text-[10px] text-[#A1A1AA] uppercase block">Peak Current Draw</span>
          <span className="text-2xl font-bold text-[#FF7900] mt-1 block">{peakCurrent}A</span>
          <span className="text-[10px] text-[#A1A1AA]">Max absolute load</span>
        </div>
      </div>

      {/* Chart 1: Battery Temperature & Thermal Gradient ΔT */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
          1. Battery Temperature &amp; Inter-Cell Thermal Gradient (ΔT)
        </h3>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Visualizes pack average temp against maximum cell temp and localized hotspot gradient threshold (5.0°C)
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
              <XAxis dataKey="timestamp" stroke="#A1A1AA" fontSize={10} tickFormatter={(t) => (t ? new Date(t).toLocaleTimeString() : '')} />
              <YAxis stroke="#A1A1AA" fontSize={10} domain={[15, 65]} />
              <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#34343A', borderRadius: '6px', fontSize: '11px', color: '#F5F5F5' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Area type="monotone" dataKey="batteryTemp" name="Pack Temp (°C)" stroke="#FF7900" fill="#FF7900" fillOpacity={0.15} strokeWidth={2} />
              <Line type="monotone" dataKey="maxCellTemp" name="Max Cell Temp (°C)" stroke="#EF4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="tempGradient" name="Thermal Gradient ΔT (°C)" stroke="#C0C0C0" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Voltage & Current Dynamics */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
          2. Electrical Load Profile (Pack Voltage &amp; Current vs Joulean Heat)
        </h3>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Shows electrochemical load and power dissipation (Joulean heating: P = I²R)
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
              <XAxis dataKey="timestamp" stroke="#A1A1AA" fontSize={10} tickFormatter={(t) => (t ? new Date(t).toLocaleTimeString() : '')} />
              <YAxis yAxisId="left" stroke="#A1A1AA" fontSize={10} domain={[300, 450]} />
              <YAxis yAxisId="right" orientation="right" stroke="#FF7900" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#34343A', borderRadius: '6px', fontSize: '11px', color: '#F5F5F5' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line yAxisId="left" type="monotone" dataKey="voltage" name="Voltage (V)" stroke="#C0C0C0" strokeWidth={1.8} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="current" name="Current (A)" stroke="#FF7900" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="heatGenW" name="Joulean Heat (W)" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Micro-Channel Coolant Dynamics */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <h3 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider mb-2">
          3. Micro-Channel Coolant Heat Absorption &amp; Flow Modulations
        </h3>
        <p className="text-xs text-[#A1A1AA] mb-4">
          Coolant inlet temp, outlet temp, and active liquid flow rate (L/min)
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
              <XAxis dataKey="timestamp" stroke="#A1A1AA" fontSize={10} tickFormatter={(t) => (t ? new Date(t).toLocaleTimeString() : '')} />
              <YAxis yAxisId="temp" stroke="#A1A1AA" fontSize={10} domain={[15, 55]} />
              <YAxis yAxisId="flow" orientation="right" stroke="#38BDF8" fontSize={10} domain={[0, 15]} />
              <Tooltip contentStyle={{ backgroundColor: '#141416', borderColor: '#34343A', borderRadius: '6px', fontSize: '11px', color: '#F5F5F5' }} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Line yAxisId="temp" type="monotone" dataKey="coolantInletTemp" name="Coolant Inlet (°C)" stroke="#C0C0C0" strokeWidth={1.8} dot={false} />
              <Line yAxisId="temp" type="monotone" dataKey="coolantOutletTemp" name="Coolant Outlet (°C)" stroke="#FF7900" strokeWidth={1.8} dot={false} />
              <Line yAxisId="flow" type="stepAfter" dataKey="coolantFlowRate" name="Coolant Pump Flow (L/min)" stroke="#38BDF8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
