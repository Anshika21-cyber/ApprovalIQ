import React from 'react';
import { AlertCircle } from 'lucide-react';

export const HonestyBanner: React.FC = () => {
  return (
    <div className="bg-[#14243A] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between border-b border-[#D8DEE7]/20">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-[#00756A] shrink-0" />
        <span className="font-semibold text-white/90">Prototype — Synthetic Data</span>
        <span className="text-white/40 hidden sm:inline">|</span>
        <span className="text-white/80 hidden sm:inline">
          Illustrative institutional approval and scrutiny rules for SIH26262 demonstration.
        </span>
      </div>
      <div className="text-white/60 text-[11px] mt-0.5 sm:mt-0">
        Deterministic sample evaluation · Not an official AICTE portal endorsement
      </div>
    </div>
  );
};
