import React from 'react';
import {
  ClipboardList,
  Calendar,
  UserCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const EVCUndertakingsScreen: React.FC = () => {
  const { currentApplication } = useApp();
  const evc = currentApplication?.evcDetails;
  const undertakings = currentApplication?.undertakings || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">
              Expert Visit Committee (EVC) &amp; Statutory Undertakings
            </h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              {evc?.committeeId || 'EVC Scheduled'}
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            Physical on-site inspection roster, verification assignments, and statutory institutional compliance bonds.
          </p>
        </div>
      </div>

      {/* EVC Inspection Details Card */}
      {evc ? (
        <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#14243A]">EVC Physical Verification Schedule</h3>
              <p className="text-xs text-[#526174]">
                Appointed by Regional Scrutiny Officer for campus infrastructure audit
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-[#164B8A] border border-blue-200">
              Status: {evc.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7] space-y-1">
              <span className="text-[10px] font-bold text-[#526174] uppercase tracking-wider block">
                Committee Chairman
              </span>
              <div className="font-semibold text-[#14243A]">{evc.chairman}</div>
              <span className="text-[11px] text-[#526174]">Senior Professor / External Expert</span>
            </div>

            <div className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7] space-y-1">
              <span className="text-[10px] font-bold text-[#526174] uppercase tracking-wider block">
                Scheduled Visit Date
              </span>
              <div className="font-semibold font-mono-data text-[#164B8A] text-sm">
                {evc.scheduledDate}
              </div>
              <span className="text-[11px] text-[#526174] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Greater Noida Campus
              </span>
            </div>

            <div className="p-3 bg-[#F4F5F7] rounded border border-[#D8DEE7] space-y-1">
              <span className="text-[10px] font-bold text-[#526174] uppercase tracking-wider block">
                Empanelled Subject Experts
              </span>
              {evc.memberExperts.map((exp, i) => (
                <div key={i} className="text-[#14243A] font-medium leading-tight">
                  • {exp}
                </div>
              ))}
            </div>
          </div>

          {/* Inspection Tasks Checklist */}
          <div className="pt-2">
            <span className="text-xs font-bold text-[#14243A] uppercase tracking-wider block mb-2">
              Assigned On-Site Verification Tasks:
            </span>
            <div className="divide-y divide-[#D8DEE7] border border-[#D8DEE7] rounded">
              {evc.tasks.map((task) => (
                <div key={task.id} className="p-3 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-data text-[10px] text-[#526174] bg-[#F4F5F7] px-1.5 py-0.2 rounded">
                        {task.id}
                      </span>
                      <span className="font-semibold text-[#14243A]">{task.title}</span>
                      <span className="text-[10px] text-[#526174]">({task.category})</span>
                    </div>
                    {task.notes && (
                      <p className="text-[11px] text-[#925500] pl-6 italic">
                        Prerequisite: {task.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[11px] text-[#526174]">{task.assignee}</span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-[#526174]">
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-white rounded border border-[#D8DEE7] text-center text-xs text-[#526174]">
          No physical visit committee scheduled for this application stage yet.
        </div>
      )}

      {/* Statutory Undertakings Section */}
      <div className="bg-white rounded border border-[#D8DEE7] p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#14243A]">Statutory Institutional Undertakings</h3>
            <p className="text-xs text-[#526174]">
              Mandatory legal bonds required under AICTE regulations prior to approval issuance
            </p>
          </div>
          <span className="text-xs font-mono-data text-[#526174]">
            {undertakings.filter((u) => u.status === 'Verified & Active').length} / {undertakings.length} Active
          </span>
        </div>

        <div className="divide-y divide-[#D8DEE7]">
          {undertakings.map((u) => (
            <div key={u.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data font-bold text-[#164B8A]">{u.id}</span>
                  <span className="font-semibold text-[#14243A]">{u.title}</span>
                </div>
                <div className="text-[11px] text-[#526174]">
                  Legal Clause: {u.legalClause} · Ref: {u.docReference}
                </div>
                <div className="text-[11px] text-[#526174]">
                  Responsible Officer: <span className="text-[#14243A] font-medium">{u.responsibleOfficer}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-[#526174] block">Deadline:</span>
                  <span className="font-mono-data text-xs text-[#14243A] font-medium">{u.submissionDeadline}</span>
                </div>

                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded ${
                    u.status === 'Verified & Active'
                      ? 'bg-emerald-50 text-[#17613B] border border-emerald-200'
                      : u.status === 'Under Review'
                      ? 'bg-blue-50 text-[#164B8A] border border-blue-200'
                      : 'bg-amber-50 text-[#925500] border border-amber-200'
                  }`}
                >
                  {u.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
