import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ArrowRight,
  FileText,
  User,
  Calendar,
  ShieldCheck,
  Send,
  Eye,
  CheckCircle2,
  HelpCircle,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Finding } from '../../types';
import { DependencyEngine } from '../../engine/dependencyEngine';

interface ResolutionCardDrawerProps {
  finding: Finding | null;
  onClose: () => void;
  onOpenPreview: (finding: Finding) => void;
}

export const Feature2ResolutionCardDrawer: React.FC<ResolutionCardDrawerProps> = ({
  finding,
  onClose,
  onOpenPreview,
}) => {
  const {
    role,
    sendClarification,
    assignFindingOwner,
    documents,
    currentCheckResults,
  } = useApp();

  const [clarificationText, setClarificationText] = useState('');
  const [isEditingOwner, setIsEditingOwner] = useState(false);
  const [newOwner, setNewOwner] = useState(finding?.responsibleOwner || '');

  if (!finding) return null;

  const targetDoc = documents.find((d) => d.id === finding.assignedDocId);
  const downstreamImpacts = DependencyEngine.getDownstreamImpacts(finding.id);
  const relatedCheck = currentCheckResults.find((c) => c.ruleId === finding.ruleId);

  const handleSendClarification = (e: React.FormEvent) => {
    e.preventDefault();
    if (clarificationText.trim()) {
      sendClarification(finding.id, clarificationText);
      setClarificationText('');
    }
  };

  const handleSaveOwner = () => {
    if (newOwner.trim()) {
      assignFindingOwner(finding.id, newOwner);
      setIsEditingOwner(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-[#D8DEE7] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8DEE7] bg-[#F4F5F7]/80 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono-data text-xs font-bold text-[#164B8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {finding.id}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  finding.severity === 'Mandatory Deficiency'
                    ? 'bg-red-50 text-[#B42318] border border-red-200'
                    : 'bg-amber-50 text-[#925500] border border-amber-200'
                }`}
              >
                {finding.severity}
              </span>
              <span className="text-xs text-[#526174]">
                Status: <strong className="text-[#14243A]">{finding.status}</strong>
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#14243A] mt-1.5 leading-snug">
              {finding.title}
            </h2>
            <p className="text-[11px] text-[#526174] mt-0.5">
              Explainable Deficiency Card · Compliance Consequence &amp; Dependency Engine
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#526174] hover:text-[#14243A] rounded hover:bg-[#D8DEE7]/40 transition-colors shrink-0"
            title="Close resolution drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-white border-b border-[#D8DEE7] flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#526174]">Assigned:</span>
            {isEditingOwner ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className="px-2 py-1 text-xs border border-[#D8DEE7] rounded bg-white"
                />
                <button
                  onClick={handleSaveOwner}
                  className="px-2 py-1 bg-[#164B8A] text-white rounded font-medium text-[11px]"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingOwner(false)}
                  className="px-1.5 py-1 text-[#526174] text-[11px]"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditingOwner(true)}
                className="font-medium text-[#14243A] hover:underline flex items-center gap-1"
                title="Click to reassign owner"
              >
                <span>{finding.responsibleOwner}</span>
                <span className="text-[10px] text-[#164B8A]">(Edit)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenPreview(finding);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded font-semibold transition-colors shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Open Correction Preview</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body: The 8 Mandated Questions */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Compact Relationship Chain */}
          <div className="p-3 bg-[#14243A] text-white rounded border border-[#14243A]">
            <div className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider mb-2">
              Compliance Consequence &amp; Dependency Chain
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-[11px] text-slate-200">
              <span className="bg-white/10 px-2 py-1 rounded truncate">
                {targetDoc?.title || 'Supporting Evidence'}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="bg-white/10 px-2 py-1 rounded truncate">
                {finding.ruleId}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="bg-amber-400/20 text-amber-200 px-2 py-1 rounded font-semibold truncate">
                {finding.id}
              </span>
              <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
              <span className="bg-white/10 px-2 py-1 rounded truncate">
                Prerequisite Validation
              </span>
            </div>
          </div>

          {/* QUESTION 1: What is wrong? */}
          <div className="bg-[#F4F5F7] p-3.5 rounded border border-[#D8DEE7] space-y-1">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              1. What is wrong?
            </div>
            <p className="text-xs text-[#14243A] font-medium leading-relaxed">
              {finding.title}
            </p>
            {relatedCheck && (
              <p className="text-[11px] text-[#526174] mt-1">{relatedCheck.explanation}</p>
            )}
          </div>

          {/* QUESTION 2: Which evidence supports the finding? */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              2. Which evidence supports the finding?
            </div>
            <div className="space-y-2">
              {finding.supportingEvidence.map((ev, i) => (
                <div key={i} className="p-2.5 bg-white rounded border border-[#D8DEE7] flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-[#164B8A] mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-[#14243A]">{ev.docTitle}</div>
                    <div className="text-[11px] text-[#526174] mt-0.5">
                      <span>Doc ID: {ev.docId}</span>
                      <span> · Version: v{ev.versionNumber}</span>
                      {ev.pageRef && <span> · Reference: {ev.pageRef}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QUESTION 3: Which requirement is relevant? */}
          <div className="p-3.5 bg-blue-50/50 rounded border border-blue-200 space-y-1">
            <div className="text-[11px] font-bold text-[#164B8A] uppercase tracking-wider flex items-center justify-between">
              <span>3. Which requirement is relevant?</span>
              <span className="font-mono-data text-[10px]">{finding.ruleId} ({finding.ruleVersion})</span>
            </div>
            <p className="text-xs text-[#14243A] leading-relaxed">
              {finding.requirementExplanation}
            </p>
          </div>

          {/* QUESTION 4: Why does it matter? */}
          <div className="space-y-1">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              4. Why does it matter?
            </div>
            <div className="p-3 bg-red-50/40 rounded border border-red-200 text-[#14243A] leading-relaxed">
              {finding.whyItMatters}
            </div>
          </div>

          {/* QUESTION 5: What else may be affected? */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              5. What else may be affected? (Downstream Prerequisites)
            </div>
            <div className="bg-[#F4F5F7] p-3 rounded border border-[#D8DEE7] space-y-1.5">
              {downstreamImpacts.map((impact, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-[#14243A]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#164B8A] shrink-0" />
                  <span>{impact}</span>
                </div>
              ))}
            </div>
          </div>

          {/* QUESTION 6: Who should act? */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7]">
              <div className="text-[10px] font-bold text-[#526174] uppercase tracking-wider">
                6. Who should act?
              </div>
              <div className="font-semibold text-xs text-[#14243A] mt-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#164B8A]" />
                <span className="truncate">{finding.responsibleOwner}</span>
              </div>
            </div>

            <div className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7]">
              <div className="text-[10px] font-bold text-[#526174] uppercase tracking-wider">
                Resolution Due Date
              </div>
              <div className="font-semibold text-xs text-[#14243A] mt-1 flex items-center gap-1.5 font-mono-data">
                <Calendar className="w-3.5 h-3.5 text-[#925500]" />
                <span>{finding.dueDate}</span>
              </div>
            </div>
          </div>

          {/* QUESTION 7: What corrective evidence is needed? */}
          <div className="p-3.5 bg-emerald-50/40 rounded border border-emerald-200 space-y-1">
            <div className="text-[11px] font-bold text-[#17613B] uppercase tracking-wider">
              7. What corrective evidence is needed?
            </div>
            <p className="text-xs text-[#14243A] leading-relaxed">
              {finding.correctiveEvidenceRequired}
            </p>
          </div>

          {/* QUESTION 8: What must be verified before closure? */}
          <div className="p-3.5 bg-slate-50 rounded border border-[#D8DEE7] space-y-1">
            <div className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              8. What must be verified before authorised closure?
            </div>
            <div className="text-xs text-[#14243A] leading-relaxed whitespace-pre-line font-mono-data text-[11px]">
              {finding.closureCriteria}
            </div>
          </div>

          {/* Clarification Thread */}
          <div className="space-y-3 pt-2 border-t border-[#D8DEE7]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                Clarification Thread ({finding.clarificationThread.length})
              </span>
              <span className="text-[11px] text-[#526174]">
                Direct coordinator / reviewer correspondence
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {finding.clarificationThread.length === 0 ? (
                <div className="p-3 text-center text-[11px] text-[#526174] bg-[#F4F5F7] rounded">
                  No clarification messages yet. Post a query below.
                </div>
              ) : (
                finding.clarificationThread.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2.5 rounded border text-xs ${
                      msg.role === 'Reviewing Officer'
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-[#D8DEE7]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-[#526174] mb-1">
                      <span className="font-semibold text-[#14243A]">{msg.author} ({msg.role})</span>
                      <span className="font-mono-data text-[10px]">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-[#14243A] leading-relaxed">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleSendClarification} className="flex gap-2 pt-1">
              <input
                type="text"
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                placeholder={`Post clarification as ${role}...`}
                className="flex-1 px-3 py-1.5 text-xs bg-[#F4F5F7] border border-[#D8DEE7] rounded focus:bg-white text-[#14243A]"
              />
              <button
                type="submit"
                disabled={!clarificationText.trim()}
                className="px-3 py-1.5 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded text-xs font-semibold flex items-center gap-1 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D8DEE7] bg-[#F4F5F7] flex items-center justify-between text-xs">
          <span className="text-[#526174] text-[11px]">
            Engine Rule: <strong className="text-[#14243A]">{finding.ruleId}</strong> · All modifications are logged in Audit Trail.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-white border border-[#D8DEE7] rounded text-[#14243A] hover:bg-slate-100 font-medium"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
