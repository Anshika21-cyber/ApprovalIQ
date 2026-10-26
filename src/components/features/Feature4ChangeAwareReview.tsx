import React, { useState, useEffect } from 'react';
import {
  FileSearch,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  FileText,
  ArrowRight,
  ShieldCheck,
  Send,
  HelpCircle,
  Clock,
  Layers,
  Info,
  Filter,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DependencyEngine } from '../../engine/dependencyEngine';
import { Document, DocumentVersion } from '../../types';

export const Feature4ChangeAwareReview: React.FC = () => {
  const {
    role,
    setRole,
    currentDocuments,
    acceptEvidence,
    returnEvidence,
    currentFindings,
    setActiveTab,
  } = useApp();

  // Pick first document with >= 2 versions, or first document with pending verification
  const defaultDoc =
    currentDocuments.find((d) => d.status === 'Pending verification') ||
    currentDocuments.find((d) => d.versions.length > 1) ||
    currentDocuments[1] ||
    currentDocuments[0];

  const [selectedDocId, setSelectedDocId] = useState<string>(defaultDoc?.id || '');
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [returnReason, setReturnReason] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const selectedDoc = currentDocuments.find((d) => d.id === selectedDocId);
  const versionsCount = selectedDoc?.versions.length || 0;
  const latestVersionNum = selectedDoc?.currentVersionNumber || selectedDoc?.versions.length || 1;

  const [baseVersionNumber, setBaseVersionNumber] = useState<number>(1);
  const [targetVersionNumber, setTargetVersionNumber] = useState<number>(latestVersionNum);
  const [filterModifiedOnly, setFilterModifiedOnly] = useState<boolean>(false);

  useEffect(() => {
    if (selectedDoc) {
      const latest = selectedDoc.currentVersionNumber || selectedDoc.versions.length || 1;
      setTargetVersionNumber(latest);
      setBaseVersionNumber(Math.max(1, latest - 1));
    }
  }, [selectedDocId, selectedDoc?.currentVersionNumber, selectedDoc?.versions.length]);

  const diffAnalysis =
    selectedDoc && versionsCount > 1
      ? DependencyEngine.analyzeVersionDiff(
          selectedDoc,
          baseVersionNumber,
          targetVersionNumber,
          currentDocuments,
          currentFindings
        )
      : null;

  const handleAccept = () => {
    if (!selectedDoc) return;
    if (!reviewNotes.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'Review verification notes are required before accepting statutory evidence.',
      });
      return;
    }

    const ok = acceptEvidence(selectedDoc.id, targetVersionNumber, reviewNotes);
    if (ok) {
      setActionFeedback({
        type: 'success',
        message: `Evidence accepted for ${selectedDoc.title} (v${targetVersionNumber}). Note: Authorised finding closure remains a distinct subsequent action.`,
      });
      setReviewNotes('');
    }
  };

  const handleReturn = () => {
    if (!selectedDoc) return;
    if (!returnReason.trim()) {
      setActionFeedback({
        type: 'error',
        message: 'A formal return rationale is required so the institution understands the remaining deficiency.',
      });
      return;
    }

    const ok = returnEvidence(selectedDoc.id, targetVersionNumber, returnReason);
    if (ok) {
      setActionFeedback({
        type: 'success',
        message: `Document returned for correction: "${returnReason}". Corresponding findings reverted to "Returned".`,
      });
      setReturnReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Feature Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">Change-Aware Document Review</h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              Feature 4
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            Recheck what changed. Compare replacement versions, isolate modified fields, and re-run dependent checks.
          </p>
        </div>

        {/* Perspective toggle if in Coordinator role */}
        {role !== 'Reviewing Officer' && (
          <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 p-2 rounded text-xs">
            <Info className="w-4 h-4 text-[#164B8A] shrink-0" />
            <span className="text-[#14243A]">You are viewing as Coordinator.</span>
            <button
              onClick={() => setRole('Reviewing Officer')}
              className="px-2.5 py-1 bg-[#164B8A] text-white rounded font-medium hover:bg-[#103B6D] transition-colors"
            >
              Switch to Reviewer Mode
            </button>
          </div>
        )}
      </div>

      {/* Strict Separation Principle Callout */}
      <div className="p-3 bg-blue-50/60 border border-blue-200 rounded text-xs text-[#14243A] flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#164B8A] mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-[#164B8A]">Statutory Separation of Concerns:</strong> (1)
          <strong> Evidence Acceptance</strong> confirms that submitted documents satisfy procedural clarity. (2)
          <strong> Finding Closure</strong> requires verified check satisfaction and an authorized closure record. (3)
          <strong> Final Application Decision</strong> remains an independent Council / Scrutiny Committee authority.
          Accepting evidence does not automatically approve the application.
        </div>
      </div>

      {/* Document Selector Bar */}
      <div className="bg-white p-3 rounded border border-[#D8DEE7] flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#14243A] uppercase tracking-wider text-[11px]">
            Select Document to Review:
          </span>
          <select
            value={selectedDocId}
            onChange={(e) => {
              setSelectedDocId(e.target.value);
              setActionFeedback(null);
            }}
            className="p-1.5 bg-[#F4F5F7] border border-[#D8DEE7] rounded font-medium text-[#14243A]"
          >
            {currentDocuments.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({doc.versions.length} version{doc.versions.length === 1 ? '' : 's'} · Status: {doc.status})
              </option>
            ))}
          </select>
        </div>

        {selectedDoc && (
          <div className="flex items-center gap-2 text-[11px] text-[#526174]">
            <span>Current Status:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded ${
                selectedDoc.status === 'Accepted'
                  ? 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                  : selectedDoc.status === 'Pending verification'
                  ? 'bg-blue-50 text-[#164B8A] border border-blue-200'
                  : 'bg-red-50 text-[#B42318] border border-red-200'
              }`}
            >
              {selectedDoc.status}
            </span>
            <span>·</span>
            <span>Latest: v{latestVersionNum}</span>
          </div>
        )}
      </div>

      {actionFeedback && (
        <div
          className={`p-3 rounded border text-xs flex items-center justify-between ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-[#17613B]'
              : 'bg-red-50 border-red-200 text-[#B42318]'
          }`}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span>{actionFeedback.message}</span>
            {actionFeedback.type === 'success' && actionFeedback.message.includes('Evidence accepted') && (
              <button
                onClick={() => setActiveTab('Resolution Workspace')}
                className="font-bold underline text-[#164B8A] hover:text-[#103B6D] inline-flex items-center gap-1 cursor-pointer"
              >
                Proceed to Resolution Workspace to close finding &rarr;
              </button>
            )}
          </div>
          <button onClick={() => setActionFeedback(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Side-by-Side Version Comparison */}
      {!diffAnalysis ? (
        <div className="bg-white rounded border border-[#D8DEE7] p-8 text-center space-y-3">
          <Layers className="w-10 h-10 text-[#526174]/50 mx-auto" />
          <h3 className="text-sm font-bold text-[#14243A]">
            {versionsCount === 0 ? 'Document Slot Empty (Missing File)' : 'Single Version on File (v1)'}
          </h3>
          <p className="text-xs text-[#526174] max-w-md mx-auto">
            {versionsCount === 0
              ? 'No statutory file has been uploaded for this slot yet. Submit a compliant document via the Resolution Workspace.'
              : 'This document currently has only 1 version attached. To test change-aware review, submit a replacement version via Correction Preview or Resolution Workspace.'}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('Resolution Workspace')}
              className="px-3 py-1.5 bg-[#164B8A] text-white text-xs font-semibold rounded hover:bg-[#103B6D] transition-colors"
            >
              Go to Resolution Workspace &rarr;
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Version Pair & Filter Selector */}
          <div className="bg-white p-3 rounded border border-[#D8DEE7] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-[#14243A]">Compare Versions:</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#526174]">Base:</span>
                <select
                  value={baseVersionNumber}
                  onChange={(e) => setBaseVersionNumber(Number(e.target.value))}
                  className="p-1 bg-[#F4F5F7] border border-[#D8DEE7] rounded font-medium text-[#14243A]"
                >
                  {selectedDoc?.versions?.map((v) => (
                    <option key={v.versionNumber} value={v.versionNumber}>
                      v{v.versionNumber} ({v.filename})
                    </option>
                  ))}
                </select>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#526174]" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#526174]">Target (Replacement):</span>
                <select
                  value={targetVersionNumber}
                  onChange={(e) => setTargetVersionNumber(Number(e.target.value))}
                  className="p-1 bg-[#F4F5F7] border border-[#D8DEE7] rounded font-medium text-[#14243A]"
                >
                  {selectedDoc?.versions?.map((v) => (
                    <option key={v.versionNumber} value={v.versionNumber}>
                      v{v.versionNumber} ({v.filename})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#526174]" />
              <button
                onClick={() => setFilterModifiedOnly(false)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  !filterModifiedOnly
                    ? 'bg-[#164B8A] text-white font-medium shadow-xs'
                    : 'bg-white text-[#526174] border border-[#D8DEE7] hover:bg-[#F4F5F7]'
                }`}
              >
                All Fields ({diffAnalysis.changedFields.length})
              </button>
              <button
                onClick={() => setFilterModifiedOnly(true)}
                className={`px-2.5 py-1 text-xs rounded transition-colors ${
                  filterModifiedOnly
                    ? 'bg-[#164B8A] text-white font-medium shadow-xs'
                    : 'bg-white text-[#526174] border border-[#D8DEE7] hover:bg-[#F4F5F7]'
                }`}
              >
                Modified Only ({diffAnalysis.changedFields.filter((f) => f.isDifferent).length})
              </button>
            </div>
          </div>

          {/* Version Metadata Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Version Box */}
            <div className="bg-white p-4 rounded border border-[#D8DEE7] space-y-2">
              <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
                <span className="font-bold text-xs text-[#526174] uppercase tracking-wider">
                  Base Evidence (v{diffAnalysis.prevVersion.versionNumber})
                </span>
                <span className="text-[11px] font-mono-data text-[#526174]">
                  {new Date(diffAnalysis.prevVersion.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-[#526174] space-y-1">
                <div>Filename: <span className="font-mono-data text-[#14243A]">{diffAnalysis.prevVersion.filename}</span></div>
                <div>Uploaded By: <span className="text-[#14243A]">{diffAnalysis.prevVersion.uploadedBy}</span></div>
                <div>Historical Review: <span className="text-[#B42318] font-medium">{diffAnalysis.prevVersion.reviewDecision || 'Returned'}</span></div>
              </div>
            </div>

            {/* Current Replacement Version Box */}
            <div className="bg-white p-4 rounded border border-blue-300 bg-blue-50/20 space-y-2">
              <div className="flex items-center justify-between border-b border-blue-200 pb-2">
                <span className="font-bold text-xs text-[#164B8A] uppercase tracking-wider">
                  Target Replacement (v{diffAnalysis.currVersion.versionNumber})
                </span>
                <span className="text-[11px] font-mono-data text-[#164B8A]">
                  {new Date(diffAnalysis.currVersion.uploadedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs text-[#526174] space-y-1">
                <div>Filename: <span className="font-mono-data text-[#14243A]">{diffAnalysis.currVersion.filename}</span></div>
                <div>Uploaded By: <span className="text-[#14243A]">{diffAnalysis.currVersion.uploadedBy}</span></div>
                <div>Submission Notes: <span className="text-[#14243A] italic">&quot;{diffAnalysis.currVersion.reviewNotes || 'Rectified replacement deed'}&quot;</span></div>
              </div>
            </div>
          </div>

          {/* Compliance Impact & Resolution Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Addressed */}
            <div className="p-3.5 bg-emerald-50/60 rounded border border-emerald-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17613B]">
                <CheckCircle2 className="w-4 h-4 text-[#17613B]" />
                <span>Addressed Findings ({diffAnalysis.findingsAddressed.length})</span>
              </div>
              {diffAnalysis.findingsAddressed.length === 0 ? (
                <p className="text-[11px] text-[#526174]">No findings fully resolved by this version delta.</p>
              ) : (
                <ul className="text-xs space-y-1">
                  {diffAnalysis.findingsAddressed.map((f) => (
                    <li key={f.findingId} className="text-[#14243A]">
                      <strong>{f.findingId}:</strong> {f.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Remaining Issues */}
            <div className="p-3.5 bg-amber-50/60 rounded border border-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#925500]">
                <AlertTriangle className="w-4 h-4 text-[#925500]" />
                <span>Remaining Issues ({diffAnalysis.remainingIssues.length})</span>
              </div>
              {diffAnalysis.remainingIssues.length === 0 ? (
                <p className="text-[11px] text-[#526174]">All document-specific issues addressed.</p>
              ) : (
                <ul className="text-xs space-y-1">
                  {diffAnalysis.remainingIssues.map((f) => (
                    <li key={f.findingId} className="text-[#14243A]">
                      <strong>{f.findingId}:</strong> {f.title}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* New Concerns */}
            <div className="p-3.5 bg-blue-50/60 rounded border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#164B8A]">
                <Info className="w-4 h-4 text-[#164B8A]" />
                <span>Advisory / New Concerns ({diffAnalysis.newConcernsIntroduced.length})</span>
              </div>
              {diffAnalysis.newConcernsIntroduced.length === 0 ? (
                <p className="text-[11px] text-[#526174]">No new concerns detected in replacement fields.</p>
              ) : (
                <ul className="text-xs space-y-1">
                  {diffAnalysis.newConcernsIntroduced.map((c, i) => (
                    <li key={i} className="text-[#14243A]">
                      <strong>{c.checkName}:</strong> {c.issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Field-by-Field Diff Table */}
          <div className="bg-white rounded border border-[#D8DEE7] overflow-hidden">
            <div className="p-4 border-b border-[#D8DEE7] bg-[#F4F5F7] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                  Extracted Field Delta &amp; Comparison
                </h3>
                <p className="text-[11px] text-[#526174]">
                  Highlighting modified fields between v{diffAnalysis.prevVersion.versionNumber} and v{diffAnalysis.currVersion.versionNumber}
                </p>
              </div>
              <span className="text-[11px] font-mono-data text-[#526174]">
                {diffAnalysis.changedFields.filter((f) => f.isDifferent).length} of {diffAnalysis.changedFields.length} Field(s) Modified
              </span>
            </div>

            <div className="divide-y divide-[#D8DEE7]">
              {diffAnalysis.changedFields
                .filter((f) => (filterModifiedOnly ? f.isDifferent : true))
                .map((field) => (
                  <div
                    key={field.key}
                    className={`p-3.5 text-xs grid grid-cols-1 md:grid-cols-3 gap-3 items-center ${
                      field.isDifferent ? 'bg-amber-50/40' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-semibold text-[#14243A] block">{field.label}</span>
                      <span className="font-mono-data text-[10px] text-[#526174]">{field.key}</span>
                    </div>

                    {/* Old Value */}
                    <div className="p-2 bg-white rounded border border-[#D8DEE7] text-xs">
                      <span className="text-[10px] text-[#526174] block uppercase">v{diffAnalysis.prevVersion.versionNumber}:</span>
                      <span className={`font-mono-data ${field.isDifferent ? 'line-through text-red-700' : 'text-[#14243A]'}`}>
                        {field.oldValue}
                      </span>
                    </div>

                    {/* New Value */}
                    <div className={`p-2 rounded border text-xs ${field.isDifferent ? 'bg-emerald-50/70 border-emerald-300 font-medium' : 'bg-white border-[#D8DEE7]'}`}>
                      <span className="text-[10px] text-[#526174] block uppercase">v{diffAnalysis.currVersion.versionNumber}:</span>
                      <span className="font-mono-data text-[#14243A]">{field.newValue}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Engine Reassessment on Affected Checks */}
          <div className="bg-white rounded border border-[#D8DEE7] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
              <span className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                Automated Engine Reassessment for Affected Checks
              </span>
              <span className="text-[11px] text-[#526174]">
                Re-evaluated against current evidence
              </span>
            </div>

            <div className="space-y-2">
              {diffAnalysis.affectedChecks.map((check) => (
                <div key={check.checkId} className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#14243A]">{check.checkName}</span>
                      <span className="font-mono-data text-[10px] text-[#526174]">{check.ruleId}</span>
                    </div>
                    <p className="text-[11px] text-[#526174] mt-0.5">{check.explanation}</p>
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        check.status === 'Appears satisfied'
                          ? 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                          : 'bg-red-50 text-[#B42318] border border-red-200'
                      }`}
                    >
                      {check.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviewer Action Terminal */}
          <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#164B8A]" />
                <h3 className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                  Reviewing Officer Decision Console
                </h3>
              </div>
              <span className="text-[11px] text-[#526174]">
                Actor: Dr. A. K. Sharma (Regional Scrutiny Officer)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Accept Evidence Column */}
              <div className="p-3.5 bg-emerald-50/40 rounded border border-emerald-200 space-y-2.5">
                <span className="font-bold text-xs text-[#17613B] block">
                  Accept Evidence (v{targetVersionNumber})
                </span>
                <p className="text-[11px] text-[#526174]">
                  Accepting marks this document version as verified. It does not automatically close open findings or approve the application.
                </p>
                <textarea
                  rows={2}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Mandatory verification notes (e.g. Legal title verified against trust deed on record)..."
                  className="w-full p-2 bg-white border border-[#D8DEE7] rounded text-xs text-[#14243A]"
                />
                <button
                  onClick={handleAccept}
                  className="w-full py-2 bg-[#17613B] hover:bg-emerald-800 text-white font-semibold rounded text-xs transition-colors shadow-xs"
                >
                  Accept Evidence with Recorded Rationale
                </button>
              </div>

              {/* Return Evidence Column */}
              <div className="p-3.5 bg-red-50/40 rounded border border-red-200 space-y-2.5">
                <span className="font-bold text-xs text-[#B42318] block">
                  Return for Rectification
                </span>
                <p className="text-[11px] text-[#526174]">
                  Returns document to the institution with specific deficiency points. Findings will revert to &quot;Returned&quot; status.
                </p>
                <textarea
                  rows={2}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Mandatory return reason explaining what remains defective..."
                  className="w-full p-2 bg-white border border-[#D8DEE7] rounded text-xs text-[#14243A]"
                />
                <button
                  onClick={handleReturn}
                  className="w-full py-2 bg-[#B42318] hover:bg-red-800 text-white font-semibold rounded text-xs transition-colors shadow-xs"
                >
                  Return Evidence with Recorded Reason
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
