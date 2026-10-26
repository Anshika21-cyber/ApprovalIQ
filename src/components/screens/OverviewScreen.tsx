import React from 'react';
import {
  AlertTriangle,
  FileCheck2,
  Clock,
  ShieldCheck,
  Building,
  ArrowRight,
  ClipboardList,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const OverviewScreen: React.FC = () => {
  const {
    applications,
    currentApplication,
    currentFindings,
    currentDocuments,
    auditLog,
    setActiveTab,
    setActiveFindingForDetail,
    role,
    setRole,
  } = useApp();

  // Metrics calculated from actual live state
  const openFindings = currentFindings.filter((f) => f.status !== 'Closed');
  const mandatoryDeficiencies = openFindings.filter((f) => f.severity === 'Mandatory Deficiency');
  const pendingReviewDocs = currentDocuments.filter((d) => d.status === 'Pending verification');
  const missingDocs = currentDocuments.filter((d) => d.status === 'Missing');
  const upcomingUndertakings = currentApplication?.undertakings.filter((u) => u.status !== 'Verified & Active') || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#14243A]">
              Approval &amp; Compliance Overview
            </h1>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              {currentApplication?.institutionCode}
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-1">
            Active Application: <strong className="text-[#14243A]">{currentApplication?.institutionName}</strong> ({currentApplication?.applicationType}) · Current Stage: <span className="font-semibold text-[#164B8A]">{currentApplication?.stage}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('Readiness Check')}
            className="px-3.5 py-2 bg-[#164B8A] hover:bg-[#103B6D] text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Pre-Submission Check</span>
          </button>
        </div>
      </div>

      {/* Operational KPI Grid (Live Calculated State) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div
          onClick={() => setActiveTab('Resolution Workspace')}
          className="bg-white p-4 rounded border border-[#D8DEE7] shadow-2xs hover:border-[#164B8A] transition-colors cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#526174]">Open Deficiencies</span>
            <AlertTriangle className="w-4 h-4 text-[#B42318]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#14243A]">
            {openFindings.length}
          </div>
          <div className="text-[11px] text-[#B42318] flex items-center justify-between pt-1">
            <span>{mandatoryDeficiencies.length} Mandatory</span>
            <span className="text-[#164B8A] group-hover:underline">Resolve &rarr;</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div
          onClick={() => setActiveTab('Review Queue')}
          className="bg-white p-4 rounded border border-[#D8DEE7] shadow-2xs hover:border-[#164B8A] transition-colors cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#526174]">Awaiting Reviewer Scrutiny</span>
            <Clock className="w-4 h-4 text-[#164B8A]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#14243A]">
            {pendingReviewDocs.length}
          </div>
          <div className="text-[11px] text-[#526174] flex items-center justify-between pt-1">
            <span>Replacement evidence on file</span>
            <span className="text-[#164B8A] group-hover:underline">Queue &rarr;</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setActiveTab('Readiness Check')}
          className="bg-white p-4 rounded border border-[#D8DEE7] shadow-2xs hover:border-[#164B8A] transition-colors cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#526174]">Missing Evidentiary Docs</span>
            <FileCheck2 className="w-4 h-4 text-[#925500]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#14243A]">
            {missingDocs.length}
          </div>
          <div className="text-[11px] text-[#925500] flex items-center justify-between pt-1">
            <span>Requires upload before EVC</span>
            <span className="text-[#164B8A] group-hover:underline">Upload &rarr;</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => setActiveTab('EVC & Undertakings')}
          className="bg-white p-4 rounded border border-[#D8DEE7] shadow-2xs hover:border-[#164B8A] transition-colors cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#526174]">Pending Undertakings</span>
            <ClipboardList className="w-4 h-4 text-[#00756A]" />
          </div>
          <div className="text-2xl font-bold font-mono-data text-[#14243A]">
            {upcomingUndertakings.length}
          </div>
          <div className="text-[11px] text-[#526174] flex items-center justify-between pt-1">
            <span>Statutory compliance bonds</span>
            <span className="text-[#164B8A] group-hover:underline">View &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Deficiencies + EVC Inspection Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deficiencies Requiring Urgent Action */}
        <div className="lg:col-span-2 bg-white rounded border border-[#D8DEE7] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
            <div>
              <h2 className="text-sm font-bold text-[#14243A]">Open Scrutiny Deficiencies</h2>
              <p className="text-xs text-[#526174]">
                Identified through deterministic rule evaluation on Northfield Institute documents
              </p>
            </div>
            <button
              onClick={() => setActiveTab('Resolution Workspace')}
              className="text-xs text-[#164B8A] font-semibold hover:underline"
            >
              Open Workspace &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {openFindings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#17613B] bg-emerald-50 rounded border border-emerald-200">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-[#17613B]" />
                <p className="font-bold">All Deficiencies Satisfactorily Closed</p>
                <p className="text-[11px] mt-1 text-[#526174]">
                  Application dossier is ready for Scrutiny Committee final recommendation.
                </p>
              </div>
            ) : (
              openFindings.map((finding) => (
                <div
                  key={finding.id}
                  className="p-3.5 bg-[#F4F5F7] rounded border border-[#D8DEE7] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data font-bold text-[#164B8A]">{finding.id}</span>
                      <span className="text-[10px] text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded font-medium">
                        {finding.severity}
                      </span>
                      <span className="text-[10px] text-[#526174]">Due: {finding.dueDate}</span>
                    </div>
                    <div className="font-semibold text-[#14243A] leading-snug">
                      {finding.title}
                    </div>
                    <div className="text-[11px] text-[#526174] line-clamp-1">
                      Assigned: {finding.responsibleOwner}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => setActiveFindingForDetail(finding)}
                      className="px-2.5 py-1 text-xs font-semibold text-[#164B8A] bg-white border border-[#D8DEE7] rounded hover:bg-slate-50 transition-colors"
                    >
                      Resolution Card
                    </button>
                    <button
                      onClick={() => {
                        setActiveFindingForDetail(null);
                        setActiveTab('Resolution Workspace');
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#164B8A] hover:bg-[#103B6D] rounded transition-colors shadow-xs"
                    >
                      Correct &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: EVC Schedule & Audit Highlights */}
        <div className="space-y-6">
          {/* EVC Inspection Snapshot */}
          <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
              <span className="font-bold text-xs text-[#14243A] uppercase tracking-wider">
                EVC Inspection Roster
              </span>
              <span className="text-[11px] font-mono-data text-[#164B8A] bg-blue-50 px-2 py-0.5 rounded">
                {currentApplication?.evcDetails?.status}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-[#14243A]">
              <div>
                <span className="text-[#526174]">Chairman:</span>{' '}
                <strong className="text-[#14243A]">{currentApplication?.evcDetails?.chairman}</strong>
              </div>
              <div>
                <span className="text-[#526174]">Scheduled Visit:</span>{' '}
                <span className="font-mono-data font-semibold text-[#164B8A]">
                  {currentApplication?.evcDetails?.scheduledDate}
                </span>
              </div>
              <div>
                <span className="text-[#526174]">Inspection Venue:</span>{' '}
                <span className="text-[#14243A]">{currentApplication?.evcDetails?.venue}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#D8DEE7]">
              <button
                onClick={() => setActiveTab('EVC & Undertakings')}
                className="text-xs text-[#164B8A] font-semibold hover:underline flex items-center gap-1"
              >
                <span>View EVC verification checklist</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Recent Activity Log Snapshot */}
          <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
              <span className="font-bold text-xs text-[#14243A] uppercase tracking-wider">
                Recent Audit Trail
              </span>
              <button
                onClick={() => setActiveTab('Activity Log')}
                className="text-[11px] text-[#164B8A] hover:underline"
              >
                Full Log &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLog.slice(0, 4).map((entry) => (
                <div key={entry.id} className="text-xs border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[11px] text-[#526174]">
                    <span className="font-medium text-[#14243A]">{entry.actor}</span>
                    <span className="font-mono-data text-[10px]">
                      {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[#14243A] font-medium mt-0.5">{entry.action}</div>
                  <div className="text-[11px] text-[#526174] truncate">{entry.details}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
