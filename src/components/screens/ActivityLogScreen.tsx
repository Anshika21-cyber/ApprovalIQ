import React, { useState } from 'react';
import { History, Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActivityLogScreen: React.FC = () => {
  const { auditLog, selectedAppId } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const filteredLogs = auditLog.filter((entry) => {
    const matchesSearch =
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEntity = entityFilter === 'All' || entry.entityType === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Application', 'Action', 'Entity Type', 'Reference', 'Details'];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.actor}"`,
      log.actorRole,
      log.applicationId,
      `"${log.action}"`,
      log.entityType,
      `"${log.entityReference}"`,
      `"${log.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `approval_iq_audit_log_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded border border-[#D8DEE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#14243A]">System Activity &amp; Audit Trail</h2>
            <span className="text-[11px] font-mono-data text-[#526174] bg-[#F4F5F7] px-2 py-0.5 rounded border border-[#D8DEE7]">
              Immutable Log
            </span>
          </div>
          <p className="text-xs text-[#526174] mt-0.5">
            Traceable historical record of all checks, draft saves, uploads, reviewer acceptances, and finding closures.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-[#F4F5F7] text-[#14243A] border border-[#D8DEE7] rounded text-xs font-medium transition-colors shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-[#526174]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded border border-[#D8DEE7] flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#526174]" />
          <input
            type="text"
            placeholder="Search audit trail by actor, action, or document..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-1.5 text-xs bg-[#F4F5F7] border border-[#D8DEE7] rounded text-[#14243A]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#526174]">Filter Entity:</span>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="p-1.5 bg-[#F4F5F7] border border-[#D8DEE7] rounded text-xs text-[#14243A]"
          >
            <option value="All">All Entities</option>
            <option value="Check">Checks</option>
            <option value="Document">Documents</option>
            <option value="Finding">Findings</option>
            <option value="Correction">Corrections</option>
            <option value="Review">Reviews</option>
          </select>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded border border-[#D8DEE7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4F5F7] text-[#526174] uppercase text-[10px] tracking-wider border-b border-[#D8DEE7]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor &amp; Role</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity &amp; Reference</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D8DEE7]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap font-mono-data text-[#526174]">
                    <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                    <div className="text-[10px] text-[#526174]/80">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-[#14243A]">{log.actor}</div>
                    <span className="text-[10px] font-mono-data text-[#526174]">{log.actorRole}</span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="font-medium text-[#164B8A] bg-blue-50/70 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                      {log.action}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="font-semibold text-[#14243A]">{log.entityReference}</div>
                    <span className="text-[10px] text-[#526174]">{log.entityType}</span>
                  </td>

                  <td className="py-3 px-3 text-[#526174] max-w-md leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
