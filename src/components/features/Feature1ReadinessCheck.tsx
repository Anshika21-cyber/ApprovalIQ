import React, { useState } from 'react';
import {
  FileCheck2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HelpCircle,
  FileText,
  Upload,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CheckResult, CheckStatus, Document } from '../../types';

export const Feature1ReadinessCheck: React.FC = () => {
  const {
    currentApplication,
    currentDocuments,
    currentCheckResults,
    lastCheckRunAt,
    runReadinessCheck,
    setActiveFindingForDetail,
    currentFindings,
    attachArbitraryFile,
    setActiveTab,
  } = useApp();

  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [uploadTargetDocCode, setUploadTargetDocCode] = useState<string>('DOC-DECL-AFF');
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleRunChecks = () => {
    setIsRunning(true);
    setTimeout(() => {
      runReadinessCheck();
      setIsRunning(false);
    }, 450);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const res = attachArbitraryFile(uploadTargetDocCode, file);
      if (res.success) {
        setUploadFeedback({
          type: 'success',
          message: `Attached "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)} MB) to statutory slot. Stored as metadata; automatic OCR parsing is not simulated.`,
        });
      } else {
        setUploadFeedback({
          type: 'error',
          message: res.error || 'Failed to attach file.',
        });
      }
      e.target.value = '';
    }
  };

  const getStatusBadge = (status: CheckStatus) => {
    switch (status) {
      case 'Appears satisfied':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#17613B]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#17613B]" />
            Appears satisfied
          </span>
        );
      case 'Potential issue':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#B42318]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B42318]" />
            Potential issue
          </span>
        );
      case 'Insufficient evidence':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#925500]">
            <Clock className="w-3.5 h-3.5 text-[#925500]" />
            Insufficient evidence
          </span>
        );
      case 'Official review required':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#164B8A]">
            <HelpCircle className="w-3.5 h-3.5 text-[#164B8A]" />
            Official review required
          </span>
        );
    }
  };

  const filteredChecks = currentCheckResults.filter((check) => {
    if (selectedCategoryFilter === 'All') return true;
    return check.category === selectedCategoryFilter;
  });

  const categories = ['All', ...Array.from(new Set(currentCheckResults.map((c) => c.category)))];

  return (
    <div className="space-y-6">
      {/* Feature Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">Pre-Submission Compliance Check</h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              Feature 1
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            Find problems before submitting. Deterministic rule evaluation against registered document versions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-[11px] text-[#526174] hidden sm:block">
            <span>Last evaluated: </span>
            <span className="font-mono-data text-[#14243A]">
              {lastCheckRunAt ? new Date(lastCheckRunAt).toLocaleTimeString() : 'Not run yet'}
            </span>
          </div>

          <button
            onClick={handleRunChecks}
            disabled={isRunning}
            className="flex items-center gap-2 px-3.5 py-2 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Evaluating...' : 'Run Readiness Checks'}</span>
          </button>
        </div>
      </div>

      {/* Honesty Notice Regarding Guaranteed Approval */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded text-xs text-[#925500] flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-[#925500] mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold">Institutional Review Disclaimer:</strong> Passing pre-submission checks
          indicates that provided sample fields conform to illustrative AICTE Approval Process Handbook (APH)
          specifications. Passing checks do not imply or guarantee official regulatory approval by the Scrutiny
          Committee or Council.
        </div>
      </div>

      {/* Two Column Layout: Document Registry Checklist + Arbitrary Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Checklist (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded border border-[#D8DEE7] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                Required Institutional Evidentiary Documents
              </h3>
              <p className="text-[11px] text-[#526174]">
                Status of statutory uploads registered for {currentApplication?.institutionName}
              </p>
            </div>
            <span className="text-[11px] font-mono-data text-[#526174]">
              {currentDocuments.filter((d) => d.status !== 'Missing').length} / {currentDocuments.length} Attached
            </span>
          </div>

          <div className="divide-y divide-[#D8DEE7]">
            {currentDocuments.map((doc) => {
              const latestVer = doc.versions[doc.versions.length - 1];
              return (
                <div key={doc.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <FileText className="w-4 h-4 text-[#164B8A] mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#14243A] truncate">{doc.title}</span>
                        {doc.isRequired && (
                          <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1 py-0.2 rounded font-medium">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#526174] mt-0.5">
                        <span>Code: {doc.code}</span>
                        <span>·</span>
                        <span>Category: {doc.category}</span>
                        {latestVer && (
                          <>
                            <span>·</span>
                            <span className="font-mono-data">v{latestVer.versionNumber}</span>
                            <span>·</span>
                            <span>{latestVer.fileSize}</span>
                          </>
                        )}
                      </div>
                      {latestVer?.reviewDecision === 'Returned for correction' && latestVer.returnReason && (
                        <p className="text-[11px] text-[#B42318] bg-red-50/60 p-1.5 rounded mt-1.5 border border-red-200">
                          <strong>Returned:</strong> {latestVer.returnReason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        doc.status === 'Accepted'
                          ? 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                          : doc.status === 'Returned for correction'
                          ? 'bg-red-50 text-[#B42318] border border-red-200'
                          : doc.status === 'Missing'
                          ? 'bg-amber-50 text-[#925500] border border-amber-200 font-semibold'
                          : 'bg-blue-50 text-[#164B8A] border border-blue-200'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upload Zone & Simulated Parsing Disclosure (Right 1 col) */}
        <div className="bg-white rounded border border-[#D8DEE7] p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-[#14243A] uppercase tracking-wider">
                Attach External Evidence
              </h3>
              <p className="text-[11px] text-[#526174]">
                Upload arbitrary institutional PDF file to observe system handling
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#14243A] block">
                Target Statutory Slot:
              </label>
              <select
                value={uploadTargetDocCode}
                onChange={(e) => setUploadTargetDocCode(e.target.value)}
                className="w-full text-xs p-1.5 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-[#14243A]"
              >
                {currentDocuments.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.code} — {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-2 border-dashed border-[#D8DEE7] rounded p-4 text-center hover:bg-[#F4F5F7] transition-colors relative">
              <input
                type="file"
                accept=".pdf,.png,.jpg"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Attach arbitrary file"
              />
              <Upload className="w-5 h-5 text-[#526174] mx-auto mb-1" />
              <span className="text-xs font-medium text-[#164B8A] block">
                Click to attach file
              </span>
              <span className="text-[10px] text-[#526174] block mt-0.5">
                PDF, JPG, PNG up to 10MB
              </span>
            </div>

            {uploadFeedback && (
              <div
                className={`p-2.5 rounded text-xs border ${
                  uploadFeedback.type === 'success'
                    ? 'bg-emerald-50 text-[#17613B] border-emerald-200'
                    : 'bg-red-50 text-[#B42318] border-red-200'
                }`}
              >
                {uploadFeedback.message}
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[#F4F5F7] rounded border border-[#D8DEE7] text-[11px] text-[#526174] leading-relaxed">
            <strong className="text-[#14243A] block mb-0.5">Prototype Disclosure:</strong>
            Arbitrary uploads are stored with filename and metadata. Automatic field extraction is not performed on
            arbitrary uploads; deterministic rule evaluation operates on the predefined structured sample documents.
          </div>
        </div>
      </div>

      {/* Checks Evaluation Results Table */}
      <div className="bg-white rounded border border-[#D8DEE7] overflow-hidden">
        <div className="p-4 border-b border-[#D8DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F5F7]/40">
          <div>
            <h3 className="text-sm font-bold text-[#14243A]">Sample Rule Evaluation Results</h3>
            <p className="text-xs text-[#526174]">
              {filteredChecks.length} checks evaluated against active document versions
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-[#526174] mr-1">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap ${
                  selectedCategoryFilter === cat
                    ? 'bg-[#164B8A] text-white font-medium shadow-xs'
                    : 'bg-white text-[#526174] border border-[#D8DEE7] hover:bg-[#F4F5F7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#D8DEE7]">
          {filteredChecks.map((check) => {
            const relatedFinding = check.findingId
              ? currentFindings.find((f) => f.id === check.findingId)
              : undefined;

            return (
              <div key={check.checkId} className="p-4 hover:bg-slate-50/50 transition-colors space-y-2.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#14243A]">{check.checkName}</span>
                    <span className="text-[10px] font-mono-data text-[#526174] bg-[#F4F5F7] px-1.5 py-0.5 rounded border border-[#D8DEE7]">
                      {check.ruleId} · {check.ruleVersion}
                    </span>
                    <span className="text-[10px] text-[#526174] hidden md:inline">
                      Category: {check.category}
                    </span>
                  </div>
                  <div>{getStatusBadge(check.status)}</div>
                </div>

                {/* Explanation */}
                <p className="text-xs text-[#14243A] leading-relaxed">{check.explanation}</p>

                {/* Extracted Values Comparison Grid */}
                {check.comparedValues.length > 0 && (
                  <div className="bg-[#F4F5F7] rounded p-2.5 border border-[#D8DEE7] text-xs">
                    <div className="text-[11px] font-semibold text-[#526174] uppercase tracking-wider mb-1.5">
                      Compared Values &amp; Evidence Basis
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {check.comparedValues.map((val, idx) => (
                        <div key={idx} className="bg-white p-2 rounded border border-[#D8DEE7]">
                          <div className="text-[11px] text-[#526174] flex justify-between">
                            <span className="font-medium text-[#14243A]">{val.fieldLabel}</span>
                            <span className="truncate max-w-[150px]">{val.docTitle}</span>
                          </div>
                          <div className="font-mono-data text-xs text-[#14243A] font-medium mt-1 truncate">
                            {val.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link to Resolution Card / Finding */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="text-[11px] text-[#526174]">
                    Documents involved: {check.comparedDocuments.join(', ')}
                  </div>

                  {relatedFinding ? (
                    <button
                      onClick={() => setActiveFindingForDetail(relatedFinding)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#164B8A] hover:underline"
                    >
                      <span>Inspect Resolution Card ({relatedFinding.id})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#17613B] font-medium">
                      No open deficiency recorded
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
