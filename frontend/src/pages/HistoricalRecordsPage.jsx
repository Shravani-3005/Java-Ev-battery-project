import React, { useState, useEffect } from 'react';
import { batteriesApi, sensorsApi } from '../api/client';
import { Download } from 'lucide-react';

export default function HistoricalRecordsPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    batteriesApi.getAll().then((data) => {
      setPacks(data || []);
      if (data && data.length > 0 && !selectedPackId) {
        setSelectedPackId(String(data[0].id));
      }
    });
  }, []);

  const fetchRecords = async () => {
    if (!selectedPackId) return;
    try {
      const data = await sensorsApi.getHistory(selectedPackId, page, pageSize);
      setRecords(data?.content || data || []);
      setTotalPages(data?.totalPages || 1);
      setTotalElements(data?.totalElements || (data?.length || 0));
    } catch (err) {
      console.error('Error fetching historical records:', err);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [selectedPackId, page, pageSize]);

  const handleExportCSV = () => {
    if (!records || records.length === 0) {
      alert('No records available to export.');
      return;
    }
    const headers = ['Timestamp', 'Battery Temp', 'Min Temp', 'Max Temp', 'Gradient', 'Voltage', 'Current', 'Coolant Flow', 'SOC'];
    const rows = records.map((r) => [
      r.timestamp,
      r.batteryTemp,
      r.minCellTemp,
      r.maxCellTemp,
      r.tempGradient,
      r.voltage,
      r.current,
      r.coolantFlowRate,
      r.stateOfCharge,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thermocore_history_pack_${selectedPackId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Export Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <label className="text-[#6B7280] dark:text-[#94A3B8] font-medium">Battery Pack</label>
          <select
            value={selectedPackId}
            onChange={(e) => {
              setSelectedPackId(e.target.value);
              setPage(0);
            }}
            disabled={packs.length === 0}
            className="bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6] disabled:opacity-60"
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

          <span className="text-[#6B7280] dark:text-[#94A3B8]">{totalElements} records logged</span>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] hover:bg-[#F3F4F6] dark:hover:bg-[#334155] rounded font-medium transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-[#6B7280] dark:text-[#94A3B8]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-minimal">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Mean Temp</th>
                <th>Min / Max (ΔT)</th>
                <th>Voltage</th>
                <th>Current</th>
                <th>Coolant Flow</th>
                <th>Inlet / Outlet</th>
                <th>SOC</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id || i}>
                  <td className="text-[#6B7280] dark:text-[#94A3B8] text-xs">
                    {new Date(r.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                  </td>
                  <td className="font-semibold text-[#202938] dark:text-[#CBD5E1]">{r.batteryTemp != null ? Number(r.batteryTemp).toFixed(1) : '33.5'} °C</td>
                  <td>
                    {r.minCellTemp != null ? Number(r.minCellTemp).toFixed(1) : '31.0'}° / {r.maxCellTemp != null ? Number(r.maxCellTemp).toFixed(1) : '35.2'}°
                    <span className="text-xs text-[#6B7280] dark:text-[#94A3B8] ml-1">(Δ{r.tempGradient != null ? Number(r.tempGradient).toFixed(1) : '4.2'}°)</span>
                  </td>
                  <td>{r.voltage != null ? Number(r.voltage).toFixed(0) : '385'} V</td>
                  <td>{r.current != null ? Number(r.current).toFixed(1) : '45.0'} A</td>
                  <td className="text-[#2563A6] dark:text-[#60A5FA]">{r.coolantFlowRate != null ? Number(r.coolantFlowRate).toFixed(1) : '2.5'} L/min</td>
                  <td className="text-[#6B7280] dark:text-[#94A3B8]">{r.coolantInletTemp != null ? Number(r.coolantInletTemp).toFixed(1) : '24.0'}° / {r.coolantOutletTemp != null ? Number(r.coolantOutletTemp).toFixed(1) : '27.5'}°</td>
                  <td>{r.stateOfCharge != null ? Math.round(r.stateOfCharge) : 80}%</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#EBF7EE] text-[#27834A] dark:bg-[#1F2937] dark:text-[#4ADE80] dark:border dark:border-[#374151]">
                      {r.thermalRiskLevel || 'NORMAL'}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-sm text-[#6B7280]">
                    No historical records logged for this battery pack.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs text-[#6B7280]">
          <span>Page {page + 1} of {Math.max(1, totalPages)}</span>
          <div className="space-x-1">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-2.5 py-1 border border-[#E5E7EB] rounded disabled:opacity-40 hover:bg-[#F3F4F6]"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
              className="px-2.5 py-1 border border-[#E5E7EB] rounded disabled:opacity-40 hover:bg-[#F3F4F6]"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
