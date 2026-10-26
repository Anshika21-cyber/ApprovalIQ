import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HonestyBanner } from './components/layout/HonestyBanner';
import { TopBar } from './components/layout/TopBar';
import { Sidebar } from './components/layout/Sidebar';
import { GuidedTourBar } from './components/tour/GuidedTourBar';
import { ResetDemoModal } from './components/modals/ResetDemoModal';
import { VideoWalkthroughModal } from './components/modals/VideoWalkthroughModal';

// Features and Screens
import { OverviewScreen } from './components/screens/OverviewScreen';
import { ApplicationsScreen } from './components/screens/ApplicationsScreen';
import { Feature1ReadinessCheck } from './components/features/Feature1ReadinessCheck';
import { Feature2ResolutionCardDrawer } from './components/features/Feature2ResolutionCardDrawer';
import { Feature3CorrectionPreviewModal } from './components/features/Feature3CorrectionPreviewModal';
import { Feature4ChangeAwareReview } from './components/features/Feature4ChangeAwareReview';
import { Feature5ResolutionWorkspace } from './components/features/Feature5ResolutionWorkspace';
import { EVCUndertakingsScreen } from './components/screens/EVCUndertakingsScreen';
import { ActivityLogScreen } from './components/screens/ActivityLogScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { Menu, X } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    activeFindingForDetail,
    setActiveFindingForDetail,
    activeFindingForPreview,
    setActiveFindingForPreview,
    startTour,
  } = useApp();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'Overview':
        return <OverviewScreen />;
      case 'Applications':
        return <ApplicationsScreen />;
      case 'Readiness Check':
        return <Feature1ReadinessCheck />;
      case 'Resolution Workspace':
        return (
          <Feature5ResolutionWorkspace
            onOpenFindingDetail={(f) => setActiveFindingForDetail(f)}
            onOpenPreview={(f) => setActiveFindingForPreview(f)}
          />
        );
      case 'Review Queue':
        return <Feature4ChangeAwareReview />;
      case 'EVC & Undertakings':
        return <EVCUndertakingsScreen />;
      case 'Activity Log':
        return <ActivityLogScreen />;
      case 'Help & Guided Demo':
        return (
          <HelpScreen
            onOpenResetModal={() => setIsResetModalOpen(true)}
            onOpenVideoModal={() => setIsVideoModalOpen(true)}
          />
        );
      default:
        return <OverviewScreen />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F5F7] text-[#14243A]">
      {/* 1. Prototype Honesty Banner */}
      <HonestyBanner />

      {/* 2. Top-level Layout with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50">
            <div className="relative flex-1 max-w-xs w-full bg-[#14243A] h-full flex flex-col">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-4 right-4 text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
              <Sidebar />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-33px)] overflow-hidden">
          {/* Top Bar with Mobile Menu Button */}
          <div className="relative">
            <TopBar
              onOpenResetModal={() => setIsResetModalOpen(true)}
              onOpenVideoModal={() => setIsVideoModalOpen(true)}
            />
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden absolute left-2 top-3.5 p-1 text-[#14243A] hover:bg-[#F4F5F7] rounded z-20"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Guided Tour Banner (Shown when active) */}
          <GuidedTourBar />

          {/* Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveScreen()}
          </main>
        </div>
      </div>

      {/* Global Modals & Drawers */}
      <Feature2ResolutionCardDrawer
        finding={activeFindingForDetail}
        onClose={() => setActiveFindingForDetail(null)}
        onOpenPreview={(f) => {
          setActiveFindingForDetail(null);
          setActiveFindingForPreview(f);
        }}
      />

      <Feature3CorrectionPreviewModal
        finding={activeFindingForPreview}
        onClose={() => setActiveFindingForPreview(null)}
        onSubmitSuccess={() => {
          setActiveFindingForPreview(null);
        }}
      />

      <ResetDemoModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      <VideoWalkthroughModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        onLaunchInteractiveTour={startTour}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
