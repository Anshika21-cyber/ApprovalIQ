import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  FolderKanban,
  FileSearch,
  Building,
  ClipboardList,
  History,
  HelpCircle,
  CheckSquare,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentFindings, currentDocuments, role } = useApp();

  const openFindingsCount = currentFindings.filter((f) => f.status !== 'Closed').length;
  const pendingReviewDocsCount = currentDocuments.filter(
    (d) => d.status === 'Pending verification'
  ).length;

  const navItems = [
    {
      id: 'Overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'Applications',
      label: 'Applications',
      icon: Building,
      badge: null,
    },
    {
      id: 'Readiness Check',
      label: 'Readiness Check',
      subtitle: 'Feature 1 · Pre-submission',
      icon: FileCheck2,
      badge: null,
    },
    {
      id: 'Resolution Workspace',
      label: 'Resolution Workspace',
      subtitle: 'Feature 5 & 2 · Deficiencies',
      icon: FolderKanban,
      badge: openFindingsCount > 0 ? openFindingsCount : null,
      badgeVariant: 'warning',
    },
    {
      id: 'Review Queue',
      label: 'Review Queue',
      subtitle: 'Feature 4 · Change-aware',
      icon: FileSearch,
      badge: pendingReviewDocsCount > 0 ? pendingReviewDocsCount : null,
      badgeVariant: 'action',
    },
    {
      id: 'EVC & Undertakings',
      label: 'EVC & Undertakings',
      icon: ClipboardList,
      badge: null,
    },
    {
      id: 'Activity Log',
      label: 'Activity Log',
      icon: History,
      badge: null,
    },
    {
      id: 'Help & Guided Demo',
      label: 'Help & Guided Demo',
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 bg-[#14243A] text-white flex flex-col shrink-0 select-none border-r border-[#14243A]">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded bg-[#164B8A] flex items-center justify-center text-white shrink-0 shadow-sm border border-white/15">
          <CheckSquare className="w-4 h-4 text-emerald-300" />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base tracking-tight text-white leading-none">
              ApprovalIQ
            </span>
          </div>
          <span className="text-[11px] text-slate-300 leading-tight mt-1 truncate">
            Institutional Approval &amp; Compliance
          </span>
        </div>
      </div>

      {/* Role Context Chip */}
      <div className="px-5 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
          Active Demo Perspective
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs font-medium text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00756A]" />
            {role}
          </span>
          <span className="text-[10px] text-slate-400">SIH26262</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs text-left transition-colors group ${
                isActive
                  ? 'bg-[#164B8A] text-white font-medium shadow-xs'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="flex flex-col min-w-0">
                  <span className="truncate">{item.label}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-slate-400 leading-none truncate">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {item.badge !== null && (
                <span
                  className={`text-[10px] font-mono-data px-1.5 py-0.5 rounded text-white shrink-0 ml-2 ${
                    item.badgeVariant === 'warning' ? 'bg-[#925500]' : 'bg-[#164B8A] border border-white/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-300">
          <span>AICTE APH Norms</span>
          <span className="font-mono-data text-[10px]">v2026.1</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
          Deterministic compliance &amp; dependency verification
        </p>
      </div>
    </aside>
  );
};
