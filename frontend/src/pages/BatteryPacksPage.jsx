import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, X } from 'lucide-react';
import { batteriesApi, sensorsApi } from '../api/client';
import { useSearchParams } from 'react-router-dom';

export default function BatteryPacksPage() {
  const [packs, setPacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    id: null,
    packCode: '',
    packName: '',
    vehicleModel: 'Standard EV',
    chemistry: 'Lithium-Ion (NMC)',
    capacityKWh: 60.0,
    nominalVoltage: 400.0,
    cellCount: 96,
    coolingType: 'Micro-channel Cold Plate',
    maxSafeTemp: 45.0,
    criticalTemp: 55.0,
  });

  const fetchPacks = async () => {
    try {
      const data = await batteriesApi.getAll(searchTerm);
      setPacks(data || []);
    } catch (err) {
      console.error('Error fetching battery packs:', err);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [searchTerm]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      packCode: `BP-0${packs.length + 1}`,
      packName: '',
      vehicleModel: 'Standard EV',
      chemistry: 'Lithium-Ion (NMC)',
      capacityKWh: 60.0,
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
      packCode: pack.packCode,
      packName: pack.packName,
      vehicleModel: pack.vehicleModel || 'Standard EV',
      chemistry: pack.chemistry || 'Lithium-Ion (NMC)',
      capacityKWh: pack.capacityKWh || 60.0,
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
      if (isEditing) {
        await batteriesApi.update(formData.id, formData);
      } else {
        await batteriesApi.create(formData);
      }
      setIsModalOpen(false);
      fetchPacks();
    } catch (err) {
      alert('Error saving battery pack: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this battery pack configuration?')) return;
    try {
      await batteriesApi.delete(id);
      fetchPacks();
    } catch (err) {
      alert('Error deleting battery pack');
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#9CA3AF]" />
          <input
            type="text"
            placeholder="Search packs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded pl-9 pr-3 py-1.5 text-xs text-[#202938] dark:text-[#CBD5E1] focus:outline-none focus:border-[#2563A6]"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563A6] hover:bg-[#1D4F85] text-white text-xs font-medium rounded transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Battery Pack</span>
        </button>
      </div>

      {/* Clean Table View */}
      <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-minimal">
            <thead>
              <tr>
                <th>Pack Code</th>
                <th>Name</th>
                <th>Chemistry</th>
                <th>Capacity</th>
                <th>Voltage</th>
                <th>Cooling Architecture</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.id}>
                  <td className="font-semibold text-[#202938] dark:text-[#CBD5E1]">{pack.packCode}</td>
                  <td className="text-[#202938] dark:text-[#CBD5E1]">{pack.packName}</td>
                  <td className="text-[#6B7280] dark:text-[#94A3B8]">{pack.chemistry}</td>
                  <td>{pack.capacityKWh} kWh</td>
                  <td>{pack.nominalVoltage} V</td>
                  <td className="text-[#6B7280] dark:text-[#94A3B8]">{pack.coolingType || 'Micro-channel Cold Plate'}</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-[#EBF7EE] text-[#27834A] dark:bg-[#1F2937] dark:text-[#4ADE80] dark:border dark:border-[#374151]">
                      Operational
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(pack)}
                      className="p-1 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#2563A6] dark:hover:text-[#60A5FA] rounded hover:bg-[#F3F4F6] dark:hover:bg-[#334155]"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5 inline" />
                    </button>
                    <button
                      onClick={() => handleDelete(pack.id)}
                      className="p-1 text-[#6B7280] dark:text-[#94A3B8] hover:text-[#C34848] rounded hover:bg-[#F3F4F6] dark:hover:bg-[#334155]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
              {packs.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-xs text-[#6B7280]">
                    <p className="font-semibold text-sm text-[#202938] mb-1">No battery packs configured yet.</p>
                    <p className="mb-4">Register your battery pack manually to begin monitoring thermal and electrical telemetry.</p>
                    <button
                      onClick={handleOpenAdd}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#2563A6] hover:bg-[#1D4F85] text-white text-xs font-medium rounded transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Battery Pack</span>
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded-lg max-w-md w-full p-5 shadow-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] dark:border-[#334155]">
              <h3 className="text-base font-semibold text-[#202938] dark:text-[#CBD5E1]">
                {isEditing ? 'Edit Battery Pack' : 'Add Battery Pack'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#9CA3AF] hover:text-[#202938] dark:hover:text-[#CBD5E1]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block mb-1 font-medium text-[#202938] dark:text-[#CBD5E1]">Pack Code</label>
                <input
                  type="text"
                  required
                  value={formData.packCode}
                  onChange={(e) => setFormData({ ...formData, packCode: e.target.value })}
                  className="w-full bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#202938] dark:text-[#CBD5E1]">Pack Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lithium-Ion Pack 1"
                  value={formData.packName}
                  onChange={(e) => setFormData({ ...formData, packName: e.target.value })}
                  className="w-full bg-white dark:bg-[#0F172A] border border-[#E5E7EB] dark:border-[#334155] text-[#202938] dark:text-[#CBD5E1] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                />
              </div>
                  className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium text-[#202938]">Battery Chemistry</label>
                <select
                  value={formData.chemistry}
                  onChange={(e) => setFormData({ ...formData, chemistry: e.target.value })}
                  className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                >
                  <option value="Lithium-Ion (NMC)">Lithium-Ion (NMC)</option>
                  <option value="Lithium Iron Phosphate (LFP)">Lithium Iron Phosphate (LFP)</option>
                  <option value="Solid-State Li-Metal">Solid-State Li-Metal</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 font-medium text-[#202938]">Capacity (kWh)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.capacityKWh}
                    onChange={(e) => setFormData({ ...formData, capacityKWh: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium text-[#202938]">Voltage (V)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={formData.nominalVoltage}
                    onChange={(e) => setFormData({ ...formData, nominalVoltage: parseFloat(e.target.value) || 0 })}
                    className="w-full border border-[#E5E7EB] rounded px-3 py-1.5 focus:outline-none focus:border-[#2563A6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 border border-[#E5E7EB] text-[#202938] rounded text-xs hover:bg-[#F3F4F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#2563A6] hover:bg-[#1D4F85] text-white rounded text-xs font-medium"
                >
                  {isEditing ? 'Save Changes' : 'Create Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
