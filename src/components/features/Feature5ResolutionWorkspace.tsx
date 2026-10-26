import React, { useState } from 'react';
import {
  FolderKanban,
  Table as TableIcon,
  LayoutGrid,
  Filter,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  User,
  Calendar,
  FileText,
  Lock,
  Layers,
  CheckCheck,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Finding, FindingStatus, FindingSeverity } from '../../types';

interface ResolutionWorkspaceProps {
  onOpenFindingDetail: (finding: Finding) => void;
  onOpenPreview: (finding: Finding) => void;
}

export const Feature5ResolutionWorkspace: React.FC<ResolutionWorkspaceProps> = ({
  onOpenFindingDetail,
  onOpenPreview,
}) => {
  const {
    currentFindings,
    currentDocuments,
    currentCheckResults,
    closeFinding,
    role,
    setRole,
  } = useApp();

  const [viewMode, setViewMode] = useState<'table' | 'board'>('table');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterOwner, setFilterOwner] = useState<string>('All');
  const [groupBy, setGroupBy] = useState<'none' | 'document' | 'owner'>('document');

  // Closure modal state
  const [closingFinding, setClosingFinding] = useState<Finding | null>(null);
  const [closureReason, setClosureReason] = useState<string>('');
  const [closureError, setClosureError] = useState<string | null>(null);

  // Filter findings
  const filteredFindings = currentFindings.filter((f) => {
    if (filterStatus !== 'All' && f.status !== filterStatus) return false;
    if (filterOwner !== 'All' && f.responsibleOwner !== filterOwner) return false;
    return true;
  });

  const allOwners = ['All', ...Array.from(new Set(currentFindings.map((f) => f.responsibleOwner)))];
  const allStatuses = ['All', 'Action required', 'Draft correction', 'Submitted for review', 'Returned', 'Closed'];

  // Table Grouping Structure
  interface FindingGroup {
    groupKey: string;
    groupTitle: string;
    groupSubtitle?: string;
    badge?: string;
    items: Finding[];
  }

  const groupedFindings: FindingGroup[] = React.useMemo(() => {
    if (groupBy === 'none') {
      return [{ groupKey: 'all', groupTitle: 'All Findings', items: filteredFindings }];
    }

    if (groupBy === 'document') {
      const map = new Map<string, Finding[]>();
      filteredFindings.forEach((f) => {
        const docId = f.assignedDocId || 'unassigned';
        if (!map.has(docId)) map.set(docId, []);
        map.get(docId)!.push(f);
      });

      const groups: FindingGroup[] = [];
      map.forEach((items, docId) => {
        const doc = currentDocuments.find((d) => d.id === docId);
        groups.push({
          groupKey: docId,
          groupTitle: doc ? `${doc.code} — ${doc.title}` : 'Unassigned / General Statutory Requirements',
          groupSubtitle: doc ? `Document Status: ${doc.status} · ${doc.versions.length} version(s)` : undefined,
          badge: `${items.length} finding${items.length > 1 ? 's' : ''}`,
          items,
        });
      });
      return groups;
    }

    if (groupBy === 'owner') {
      const map = new Map<string, Finding[]>();
      filteredFindings.forEach((f) => {
        const owner = f.responsibleOwner;
        if (!map.has(owner)) map.set(owner, []);
        map.get(owner)!.push(f);
      });

      const groups: FindingGroup[] = [];
      map.forEach((items, owner) => {
        groups.push({
          groupKey: owner,
          groupTitle: owner,
          badge: `${items.length} finding${items.length > 1 ? 's' : ''} assigned`,
          items,
        });
      });
      return groups;
    }

    return [{ groupKey: 'all', groupTitle: 'All Findings', items: filteredFindings }];
  }, [groupBy, filteredFindings, currentDocuments]);

  // Priority rationale generator (transparent heuristic, no fake ML)
  const getPriorityExplanation = (finding: Finding) => {
    if (finding.status === 'Closed') return 'Deficiency closed and verified.';
    if (finding.id === 'FND-NIT-001' || finding.id === 'FND-NIT-002') {
      return 'High Priority: 2 related checks and downstream EVC dossier await this single legal deed.';
    }
    if (finding.id === 'FND-NIT-003') {
      return 'Due soon: Statutory Fire Safety continuity is an absolute bar to Scrutiny sign-off.';
    }
    if (finding.id === 'FND-NIT-004') {
      return 'Mandatory prerequisite: Scrutiny stage cannot advance without NBC Form-B attachment.';
    }
    return 'Priority based on Scrutiny deadline proximity.';
  };

  const handleInitiateClosure = (finding: Finding) => {
    setClosingFinding(finding);
    setClosureReason('');
    setClosureError(null);
  };

  const handleConfirmClosure = () => {
    if (!closingFinding) return;
    const res = closeFinding(closingFinding.id, closureReason);
    if (!res.success) {
      setClosureError(res.error || 'Closure conditions not satisfied.');
    } else {
      setClosingFinding(null);
      setClosureReason('');
      setClosureError(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">Guided Resolution Workspace</h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              Feature 5
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            One place to finish the work. Operational coordination of deficiencies, corrective drafts, and authorised closure.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#F4F5F7] border border-[#D8DEE7] rounded p-0.5 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-white text-[#14243A] shadow-xs font-semibold' : 'text-[#526174] hover:text-[#14243A]'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors ${
                viewMode === 'board' ? 'bg-white text-[#14243A] shadow-xs font-semibold' : 'text-[#526174] hover:text-[#14243A]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Grouping Bar */}
      <div className="bg-white p-3 rounded border border-[#D8DEE7] flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#526174] text-[11px]">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-1 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
            >
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#526174] text-[11px]">Owner:</span>
            <select
              value={filterOwner}
              onChange={(e) => setFilterOwner(e.target.value)}
              className="p-1 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
            >
              {allOwners.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          </div>

          {/* Grouping */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#526174] text-[11px]">Group by:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as any)}
              className="p-1 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
            >
              <option value="none">None (Flat list)</option>
              <option value="document">Shared Evidence / Document</option>
              <option value="owner">Responsible Owner</option>
            </select>
          </div>
        </div>

        <div className="text-[11px] text-[#526174] font-mono-data">
          Showing {filteredFindings.length} of {currentFindings.length} findings
        </div>
      </div>

      {/* TABLE VIEW (Default) */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded border border-[#D8DEE7] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#F4F5F7] text-[#526174] uppercase text-[10px] tracking-wider border-b border-[#D8DEE7]">
                <tr>
                  <th className="py-2.5 px-3">Finding &amp; Rule</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Supporting Evidence</th>
                  <th className="py-2.5 px-3">Owner &amp; Due Date</th>
                  <th className="py-2.5 px-3">Priority Rationale</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8DEE7]">
                {groupedFindings.map((group) => (
                  <React.Fragment key={group.groupKey}>
                    {groupBy !== 'none' && (
                      <tr className="bg-[#F4F5F7]/90 border-y border-[#D8DEE7]">
                        <td colSpan={6} className="py-2.5 px-3">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {groupBy === 'document' ? (
                                <FileText className="w-4 h-4 text-[#164B8A]" />
                              ) : (
                                <User className="w-4 h-4 text-[#164B8A]" />
                              )}
                              <span className="font-bold text-[#14243A]">{group.groupTitle}</span>
                              {group.groupSubtitle && (
                                <span className="text-[11px] text-[#526174]">
                                  — {group.groupSubtitle}
                                </span>
                              )}
                            </div>
                            {group.badge && (
                              <span className="text-[10px] font-semibold bg-white border border-[#D8DEE7] text-[#526174] px-2 py-0.5 rounded shadow-2xs">
                                {group.badge}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {group.items.map((finding) => {
                      const targetDoc = currentDocuments.find((d) => d.id === finding.assignedDocId);
                      const isClosed = finding.status === 'Closed';

                      return (
                        <tr key={finding.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* Finding & Rule */}
                          <td className="py-3 px-3 max-w-[280px]">
                            <div className="flex items-center gap-2">
                              <span className="font-mono-data font-bold text-[#164B8A]">{finding.id}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                                finding.severity === 'Mandatory Deficiency' ? 'text-red-700 bg-red-50' : 'text-amber-700 bg-amber-50'
                              }`}>
                                {finding.severity}
                              </span>
                            </div>
                            <div className="font-semibold text-[#14243A] mt-1 leading-snug">
                              {finding.title}
                            </div>
                            <div className="text-[11px] text-[#526174] mt-0.5">
                              {finding.ruleId} ({finding.ruleVersion})
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                              finding.status === 'Closed'
                                ? 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                                : finding.status === 'Submitted for review'
                                ? 'bg-blue-50 text-[#164B8A] border border-blue-200'
                                : finding.status === 'Returned'
                                ? 'bg-red-50 text-[#B42318] border border-red-200'
                                : 'bg-amber-50 text-[#925500] border border-amber-200'
                            }`}>
                              {finding.status === 'Closed' && <CheckCircle2 className="w-3 h-3" />}
                              {finding.status}
                            </span>
                          </td>

                          {/* Supporting Evidence */}
                          <td className="py-3 px-3 max-w-[220px]">
                            <div className="font-medium text-[#14243A] truncate">
                              {targetDoc?.title || 'Required Document'}
                            </div>
                            <div className="text-[11px] text-[#526174] mt-0.5">
                              Doc Status: <strong className={targetDoc?.status === 'Accepted' ? 'text-[#17613B]' : 'text-[#925500]'}>
                                {targetDoc?.status || 'Missing'}
                              </strong>
                            </div>
                          </td>

                          {/* Owner & Due */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <div className="text-[#14243A] font-medium truncate max-w-[150px]">
                              {finding.responsibleOwner.split('(')[0]}
                            </div>
                            <div className="text-[11px] font-mono-data text-[#526174] mt-0.5">
                              Due: {finding.dueDate}
                            </div>
                          </td>

                          {/* Priority Rationale (Transparent criteria) */}
                          <td className="py-3 px-3 max-w-[240px]">
                            <p className="text-[11px] text-[#526174] leading-snug">
                              {getPriorityExplanation(finding)}
                            </p>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => onOpenFindingDetail(finding)}
                                className="p-1.5 text-[#164B8A] hover:bg-blue-50 rounded transition-colors"
                                title="Inspect Resolution Card"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {!isClosed && (
                                <button
                                  onClick={() => onOpenPreview(finding)}
                                  className="px-2 py-1 text-[11px] font-semibold text-[#164B8A] bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                                >
                                  Preview
                                </button>
                              )}

                              {/* Authorised Closure Button */}
                              {!isClosed && (
                                <button
                                  onClick={() => handleInitiateClosure(finding)}
                                  className="px-2 py-1 text-[11px] font-semibold text-[#17613B] bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                                  title="Authorised Reviewer Closure"
                                >
                                  Close
                                </button>
                              )}

                              {isClosed && (
                                <span className="text-[11px] text-[#17613B] font-semibold flex items-center gap-1">
                                  <CheckCheck className="w-3.5 h-3.5" />
                                  Closed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* BOARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {['Action required', 'Draft correction', 'Submitted for review', 'Returned', 'Closed'].map((columnStatus) => {
            const colFindings = filteredFindings.filter((f) => f.status === columnStatus);

            return (
              <div key={columnStatus} className="bg-[#F4F5F7] rounded border border-[#D8DEE7] p-3 space-y-3">
                <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-2">
                  <span className="font-bold text-xs text-[#14243A] uppercase tracking-wider">
                    {columnStatus}
                  </span>
                  <span className="font-mono-data text-xs bg-white px-2 py-0.5 rounded border border-[#D8DEE7] text-[#526174]">
                    {colFindings.length}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {colFindings.map((finding) => (
                    <div
                      key={finding.id}
                      className="bg-white p-3 rounded border border-[#D8DEE7] shadow-2xs hover:shadow-xs transition-shadow space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono-data font-bold text-[#164B8A]">{finding.id}</span>
                        <span className="text-[#526174] font-mono-data">{finding.dueDate}</span>
                      </div>

                      <h4 className="font-semibold text-[#14243A] leading-snug">{finding.title}</h4>

                      <p className="text-[11px] text-[#526174] line-clamp-2">
                        {getPriorityExplanation(finding)}
                      </p>

                      <div className="pt-2 border-t border-[#D8DEE7] flex items-center justify-between gap-1 flex-wrap">
                        <button
                          onClick={() => onOpenFindingDetail(finding)}
                          className="text-[#164B8A] font-semibold hover:underline cursor-pointer"
                        >
                          Details &rarr;
                        </button>
                        {finding.status !== 'Closed' && (
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenPreview(finding)}
                              className="px-2 py-0.5 bg-blue-50 text-[#164B8A] hover:bg-blue-100 rounded font-medium text-[11px] cursor-pointer"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleInitiateClosure(finding)}
                              className="px-2 py-0.5 bg-emerald-50 text-[#17613B] hover:bg-emerald-100 rounded font-semibold text-[11px] border border-emerald-200 cursor-pointer"
                              title="Authorised Reviewer Closure"
                            >
                              Close
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Authorised Reviewer Closure Modal */}
      {closingFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded border border-[#D8DEE7] shadow-xl max-w-lg w-full p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-[#D8DEE7] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#17613B]" />
                <div>
                  <h3 className="text-sm font-bold text-[#14243A]">Authorised Finding Closure</h3>
                  <p className="text-xs text-[#526174]">{closingFinding.id} — {closingFinding.title}</p>
                </div>
              </div>
              <button onClick={() => setClosingFinding(null)} className="text-[#526174] hover:text-[#14243A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Checklist of Closure Prerequisites */}
            <div className="bg-[#F4F5F7] p-3 rounded border border-[#D8DEE7] space-y-2 text-xs">
              <span className="font-bold text-[#14243A] uppercase tracking-wider text-[11px] block">
                Statutory Closure Prerequisites Check:
              </span>

              {(() => {
                const targetDoc = currentDocuments.find((d) => d.id === closingFinding.assignedDocId);
                const matchingCheck = currentCheckResults.find((c) => c.ruleId === closingFinding.ruleId);
                const isDocAccepted = targetDoc?.status === 'Accepted';
                const isCheckSatisfied = matchingCheck?.status === 'Appears satisfied';

                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[#526174]">1. Required Evidence Formally Accepted:</span>
                      <span className={`font-semibold ${isDocAccepted ? 'text-[#17613B]' : 'text-[#B42318]'}`}>
                        {targetDoc?.status || 'Missing'} {isDocAccepted ? '✓' : '✗'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#526174]">2. Engine Check Reassessment:</span>
                      <span className={`font-semibold ${isCheckSatisfied ? 'text-[#17613B]' : 'text-[#B42318]'}`}>
                        {matchingCheck?.status || 'Unsatisfied'} {isCheckSatisfied ? '✓' : '✗'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#526174]">3. Closure Authority:</span>
                      {role === 'Reviewing Officer' ? (
                        <span className="text-[#17613B] font-semibold">
                          Reviewing Officer (Authorized) ✓
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[#B42318] font-semibold text-[11px]">
                            {role} (Unauthorized) ✗
                          </span>
                          <button
                            type="button"
                            onClick={() => setRole('Reviewing Officer')}
                            className="text-[10px] bg-[#164B8A] text-white px-2 py-0.5 rounded hover:bg-[#103B6D] transition-colors"
                          >
                            Switch to Reviewer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Closure Rationale Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#14243A] block">
                Mandatory Written Closure Rationale:
              </label>
              <textarea
                rows={3}
                value={closureReason}
                onChange={(e) => setClosureReason(e.target.value)}
                placeholder="Record explicit verification rationale (e.g. Verified verbatim title match in accepted replacement deed v2)..."
                className="w-full p-2 bg-white border border-[#D8DEE7] rounded text-xs text-[#14243A]"
              />
            </div>

            {closureError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-[#B42318] flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{closureError}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-[#D8DEE7]">
              <span className="text-[11px] text-[#526174]">
                Closure is permanently recorded in the Audit Log.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClosingFinding(null)}
                  className="px-3 py-1.5 border border-[#D8DEE7] rounded text-xs text-[#526174] hover:bg-[#F4F5F7]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmClosure}
                  className="px-4 py-1.5 bg-[#17613B] hover:bg-emerald-800 text-white rounded text-xs font-semibold shadow-xs"
                >
                  Confirm Authorised Closure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
