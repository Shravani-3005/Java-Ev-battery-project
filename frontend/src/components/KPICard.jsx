import React from 'react';

export default function KPICard({ title, value, unit, icon: Icon, subtitle, status = 'default', badgeText }) {
  const statusStyles = {
    default: 'border-[#34343A] text-[#F5F5F5]',
    normal: 'border-[#34343A] text-[#22C55E]',
    warning: 'border-[#FF7900]/50 text-[#FF7900] bg-[#FF7900]/5',
    danger: 'border-[#EF4444]/60 text-[#EF4444] bg-[#EF4444]/5 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    critical: 'border-[#EF4444] text-[#EF4444] bg-[#EF4444]/10 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse',
  };

  return (
    <div className={`p-4 rounded-lg bg-[#1B1B1F] border ${statusStyles[status] || statusStyles.default} transition-all duration-200 hover:border-[#FF7900]/60 relative overflow-hidden group`}>
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF7900]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium text-[#A1A1AA] uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className="w-7 h-7 rounded bg-[#222226] border border-[#34343A] flex items-center justify-center text-[#C0C0C0] group-hover:text-[#FF7900] transition-colors">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-2xl font-black font-mono tracking-tight text-[#F5F5F5]">{value}</span>
        {unit && <span className="text-xs font-mono text-[#A1A1AA]">{unit}</span>}
      </div>

      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#34343A]/60">
        <span className="text-[#A1A1AA] truncate">{subtitle}</span>
        {badgeText && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-[#222226] text-[#C0C0C0] border border-[#34343A]">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
