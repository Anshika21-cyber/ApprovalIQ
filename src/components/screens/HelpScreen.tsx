import React from 'react';
import {
  HelpCircle,
  PlayCircle,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck,
  Video,
  Layers,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface HelpScreenProps {
  onOpenResetModal: () => void;
  onOpenVideoModal: () => void;
}

export const HelpScreen: React.FC<HelpScreenProps> = ({ onOpenResetModal, onOpenVideoModal }) => {
  const { startTour, setActiveTab } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">Help, Guided Demo &amp; Prototype Disclosures</h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              SIH26262
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            Operational guide, complete 12-step synthetic demonstration journey, and capability disclosures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startTour}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Launch 60s Guided Tour</span>
          </button>

          <button
            onClick={onOpenVideoModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#F4F5F7] text-[#14243A] border border-[#D8DEE7] rounded text-xs font-semibold transition-colors shadow-2xs"
          >
            <Video className="w-4 h-4 text-[#164B8A]" />
            <span>Watch Walkthrough</span>
          </button>
        </div>
      </div>

      {/* 12-Step Complete Demo Journey */}
      <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#14243A]">Complete End-to-End Demo Journey</h3>
            <p className="text-xs text-[#526174]">
              Follow this step-by-step sequence to demonstrate the entire connected workflow
            </p>
          </div>
          <span className="text-xs font-semibold text-[#164B8A] bg-blue-50 px-2.5 py-1 rounded">
            Connected 5-Feature Pipeline
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {[
            { step: 1, title: 'Run Readiness Check', desc: 'Click "Run Readiness Checks" in Feature 1. View 4 evaluated conditions.', tab: 'Readiness Check' },
            { step: 2, title: 'Open Resolution Card', desc: 'Select finding FND-NIT-001 (Name Mismatch) to view the 8-part resolution card.', tab: 'Resolution Workspace' },
            { step: 3, title: 'Inspect Engine Chain', desc: 'Review Evidence → Requirement → Finding → Affected check → Action.', tab: 'Resolution Workspace' },
            { step: 4, title: 'View Downstream Impact', desc: 'See how the title mismatch halts State Affiliation and EVC dossier validation.', tab: 'Resolution Workspace' },
            { step: 5, title: 'Preview Replacement A', desc: 'Click "Open Correction Preview". Select Replacement A (fixes name, leaves address).', tab: 'Resolution Workspace' },
            { step: 6, title: 'Simulate Conditional Reassessment', desc: 'Observe findings addressed vs unresolved without altering official review state.', tab: 'Resolution Workspace' },
            { step: 7, title: 'Submit Replacement for Review', desc: 'Click "Submit Replacement for Review". Document changes to "Pending verification".', tab: 'Resolution Workspace' },
            { step: 8, title: 'Switch to Reviewer Role', desc: 'Use TopBar role switcher to toggle to "Reviewing Officer" (Dr. A. K. Sharma).', tab: 'Review Queue' },
            { step: 9, title: 'Change-Aware Diff Review', desc: 'Open Review Queue. Inspect side-by-side field diff (v1 vs v2) and reassessed checks.', tab: 'Review Queue' },
            { step: 10, title: 'Accept Evidence with Notes', desc: 'Record verification notes and click "Accept Evidence with Recorded Rationale".', tab: 'Review Queue' },
            { step: 11, title: 'Authorised Finding Closure', desc: 'In Workspace, click "Close". Engine validates prerequisites and records formal closure.', tab: 'Resolution Workspace' },
            { step: 12, title: 'Inspect Immutable Audit Log', desc: 'Open Activity Log to verify every single action and timestamp has been recorded.', tab: 'Activity Log' },
          ].map((item) => (
            <div key={item.step} className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7] flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold font-mono-data text-[#164B8A]">Step {item.step}</span>
                  <span className="text-[#526174]">{item.tab}</span>
                </div>
                <h4 className="font-semibold text-[#14243A]">{item.title}</h4>
                <p className="text-[11px] text-[#526174] mt-0.5 leading-snug">{item.desc}</p>
              </div>
              <button
                onClick={() => setActiveTab(item.tab)}
                className="text-[11px] font-semibold text-[#164B8A] hover:underline self-start"
              >
                Go to screen &rarr;
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Implemented vs Simulated Technical Capabilities Table */}
      <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#14243A]">Implemented vs. Simulated Capabilities (Prototype Honesty)</h3>
            <p className="text-xs text-[#526174]">
              Clear distinction of working frontend mechanisms from simulated external components
            </p>
          </div>
          <span className="text-xs text-[#526174]">Zero Fake OCR or Fabricated Telemetry</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F4F5F7] text-[#526174] text-[10px] uppercase tracking-wider border-b border-[#D8DEE7]">
              <tr>
                <th className="py-2 px-3">System Capability</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Implementation Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE7]">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Pre-Submission Rule Engine</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Deterministic evaluation of institutional title, premises address, NBC Form-B presence, and Fire Safety expiration threshold.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Consequence &amp; Dependency Logic</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Integrated within Feature 2 to link documents, rules, findings, downstream prerequisites, and closure criteria.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Correction Preview</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Conditional reassessment simulation comparing current vs projected results without modifying official review standing.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Change-Aware Diff Review</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Side-by-side version comparison isolating modified extracted fields and re-running dependent checks.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Authorised Finding Closure</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Enforces strict prerequisite: evidence must be accepted, check reassessed to &quot;Appears satisfied&quot;, and justification recorded.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Local State Persistence</td>
                <td className="py-2.5 px-3 text-[#17613B] font-semibold">Implemented</td>
                <td className="py-2.5 px-3 text-[#526174]">Browser localStorage store preserving draft corrections, submissions, review decisions, and audit events across reloads.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Arbitrary Document Parser / OCR</td>
                <td className="py-2.5 px-3 text-[#925500] font-semibold">Simulated (Disclosed)</td>
                <td className="py-2.5 px-3 text-[#526174]">Arbitrary uploaded PDFs record filename and size, but do not claim genuine OCR. Pre-configured structured documents demonstrate deterministic evaluation.</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#14243A]">Regulatory Status &amp; Policy</td>
                <td className="py-2.5 px-3 text-[#925500] font-semibold">Illustrative Sample</td>
                <td className="py-2.5 px-3 text-[#526174]">Conditions are inspired by AICTE APH norms for competition demonstration and do not claim official Council validation.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset State Card */}
      <div className="bg-white rounded border border-[#D8DEE7] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div>
          <h3 className="text-sm font-bold text-[#14243A]">Reset Prototype State</h3>
          <p className="text-[#526174] mt-0.5">
            Clear all saved drafts, replacement uploads, and review decisions to restart the evaluation demo from scratch.
          </p>
        </div>

        <button
          onClick={onOpenResetModal}
          className="px-4 py-2 bg-red-50 hover:bg-red-100 text-[#B42318] border border-red-200 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Synthetic Demo Data</span>
        </button>
      </div>
    </div>
  );
};
