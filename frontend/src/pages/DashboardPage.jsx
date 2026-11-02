import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Thermometer,
  Droplets,
  Zap,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dashboardApi, sensorsApi } from '../api/client';
import KPICard from '../components/KPICard';
import { Link, useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  NORMAL: '#22C55E',
  MODERATE: '#FF7900',
  HIGH_RISK: '#EF4444',
  CRITICAL: '#DC2626',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [overviewChart, setOverviewChart] = useState([]);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [latestReadings, setLatestReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [sumData, chartData, alertsData, readingsData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getThermalOverview(null, 25),
        dashboardApi.getRecentAlerts(5),
        sensorsApi.getLatest(),
      ]);
      setSummary(sumData);
      setOverviewChart(chartData);
      setRecentAlerts(alertsData?.content || alertsData || []);
      setLatestReadings(readingsData || []);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3500);
    return () => clearInterval(interval);
  }, []);

  const donutData = summary?.statusDistribution
    ? Object.entries(summary.statusDistribution).map(([name, value]) => ({
        name: name.replace('_', ' '),
        value,
        key: name,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Fleet Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">
              Fleet Thermal Telemetry Live
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Real-time monitoring across registered EV micro-channel cold plate packs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#A1A1AA]">
            Sync: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-xs font-mono text-[#F5F5F5] hover:border-[#FF7900] hover:text-[#FF7900] flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <KPICard
          title="Total Packs"
          value={summary ? summary.totalBatteryPacks : '--'}
          subtitle="Registered fleet units"
          icon={Layers}
        />
        <KPICard
          title="Active Packs"
          value={summary ? summary.activeBatteryPacks : '--'}
          subtitle="Transmitting telemetry"
          icon={Activity}
          status="normal"
        />
        <KPICard
          title="Normal Status"
          value={summary ? summary.normalBatteries : '--'}
          subtitle="< 35°C optimal window"
          icon={ShieldCheck}
          status="normal"
        />
        <KPICard
          title="At Thermal Risk"
          value={summary ? summary.batteriesAtRisk : '--'}
          subtitle="Elevated / Hotspot"
          icon={AlertTriangle}
          status={summary?.batteriesAtRisk > 0 ? 'warning' : 'default'}
        />
        <KPICard
          title="Critical Alerts"
          value={summary ? summary.criticalAlerts : '--'}
          subtitle="Immediate action req."
          icon={Flame}
          status={summary?.criticalAlerts > 0 ? 'critical' : 'default'}
        />
        <KPICard
          title="Avg Fleet Temp"
          value={summary ? summary.avgBatteryTemp : '--'}
          unit="°C"
          subtitle="Micro-channel target: 32°C"
          icon={Thermometer}
        />
      </div>

      {/* Charts Section: Thermal Overview & Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Large Thermal Overview Line Chart (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#FF7900]" />
                Thermal Overview – Fleet Temperature Curves
              </h2>
              <p className="text-xs text-[#A1A1AA] mt-0.5 font-mono">
                Real-time pack battery temp (°C) vs micro-channel coolant inlet & outlet temperatures
              </p>
            </div>
            <Link
              to="/analytics"
              className="text-xs text-[#FF7900] hover:text-[#FF922B] flex items-center gap-1 font-mono font-medium"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={overviewChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222226" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#A1A1AA"
                  fontSize={10}
                  tickFormatter={(t) => (t ? new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '')}
                />
                <YAxis stroke="#A1A1AA" fontSize={10} domain={[15, 65]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141416', borderColor: '#34343A', borderRadius: '6px', fontSize: '11px', color: '#F5F5F5' }}
                  labelFormatter={(t) => (t ? new Date(t).toLocaleTimeString() : '')}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="batteryTemp" name="Battery Temp (°C)" stroke="#FF7900" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="maxCellTemp" name="Max Cell Temp (°C)" stroke="#EF4444" strokeWidth={1.8} strokeDasharray="4 4" dot={false} />
                <Line type="monotone" dataKey="coolantInletTemp" name="Coolant Inlet (°C)" stroke="#C0C0C0" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="coolantOutletTemp" name="Coolant Outlet (°C)" stroke="#38BDF8" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Status Distribution Donut Chart (1 Col) */}
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider">
              Fleet Risk Distribution
            </h2>
            <p className="text-xs text-[#A1A1AA] mt-0.5 font-mono">
              Electrochemical safety categorisation
            </p>
          </div>

          <div className="h-56 w-full my-2 flex items-center justify-center">
            {donutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.key] || '#C0C0C0'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141416', borderColor: '#34343A', borderRadius: '6px', fontSize: '11px', color: '#F5F5F5' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-[#A1A1AA] font-mono">Loading distribution...</div>
            )}
          </div>

          {/* Cooling Overview Micro-Card */}
          <div className="p-3 rounded bg-[#141416] border border-[#34343A] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] flex items-center gap-1.5 font-mono">
                <Droplets className="w-3.5 h-3.5 text-[#38BDF8]" /> Coolant Flow
              </span>
              <span className="font-mono font-bold text-[#F5F5F5]">{summary?.avgCoolantFlowRate || '3.4'} L/min</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] font-mono">Inlet / Outlet</span>
              <span className="font-mono text-[#C0C0C0]">
                {summary?.avgCoolantInletTemp || '23.8'}°C / {summary?.avgCoolantOutletTemp || '27.2'}°C
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA] font-mono">Efficiency Status</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                summary?.coolingEfficiencyStatus === 'OPTIMAL'
                  ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                  : 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30'
              }`}>
                {summary?.coolingEfficiencyStatus || 'OPTIMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Battery Monitoring Table */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF7900]" />
              Live Battery Pack Ingestion &amp; Telemetry
            </h2>
            <p className="text-xs text-[#A1A1AA] font-mono mt-0.5">
              Individual pack sensor streams, gradient ΔT, micro-channel cold plate flow and risk ratings
            </p>
          </div>
          <Link
            to="/batteries"
            className="text-xs text-[#FF7900] hover:text-[#FF922B] flex items-center gap-1 font-mono font-medium"
          >
            <span>Manage Packs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#34343A] text-[10px] font-mono uppercase text-[#A1A1AA]">
                <th className="py-2.5 px-3">Battery ID</th>
                <th className="py-2.5 px-3">Vehicle Model</th>
                <th className="py-2.5 px-3">Chemistry</th>
                <th className="py-2.5 px-3">Battery Temp</th>
                <th className="py-2.5 px-3">Max Cell (ΔT)</th>
                <th className="py-2.5 px-3">Voltage / Current</th>
                <th className="py-2.5 px-3">Coolant Flow</th>
                <th className="py-2.5 px-3">Thermal Risk</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34343A]/50 text-xs font-mono">
              {latestReadings.length > 0 ? (
                latestReadings.map((reading) => {
                  const pack = reading.batteryPack;
                  const isHotspot = reading.isHotspotDetected;
                  return (
                    <tr key={reading.id} className="hover:bg-[#141416] transition-colors">
                      <td className="py-3 px-3 font-bold text-[#F5F5F5]">
                        <span className="text-[#FF7900]">{pack?.packCode}</span>
                        <div className="text-[10px] text-[#A1A1AA] font-sans font-normal">{pack?.packName}</div>
                      </td>
                      <td className="py-3 px-3 text-[#C0C0C0] font-sans font-medium">{pack?.vehicleModel}</td>
                      <td className="py-3 px-3 text-[#A1A1AA]">{pack?.chemistry}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold ${reading.batteryTemp >= 45 ? 'text-[#EF4444]' : reading.batteryTemp >= 38 ? 'text-[#FF7900]' : 'text-[#F5F5F5]'}`}>
                          {reading.batteryTemp?.toFixed(1)}°C
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[#F5F5F5]">{reading.maxCellTemp?.toFixed(1)}°C</span>
                          <span className={`text-[10px] px-1 py-0.2 rounded ${isHotspot ? 'bg-[#EF4444]/20 text-[#EF4444] font-bold' : 'text-[#A1A1AA]'}`}>
                            (Δ{reading.tempGradient?.toFixed(1)}°C)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#C0C0C0]">
                        {reading.voltage?.toFixed(0)}V / <span className={reading.current > 150 ? 'text-[#FF7900] font-semibold' : ''}>{reading.current?.toFixed(1)}A</span>
                      </td>
                      <td className="py-3 px-3 text-[#38BDF8]">
                        {reading.coolantFlowRate?.toFixed(1)} L/min
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          reading.thermalRiskLevel === 'CRITICAL'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 animate-pulse'
                            : reading.thermalRiskLevel === 'HIGH'
                            ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                            : reading.thermalRiskLevel === 'MODERATE'
                            ? 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30'
                            : 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                        }`}>
                          {reading.thermalRiskLevel} ({reading.thermalRiskScore?.toFixed(0)}/100)
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => navigate(`/batteries?selected=${pack?.id}`)}
                          className="px-2.5 py-1 rounded bg-[#222226] text-[#C0C0C0] hover:text-[#FF7900] hover:border-[#FF7900] border border-[#34343A] transition-colors text-[11px]"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="py-6 text-center text-[#A1A1AA]">
                    No live sensor streams detected. Simulator generating readings...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Alerts Strip */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#EF4444]" />
            Recent Thermal Safety Alerts
          </h2>
          <Link
            to="/alerts"
            className="text-xs text-[#FF7900] hover:text-[#FF922B] flex items-center gap-1 font-mono font-medium"
          >
            <span>All Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded bg-[#141416] border border-[#34343A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase mt-0.5 ${
                    alert.severity === 'CRITICAL' ? 'bg-[#EF4444] text-black font-extrabold' :
                    alert.severity === 'DANGER' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40' :
                    alert.severity === 'WARNING' ? 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40' :
                    'bg-[#C0C0C0]/20 text-[#C0C0C0]'
                  }`}>
                    {alert.severity}
                  </span>
                  <div>
                    <div className="font-semibold text-[#F5F5F5]">
                      {alert.batteryPack?.packCode} &bull; {alert.alertType}
                    </div>
                    <div className="text-[11px] text-[#A1A1AA] mt-0.5">{alert.description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-[#A1A1AA] self-end sm:self-center">
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                  <Link
                    to="/alerts"
                    className="text-[#FF7900] hover:underline"
                  >
                    Review Action &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-xs text-[#A1A1AA] font-mono">
              Zero active thermal alerts. All packs operating within normal limits.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
