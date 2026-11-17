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
import LoginPage from './pages/LoginPage';
import { alertsApi, simulationApi, authApi, batteriesApi } from './api/client';

function AppContent() {
  const location = useLocation();
  const [systemOnline, setSystemOnline] = useState(true);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const currentUser = authApi.getCurrentUser();

  // Authentication Gate: if user is not logged in, show clean Login / Sign-up page
  if (!currentUser) {
    return <LoginPage />;
  }

  const routeTitles = {
    '/': 'Overview',
    '/batteries': 'Battery Packs',
    '/live': 'Live Monitoring',
    '/analytics': 'Thermal Analytics',
    '/hotspots': 'Hotspot Detection',
    '/alerts': 'Alerts',
    '/history': 'Historical Records',
    '/simulator': 'Thermal Simulator',
    '/settings': 'Settings',
  };

  const currentTitle = routeTitles[location.pathname] || 'THERMOCORE';

  const checkHealth = async () => {
    try {
      const [alerts, sim, packsData] = await Promise.all([
        alertsApi.getAll({ status: 'ACTIVE' }),
        simulationApi.getStatus(),
        batteriesApi.getAll(),
      ]);
      setSystemOnline(true);
      const activeCount = Array.isArray(alerts) ? alerts.length : alerts?.content?.length || 0;
      setUnreadAlerts(activeCount);
      if (packsData && packsData.length > 0) {
        setPacks(packsData);
        if (!selectedPackId) setSelectedPackId(String(packsData[0].id));
      }
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
    <div className="min-h-screen bg-[#F7F8FA] text-[#202938] flex font-sans">
      {/* 1. Simple Dark Navy Sidebar */}
      <Sidebar systemOnline={systemOnline} />

      {/* 2. Main Work Content Area */}
      <div className="flex-1 ml-56 flex flex-col min-w-0">
        <Navbar
          title={currentTitle}
          packs={packs}
          selectedPackId={selectedPackId}
          onSelectPack={setSelectedPackId}
          unreadAlerts={unreadAlerts}
        />

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
            <Route path="/login" element={<LoginPage />} />
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
