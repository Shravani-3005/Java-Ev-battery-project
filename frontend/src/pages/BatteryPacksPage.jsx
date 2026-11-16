import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  Thermometer,
  ShieldAlert
} from 'lucide-react';
import { batteriesApi, sensorsApi } from '../api/client';
import { useSearchParams } from 'react-router-dom';

export default function BatteryPacksPage() {
  const [packs, setPacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chemistryFilter, setChemistryFilter] = useState('');
  const [selectedPack, setSelectedPack] = useState(null);
  const [selectedPackReadings, setSelectedPackReadings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    packCode: '',
    packName: '',
    vehicleModel: '',
    chemistry: 'NMC 811 (Nickel Manganese Cobalt)',
    capacityKWh: 60.0,
    nominalVoltage: 400.0,
    cellCount: 96,
    coolingType: 'Micro-channel Liquid Cold Plate',
    maxSafeTemp: 45.0,
    criticalTemp: 55.0,
  });

  const fetchPacks = async () => {
    try {
      const data = await batteriesApi.getAll(searchTerm);
      setPacks(data);

      const targetId = searchParams.get('selected');
      if (targetId) {
        const found = data.find(p => p.id === Number(targetId));
        if (found) handleViewDetails(found);
      }
    } catch (err) {
      console.error('Error fetching battery packs:', err);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [searchTerm]);

  const handleViewDetails = async (pack) => {
    setSelectedPack(pack);
    try {
      const hist = await sensorsApi.getHistory(pack.id, 0, 10);
      setSelectedPackReadings(hist?.content || hist || []);
    } catch (e) {
      setSelectedPackReadings([]);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    const code = `BP-${Math.floor(100 + Math.random() * 900)}`;
    setFormData({
      packCode: code,
      packName: '',
      vehicleModel: 'Standard EV',
      chemistry: 'Lithium-Ion (NMC)',
      capacityKWh: 50.0,
      nominalVoltage: 400.0,
      cellCount: 96,
      coolingType: 'Micro-channel Cold Plate',
      maxSafeTemp: 45.0,
      criticalTemp: 55.0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pack) => {
    setIsEditing(true);
    setFormData({
      id: pack.id,
      packCode: pack.packCode || `BP-${pack.id}`,
      packName: pack.packName,
      vehicleModel: pack.vehicleModel || 'Standard EV',
      chemistry: pack.chemistry || 'Lithium-Ion (NMC)',
      capacityKWh: pack.capacityKWh || 50.0,
      nominalVoltage: pack.nominalVoltage || 400.0,
      cellCount: pack.cellCount || 96,
      coolingType: pack.coolingType || 'Micro-channel Cold Plate',
      maxSafeTemp: pack.maxSafeTemp || 45.0,
      criticalTemp: pack.criticalTemp || 55.0,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        packCode: formData.packCode || `BP-${Math.floor(100 + Math.random() * 900)}`,
        vehicleModel: formData.vehicleModel || 'Standard EV',
        cellCount: formData.cellCount || 96,
        coolingType: formData.coolingType || 'Micro-channel Cold Plate',
        maxSafeTemp: formData.maxSafeTemp || 45.0,
        criticalTemp: formData.criticalTemp || 55.0,
      };

      if (isEditing) {
        await batteriesApi.update(formData.id, payload);
      } else {
        await batteriesApi.create(payload);
      }
      setIsModalOpen(false);
      fetchPacks();
    } catch (err) {
      alert('Error saving battery pack: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to decommission this battery pack? All telemetry history will be removed.')) return;
    try {
      await batteriesApi.delete(id);
      if (selectedPack?.id === id) setSelectedPack(null);
      fetchPacks();
    } catch (err) {
      alert('Error deleting battery pack');
    }
  };

  const filteredPacks = packs.filter((p) => {
    if (chemistryFilter && !p.chemistry.toLowerCase().includes(chemistryFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#141416] border border-[#34343A]">
        <div>
          <h2 className="text-base font-bold text-[#F5F5F5] uppercase tracking-wider flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-[#FF7900]" />
            Battery Pack Asset Fleet
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Manage multi-chemistry battery packs, micro-channel cold plate designs and thermal thresholds.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded bg-[#FF7900] hover:bg-[#FF922B] text-black font-mono font-bold text-xs uppercase flex items-center gap-2 shadow-[0_0_12px_rgba(255,121,0,0.3)] transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Battery Pack</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#A1A1AA] absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by pack code, name, vehicle model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1B1B1F] border border-[#34343A] rounded pl-9 pr-3 py-2 text-xs text-[#F5F5F5] placeholder-[#A1A1AA] focus:border-[#FF7900] focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#A1A1AA]" />
          <select
            value={chemistryFilter}
            onChange={(e) => setChemistryFilter(e.target.value)}
            className="bg-[#1B1B1F] border border-[#34343A] rounded px-3 py-2 text-xs text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none font-mono"
          >
            <option value="">All Chemistries</option>
            <option value="LFP">LFP (Lithium Iron Phosphate)</option>
            <option value="NMC">NMC (Nickel Manganese Cobalt)</option>
            <option value="Solid-State">Solid-State</option>
          </select>
        </div>
      </div>

      {/* Grid of Battery Pack Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPacks.map((pack) => (
          <div
            key={pack.id}
            className="p-5 rounded-lg bg-[#1B1B1F] border border-[#34343A] hover:border-[#FF7900]/70 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs font-mono font-bold text-[#FF7900] uppercase tracking-wider">
                    {pack.packCode}
                  </span>
                  <h3 className="text-sm font-bold text-[#F5F5F5] mt-0.5">{pack.packName}</h3>
                  <div className="text-xs text-[#A1A1AA] font-mono">{pack.vehicleModel}</div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  pack.status === 'NORMAL' ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30' :
                  pack.status === 'MODERATE_WARMING' ? 'bg-[#FF7900]/15 text-[#FF7900] border border-[#FF7900]/30' :
                  'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30 animate-pulse'
                }`}>
                  {pack.status?.replace('_', ' ')}
                </span>
              </div>

              {/* Simplified Specs */}
              <div className="grid grid-cols-2 gap-2 my-4 text-xs font-mono bg-[#141416] p-3 rounded border border-[#34343A]/60">
                <div>
                  <span className="text-[#A1A1AA] text-[10px] block">BATTERY TYPE</span>
                  <span className="text-[#F5F5F5] font-semibold truncate block">{pack.chemistry}</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-[10px] block">CAPACITY</span>
                  <span className="text-[#FF7900] font-bold">{pack.capacityKWh} kWh</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-[10px] block">VOLTAGE</span>
                  <span className="text-[#F5F5F5]">{pack.nominalVoltage} V</span>
                </div>
                <div>
                  <span className="text-[#A1A1AA] text-[10px] block">STATUS</span>
                  <span className="text-[#22C55E]">Optimal</span>
                </div>
              </div>

              <div className="text-[11px] text-[#A1A1AA] font-mono mb-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                <span className="truncate">{pack.coolingType}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#34343A]/60 text-xs font-mono">
              <button
                onClick={() => handleViewDetails(pack)}
                className="px-3 py-1.5 rounded bg-[#222226] text-[#F5F5F5] hover:text-[#FF7900] hover:border-[#FF7900] border border-[#34343A] flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Diagnostics</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(pack)}
                  className="p-1.5 rounded bg-[#141416] text-[#C0C0C0] hover:text-[#F5F5F5] hover:border-[#34343A] border border-transparent transition-colors"
                  title="Edit Pack Configuration"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(pack.id)}
                  className="p-1.5 rounded bg-[#141416] text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                  title="Delete Pack"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pack Details Modal / Drawer */}
      {selectedPack && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1B1B1F] border border-[#34343A] rounded-lg max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedPack(null)}
              className="absolute top-4 right-4 p-1.5 rounded bg-[#222226] text-[#A1A1AA] hover:text-[#F5F5F5]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-[#FF7900]">{selectedPack.packCode}</span>
              <span className="text-xs text-[#A1A1AA]">&bull;</span>
              <span className="text-xs text-[#A1A1AA] font-mono">{selectedPack.vehicleModel}</span>
            </div>
            <h2 className="text-lg font-bold text-[#F5F5F5]">{selectedPack.packName}</h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5 font-mono text-xs">
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <div className="text-[10px] text-[#A1A1AA]">CHEMISTRY</div>
                <div className="font-semibold text-[#F5F5F5] mt-1">{selectedPack.chemistry}</div>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <div className="text-[10px] text-[#A1A1AA]">ENERGY / VOLT</div>
                <div className="font-semibold text-[#F5F5F5] mt-1">{selectedPack.capacityKWh} kWh / {selectedPack.nominalVoltage}V</div>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <div className="text-[10px] text-[#A1A1AA]">SAFE THRESHOLD</div>
                <div className="font-semibold text-[#22C55E] mt-1">{selectedPack.maxSafeTemp}°C</div>
              </div>
              <div className="p-3 rounded bg-[#141416] border border-[#34343A]">
                <div className="text-[10px] text-[#A1A1AA]">CRITICAL LIMIT</div>
                <div className="font-semibold text-[#EF4444] mt-1">{selectedPack.criticalTemp}°C</div>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider font-mono mb-2">
                Recent Ingested Telemetry Points
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[#34343A] text-[10px] text-[#A1A1AA]">
                      <th className="py-2">Time</th>
                      <th className="py-2">Battery Temp</th>
                      <th className="py-2">Max Cell (ΔT)</th>
                      <th className="py-2">Current</th>
                      <th className="py-2">Coolant Flow</th>
                      <th className="py-2">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#34343A]/40">
                    {selectedPackReadings.map((r) => (
                      <tr key={r.id} className="hover:bg-[#141416]">
                        <td className="py-2 text-[#A1A1AA]">{new Date(r.timestamp).toLocaleTimeString()}</td>
                        <td className="py-2 font-bold text-[#F5F5F5]">{r.batteryTemp}°C</td>
                        <td className="py-2 text-[#EF4444]">{r.maxCellTemp}°C (Δ{r.tempGradient}°C)</td>
                        <td className="py-2 text-[#C0C0C0]">{r.current}A</td>
                        <td className="py-2 text-[#38BDF8]">{r.coolantFlowRate} L/min</td>
                        <td className="py-2">
                          <span className="text-[10px] font-bold text-[#FF7900]">{r.thermalRiskLevel}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#34343A]">
              <button
                onClick={() => setSelectedPack(null)}
                className="px-4 py-1.5 rounded bg-[#222226] text-[#F5F5F5] hover:bg-[#34343A] text-xs font-mono"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Pack Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1B1B1F] border border-[#34343A] rounded-lg max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded bg-[#222226] text-[#A1A1AA] hover:text-[#F5F5F5]"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-sm font-bold text-[#F5F5F5] uppercase tracking-wider font-mono mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF7900]" />
              {isEditing ? 'Edit Battery Pack Profile' : 'Register New Battery Pack'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
              <div className="space-y-3">
                <div>
                  <label className="text-[#A1A1AA] block mb-1">BATTERY NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City EV Battery 1"
                    value={formData.packName}
                    onChange={(e) => setFormData({ ...formData, packName: e.target.value })}
                    className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#A1A1AA] block mb-1">BATTERY TYPE</label>
                  <select
                    value={formData.chemistry}
                    onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                    className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                  >
                    <option value="Lithium-Ion (NMC)">Lithium-Ion (NMC)</option>
                    <option value="Lithium Iron Phosphate (LFP)">Lithium Iron Phosphate (LFP)</option>
                    <option value="Solid-State Battery">Solid-State Battery</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">CAPACITY (kWh)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 50"
                      value={formData.capacityKWh}
                      onChange={(e) => setFormData({ ...formData, capacityKWh: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[#A1A1AA] block mb-1">VOLTAGE (V)</label>
                    <input
                      type="number"
                      step="1"
                      required
                      placeholder="e.g. 400"
                      value={formData.nominalVoltage}
                      onChange={(e) => setFormData({ ...formData, nominalVoltage: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#141416] border border-[#34343A] rounded px-3 py-2 text-[#F5F5F5] focus:border-[#FF7900] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#34343A]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded bg-[#222226] hover:bg-[#34343A] text-[#A1A1AA] font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#FF7900] hover:bg-[#FF922B] text-black font-mono font-bold text-xs uppercase"
                >
                  {isEditing ? 'Update Configuration' : 'Save Battery Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
