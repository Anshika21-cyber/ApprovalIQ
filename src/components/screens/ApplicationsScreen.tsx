import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ApplicationStage } from '../../types';

export const ApplicationsScreen: React.FC = () => {
  const {
    applications,
    selectedAppId,
    setSelectedAppId,
    findings,
    setActiveTab,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('All');

  const STAGES: ApplicationStage[] = [
    'Draft',
    'Submitted',
    'Scrutiny',
    'Corrections',
    'Review',
    'Decision Pending',
  ];

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.institutionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.institutionCode.includes(searchQuery) ||
      app.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || app.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const getNextAction = (app: typeof applications[0], openCount: number) => {
    switch (app.stage) {
      case 'Corrections':
        return `${openCount} Deficiencies await replacement evidence from Institute`;
      case 'Scrutiny':
        return 'Regional Scrutiny Committee preliminary audit in progress';
      case 'Review':
        return 'Change-aware verification of replacement submissions';
      case 'Decision Pending':
        return 'Executive Committee approval order formulation';
      default:
        return 'Statutory document compilation';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#14243A]">Institutional Applications Registry</h2>
          <p className="text-xs text-[#526174] mt-0.5">
            Manage multi-institutional approval workflows, scrutiny stages, and assigned scrutiny officers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-[#526174]">Currently Selected:</span>
          <span className="text-xs font-bold text-[#164B8A] bg-blue-50 px-2 py-1 rounded border border-blue-200">
            {selectedAppId}
          </span>
        </div>
      </div>

      {/* Illustrative Stage Sequence Diagram */}
      <div className="bg-white p-4 rounded border border-[#D8DEE7] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#14243A] uppercase tracking-wider text-[11px]">
            Illustrative Scrutiny Stage Sequence
          </span>
          <span className="text-[11px] text-[#526174] italic">
            Sample progression framework — not a rigid single mandatory statutory path
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
          {STAGES.map((stg, i) => (
            <React.Fragment key={stg}>
              <div
                className={`px-3 py-1.5 rounded font-medium whitespace-nowrap shrink-0 border ${
                  stg === 'Corrections'
                    ? 'bg-[#164B8A] text-white border-[#164B8A]'
                    : 'bg-[#F4F5F7] text-[#526174] border-[#D8DEE7]'
                }`}
              >
                {stg}
              </div>
              {i < STAGES.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-[#526174] shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-3 rounded border border-[#D8DEE7] flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#526174]" />
          <input
            type="text"
            placeholder="Search by institution name, code, or app ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-1.5 text-xs bg-[#F4F5F7] border border-[#D8DEE7] rounded text-[#14243A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#526174]">Filter Stage:</span>
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="p-1.5 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
          >
            <option value="All">All Stages</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded border border-[#D8DEE7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4F5F7] text-[#526174] uppercase text-[10px] tracking-wider border-b border-[#D8DEE7]">
              <tr>
                <th className="py-2.5 px-3">Institution &amp; ID</th>
                <th className="py-2.5 px-3">Application Type</th>
                <th className="py-2.5 px-3">Current Stage</th>
                <th className="py-2.5 px-3">Assigned Reviewer</th>
                <th className="py-2.5 px-3">Open Findings</th>
                <th className="py-2.5 px-3">Pending Next Action</th>
                <th className="py-2.5 px-3 text-right">Switch Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE7]">
              {filteredApps.map((app) => {
                const appFindings = findings.filter(
                  (f) => f.applicationId === app.id && f.status !== 'Closed'
                );
                const isSelected = app.id === selectedAppId;

                return (
                  <tr
                    key={app.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-[#14243A] leading-snug">
                        {app.institutionName}
                      </div>
                      <div className="text-[11px] font-mono-data text-[#526174]">
                        {app.id} · Portal Ref: {app.institutionCode}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-[#14243A]">{app.applicationType}</td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-semibold text-xs text-[#164B8A] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                        {app.stage}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-[#526174]">{app.assignedReviewer}</td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`font-mono-data font-semibold text-xs px-2 py-0.5 rounded ${
                          appFindings.length > 0
                            ? 'bg-amber-50 text-[#925500] border border-amber-200'
                            : 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                        }`}
                      >
                        {appFindings.length} Open
                      </span>
                    </td>

                    <td className="py-3 px-3 max-w-[220px]">
                      <span className="text-[11px] text-[#526174] leading-snug block">
                        {getNextAction(app, appFindings.length)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {isSelected ? (
                        <span className="text-xs text-[#17613B] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Active
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedAppId(app.id);
                            setActiveTab('Overview');
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-100 text-[#164B8A] border border-[#D8DEE7] rounded text-xs font-semibold transition-colors"
                        >
                          Select &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
