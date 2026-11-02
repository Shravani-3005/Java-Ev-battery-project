import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import BatteryPacksPage from './pages/BatteryPacksPage';
import LiveMonitoringPage from './pages/LiveMonitoringPage';
import ThermalAnalyticsPage from './pages/ThermalAnalyticsPage';
import HotspotDetectionPage from './pages/HotspotDetectionPage';
import AlertsPage from './pages/AlertsPage';
import HistoricalRecordsPage from './pages/HistoricalRecordsPage';
import ThermalSimulatorPage from './pages/ThermalSimulatorPage';
import SettingsPage from './pages/SettingsPage';
import { alertsApi, simulationApi } from './api/client';

function AppContent() {
  const location = useLocation();
  const [systemOnline, setSystemOnline] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const routeMeta = {
    '/': { title: 'Fleet Thermal Overview', breadcrumbs: ['Operations', 'Dashboard'] },
    '/batteries': { title: 'Battery Pack Management', breadcrumbs: ['Assets', 'Battery Packs'] },
    '/live': { title: 'Live Sensor Telemetry', breadcrumbs: ['Telemetry', 'Live Monitoring'] },
    '/analytics': { title: 'Thermal Analytics & Trends', breadcrumbs: ['Engineering', 'Analytics'] },
    '/hotspots': { title: 'Hotspot & Gradient Diagnostics', breadcrumbs: ['Safety', 'Hotspots'] },
    '/alerts': { title: 'Thermal Alerts & Cooling Directives', breadcrumbs: ['Safety', 'Alerts'] },
    '/history': { title: 'Historical Observations Database', breadcrumbs: ['Database', 'Records'] },
    '/simulator': { title: 'What-If Thermal Sandbox', breadcrumbs: ['R&D', 'Simulator'] },
    '/settings': { title: 'System Configuration', breadcrumbs: ['Admin', 'Settings'] },
  };

  const currentMeta = routeMeta[location.pathname] || { title: 'THERMOCORE', breadcrumbs: ['System'] };

  const checkHealth = async () => {
    try {
      const [alerts, sim] = await Promise.all([
        alertsApi.getAll({ status: 'ACTIVE' }),
        simulationApi.getStatus(),
      ]);
      setSystemOnline(true);
      const activeCount = Array.isArray(alerts) ? alerts.length : alerts?.content?.length || 0;
      setUnreadAlerts(activeCount);
    } catch (e) {
      setSystemOnline(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#0B0B0D] flex text-[#F5F5F5]">
      {/* Persistent Left Sidebar */}
      <Sidebar systemOnline={systemOnline} activeSimulation={systemOnline} />

      {/* Main Container */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Navbar
          title={currentMeta.title}
          breadcrumbs={currentMeta.breadcrumbs}
          unreadAlerts={unreadAlerts}
        />

        {/* Page Content View */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/batteries" element={<BatteryPacksPage />} />
            <Route path="/live" element={<LiveMonitoringPage />} />
            <Route path="/analytics" element={<ThermalAnalyticsPage />} />
            <Route path="/hotspots" element={<HotspotDetectionPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/history" element={<HistoricalRecordsPage />} />
            <Route path="/simulator" element={<ThermalSimulatorPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
