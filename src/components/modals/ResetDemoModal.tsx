import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ResetDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResetDemoModal: React.FC<ResetDemoModalProps> = ({ isOpen, onClose }) => {
  const { resetDemoData } = useApp();

  if (!isOpen) return null;

  const handleConfirm = () => {
    resetDemoData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded border border-[#D8DEE7] shadow-lg max-w-md w-full p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-50 text-[#B42318] flex items-center justify-center shrink-0">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#14243A]">Reset Synthetic Demo State</h3>
              <p className="text-xs text-[#526174]">Restore original fixtures and deficiencies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#526174] hover:text-[#14243A] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-[#526174] bg-[#F4F5F7] p-3 rounded border border-[#D8DEE7] space-y-1.5 leading-relaxed">
          <p className="font-medium text-[#14243A] flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#925500]" />
            What will happen:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-[#526174]">
            <li>All saved correction drafts, previews, and replacement documents will be cleared.</li>
            <li>Northfield Institute will reset to its initial 4 findings (name mismatch, address inconsistency, expired fire NOC, missing NBC Form-B).</li>
            <li>Reviewer queue decisions and closure records will revert to initial state.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded text-xs font-medium text-[#14243A] hover:bg-[#F4F5F7] border border-[#D8DEE7] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-3 py-1.5 rounded text-xs font-medium text-white bg-[#B42318] hover:bg-red-800 transition-colors"
          >
            Confirm &amp; Reset Data
          </button>
        </div>
      </div>
    </div>
  );
};
