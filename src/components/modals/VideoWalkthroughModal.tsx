import React, { useState } from 'react';
import { Video, X, ExternalLink, Play, Info } from 'lucide-react';

interface VideoWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc?: string;
  onLaunchInteractiveTour: () => void;
}

export const VideoWalkthroughModal: React.FC<VideoWalkthroughModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  onLaunchInteractiveTour,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded border border-[#D8DEE7] shadow-xl max-w-2xl w-full p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#D8DEE7] pb-3">
          <div className="flex items-center gap-2">
            <Video className="w-4 h-4 text-[#164B8A]" />
            <h3 className="text-sm font-semibold text-[#14243A]">ApprovalIQ Workflow Walkthrough</h3>
          </div>
          <button onClick={onClose} className="text-[#526174] hover:text-[#14243A] p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {videoSrc ? (
          <div className="space-y-3">
            <div className="aspect-video bg-black rounded overflow-hidden">
              <video
                controls
                src={videoSrc}
                className="w-full h-full object-contain"
                aria-label="ApprovalIQ Workflow Walkthrough Video"
              >
                <track kind="captions" src="/captions.vtt" srcLang="en" label="English" default />
                Your browser does not support HTML5 video.
              </video>
            </div>
            <p className="text-xs text-[#526174]">
              Recorded institutional walkthrough illustrating pre-submission check, deficiency explanation, and reviewer closure.
            </p>
          </div>
        ) : (
          <div className="p-6 text-center bg-[#F4F5F7] rounded border border-[#D8DEE7] space-y-3">
            <div className="w-12 h-12 rounded bg-blue-100 text-[#164B8A] flex items-center justify-center mx-auto">
              <Info className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-[#14243A]">Interactive Guided Tour Active</h4>
              <p className="text-xs text-[#526174] max-w-md mx-auto">
                No external video URL is configured for this local prototype instance. Use the built-in, 60-second interactive workflow tour to experience the full connected pipeline live.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  onClose();
                  onLaunchInteractiveTour();
                }}
                className="px-4 py-2 bg-[#164B8A] hover:bg-[#103B6D] text-white text-xs font-semibold rounded shadow-xs transition-colors inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Interactive Tour Now
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-[#D8DEE7] text-[11px] text-[#526174]">
          <span>Prototype Honest Notice: Video player only mounts configured media sources.</span>
          <button onClick={onClose} className="px-3 py-1 border border-[#D8DEE7] rounded hover:bg-[#F4F5F7]">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
