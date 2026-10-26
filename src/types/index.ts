export type Role = 'Institute Coordinator' | 'Reviewing Officer';

export type ApplicationStage =
  | 'Draft'
  | 'Submitted'
  | 'Scrutiny'
  | 'Corrections'
  | 'Review'
  | 'Decision Pending';

export type DocumentStatus =
  | 'Missing'
  | 'Uploaded'
  | 'Pending verification'
  | 'Accepted'
  | 'Returned for correction';

export type CheckStatus =
  | 'Appears satisfied'
  | 'Potential issue'
  | 'Insufficient evidence'
  | 'Official review required';

export type FindingStatus =
  | 'Action required'
  | 'Draft correction'
  | 'Submitted for review'
  | 'Returned'
  | 'Closed';

export type FindingSeverity =
  | 'Mandatory Deficiency'
  | 'Advisory Concern'
  | 'Clarification Required';

export interface ExtractedField {
  key: string;
  label: string;
  value: string;
  confidence: 'Exact Match' | 'Sample High' | 'Sample Disclosed' | 'Manual';
  pageReference?: string;
  sourceSection?: string;
}

export interface DocumentVersion {
  versionNumber: number;
  uploadedAt: string;
  uploadedBy: string;
  filename: string;
  fileSize: string;
  isSample: boolean;
  extractedFields: Record<string, ExtractedField>;
  reviewNotes?: string;
  reviewDecision?: 'Accepted' | 'Returned for correction';
  reviewedAt?: string;
  reviewedBy?: string;
  returnReason?: string;
}

export interface Document {
  id: string;
  applicationId: string;
  code: string; // e.g. DOC-INST-PROF
  title: string;
  category: 'Institutional Governance' | 'Statutory Approvals' | 'Infrastructure Compliance';
  isRequired: boolean;
  status: DocumentStatus;
  currentVersionNumber: number;
  versions: DocumentVersion[];
}

export interface Rule {
  id: string;
  version: string;
  title: string;
  clauseReference: string;
  category: string;
  description: string;
  severity: FindingSeverity;
  closurePrerequisite: string;
}

export interface CheckResult {
  checkId: string;
  ruleId: string;
  ruleVersion: string;
  checkName: string;
  category: string;
  status: CheckStatus;
  comparedDocuments: string[];
  comparedValues: {
    fieldLabel: string;
    docTitle: string;
    value: string;
  }[];
  explanation: string;
  findingId?: string;
  requiresReassessment?: boolean;
}

export interface ClarificationMessage {
  id: string;
  author: string;
  role: Role;
  timestamp: string;
  message: string;
}

export interface CorrectionDraft {
  id: string;
  findingId: string;
  targetDocId: string;
  proposedDocSampleId?: string;
  proposedFields: Record<string, string>;
  explanation: string;
  lastSaved: string;
}

export interface Finding {
  id: string;
  applicationId: string;
  ruleId: string;
  ruleVersion: string;
  title: string;
  severity: FindingSeverity;
  status: FindingStatus;
  supportingEvidence: {
    docId: string;
    docTitle: string;
    versionNumber: number;
    fieldKeys: string[];
    pageRef?: string;
  }[];
  requirementExplanation: string;
  whyItMatters: string;
  whatElseAffected: string[];
  responsibleOwner: string;
  dueDate: string;
  correctiveEvidenceRequired: string;
  closureCriteria: string;
  assignedDocId?: string;
  correctionDraft?: CorrectionDraft;
  clarificationThread: ClarificationMessage[];
  closureRecord?: {
    closedBy: string;
    closedAt: string;
    closureReason: string;
    acceptedEvidenceDocId: string;
    acceptedEvidenceVersion: number;
  };
}

export interface InspectionTask {
  id: string;
  title: string;
  category: string;
  assignee: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes?: string;
}

export interface EVCDetails {
  committeeId: string;
  chairman: string;
  memberExperts: string[];
  scheduledDate: string;
  status: 'Scheduled' | 'Dossier Review' | 'Physical Visit Completed' | 'Report Submitted';
  venue: string;
  tasks: InspectionTask[];
}

export interface Undertaking {
  id: string;
  title: string;
  docReference: string;
  responsibleOfficer: string;
  submissionDeadline: string;
  status: 'Pending Upload' | 'Under Review' | 'Verified & Active' | 'Overdue';
  legalClause: string;
}

export interface Application {
  id: string;
  institutionName: string;
  institutionCode: string;
  applicationType: string;
  academicYear: string;
  stage: ApplicationStage;
  assignedReviewer: string;
  instituteCoordinator: string;
  lastUpdated: string;
  region: string;
  totalIntake: number;
  requiredDocumentCodes: string[];
  evcDetails?: EVCDetails;
  undertakings: Undertaking[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: Role | 'System';
  applicationId: string;
  action: string;
  entityType: 'Check' | 'Finding' | 'Document' | 'Correction' | 'Undertaking' | 'Review';
  entityReference: string;
  details: string;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'action_required' | 'submitted' | 'returned' | 'closed' | 'alert';
  linkTab: string;
  relatedFindingId?: string;
  read: boolean;
}

export interface ReassessmentPreviewResult {
  findingsAddressed: {
    findingId: string;
    title: string;
    reason: string;
  }[];
  findingsUnresolved: {
    findingId: string;
    title: string;
    reason: string;
  }[];
  checksRequiringReassessment: {
    checkName: string;
    ruleId: string;
    currentStatus: CheckStatus;
    projectedStatus: CheckStatus;
  }[];
  newConcernsIntroduced: {
    checkName: string;
    issue: string;
    severity: FindingSeverity;
  }[];
}
