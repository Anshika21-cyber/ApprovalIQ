import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Application,
  Document,
  Finding,
  AuditEvent,
  AppNotification,
  CheckResult,
  CorrectionDraft,
  ReassessmentPreviewResult,
  DocumentVersion,
} from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_FINDINGS,
  INITIAL_AUDIT_LOG,
  INITIAL_NOTIFICATIONS,
  SAMPLE_REPLACEMENTS,
} from '../fixtures/syntheticData';
import { DependencyEngine } from '../engine/dependencyEngine';

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedAppId: string;
  setSelectedAppId: (id: string) => void;
  applications: Application[];
  documents: Document[];
  findings: Finding[];
  auditLog: AuditEvent[];
  notifications: AppNotification[];
  currentApplication: Application | undefined;
  currentDocuments: Document[];
  currentFindings: Finding[];
  currentCheckResults: CheckResult[];
  activeFindingForDetail: Finding | null;
  setActiveFindingForDetail: (finding: Finding | null) => void;
  activeFindingForPreview: Finding | null;
  setActiveFindingForPreview: (finding: Finding | null) => void;
  lastCheckRunAt: string | null;
  runReadinessCheck: () => void;
  saveCorrectionDraft: (findingId: string, draft: Omit<CorrectionDraft, 'id' | 'lastSaved'>) => void;
  runCorrectionPreview: (findingId: string, draft: Partial<CorrectionDraft>) => ReassessmentPreviewResult | null;
  submitCorrection: (
    findingId: string,
    targetDocCode: string,
    sampleReplacementId: string | null,
    manualFields: Record<string, string>,
    explanation: string
  ) => boolean;
  acceptEvidence: (docId: string, versionNumber: number, notes: string) => boolean;
  returnEvidence: (docId: string, versionNumber: number, reason: string) => boolean;
  closeFinding: (findingId: string, closureReason: string) => { success: boolean; error?: string };
  sendClarification: (findingId: string, message: string) => void;
  assignFindingOwner: (findingId: string, newOwner: string) => void;
  attachArbitraryFile: (docCode: string, file: File) => { success: boolean; error?: string };
  markNotificationAsRead: (id: string) => void;
  resetDemoData: () => void;
  // Guided Tour
  isTourActive: boolean;
  tourStep: number;
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
}

const STORAGE_KEY = 'approval_iq_v1_store';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('Institute Coordinator');
  const [activeTab, setActiveTab] = useState<string>('Overview');
  const [selectedAppId, setSelectedAppId] = useState<string>('APP-2026-NIT-0492');

  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.applications || INITIAL_APPLICATIONS;
      } catch (e) {
        console.error('Failed to restore applications from storage', e);
      }
    }
    return INITIAL_APPLICATIONS;
  });

  const [documents, setDocuments] = useState<Document[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.documents || INITIAL_DOCUMENTS;
      } catch (e) {
        console.error('Failed to restore documents from storage', e);
      }
    }
    return INITIAL_DOCUMENTS;
  });

  const [findings, setFindings] = useState<Finding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.findings || INITIAL_FINDINGS;
      } catch (e) {
        console.error('Failed to restore findings from storage', e);
      }
    }
    return INITIAL_FINDINGS;
  });

  const [auditLog, setAuditLog] = useState<AuditEvent[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.auditLog || INITIAL_AUDIT_LOG;
      } catch (e) {
        console.error('Failed to restore auditLog from storage', e);
      }
    }
    return INITIAL_AUDIT_LOG;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.notifications || INITIAL_NOTIFICATIONS;
      } catch (e) {
        console.error('Failed to restore notifications from storage', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [activeFindingForDetail, setActiveFindingForDetail] = useState<Finding | null>(null);
  const [activeFindingForPreview, setActiveFindingForPreview] = useState<Finding | null>(null);
  const [lastCheckRunAt, setLastCheckRunAt] = useState<string | null>('2026-10-24T14:30:00Z');

  // Tour state
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Sync state to local storage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          applications,
          documents,
          findings,
          auditLog,
          notifications,
        })
      );
    } catch (e) {
      console.warn('Unable to persist ApprovalIQ state to local storage', e);
    }
  }, [applications, documents, findings, auditLog, notifications]);

  // Derived current application and documents
  const currentApplication = applications.find((a) => a.id === selectedAppId);
  const currentDocuments = documents.filter((d) => d.applicationId === selectedAppId);
  const currentFindings = findings.filter((f) => f.applicationId === selectedAppId);

  // Compute live check results via the DependencyEngine
  const currentCheckResults = DependencyEngine.runAllChecks(currentDocuments);

  const addAuditEvent = (
    action: string,
    entityType: AuditEvent['entityType'],
    entityReference: string,
    details: string
  ) => {
    const newEvent: AuditEvent = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actor: role === 'Institute Coordinator' ? 'Er. Ramesh Narayan (Dean)' : 'Dr. A. K. Sharma (Scrutiny Officer)',
      actorRole: role,
      applicationId: selectedAppId,
      action,
      entityType,
      entityReference,
      details,
    };
    setAuditLog((prev) => [newEvent, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: AppNotification['type'],
    linkTab: string,
    relatedFindingId?: string
  ) => {
    const newNotif: AppNotification = {
      id: `NOTIF-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      linkTab,
      relatedFindingId,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const runReadinessCheck = () => {
    setLastCheckRunAt(new Date().toISOString());
    addAuditEvent(
      'Pre-Submission Readiness Check Executed',
      'Check',
      'Rules Evaluation Suite v2026.1',
      `Evaluated ${currentDocuments.length} registered documents across 5 sample regulatory conditions.`
    );
  };

  const saveCorrectionDraft = (
    findingId: string,
    draftData: Omit<CorrectionDraft, 'id' | 'lastSaved'>
  ) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          const draft: CorrectionDraft = {
            id: `DFT-${Date.now().toString().slice(-4)}`,
            findingId,
            targetDocId: draftData.targetDocId,
            proposedDocSampleId: draftData.proposedDocSampleId,
            proposedFields: draftData.proposedFields,
            explanation: draftData.explanation,
            lastSaved: new Date().toISOString(),
          };
          return {
            ...f,
            status: f.status === 'Action required' ? 'Draft correction' : f.status,
            correctionDraft: draft,
          };
        }
        return f;
      })
    );

    addAuditEvent(
      'Correction Draft Saved',
      'Correction',
      findingId,
      'Saved draft values for conditional reassessment preview.'
    );
  };

  const runCorrectionPreview = (
    findingId: string,
    draft: Partial<CorrectionDraft>
  ): ReassessmentPreviewResult | null => {
    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return null;

    const targetDoc = documents.find((d) => d.id === finding.assignedDocId);
    if (!targetDoc) return null;

    let sampleDoc = undefined;
    if (draft.proposedDocSampleId === 'SAMPLE-REPL-A') {
      sampleDoc = SAMPLE_REPLACEMENTS.REPLACEMENT_A;
    } else if (draft.proposedDocSampleId === 'SAMPLE-REPL-B') {
      sampleDoc = SAMPLE_REPLACEMENTS.REPLACEMENT_B;
    } else if (draft.proposedDocSampleId === 'SAMPLE-NBC-B') {
      sampleDoc = SAMPLE_REPLACEMENTS.SAMPLE_NBC_FORM_B;
    } else if (draft.proposedDocSampleId === 'SAMPLE-FIRE-RENEW') {
      sampleDoc = SAMPLE_REPLACEMENTS.SAMPLE_FIRE_NOC_RENEWED;
    }

    return DependencyEngine.runCorrectionPreview(
      currentDocuments,
      currentFindings,
      targetDoc.code,
      draft.proposedFields || {},
      sampleDoc
    );
  };

  const submitCorrection = (
    findingId: string,
    targetDocCode: string,
    sampleReplacementId: string | null,
    manualFields: Record<string, string>,
    explanation: string
  ): boolean => {
    // 1. Locate target document
    const docIndex = documents.findIndex((d) => d.code === targetDocCode && d.applicationId === selectedAppId);
    if (docIndex === -1) return false;

    const targetDoc = documents[docIndex];
    const nextVerNum = targetDoc.versions.length + 1;

    let fieldsToUse: Record<string, any> = {};

    if (sampleReplacementId === 'SAMPLE-REPL-A') {
      fieldsToUse = { ...SAMPLE_REPLACEMENTS.REPLACEMENT_A.extractedFields };
    } else if (sampleReplacementId === 'SAMPLE-REPL-B') {
      fieldsToUse = { ...SAMPLE_REPLACEMENTS.REPLACEMENT_B.extractedFields };
    } else if (sampleReplacementId === 'SAMPLE-NBC-B') {
      fieldsToUse = { ...SAMPLE_REPLACEMENTS.SAMPLE_NBC_FORM_B.extractedFields };
    } else if (sampleReplacementId === 'SAMPLE-FIRE-RENEW') {
      fieldsToUse = { ...SAMPLE_REPLACEMENTS.SAMPLE_FIRE_NOC_RENEWED.extractedFields };
    } else {
      const baseFields = targetDoc.versions[targetDoc.versions.length - 1]?.extractedFields || {};
      fieldsToUse = { ...baseFields };
    }

    // Apply manual overrides
    Object.entries(manualFields).forEach(([k, v]) => {
      fieldsToUse[k] = {
        key: k,
        label: k.replace(/_/g, ' ').toUpperCase(),
        value: v,
        confidence: 'Manual',
      };
    });

    const newVersion: DocumentVersion = {
      versionNumber: nextVerNum,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan (Institute Coordinator)',
      filename: `${targetDoc.code.toLowerCase()}_v${nextVerNum}_rectified.pdf`,
      fileSize: '2.8 MB',
      isSample: true,
      extractedFields: fieldsToUse,
      reviewNotes: explanation,
    };

    const updatedDocuments = [...documents];
    updatedDocuments[docIndex] = {
      ...targetDoc,
      status: 'Pending verification',
      currentVersionNumber: nextVerNum,
      versions: [...targetDoc.versions, newVersion],
    };
    setDocuments(updatedDocuments);

    // 2. Update Finding status to 'Submitted for review'
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            status: 'Submitted for review',
          };
        }
        return f;
      })
    );

    // 3. Audit log & Notification for Reviewer
    addAuditEvent(
      'Replacement Evidence Submitted',
      'Document',
      `${targetDoc.title} (v${nextVerNum})`,
      `Submitted replacement addressing ${findingId}: "${explanation}"`
    );

    addNotification(
      'New Evidence Submitted for Review',
      `${targetDoc.title} (v${nextVerNum}) was submitted for ${selectedAppId}. Reviewer verification required.`,
      'submitted',
      'Review Queue',
      findingId
    );

    return true;
  };

  const acceptEvidence = (docId: string, versionNumber: number, notes: string): boolean => {
    if (!notes.trim()) return false;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const updatedVersions = d.versions.map((v) => {
            if (v.versionNumber === versionNumber) {
              return {
                ...v,
                reviewDecision: 'Accepted' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Dr. A. K. Sharma (Reviewing Officer)',
                reviewNotes: notes,
              };
            }
            return v;
          });
          return {
            ...d,
            status: 'Accepted' as const,
            versions: updatedVersions,
          };
        }
        return d;
      })
    );

    const doc = documents.find((d) => d.id === docId);
    addAuditEvent(
      'Evidence Formally Accepted',
      'Review',
      `${doc?.title || 'Document'} (v${versionNumber})`,
      `Reviewing Officer accepted evidence. Verification notes: "${notes}". Note: Evidence acceptance does not close findings automatically.`
    );

    addNotification(
      'Evidence Accepted by Reviewer',
      `${doc?.title || 'Document'} (v${versionNumber}) has been verified and accepted. Authorised finding closure can now be initiated.`,
      'closed',
      'Resolution Workspace'
    );

    return true;
  };

  const returnEvidence = (docId: string, versionNumber: number, reason: string): boolean => {
    if (!reason.trim()) return false;

    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id === docId) {
          const updatedVersions = d.versions.map((v) => {
            if (v.versionNumber === versionNumber) {
              return {
                ...v,
                reviewDecision: 'Returned for correction' as const,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'Dr. A. K. Sharma (Reviewing Officer)',
                returnReason: reason,
              };
            }
            return v;
          });
          return {
            ...d,
            status: 'Returned for correction' as const,
            versions: updatedVersions,
          };
        }
        return d;
      })
    );

    // Update related findings to 'Returned'
    setFindings((prev) =>
      prev.map((f) => {
        if (f.assignedDocId === docId && f.status === 'Submitted for review') {
          return { ...f, status: 'Returned' };
        }
        return f;
      })
    );

    const doc = documents.find((d) => d.id === docId);
    addAuditEvent(
      'Evidence Returned for Rectification',
      'Review',
      `${doc?.title || 'Document'} (v${versionNumber})`,
      `Reviewing Officer returned evidence. Reason: "${reason}"`
    );

    addNotification(
      'Evidence Returned by Scrutiny Officer',
      `${doc?.title || 'Document'} returned for correction: ${reason}`,
      'returned',
      'Resolution Workspace'
    );

    return true;
  };

  const closeFinding = (
    findingId: string,
    closureReason: string
  ): { success: boolean; error?: string } => {
    // 1. Role Authorization validation
    if (role !== 'Reviewing Officer') {
      return {
        success: false,
        error: 'Authorisation check failed: Only a designated Reviewing Officer can formally close a statutory deficiency. Please switch to the Reviewing Officer role.',
      };
    }

    // 2. Closure rationale validation
    if (!closureReason.trim()) {
      return { success: false, error: 'A formal closure rationale is mandatory.' };
    }

    const finding = findings.find((f) => f.id === findingId);
    if (!finding) return { success: false, error: 'Finding record not found.' };

    const targetDoc = documents.find((d) => d.id === finding.assignedDocId);
    if (!targetDoc) return { success: false, error: 'Supporting document not found.' };

    // 3. Strict validation: Required evidence must be Accepted
    if (targetDoc.status !== 'Accepted') {
      return {
        success: false,
        error: `Cannot close finding: Supporting evidence (${targetDoc.title}) is currently "${targetDoc.status}". It must be verified and Accepted first.`,
      };
    }

    // 4. Check reassessment status
    const currentCheck = currentCheckResults.find((c) => c.ruleId === finding.ruleId);
    if (currentCheck && currentCheck.status !== 'Appears satisfied') {
      return {
        success: false,
        error: `Cannot close finding: The reassessed check "${currentCheck.checkName}" has status "${currentCheck.status}". Closure requires "Appears satisfied".`,
      };
    }

    const latestVersion = targetDoc.versions[targetDoc.versions.length - 1];

    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            status: 'Closed',
            closureRecord: {
              closedBy: 'Dr. A. K. Sharma (Reviewing Officer)',
              closedAt: new Date().toISOString(),
              closureReason,
              acceptedEvidenceDocId: targetDoc.id,
              acceptedEvidenceVersion: latestVersion?.versionNumber || 1,
            },
          };
        }
        return f;
      })
    );

    addAuditEvent(
      'Finding Officially Closed',
      'Finding',
      findingId,
      `Authorised closure by Reviewing Officer. Rationale: "${closureReason}". Evidence verified: ${targetDoc.title} (v${latestVersion?.versionNumber}).`
    );

    addNotification(
      'Finding Formally Closed',
      `${findingId} (${finding.title}) has met all statutory closure criteria and is closed.`,
      'closed',
      'Resolution Workspace',
      findingId
    );

    return { success: true };
  };

  const sendClarification = (findingId: string, message: string) => {
    if (!message.trim()) return;

    const newMessage = {
      id: `CLR-${Date.now().toString().slice(-4)}`,
      author: role === 'Institute Coordinator' ? 'Er. Ramesh Narayan' : 'Dr. A. K. Sharma',
      role,
      timestamp: new Date().toISOString(),
      message,
    };

    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return {
            ...f,
            clarificationThread: [...f.clarificationThread, newMessage],
          };
        }
        return f;
      })
    );

    addAuditEvent(
      'Clarification Thread Updated',
      'Finding',
      findingId,
      `${role} posted clarification: "${message.slice(0, 60)}..."`
    );
  };

  const assignFindingOwner = (findingId: string, newOwner: string) => {
    setFindings((prev) =>
      prev.map((f) => {
        if (f.id === findingId) {
          return { ...f, responsibleOwner: newOwner };
        }
        return f;
      })
    );

    addAuditEvent(
      'Finding Reassigned',
      'Finding',
      findingId,
      `Responsible owner updated to ${newOwner}.`
    );
  };

  const attachArbitraryFile = (
    docCode: string,
    file: File
  ): { success: boolean; error?: string } => {
    // 1. File size validation (max 10 MB)
    if (file.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: `File size exceeds the 10 MB maximum limit (${(file.size / (1024 * 1024)).toFixed(1)} MB uploaded).`,
      };
    }

    // 2. File type validation (.pdf, .png, .jpg, .jpeg)
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg'];
    const lowerName = file.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isAllowed) {
      return {
        success: false,
        error: 'Unsupported file format. Please upload a valid document format (.pdf, .jpg, .png).',
      };
    }

    const docIndex = documents.findIndex((d) => d.code === docCode && d.applicationId === selectedAppId);
    if (docIndex === -1) {
      return { success: false, error: 'Target statutory document slot not found.' };
    }

    const targetDoc = documents[docIndex];
    const nextVer = targetDoc.versions.length + 1;

    const newVersion: DocumentVersion = {
      versionNumber: nextVer,
      uploadedAt: new Date().toISOString(),
      uploadedBy: role === 'Institute Coordinator' ? 'Er. Ramesh Narayan (Institute Coordinator)' : 'Dr. A. K. Sharma (Reviewing Officer)',
      filename: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      isSample: false,
      extractedFields: {},
      reviewNotes: 'Arbitrary manual upload. Automatic extraction is unavailable; sample structured documents are provided for deterministic evaluation.',
    };

    const updatedDocs = [...documents];
    updatedDocs[docIndex] = {
      ...targetDoc,
      status: 'Pending verification',
      currentVersionNumber: nextVer,
      versions: [...targetDoc.versions, newVersion],
    };

    setDocuments(updatedDocs);

    addAuditEvent(
      'Arbitrary Document Attached',
      'Document',
      `${targetDoc.title} (v${nextVer})`,
      `User uploaded manual file "${file.name}" (${file.type || 'application/pdf'}). Stored with synthetic parser disclosure.`
    );

    return { success: true };
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApplications(INITIAL_APPLICATIONS);
    setDocuments(INITIAL_DOCUMENTS);
    setFindings(INITIAL_FINDINGS);
    setAuditLog(INITIAL_AUDIT_LOG);
    setNotifications(INITIAL_NOTIFICATIONS);
    setSelectedAppId('APP-2026-NIT-0492');
    setRole('Institute Coordinator');
    setActiveTab('Overview');
    setActiveFindingForDetail(null);
    setActiveFindingForPreview(null);
    setLastCheckRunAt('2026-10-24T14:30:00Z');
    setIsTourActive(false);
    setTourStep(0);
  };

  // Guided Tour Handlers
  const startTour = () => {
    setIsTourActive(true);
    setTourStep(0);
    setActiveTab('Readiness Check');
  };

  const nextTourStep = () => {
    const next = tourStep + 1;
    if (next === 1) {
      setActiveTab('Readiness Check');
    } else if (next === 2) {
      setActiveTab('Resolution Workspace');
      const finding1 = findings.find((f) => f.id === 'FND-NIT-001');
      if (finding1) setActiveFindingForDetail(finding1);
    } else if (next === 3) {
      setActiveTab('Resolution Workspace');
      const finding1 = findings.find((f) => f.id === 'FND-NIT-001');
      if (finding1) setActiveFindingForPreview(finding1);
    } else if (next === 4) {
      setActiveTab('Review Queue');
      setRole('Reviewing Officer');
    } else if (next === 5) {
      setActiveTab('Activity Log');
    }
    setTourStep(next);
  };

  const prevTourStep = () => {
    const prev = Math.max(0, tourStep - 1);
    setTourStep(prev);
  };

  const endTour = () => {
    setIsTourActive(false);
    setTourStep(0);
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        activeTab,
        setActiveTab,
        selectedAppId,
        setSelectedAppId,
        applications,
        documents,
        findings,
        auditLog,
        notifications,
        currentApplication,
        currentDocuments,
        currentFindings,
        currentCheckResults,
        activeFindingForDetail,
        setActiveFindingForDetail,
        activeFindingForPreview,
        setActiveFindingForPreview,
        lastCheckRunAt,
        runReadinessCheck,
        saveCorrectionDraft,
        runCorrectionPreview,
        submitCorrection,
        acceptEvidence,
        returnEvidence,
        closeFinding,
        sendClarification,
        assignFindingOwner,
        attachArbitraryFile,
        markNotificationAsRead,
        resetDemoData,
        isTourActive,
        tourStep,
        startTour,
        nextTourStep,
        prevTourStep,
        endTour,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
