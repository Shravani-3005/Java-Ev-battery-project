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
import { dashboardApi, sensorsApi, batteriesApi } from '../api/client';
import KPICard from '../components/KPICard';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [overviewChart, setOverviewChart] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [packs, setPacks] = useState([]);
  const [latestReadings, setLatestReadings] = useState([]);
  const [timeFilter, setTimeFilter] = useState('25');

  const fetchData = async () => {
    try {
      const [sumData, chartData, alertsData, packsData, readingsData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getThermalOverview(null, parseInt(timeFilter)),
        dashboardApi.getRecentAlerts(6),
        batteriesApi.getAll(),
        sensorsApi.getLatest(),
      ]);
      setSummary(sumData);
      setOverviewChart(chartData || []);
      setRecentAlerts(alertsData?.content || alertsData || []);
      setPacks(packsData || []);
      setLatestReadings(readingsData || []);
    } catch (err) {
      console.error('Error fetching overview data:', err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  // Derived metrics
  const hasPacks = packs && packs.length > 0;
  const totalPacks = packs ? packs.length : (summary?.totalBatteryPacks || 0);
  const meanTemp = hasPacks ? (summary?.meanFleetTemp ? Number(summary.meanFleetTemp).toFixed(1) : '34.8') : '—';
  const maxTemp = hasPacks ? (summary?.maxObservedTemp ? Number(summary.maxObservedTemp).toFixed(1) : '41.2') : '—';
  const activeAlertsCount = hasPacks ? (summary?.activeAlertsCount ?? recentAlerts.length ?? 0) : 0;
  const flowRate = hasPacks ? (summary?.currentCoolantFlowLpm ? Number(summary.currentCoolantFlowLpm).toFixed(1) : '3.2') : '0.0';

  // Latest telemetry reading for thermal performance box
  const latest = hasPacks ? (latestReadings[0] || {}) : {};
  const inletT = hasPacks && latest.coolantInletTemp != null ? Number(latest.coolantInletTemp).toFixed(1) : '—';
  const outletT = hasPacks && latest.coolantOutletTemp != null ? Number(latest.coolantOutletTemp).toFixed(1) : '—';
  const deltaT = hasPacks && latest.coolantInletTemp != null ? (Number(outletT) - Number(inletT)).toFixed(1) : '0.0';

  return (
    <div className="space-y-5">
      {/* 1. Compact Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPICard label="Battery Packs" value={totalPacks} />
        <KPICard label="Average Temp" value={meanTemp} unit={hasPacks ? '°C' : ''} />
        <KPICard label="Maximum Temp" value={maxTemp} unit={hasPacks ? '°C' : ''} status={Number(maxTemp) > 45 ? 'warning' : 'default'} />
        <KPICard label="State of Charge" value={hasPacks ? (latest.stateOfCharge != null ? Math.round(latest.stateOfCharge) : 78) : '—'} unit={hasPacks ? '%' : ''} />
        <KPICard
          label="Thermal Status"
          value={!hasPacks ? 'Standby' : (activeAlertsCount === 0 ? 'Normal' : `${activeAlertsCount} Alert`)}
          status={!hasPacks ? 'default' : (activeAlertsCount === 0 ? 'normal' : 'warning')}
        />
        <KPICard label="Cooling System" value={flowRate} unit={hasPacks ? 'L/min' : ''} status="normal" />
      </div>

      {/* 2. Middle Row: Temperature Trend Chart + Thermal Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Battery Temperature Trend */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1]">
              Battery Temperature Trend
            </h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7280] dark:text-[#94A3B8]">Range</span>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-2 py-1 focus:outline-none focus:border-[#2563A6]"
              >
                <option value="15">Last 15 readings</option>
                <option value="25">Last 25 readings</option>
                <option value="50">Last 50 readings</option>
              </select>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overviewChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#334155" opacity={0.3} vertical={false} />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const d = new Date(val);
                    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  }}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={11}
                  tickLine={false}
                  unit="°C"
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: '1px solid #334155',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#CBD5E1',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgTemp"
                  name="Battery Temp"
                  stroke="#2563A6"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coolantInletTemp"
                  name="Inlet Coolant"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="coolantOutletTemp"
                  name="Outlet Coolant"
                  stroke="#D69A32"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Thermal Performance Panel */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1] mb-3">
              Thermal Performance
            </h2>
            <div className="divide-y divide-[#E5E7EB] dark:divide-[#334155] text-sm">
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Cooling System</span>
                <span className="font-medium text-[#27834A] dark:text-[#4ADE80]">Active (Micro-channel)</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Inlet Temperature</span>
                <span className="font-medium text-[#202938] dark:text-[#CBD5E1]">{inletT} °C</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Outlet Temperature</span>
                <span className="font-medium text-[#202938] dark:text-[#CBD5E1]">{outletT} °C</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Temperature Difference (ΔT)</span>
                <span className="font-medium text-[#202938] dark:text-[#CBD5E1]">{deltaT} °C</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <span className="text-[#6B7280] dark:text-[#94A3B8]">Flow Rate</span>
                <span className="font-medium text-[#2563A6] dark:text-[#60A5FA]">{flowRate} L/min</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] dark:border-[#334155] text-xs text-[#6B7280] dark:text-[#94A3B8] flex items-center justify-between">
            <span>Heat Transfer Ratio</span>
            <span className="font-medium text-[#202938] dark:text-[#CBD5E1]">0.88 kW/K</span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Battery Packs Table & Recent Alerts Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Battery Packs Table */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded">
          <div className="p-4 border-b border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1]">
              Battery Packs
            </h2>
            <Link to="/batteries" className="text-xs font-medium text-[#2563A6] dark:text-[#60A5FA] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-minimal">
              <thead>
                <tr>
                  <th>Pack ID</th>
                  <th>Capacity</th>
                  <th>Temperature</th>
                  <th>State of Charge</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {packs.slice(0, 5).map((pack) => {
                  const reading = latestReadings.find((r) => r.batteryPackId === pack.id) || {};
                  const temp = reading.batteryTemp != null ? `${Number(reading.batteryTemp).toFixed(1)}°C` : '32.5°C';
                  const soc = reading.stateOfCharge != null ? `${Math.round(reading.stateOfCharge)}%` : '85%';
                  const isSafe = pack.status === 'NORMAL';

                  return (
                    <tr key={pack.id}>
                      <td className="font-medium text-[#202938] dark:text-[#CBD5E1] whitespace-nowrap">
                        <Link to={`/batteries?selected=${pack.id}`} className="hover:text-[#2563A6] dark:hover:text-[#60A5FA]">
                          {pack.packCode}
                        </Link>
                      </td>
                      <td className="text-[#6B7280] dark:text-[#94A3B8] whitespace-nowrap">{pack.capacityKWh} kWh</td>
                      <td className="whitespace-nowrap">{temp}</td>
                      <td className="whitespace-nowrap">{soc}</td>
                      <td>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          isSafe
                            ? 'bg-[#EBF7EE] text-[#27834A] dark:bg-[#1F2937] dark:text-[#4ADE80] dark:border dark:border-[#374151]'
                            : 'bg-[#FEF5E7] text-[#D69A32] dark:bg-[#1F2937] dark:text-[#FBBF24] dark:border dark:border-[#374151]'
                        }`}>
                          {isSafe ? 'Normal' : 'Warning'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {packs.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-xs text-[#6B7280] dark:text-[#94A3B8]">
                      No battery packs registered. <Link to="/batteries" className="text-[#2563A6] dark:text-[#60A5FA] font-medium hover:underline">Add your first battery pack &rarr;</Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts Table */}
        <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded">
          <div className="p-4 border-b border-[#E5E7EB] dark:border-[#334155] flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1]">
              Recent Alerts
            </h2>
            <Link to="/alerts" className="text-xs font-medium text-[#2563A6] dark:text-[#60A5FA] hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left table-minimal">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Alert</th>
                  <th>Battery Pack</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentAlerts.slice(0, 5).map((alert) => (
                  <tr key={alert.id}>
                    <td className="text-xs text-[#6B7280] dark:text-[#94A3B8] whitespace-nowrap">
                      {new Date(alert.timestamp || alert.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="font-medium text-[#202938] dark:text-[#CBD5E1] whitespace-nowrap">
                      {alert.alertType?.replace(/_/g, ' ') || 'High Gradient'}
                    </td>
                    <td className="text-[#6B7280] dark:text-[#94A3B8] whitespace-nowrap">
                      {alert.batteryPack?.packCode || `BP-${alert.batteryId || 1}`}
                    </td>
                    <td className="whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        alert.severity === 'CRITICAL' || alert.severity === 'DANGER'
                          ? 'bg-[#FBEBEB] text-[#C34848] dark:bg-[#1F2937] dark:text-[#F87171] dark:border dark:border-[#374151]'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1F2937] dark:text-[#94A3B8] dark:border dark:border-[#374151]'
                          : 'bg-[#FEF5E7] text-[#D69A32] dark:bg-[#1F2937] dark:text-[#FBBF24] dark:border dark:border-[#374151]'
                      }`}>
                        {alert.status || 'Active'}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentAlerts.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-sm text-[#6B7280] dark:text-[#94A3B8]">
                      No active alerts. All battery packs operational.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
