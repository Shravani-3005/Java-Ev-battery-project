import React, { useState, useEffect } from 'react';
import { alertsApi } from '../api/client';
import { Check } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchAlerts = async () => {
    try {
      const data = await alertsApi.getAll({
        severity: severityFilter || undefined,
        status: statusFilter || undefined,
      });
      setAlerts(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter]);

  const handleAcknowledge = async (id) => {
    try {
      await alertsApi.acknowledge(id, { operatorName: 'Operator' });
      fetchAlerts();
    } catch (err) {
      alert('Error acknowledging alert');
    }
  };

  const handleResolve = async (id) => {
    try {
      await alertsApi.resolve(id, { operatorName: 'Operator', resolutionNotes: 'Thermal stabilized' });
      fetchAlerts();
    } catch (err) {
      alert('Error resolving alert');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-[#6B7280] dark:text-[#94A3B8] font-medium">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-2.5 py-1 focus:outline-none focus:border-[#2563A6]"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="DANGER">Danger</option>
              <option value="WARNING">Warning</option>
              <option value="INFO">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[#6B7280] dark:text-[#94A3B8] font-medium">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-2.5 py-1 focus:outline-none focus:border-[#2563A6]"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <span className="text-[#6B7280] dark:text-[#94A3B8]">{alerts.length} total alerts</span>
      </div>

      {/* Clean Alert Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-minimal">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Severity</th>
                <th>Alert Condition</th>
                <th>Affected Pack</th>
                <th>Observed Reading</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => {
                const isCrit = alert.severity === 'CRITICAL' || alert.severity === 'DANGER';
                return (
                  <tr key={alert.id}>
                    <td className="text-[#6B7280] dark:text-[#94A3B8] text-xs">
                      {new Date(alert.timestamp || alert.createdAt || Date.now()).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        isCrit
                          ? 'bg-[#FBEBEB] text-[#C34848] dark:bg-[#1F2937] dark:text-[#F87171] dark:border dark:border-[#374151]'
                          : 'bg-[#FEF5E7] text-[#D69A32] dark:bg-[#1F2937] dark:text-[#FBBF24] dark:border dark:border-[#374151]'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="font-semibold text-[#202938] dark:text-[#CBD5E1]">
                      {alert.alertType?.replace(/_/g, ' ') || 'High Thermal Stress'}
                    </td>
                    <td className="text-[#6B7280] dark:text-[#94A3B8]">
                      {alert.batteryPack?.packCode || `BP-${alert.batteryId || 1}`}
                    </td>
                    <td>{alert.observedReading || '48.5°C'}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        alert.status === 'RESOLVED'
                          ? 'bg-[#EBF7EE] text-[#27834A] dark:bg-[#1F2937] dark:text-[#4ADE80] dark:border dark:border-[#374151]'
                          : alert.status === 'ACKNOWLEDGED'
                          ? 'bg-[#F3F4F6] text-[#6B7280] dark:bg-[#1F2937] dark:text-[#94A3B8] dark:border dark:border-[#374151]'
                          : 'bg-[#FEF5E7] text-[#D69A32] dark:bg-[#1F2937] dark:text-[#FBBF24] dark:border dark:border-[#374151]'
                      }`}>
                        {alert.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="text-right space-x-1.5">
                      {alert.status !== 'RESOLVED' && (
                        <button
                          onClick={() => handleResolve(alert.id)}
                          className="px-2 py-1 bg-[#2563A6] hover:bg-[#1D4F85] text-white text-xs rounded font-medium"
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-sm text-[#6B7280]">
                    No thermal alerts match the current filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
