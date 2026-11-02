import React, { useState, useEffect } from 'react';
import {
  BellRing,
  AlertTriangle,
  ShieldCheck,
  CheckCircle,
  Clock,
  Filter,
  Check,
  Zap,
  Droplets,
  Layers
} from 'lucide-react';
import { alertsApi, batteriesApi, recommendationsApi } from '../api/client';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' or 'recommendations'
  const [alerts, setAlerts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [packs, setPacks] = useState([]);

  // Filters
  const [selectedPackId, setSelectedPackId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);

  const fetchAlertsAndRecs = async () => {
    try {
      const params = {};
      if (selectedPackId) params.batteryId = selectedPackId;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSeverity) params.severity = selectedSeverity;

      const [alertsData, recsData, packsData] = await Promise.all([
        alertsApi.getAll(params),
        recommendationsApi.getAll(0, 30),
        batteriesApi.getAll(),
      ]);

      setAlerts(alertsData?.content || alertsData || []);
      setRecommendations(recsData?.content || recsData || []);
      setPacks(packsData || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAlertsAndRecs();
    const interval = setInterval(fetchAlertsAndRecs, 4000);
    return () => clearInterval(interval);
  }, [selectedPackId, selectedStatus, selectedSeverity]);

  const handleAcknowledge = async (id) => {
    setIsProcessing(true);
    try {
      await alertsApi.acknowledge(id, { operatorName: 'BTMS Operator' });
      fetchAlertsAndRecs();
    } catch (e) {
      alert('Error acknowledging alert');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResolve = async (id) => {
    const notes = prompt('Enter resolution remarks (e.g., Coolant pump restored, load derated):');
    if (notes === null) return;
    setIsProcessing(true);
    try {
      await alertsApi.resolve(id, { operatorName: 'BTMS Operator', resolutionNotes: notes || 'Resolved' });
      fetchAlertsAndRecs();
    } catch (e) {
      alert('Error resolving alert');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#FF7900]" />
            Safety Alert Management &amp; Cooling Recommendations
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Automated thermal hazard detection, contactor emergency response, and actuator audit history
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 bg-[#1B1B1F] p-1 rounded border border-[#34343A]">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'alerts'
                ? 'bg-[#FF7900] text-black'
                : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Thermal Alerts ({alerts.filter(a => a.status === 'ACTIVE').length} Active)
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activeTab === 'recommendations'
                ? 'bg-[#FF7900] text-black'
                : 'text-[#A1A1AA] hover:text-[#F5F5F5]'
            }`}
          >
            Cooling Directives ({recommendations.length})
          </button>
        </div>
      </div>

      {activeTab === 'alerts' && (
        <>
          {/* Alert Filters */}
          <div className="flex flex-wrap items-center gap-3 p-3 rounded bg-[#1B1B1F] border border-[#34343A]">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-[#A1A1AA]" />
              <span className="text-[#A1A1AA] uppercase">Filter:</span>
            </div>

            <select
              value={selectedPackId}
              onChange={(e) => setSelectedPackId(e.target.value)}
              className="bg-[#141416] border border-[#34343A] text-[#F5F5F5] rounded px-2.5 py-1 focus:border-[#FF7900] focus:outline-none"
            >
              <option value="">All Battery Packs</option>
              {packs.map((p) => (
                <option key={p.id} value={p.id}>{p.packCode} ({p.vehicleModel})</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#141416] border border-[#34343A] text-[#F5F5F5] rounded px-2.5 py-1 focus:border-[#FF7900] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>

            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-[#141416] border border-[#34343A] text-[#F5F5F5] rounded px-2.5 py-1 focus:border-[#FF7900] focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="DANGER">DANGER</option>
              <option value="WARNING">WARNING</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          {/* Alerts Table */}
          <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#34343A] text-[10px] text-[#A1A1AA] uppercase">
                    <th className="py-2.5 px-3">Severity</th>
                    <th className="py-2.5 px-3">Battery Pack</th>
                    <th className="py-2.5 px-3">Alert Type</th>
                    <th className="py-2.5 px-3">Trigger Diagnostic</th>
                    <th className="py-2.5 px-3">Observed Reading</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#34343A]/40">
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <tr key={alert.id} className="hover:bg-[#141416]">
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            alert.severity === 'CRITICAL' ? 'bg-[#EF4444] text-black font-extrabold animate-pulse' :
                            alert.severity === 'DANGER' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40 font-bold' :
                            alert.severity === 'WARNING' ? 'bg-[#FF7900]/20 text-[#FF7900] border border-[#FF7900]/40 font-bold' :
                            'bg-[#C0C0C0]/20 text-[#C0C0C0]'
                          }`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-bold text-[#F5F5F5]">
                          {alert.batteryPack?.packCode}
                        </td>
                        <td className="py-3 px-3 text-[#FF7900] font-semibold">
                          {alert.alertType}
                        </td>
                        <td className="py-3 px-3 text-[#C0C0C0] max-w-xs truncate" title={alert.description}>
                          {alert.description}
                        </td>
                        <td className="py-3 px-3 text-[#EF4444]">
                          {alert.observedValue}
                        </td>
                        <td className="py-3 px-3 text-[#A1A1AA]">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            alert.status === 'ACTIVE' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
                            alert.status === 'ACKNOWLEDGED' ? 'bg-[#FF7900]/15 text-[#FF7900]' :
                            'bg-[#22C55E]/15 text-[#22C55E]'
                          }`}>
                            {alert.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right space-x-2">
                          {alert.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded bg-[#222226] text-[#FF7900] hover:bg-[#FF7900] hover:text-black border border-[#34343A] transition-colors"
                            >
                              Acknowledge
                            </button>
                          )}
                          {alert.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleResolve(alert.id)}
                              disabled={isProcessing}
                              className="px-2.5 py-1 rounded bg-[#222226] text-[#22C55E] hover:bg-[#22C55E] hover:text-black border border-[#34343A] transition-colors"
                            >
                              Resolve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-6 text-center text-[#A1A1AA]">
                        No alerts matching selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'recommendations' && (
        <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#34343A] text-[10px] text-[#A1A1AA] uppercase">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Pack Code</th>
                  <th className="py-2.5 px-3">Urgency</th>
                  <th className="py-2.5 px-3">Actuation Action</th>
                  <th className="py-2.5 px-3">Target Coolant Flow</th>
                  <th className="py-2.5 px-3">Radiator Fan</th>
                  <th className="py-2.5 px-3">Powertrain Derate</th>
                  <th className="py-2.5 px-3">Directive Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34343A]/40">
                {recommendations.map((rec) => (
                  <tr key={rec.id} className="hover:bg-[#141416]">
                    <td className="py-3 px-3 text-[#A1A1AA]">
                      {new Date(rec.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-3 font-bold text-[#FF7900]">
                      {rec.batteryPack?.packCode}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                        rec.urgencyLevel === 'EMERGENCY' ? 'bg-[#EF4444] text-black font-extrabold' :
                        rec.urgencyLevel === 'HIGH' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                        rec.urgencyLevel === 'MODERATE' ? 'bg-[#FF7900]/20 text-[#FF7900]' :
                        'bg-[#22C55E]/20 text-[#22C55E]'
                      }`}>
                        {rec.urgencyLevel}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-[#F5F5F5]">
                      {rec.actionType}
                    </td>
                    <td className="py-3 px-3 text-[#38BDF8]">
                      {rec.targetCoolantFlowLpm} L/min
                    </td>
                    <td className="py-3 px-3 text-[#C0C0C0]">
                      {rec.targetRadiatorSpeedPercent}%
                    </td>
                    <td className="py-3 px-3 text-[#FF7900]">
                      {rec.powertrainDeratePercent > 0 ? `-${rec.powertrainDeratePercent}%` : 'None'}
                    </td>
                    <td className="py-3 px-3 text-[#A1A1AA] max-w-sm truncate" title={rec.recommendationDetails}>
                      {rec.recommendationDetails}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
