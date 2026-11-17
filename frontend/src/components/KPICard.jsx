import React from 'react';

export default function KPICard({ label, value, unit, status = 'default' }) {
  const statusColors = {
    default: 'text-[#202938]',
    normal: 'text-[#27834A]',
    warning: 'text-[#D69A32]',
    critical: 'text-[#C34848]',
  };

  return (
    <div className="bg-white border border-[#E5E7EB] rounded p-4 flex flex-col justify-between">
      <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-semibold tracking-tight ${statusColors[status] || statusColors.default}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-normal text-[#6B7280]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
