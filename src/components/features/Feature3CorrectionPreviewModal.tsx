import React, { useState, useEffect } from 'react';
import {
  Eye,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  ArrowRight,
  Save,
  Send,
  X,
  FileText,
  Info,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Finding, ReassessmentPreviewResult } from '../../types';
import { SAMPLE_REPLACEMENTS } from '../../fixtures/syntheticData';

interface CorrectionPreviewModalProps {
  finding: Finding | null;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

export const Feature3CorrectionPreviewModal: React.FC<CorrectionPreviewModalProps> = ({
  finding,
  onClose,
  onSubmitSuccess,
}) => {
  const {
    currentFindings,
    documents,
    saveCorrectionDraft,
    runCorrectionPreview,
    submitCorrection,
    role,
    setActiveTab,
  } = useApp();

  const [selectedFindingId, setSelectedFindingId] = useState<string>(finding?.id || '');
  const [selectedSampleReplacement, setSelectedSampleReplacement] = useState<string>('SAMPLE-REPL-A');
  const [proposedFields, setProposedFields] = useState<Record<string, string>>({
    institute_name: 'Northfield Institute of Technology',
    registered_address: 'Plot 42, Knowledge Corridor, Greater Noida, UP 201310',
  });
  const [explanation, setExplanation] = useState<string>(
    'Rectified deponent statement adhering to the verbatim institution registration name.'
  );

  const [previewResult, setPreviewResult] = useState<ReassessmentPreviewResult | null>(null);
  const [hasPreviewed, setHasPreviewed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeFinding = finding
    ? currentFindings.find((f) => f.id === selectedFindingId) || finding
    : null;
  const targetDoc = documents.find((d) => d.id === activeFinding?.assignedDocId);

  useEffect(() => {
    if (finding) {
      if (selectedFindingId && selectedFindingId !== finding.id) {
        setHasPreviewed(false);
        setPreviewResult(null);
      }
      setSelectedFindingId(finding.id);
      if (finding.correctionDraft) {
        setProposedFields(finding.correctionDraft.proposedFields);
        setExplanation(finding.correctionDraft.explanation);
        if (finding.correctionDraft.proposedDocSampleId) {
          setSelectedSampleReplacement(finding.correctionDraft.proposedDocSampleId);
        }
      }
    }
  }, [finding]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && finding) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [finding, onClose]);

  // Adjust pre-filled fields when sample document changes
  const handleSampleChange = (sampleId: string) => {
    setSelectedSampleReplacement(sampleId);
    if (sampleId === 'SAMPLE-REPL-A') {
      setProposedFields({
        institute_name: 'Northfield Institute of Technology',
        registered_address: 'Plot 42, Knowledge Corridor, Greater Noida, UP 201310',
      });
      setExplanation('Deed v2: Corrects institutional title. Address unchanged.');
    } else if (sampleId === 'SAMPLE-REPL-B') {
      setProposedFields({
        institute_name: 'Northfield Institute of Technology',
        registered_address: 'Plot 42, Knowledge Corridor, Sector 5, Greater Noida, UP 201310',
      });
      setExplanation('Deed v2-Alt: Corrects address to Sector 5, but deponent designation is Ad-hoc Member Secretary.');
    } else if (sampleId === 'SAMPLE-NBC-B') {
      setProposedFields({
        certificate_no: 'NBC-SE-2026-0412',
        structural_engineer_reg: 'COA/SE-UP/9981',
      });
      setExplanation('Form NBC-B Structural Stability Certificate certified by Chartered Engineer.');
    } else if (sampleId === 'SAMPLE-FIRE-RENEW') {
      setProposedFields({
        certificate_no: 'FS-UP-2026-9904',
        valid_until: '2028-03-31',
      });
      setExplanation('Renewed Fire Safety Clearance valid through 2028.');
    }
    setHasPreviewed(false);
  };

  const handleRunPreview = () => {
    if (!activeFinding) return;

    const result = runCorrectionPreview(activeFinding.id, {
      proposedDocSampleId: selectedSampleReplacement,
      proposedFields,
      explanation,
    });

    setPreviewResult(result);
    setHasPreviewed(true);
  };

  const handleSaveDraft = () => {
    if (!activeFinding || !targetDoc) return;
    saveCorrectionDraft(activeFinding.id, {
      findingId: activeFinding.id,
      targetDocId: targetDoc.id,
      proposedDocSampleId: selectedSampleReplacement,
      proposedFields,
      explanation,
    });
    setStatusMessage('Draft correction saved successfully. Official state remains unchanged.');
    setTimeout(() => setStatusMessage(null), 3500);
  };

  const handleSubmitForReview = () => {
    if (!activeFinding || !targetDoc) return;
    setIsSubmitting(true);

    const success = submitCorrection(
      activeFinding.id,
      targetDoc.code,
      selectedSampleReplacement,
      proposedFields,
      explanation
    );

    if (success) {
      setIsSubmitting(false);
      onClose();
      if (onSubmitSuccess) onSubmitSuccess();
    }
  };

  if (!finding || !activeFinding) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded border border-[#D8DEE7] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D8DEE7] bg-[#F4F5F7] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-bold text-[#164B8A] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Feature 3
              </span>
              <h2 className="text-sm sm:text-base font-bold text-[#14243A]">
                Correction Preview &amp; Conditional Reassessment
              </h2>
            </div>
            <p className="text-xs text-[#526174] mt-0.5">
              See what your correction would change before official submission.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-[#526174] hover:text-[#14243A] transition-colors"
            title="Close correction preview"
            aria-label="Close correction preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Strict Honesty Banner */}
        <div className="bg-blue-900 text-white px-4 py-2 text-xs flex items-center justify-between border-b border-blue-800">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-300 shrink-0" />
            <span className="font-semibold">Preview only — no official status change.</span>
            <span className="text-blue-200 hidden sm:inline">
              Simulates rule engine logic without altering current official scrutiny standing or reviewer queue.
            </span>
          </div>
        </div>

        {/* Body Split */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Left Column: Proposed Correction Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#14243A] uppercase tracking-wider mb-1">
                Target Open Deficiency:
              </label>
              <select
                value={selectedFindingId}
                onChange={(e) => {
                  setSelectedFindingId(e.target.value);
                  setHasPreviewed(false);
                }}
                className="w-full p-2 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A] font-medium"
              >
                {currentFindings
                  .filter((f) => f.status !== 'Closed')
                  .map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.id}: {f.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14243A] uppercase tracking-wider mb-1">
                Sample Replacement Document Option:
              </label>
              <div className="space-y-2">
                <label className="flex items-start gap-2 p-2.5 bg-slate-50 border border-[#D8DEE7] rounded cursor-pointer hover:bg-slate-100">
                  <input
                    type="radio"
                    name="replacementOption"
                    value="SAMPLE-REPL-A"
                    checked={selectedSampleReplacement === 'SAMPLE-REPL-A'}
                    onChange={() => handleSampleChange('SAMPLE-REPL-A')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-[#14243A] block">
                      Replacement A: Rectified Declaration Deed (Fixes Title)
                    </span>
                    <span className="text-[11px] text-[#526174] block mt-0.5">
                      Sets legal name to &quot;Northfield Institute of Technology&quot;. Retains address discrepancy (omits Sector 5).
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2.5 bg-slate-50 border border-[#D8DEE7] rounded cursor-pointer hover:bg-slate-100">
                  <input
                    type="radio"
                    name="replacementOption"
                    value="SAMPLE-REPL-B"
                    checked={selectedSampleReplacement === 'SAMPLE-REPL-B'}
                    onChange={() => handleSampleChange('SAMPLE-REPL-B')}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-[#14243A] block">
                      Replacement B: Alternative Declaration (Fixes Address, Ad-hoc Signatory)
                    </span>
                    <span className="text-[11px] text-[#526174] block mt-0.5">
                      Fixes Sector 5 address, but changes deponent to &quot;Member Secretary (Ad-hoc)&quot; triggering new governance concern.
                    </span>
                  </div>
                </label>

                {activeFinding.id === 'FND-NIT-004' && (
                  <label className="flex items-start gap-2 p-2.5 bg-slate-50 border border-[#D8DEE7] rounded cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="replacementOption"
                      value="SAMPLE-NBC-B"
                      checked={selectedSampleReplacement === 'SAMPLE-NBC-B'}
                      onChange={() => handleSampleChange('SAMPLE-NBC-B')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-[#14243A] block">
                        Sample NBC Form-B Stability Certificate
                      </span>
                      <span className="text-[11px] text-[#526174] block mt-0.5">
                        Attaches missing statutory structural certificate from Empanelled Engineer.
                      </span>
                    </div>
                  </label>
                )}

                {activeFinding.id === 'FND-NIT-003' && (
                  <label className="flex items-start gap-2 p-2.5 bg-slate-50 border border-[#D8DEE7] rounded cursor-pointer hover:bg-slate-100">
                    <input
                      type="radio"
                      name="replacementOption"
                      value="SAMPLE-FIRE-RENEW"
                      checked={selectedSampleReplacement === 'SAMPLE-FIRE-RENEW'}
                      onChange={() => handleSampleChange('SAMPLE-FIRE-RENEW')}
                      className="mt-0.5"
                    />
                    <div>
                      <span className="font-semibold text-[#14243A] block">
                        Renewed Fire Safety Clearance NOC
                      </span>
                      <span className="text-[11px] text-[#526174] block mt-0.5">
                        Extends validity date through 2028-03-31, satisfying continuity threshold.
                      </span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Editable Proposed Values */}
            <div>
              <label className="block text-xs font-bold text-[#14243A] uppercase tracking-wider mb-1">
                Proposed Corrective Values (Simulated Extracted Fields):
              </label>
              <div className="space-y-2 bg-[#F4F5F7] p-3 rounded border border-[#D8DEE7]">
                {Object.entries(proposedFields).map(([key, val]) => (
                  <div key={key}>
                    <label className="text-[11px] font-semibold text-[#526174] block mb-0.5">
                      {key.replace(/_/g, ' ').toUpperCase()}:
                    </label>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => {
                        setProposedFields({ ...proposedFields, [key]: e.target.value });
                        setHasPreviewed(false);
                      }}
                      className="w-full p-1.5 bg-white border border-[#D8DEE7] rounded text-xs font-mono-data text-[#14243A]"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14243A] uppercase tracking-wider mb-1">
                Institute Coordinator Rectification Statement:
              </label>
              <textarea
                rows={2}
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the basis of this corrective evidence..."
                className="w-full p-2 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleRunPreview}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>Run Conditional Reassessment</span>
              </button>

              <button
                onClick={handleSaveDraft}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-[#14243A] border border-[#D8DEE7] rounded text-xs font-medium transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            </div>

            {statusMessage && (
              <p className="text-xs text-[#17613B] font-medium bg-emerald-50 p-2 rounded border border-emerald-200">
                {statusMessage}
              </p>
            )}
          </div>

          {/* Right Column: Reassessment Results Display */}
          <div className="bg-[#F4F5F7] p-4 rounded border border-[#D8DEE7] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
                <span className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                  Conditional Reassessment Projection
                </span>
                <span className="text-[11px] text-[#526174]">
                  {hasPreviewed ? 'Engine Evaluation Complete' : 'Awaiting Reassessment Run'}
                </span>
              </div>

              {!hasPreviewed ? (
                <div className="p-8 text-center text-[#526174] space-y-2">
                  <Clock className="w-8 h-8 text-[#526174]/60 mx-auto" />
                  <p className="font-medium text-xs text-[#14243A]">No conditional preview generated yet.</p>
                  <p className="text-[11px]">
                    Select replacement options and click <strong>&quot;Run Conditional Reassessment&quot;</strong> to evaluate results without altering the live review queue.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 mt-3">
                  {/* 1. Findings Potentially Addressed */}
                  <div className="bg-white p-3 rounded border border-emerald-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#17613B] uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#17613B]" />
                      <span>1. Findings Potentially Addressed ({previewResult?.findingsAddressed.length || 0})</span>
                    </div>
                    {previewResult?.findingsAddressed.length === 0 ? (
                      <p className="text-[11px] text-[#526174]">No findings fully addressed by this proposal.</p>
                    ) : (
                      previewResult?.findingsAddressed.map((fa) => (
                        <div key={fa.findingId} className="text-xs text-[#14243A] pl-5">
                          <span className="font-semibold">{fa.findingId}:</span> {fa.title}
                          <p className="text-[11px] text-[#17613B] mt-0.5">{fa.reason}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 2. Findings Still Unresolved */}
                  <div className="bg-white p-3 rounded border border-amber-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#925500] uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#925500]" />
                      <span>2. Findings Still Unresolved ({previewResult?.findingsUnresolved.length || 0})</span>
                    </div>
                    {previewResult?.findingsUnresolved.length === 0 ? (
                      <p className="text-[11px] text-[#17613B] pl-5">All current deficiencies addressed.</p>
                    ) : (
                      previewResult?.findingsUnresolved.map((fu) => (
                        <div key={fu.findingId} className="text-xs text-[#14243A] pl-5">
                          <span className="font-semibold">{fu.findingId}:</span> {fu.title}
                          <p className="text-[11px] text-[#925500] mt-0.5">{fu.reason}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* 3. Checks Requiring Reassessment / Reviewer Verification */}
                  <div className="bg-white p-3 rounded border border-blue-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-[#164B8A] uppercase tracking-wider flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-[#164B8A]" />
                      <span>3. Checks Requiring Reviewer Verification ({previewResult?.checksRequiringReassessment.length || 0})</span>
                    </div>
                    {previewResult?.checksRequiringReassessment.map((cr, idx) => (
                      <div key={idx} className="text-xs text-[#14243A] pl-5 flex justify-between">
                        <span>{cr.checkName}</span>
                        <span className="text-[11px] font-mono-data text-[#164B8A]">
                          Projected: {cr.projectedStatus}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 4. Newly Introduced Concerns (if Replacement B tested) */}
                  {previewResult && previewResult.newConcernsIntroduced.length > 0 && (
                    <div className="bg-red-50 p-3 rounded border border-red-200 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#B42318] uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-[#B42318]" />
                        <span>Newly Introduced Concern</span>
                      </div>
                      {previewResult.newConcernsIntroduced.map((nc, idx) => (
                        <div key={idx} className="text-xs text-[#14243A] pl-5">
                          <span className="font-semibold">{nc.checkName}:</span> {nc.issue}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Submission Actions */}
            <div className="pt-3 border-t border-[#D8DEE7] flex items-center justify-between">
              <span className="text-[11px] text-[#526174]">
                Submission will update the Reviewer Queue for verification.
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white border border-[#D8DEE7] rounded text-xs text-[#526174] hover:text-[#14243A] hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitForReview}
                  disabled={!hasPreviewed || isSubmitting}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00756A] hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Replacement for Review</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
