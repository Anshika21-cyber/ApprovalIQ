import React from 'react';
import { ChevronLeft, ChevronRight, X, Play, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const GuidedTourBar: React.FC = () => {
  const { isTourActive, tourStep, nextTourStep, prevTourStep, endTour, startTour } = useApp();

  if (!isTourActive) return null;

  const tourStepsData = [
    {
      step: 0,
      title: 'Step 1 of 6: Institutional Application Selected',
      description: 'You are viewing "Northfield Institute of Technology" (APP-2026-NIT-0492), currently in the Scrutiny/Corrections stage with 4 statutory compliance requirements.',
      suggestedAction: 'Click "Next" to run the Pre-Submission Readiness Check.',
    },
    {
      step: 1,
      title: 'Step 2 of 6: Run Pre-Submission Readiness Check',
      description: 'The engine evaluates registered documents against sample AICTE Handbook clauses, discovering a legal title mismatch, address omission, and expired Fire NOC.',
      suggestedAction: 'Click "Next" to inspect an Explainable Deficiency Card.',
    },
    {
      step: 2,
      title: 'Step 3 of 6: Inspect Explainable Deficiency & Dependencies',
      description: 'Open finding FND-NIT-001 (Name Mismatch). See the exact 8-part resolution card, legal clause, and downstream impacts (State Affiliation, EVC dossier).',
      suggestedAction: 'Click "Next" to launch the Correction Preview simulation.',
    },
    {
      step: 3,
      title: 'Step 4 of 6: Preview Proposed Correction',
      description: 'Simulate applying "Replacement Option A". The engine executes conditional reassessment without altering official review state, showing what is fixed and what remains.',
      suggestedAction: 'Click "Next" to simulate coordinator submission and switch to Reviewer role.',
    },
    {
      step: 4,
      title: 'Step 5 of 6: Change-Aware Reviewer Comparison',
      description: 'As Reviewing Officer, compare version 1 and 2 side-by-side with highlighted field diffs, re-assessed checks, and formal Acceptance / Return controls.',
      suggestedAction: 'Click "Next" to inspect the authorised closure workflow and audit trail.',
    },
    {
      step: 5,
      title: 'Step 6 of 6: Authorised Finding Closure & Immutable Audit Log',
      description: 'Findings can only be closed once required evidence is formally Accepted and checks reassess to "Appears satisfied" with a recorded reviewer justification.',
      suggestedAction: 'Tour complete! You may now freely navigate or restart anytime.',
    },
  ];

  const current = tourStepsData[tourStep] || tourStepsData[0];

  return (
    <div className="bg-[#14243A] text-white border-b border-blue-400/20 px-4 py-2.5 shadow-md sticky top-14 z-30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-start sm:items-center gap-3">
        <div className="w-6 h-6 rounded bg-[#164B8A] border border-blue-400/30 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {tourStep + 1}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-white tracking-wide">{current.title}</span>
            <span className="text-[10px] text-blue-200 bg-blue-900/60 px-1.5 py-0.5 rounded">
              Interactive Guided Demo
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {current.description} <strong className="text-white/95">{current.suggestedAction}</strong>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
        {tourStep > 0 && (
          <button
            onClick={prevTourStep}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        )}

        {tourStep < tourStepsData.length - 1 ? (
          <button
            onClick={nextTourStep}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-[#164B8A] hover:bg-[#103B6D] text-white transition-colors shadow-xs"
          >
            <span>Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={endTour}
            className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-[#00756A] hover:bg-teal-700 text-white transition-colors"
          >
            <span>Finish Tour</span>
          </button>
        )}

        <button
          onClick={startTour}
          className="p-1 text-slate-400 hover:text-white rounded"
          title="Restart guided tour from Step 1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={endTour}
          className="p-1 text-slate-400 hover:text-white rounded ml-1"
          title="Exit Tour"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
