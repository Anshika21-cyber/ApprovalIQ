import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  RotateCcw,
  PlayCircle,
  Building2,
  CheckCheck,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Role } from '../../types';

interface TopBarProps {
  onOpenResetModal: () => void;
  onOpenVideoModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenResetModal, onOpenVideoModal }) => {
  const {
    role,
    setRole,
    activeTab,
    setActiveTab,
    selectedAppId,
    setSelectedAppId,
    applications,
    currentApplication,
    notifications,
    markNotificationAsRead,
    startTour,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAppDropdownOpen, setIsAppDropdownOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (appRef.current && !appRef.current.contains(e.target as Node)) {
        setIsAppDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-[#D8DEE7] h-14 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Left: Breadcrumbs & App Selector */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2 text-xs text-[#526174] shrink-0 hidden md:flex">
          <span className="font-semibold text-[#14243A]">ApprovalIQ</span>
          <span>/</span>
          <span>{currentApplication?.institutionName.split(' ')[0]}</span>
          <span>/</span>
          <span className="text-[#14243A] font-medium">{activeTab}</span>
        </div>

        {/* Application Selector */}
        <div className="relative" ref={appRef}>
          <button
            onClick={() => setIsAppDropdownOpen(!isAppDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-[#14243A] bg-[#F4F5F7] hover:bg-[#EBEFF4] border border-[#D8DEE7] transition-colors"
            title="Switch Sample Application"
          >
            <Building2 className="w-3.5 h-3.5 text-[#164B8A]" />
            <span className="max-w-[140px] sm:max-w-[200px] truncate">
              {currentApplication?.institutionName}
            </span>
            <ChevronDown className="w-3 h-3 text-[#526174]" />
          </button>

          {isAppDropdownOpen && (
            <div className="absolute left-0 mt-1 w-72 bg-white border border-[#D8DEE7] rounded shadow-sm py-1 z-30">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-[#526174] uppercase tracking-wider border-b border-[#D8DEE7]">
                Select Synthetic Application
              </div>
              {applications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedAppId(app.id);
                    setIsAppDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-[#F4F5F7] transition-colors ${
                    app.id === selectedAppId ? 'bg-[#F4F5F7] font-semibold text-[#164B8A]' : 'text-[#14243A]'
                  }`}
                >
                  <span className="truncate">{app.institutionName}</span>
                  <span className="text-[11px] text-[#526174]">
                    {app.id} · Stage: {app.stage}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Watch Workflow Tour Button */}
        <button
          onClick={startTour}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-[#164B8A] bg-blue-50/60 hover:bg-blue-50 border border-blue-200 rounded transition-colors whitespace-nowrap"
          title="Start interactive 60-second guided tour"
        >
          <PlayCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Watch workflow</span>
        </button>

        {/* Demo Role Switcher */}
        <div className="flex items-center bg-[#F4F5F7] border border-[#D8DEE7] rounded p-0.5 text-xs">
          <button
            onClick={() => setRole('Institute Coordinator')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-[11px] font-medium ${
              role === 'Institute Coordinator'
                ? 'bg-white text-[#14243A] shadow-xs'
                : 'text-[#526174] hover:text-[#14243A]'
            }`}
          >
            Coordinator
          </button>
          <button
            onClick={() => setRole('Reviewing Officer')}
            className={`px-2 py-1 rounded transition-colors whitespace-nowrap text-[11px] font-medium ${
              role === 'Reviewing Officer'
                ? 'bg-white text-[#164B8A] shadow-xs font-semibold'
                : 'text-[#526174] hover:text-[#14243A]'
            }`}
          >
            Reviewer
          </button>
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 rounded text-[#526174] hover:text-[#14243A] hover:bg-[#F4F5F7] relative transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#B42318] rounded-full" />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D8DEE7] rounded shadow-md z-30">
              <div className="px-3 py-2 border-b border-[#D8DEE7] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#14243A]">Application Alerts &amp; Events</span>
                <span className="text-[11px] text-[#526174]">{unreadCount} unread</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-[#D8DEE7]">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#526174]">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        setActiveTab(n.linkTab);
                        setIsNotifOpen(false);
                      }}
                      className={`p-3 text-xs hover:bg-[#F4F5F7] cursor-pointer transition-colors ${
                        !n.read ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-medium text-[#14243A]">{n.title}</span>
                        <span className="text-[10px] text-[#526174] whitespace-nowrap">
                          {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[#526174] text-[11px] mt-1 line-clamp-2">{n.message}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#164B8A] font-medium">
                        <span>Go to {n.linkTab} &rarr;</span>
                        {!n.read && <span className="text-[#B42318]">New</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data Button */}
        <button
          onClick={onOpenResetModal}
          className="p-1.5 rounded text-[#526174] hover:text-[#B42318] hover:bg-[#F4F5F7] transition-colors"
          title="Reset synthetic demo data to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* User Profile Pill */}
        <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-[#D8DEE7] text-xs">
          <div className="w-7 h-7 rounded bg-[#14243A] text-white flex items-center justify-center font-semibold text-[11px]">
            {role === 'Institute Coordinator' ? 'RN' : 'AS'}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-[#14243A] leading-tight text-[11px]">
              {role === 'Institute Coordinator' ? 'Er. Ramesh Narayan' : 'Dr. A. K. Sharma'}
            </span>
            <span className="text-[10px] text-[#526174] leading-tight">
              {role === 'Institute Coordinator' ? 'Dean, Northfield' : 'Regional Scrutiny Officer'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
