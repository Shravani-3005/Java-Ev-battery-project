import React, { useState, useEffect } from 'react';
import {
  History,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Layers,
  RefreshCw
} from 'lucide-react';
import { batteriesApi, sensorsApi } from '../api/client';

export default function HistoricalRecordsPage() {
  const [packs, setPacks] = useState([]);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [historyPage, setHistoryPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
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

  const fetchRecords = async () => {
    if (!selectedPackId) return;
    setIsLoading(true);
    try {
      const pageData = await sensorsApi.getHistory(selectedPackId, currentPage, pageSize);
      setHistoryPage(pageData);
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
    fetchRecords();
  }, [selectedPackId, currentPage, pageSize]);

  const handleExportCSV = () => {
    if (!historyPage?.content || historyPage.content.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Timestamp',
      'BatteryPack',
      'BatteryTemp_C',
      'MinCellTemp_C',
      'MaxCellTemp_C',
      'GradientDeltaT_C',
      'Voltage_V',
      'Current_A',
      'CoolantInlet_C',
      'CoolantOutlet_C',
      'CoolantFlow_Lpm',
      'SOC_Percent',
      'SOH_Percent',
      'JouleanHeat_W',
      'RiskScore',
      'RiskLevel',
      'Scenario',
    ];

    const rows = historyPage.content.map(r => [
      `"${r.timestamp}"`,
      `"${r.batteryPack?.packCode || ''}"`,
      r.batteryTemp,
      r.minCellTemp,
      r.maxCellTemp,
      r.tempGradient,
      r.voltage,
      r.current,
      r.coolantInletTemp,
      r.coolantOutletTemp,
      r.coolantFlowRate,
      r.stateOfCharge,
      r.stateOfHealth,
      r.calculatedHeatGenW,
      r.thermalRiskScore,
      `"${r.thermalRiskLevel}"`,
      `"${r.testScenario || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `thermocore_telemetry_${selectedPackId}_page${currentPage + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activePack = packs.find(p => p.id === Number(selectedPackId));

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-[#FF7900]" />
            Historical Sensor Telemetry Database
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Query time-series observations, export CSV logs, and inspect previous thermal risk cycles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPackId}
            onChange={(e) => {
              setSelectedPackId(e.target.value);
              setCurrentPage(0);
            }}
            className="bg-[#1B1B1F] border border-[#FF7900] text-[#F5F5F5] rounded px-3 py-1.5 focus:outline-none"
          >
            {packs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.packCode} ({p.vehicleModel})
              </option>
            ))}
          </select>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded bg-[#1B1B1F] border border-[#34343A] text-[#F5F5F5] hover:border-[#FF7900] hover:text-[#FF7900] flex items-center gap-1.5 transition-colors font-bold"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Historical Records Table */}
      <div className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#34343A] text-[10px] text-[#A1A1AA] uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Avg Temp</th>
                <th className="py-2.5 px-3">Min / Max (ΔT)</th>
                <th className="py-2.5 px-3">Voltage / Current</th>
                <th className="py-2.5 px-3">Coolant Flow</th>
                <th className="py-2.5 px-3">Coolant In/Out</th>
                <th className="py-2.5 px-3">SOC / SOH</th>
                <th className="py-2.5 px-3">Heat (W)</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Scenario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34343A]/40 text-xs">
              {historyPage?.content && historyPage.content.length > 0 ? (
                historyPage.content.map((r) => (
                  <tr key={r.id} className="hover:bg-[#141416]">
                    <td className="py-2.5 px-3 text-[#A1A1AA]">
                      {new Date(r.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#F5F5F5]">
                      {r.batteryTemp?.toFixed(1)}°C
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[#C0C0C0]">{r.minCellTemp?.toFixed(1)}°</span> /{' '}
                      <span className="text-[#EF4444] font-semibold">{r.maxCellTemp?.toFixed(1)}°</span>
                      <span className="text-[10px] text-[#A1A1AA] ml-1">(Δ{r.tempGradient?.toFixed(1)}°)</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#C0C0C0]">
                      {r.voltage?.toFixed(0)}V / {r.current?.toFixed(1)}A
                    </td>
                    <td className="py-2.5 px-3 text-[#38BDF8]">
                      {r.coolantFlowRate?.toFixed(1)} L/min
                    </td>
                    <td className="py-2.5 px-3 text-[#A1A1AA]">
                      {r.coolantInletTemp?.toFixed(1)}° / {r.coolantOutletTemp?.toFixed(1)}°
                    </td>
                    <td className="py-2.5 px-3 text-[#C0C0C0]">
                      {r.stateOfCharge?.toFixed(1)}% / {r.stateOfHealth?.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-[#FF7900]">
                      {r.calculatedHeatGenW?.toFixed(0)} W
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                        r.thermalRiskLevel === 'CRITICAL' ? 'bg-[#EF4444]/20 text-[#EF4444]' :
                        r.thermalRiskLevel === 'HIGH' ? 'bg-[#EF4444]/15 text-[#EF4444]' :
                        r.thermalRiskLevel === 'MODERATE' ? 'bg-[#FF7900]/15 text-[#FF7900]' :
                        'bg-[#22C55E]/15 text-[#22C55E]'
                      }`}>
                        {r.thermalRiskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#A1A1AA] text-[11px] truncate max-w-[120px]">
                      {r.testScenario}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="py-6 text-center text-[#A1A1AA]">
                    No historical telemetry records stored for this pack yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {historyPage && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#34343A] text-xs">
            <span className="text-[#A1A1AA]">
              Showing page {currentPage + 1} of {historyPage.totalPages || 1} ({historyPage.totalElements} records)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-2.5 py-1 rounded bg-[#222226] text-[#C0C0C0] hover:text-[#F5F5F5] disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={currentPage >= (historyPage.totalPages - 1)}
                className="px-2.5 py-1 rounded bg-[#222226] text-[#C0C0C0] hover:text-[#F5F5F5] disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
