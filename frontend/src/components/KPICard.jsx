import React from 'react';

export default function KPICard({ label, value, unit, status = 'default' }) {
  const statusColors = {
    default: 'text-[#202938] dark:text-[#CBD5E1]',
    normal: 'text-[#27834A] dark:text-[#4ADE80]',
    warning: 'text-[#D69A32] dark:text-[#FBBF24]',
    critical: 'text-[#C34848] dark:text-[#F87171]',
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] border border-[#E5E7EB] dark:border-[#334155] rounded p-4 flex flex-col justify-between transition-colors">
      <span className="text-xs font-medium text-[#6B7280] dark:text-[#94A3B8] uppercase tracking-wide">
        {label}
      </span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`text-2xl font-semibold tracking-tight ${statusColors[status] || statusColors.default}`}>
          {value}
        </span>
        {unit && (
          <span className="text-xs font-normal text-[#6B7280] dark:text-[#94A3B8]">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
