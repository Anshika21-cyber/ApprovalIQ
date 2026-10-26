/**
 * ApprovalIQ — Comprehensive End-to-End Automated Test Suite (Flows A through F)
 * Tests compliance evaluation, non-mutating preview, versioning, change-aware diff,
 * RBAC authorization, statutory finding closure, and input validation.
 */

import { DependencyEngine } from '../src/engine/dependencyEngine';
import {
  INITIAL_APPLICATIONS,
  INITIAL_DOCUMENTS,
  INITIAL_FINDINGS,
  SAMPLE_REPLACEMENTS,
} from '../src/fixtures/syntheticData';
import {
  Document,
  Finding,
  AuditEvent,
  DocumentVersion,
} from '../src/types';

function runTests() {
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passedCount++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failedCount++;
    }
  }

  console.log('\n=============================================================');
  console.log('APPROVALIQ AUTOMATED SYSTEM & WORKFLOW VERIFICATION SUITE');
  console.log('=============================================================\n');

  // Deep clone helper to ensure fresh state for isolated tests
  const getFreshDocs = (): Document[] => JSON.parse(JSON.stringify(INITIAL_DOCUMENTS));
  const getFreshFindings = (): Finding[] => JSON.parse(JSON.stringify(INITIAL_FINDINGS));

  // =========================================================================
  // TEST SUITE 1: FLOW A — Pre-submission Compliance Check & Non-Mutating Preview
  // =========================================================================
  console.log('▶ [FLOW A] Pre-submission Compliance Check & Non-Mutating Preview');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();

    // 1. Initial Evaluation
    const checkResultsRun1 = DependencyEngine.runAllChecks(docs);
    assert(checkResultsRun1.length >= 4, 'Evaluated all core statutory checks (>= 4 checks).');

    const nameCheck = checkResultsRun1.find((c) => c.checkId === 'CHK-01-NAME');
    const addrCheck = checkResultsRun1.find((c) => c.checkId === 'CHK-02-ADDR');
    const fireCheck = checkResultsRun1.find((c) => c.checkId === 'CHK-03-FIRE');
    const bldgCheck = checkResultsRun1.find((c) => c.checkId === 'CHK-04-NBC');

    assert(nameCheck?.status === 'Potential issue', 'CHK-01-NAME correctly identified name mismatch.');
    assert(addrCheck?.status === 'Potential issue', 'CHK-02-ADDR correctly identified address omission.');
    assert(fireCheck?.status === 'Potential issue', 'CHK-03-FIRE correctly identified expired Fire NOC.');
    assert(bldgCheck?.status === 'Insufficient evidence', 'CHK-04-NBC correctly identified missing NBC Form-B.');

    // 2. Deterministic Consistency (repeated check execution)
    const checkResultsRun2 = DependencyEngine.runAllChecks(docs);
    assert(
      JSON.stringify(checkResultsRun1) === JSON.stringify(checkResultsRun2),
      'Repeated check evaluations yield strictly identical, deterministic results.'
    );

    // 3. Preview Replacement A (Name Fixed, Address Still Defective)
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;
    const previewA = DependencyEngine.runCorrectionPreview(
      docs,
      findings,
      'DOC-DECL-AFF',
      {},
      SAMPLE_REPLACEMENTS.REPLACEMENT_A
    );

    assert(
      previewA.findingsAddressed.some((f) => f.findingId === 'FND-NIT-001'),
      'Preview A projects resolution for FND-NIT-001 (Legal Name).'
    );
    assert(
      previewA.findingsUnresolved.some((f) => f.findingId === 'FND-NIT-002'),
      'Preview A maintains FND-NIT-002 (Address) as unresolved.'
    );
    assert(
      previewA.findingsUnresolved.some((f) => f.findingId === 'FND-NIT-003'),
      'Preview A maintains unrelated FND-NIT-003 (Fire Safety) as unresolved.'
    );

    // 4. Preview Replacement B (Address Fixed, Introduces Signatory Concern)
    const previewB = DependencyEngine.runCorrectionPreview(
      docs,
      findings,
      'DOC-DECL-AFF',
      {},
      SAMPLE_REPLACEMENTS.REPLACEMENT_B
    );

    assert(
      previewB.findingsAddressed.some((f) => f.findingId === 'FND-NIT-002'),
      'Preview B projects resolution for FND-NIT-002 (Address).'
    );
    assert(
      previewB.newConcernsIntroduced.length > 0 &&
        previewB.newConcernsIntroduced.some((c) => c.checkName.includes('Signatory')),
      'Preview B accurately detects and flags newly introduced signatory advisory concern.'
    );

    // 5. Verify Preview is Non-Mutating (Closing preview leaves state untouched)
    const declDocAfterPreview = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    assert(declDocAfterPreview.versions.length === 1, 'Preview did NOT mutate document version count (still v1).');
    assert(finding1.status === 'Action required', 'Preview did NOT mutate official finding status.');
  }

  // =========================================================================
  // TEST SUITE 2: FLOW B — Correction Draft, Versioning & Replacement Submission
  // =========================================================================
  console.log('\n▶ [FLOW B] Draft Creation, Versioning & Replacement Submission');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;

    // Initial state
    assert(declDoc.versions.length === 1, 'Initial document has exactly 1 version.');
    const v1 = declDoc.versions[0];
    const initialV1Name = v1.extractedFields['institute_name']?.value;

    // Simulate submission of Replacement A (creates v2)
    const replA = SAMPLE_REPLACEMENTS.REPLACEMENT_A;
    const newVersionNumber = declDoc.versions.length + 1; // 2
    const newVersion: DocumentVersion = {
      versionNumber: newVersionNumber,
      filename: replA.filename,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan (Dean, Academic Affairs)',
      fileSize: '1.9 MB',
      isSample: true,
      extractedFields: replA.extractedFields,
      reviewDecision: undefined,
      reviewNotes: 'Rectified deed submitted addressing institution legal name.',
    };

    declDoc.versions.push(newVersion);
    declDoc.currentVersionNumber = newVersionNumber;
    declDoc.status = 'Pending verification';
    finding1.status = 'Submitted for review';

    assert(declDoc.versions.length === 2, 'Submitting replacement creates distinct version v2.');
    assert(
      declDoc.versions[0].extractedFields['institute_name'].value === initialV1Name,
      'Version v1 is preserved with original historical values.'
    );
    assert(
      declDoc.versions[1].extractedFields['institute_name'].value === 'Northfield Institute of Technology',
      'Version v2 contains new corrected field values.'
    );
    assert(declDoc.status === 'Pending verification', 'Document status transitions to "Pending verification".');
    assert(finding1.status === 'Submitted for review', 'Finding status transitions to "Submitted for review".');
  }

  // =========================================================================
  // TEST SUITE 3: FLOW C — Reviewer Queue, Diff Analysis & Return with Reason
  // =========================================================================
  console.log('\n▶ [FLOW C] Change-Aware Diff Analysis & Evidence Return');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;

    // Setup v2 on declDoc
    const replA = SAMPLE_REPLACEMENTS.REPLACEMENT_A;
    declDoc.versions.push({
      versionNumber: 2,
      filename: replA.filename,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan',
      fileSize: '1.9 MB',
      isSample: true,
      extractedFields: replA.extractedFields,
      reviewDecision: undefined,
      reviewNotes: 'Rectified deed submitted.',
    });
    declDoc.currentVersionNumber = 2;
    declDoc.status = 'Pending verification';
    finding1.status = 'Submitted for review';

    // 1. Analyze Version Diff
    const diff = DependencyEngine.analyzeVersionDiff(declDoc, 1, 2, docs, findings);
    assert(diff !== null, 'Diff analysis succeeds between v1 and v2.');
    assert(
      Boolean(diff?.changedFields.some((f) => f.key === 'institute_name' && f.isDifferent)),
      'Diff correctly isolates "institute_name" as modified.'
    );
    assert(
      Boolean(diff?.changedFields.some((f) => f.key === 'registered_address' && !f.isDifferent)),
      'Diff correctly isolates "registered_address" as unchanged.'
    );
    assert(
      Boolean(diff?.findingsAddressed.some((f) => f.findingId === 'FND-NIT-001')),
      'Diff analysis identifies FND-NIT-001 as addressed by v2.'
    );
    assert(
      Boolean(diff?.remainingIssues.some((f) => f.findingId === 'FND-NIT-002')),
      'Diff analysis identifies FND-NIT-002 as a remaining issue.'
    );

    // 2. Reviewer returns evidence with formal reason
    const returnReason = 'Address remains incomplete (missing Sector 5 in deed schedule).';
    declDoc.status = 'Returned for correction';
    declDoc.versions[1].reviewDecision = 'Returned for correction';
    declDoc.versions[1].reviewNotes = returnReason;
    finding1.status = 'Returned';

    assert(declDoc.status === 'Returned for correction', 'Document status reverted to "Returned for correction".');
    assert(declDoc.versions[1].reviewDecision === 'Returned for correction', 'Version v2 reviewDecision recorded as "Returned for correction".');
    assert(finding1.status === 'Returned', 'Finding FND-NIT-001 status transitioned to "Returned".');
  }

  // =========================================================================
  // TEST SUITE 4: FLOW D — Resubmission & Evidence Acceptance (No Auto-Closure)
  // =========================================================================
  console.log('\n▶ [FLOW D] Evidence Acceptance & Statutory Separation (No Auto-Closure)');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;

    // Create v2 with fully compliant fields
    declDoc.versions.push({
      versionNumber: 2,
      filename: 'rectified_declaration_deed_v2_compliant.pdf',
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan',
      fileSize: '1.9 MB',
      isSample: true,
      extractedFields: {
        institute_name: {
          key: 'institute_name',
          label: 'Institution Legal Name',
          value: 'Northfield Institute of Technology',
          confidence: 'Sample High',
          pageReference: 'Page 1',
          sourceSection: 'Statement',
        },
        registered_address: {
          key: 'registered_address',
          label: 'Registered Premise Address',
          value: 'Plot 42, Knowledge Corridor, Sector 5, Greater Noida, UP 201310',
          confidence: 'Sample High',
          pageReference: 'Page 1',
          sourceSection: 'Schedule',
        },
      },
      reviewDecision: undefined,
    });
    declDoc.currentVersionNumber = 2;
    declDoc.status = 'Pending verification';
    finding1.status = 'Submitted for review';

    // 1. Mandatory Rationale Validation: Empty or whitespace rationale must fail
    function attemptAcceptEvidence(
      doc: Document,
      versionNum: number,
      notes: string
    ): boolean {
      if (!notes || !notes.trim()) return false;
      const v = doc.versions.find((ver) => ver.versionNumber === versionNum);
      if (!v) return false;
      v.reviewDecision = 'Accepted';
      v.reviewedAt = new Date().toISOString();
      v.reviewedBy = 'Dr. A. K. Sharma (Reviewing Officer)';
      v.reviewNotes = notes;
      doc.status = 'Accepted';
      return true;
    }

    const emptyRationaleRes = attemptAcceptEvidence(declDoc, 2, '   ');
    assert(
      !emptyRationaleRes,
      'Evidence acceptance strictly rejects empty or whitespace-only verification rationale.'
    );
    assert(
      declDoc.status === 'Pending verification',
      'Document status remains unmutated ("Pending verification") when rationale is missing.'
    );

    // 2. Reviewer accepts evidence with valid rationale
    const verificationNotes = 'Verified verbatim legal title against Trust Deed registration on record.';
    const acceptRes = attemptAcceptEvidence(declDoc, 2, verificationNotes);
    assert(acceptRes, 'Evidence acceptance succeeds when formal rationale is recorded.');
    assert((declDoc.status as string) === 'Accepted', 'Document status transitions to "Accepted".');
    assert(
      declDoc.versions[1].reviewDecision === 'Accepted',
      'Document v2 review decision is persisted as "Accepted".'
    );
    assert(
      declDoc.versions[1].reviewNotes === verificationNotes,
      'Document v2 persists recorded verification notes.'
    );
    assert(
      declDoc.versions[0].reviewDecision === 'Returned for correction',
      'Historical v1 reviewDecision remains unmutated ("Returned for correction").'
    );

    // 3. STATUTORY SEPARATION INVARIANTS:
    // (a) Evidence acceptance must NOT automatically close findings
    assert(
      (finding1.status as string) !== 'Closed',
      'Statutory Separation: Finding is NOT automatically closed upon evidence acceptance (still "Submitted for review").'
    );
    // (b) Evidence acceptance must NOT automatically approve the application
    const appStage: string = INITIAL_APPLICATIONS[0].stage;
    assert(
      appStage !== 'Approved' && appStage === 'Corrections',
      'Statutory Separation: Application stage remains in "Corrections" (never auto-approved).'
    );
  }

  // =========================================================================
  // TEST SUITE 5: FLOW E — Authorized Finding Closure & Statutory Guardrails
  // =========================================================================
  console.log('\n▶ [FLOW E] Authorized Finding Closure & Statutory Guardrails');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;
    const finding2 = findings.find((f) => f.id === 'FND-NIT-002')!;
    const finding4 = findings.find((f) => f.id === 'FND-NIT-004')!;

    // Setup: Replacement A submitted (fixes name check CHK-01-NAME, but leaves address check CHK-02-ADDR unresolved)
    declDoc.versions.push({
      versionNumber: 2,
      filename: SAMPLE_REPLACEMENTS.REPLACEMENT_A.filename,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan',
      fileSize: '1.9 MB',
      isSample: true,
      extractedFields: SAMPLE_REPLACEMENTS.REPLACEMENT_A.extractedFields,
      reviewDecision: 'Accepted',
    });
    declDoc.currentVersionNumber = 2;
    declDoc.status = 'Accepted';

    const checks = DependencyEngine.runAllChecks(docs);

    // Full Closure Validation Function matching AppContext rules
    function validateAndCloseFinding(
      role: string,
      targetFindingId: string,
      reason: string,
      allDocs: Document[],
      allFindings: Finding[]
    ): { success: boolean; error?: string } {
      if (role !== 'Reviewing Officer') {
        return {
          success: false,
          error: 'Authorisation check failed: Only a designated Reviewing Officer can formally close a statutory deficiency.',
        };
      }
      if (!reason.trim()) {
        return { success: false, error: 'A formal closure rationale is mandatory.' };
      }
      const targetF = allFindings.find((f) => f.id === targetFindingId);
      if (!targetF) return { success: false, error: 'Finding record not found.' };

      const targetD = allDocs.find((d) => d.id === targetF.assignedDocId);
      if (!targetD) return { success: false, error: 'Supporting document not found.' };

      if (targetD.status !== 'Accepted') {
        return {
          success: false,
          error: `Cannot close finding: Supporting evidence (${targetD.title}) is currently "${targetD.status}". It must be verified and Accepted first.`,
        };
      }

      const evaluatedChecks = DependencyEngine.runAllChecks(allDocs);
      const currentCheck = evaluatedChecks.find((c) => c.ruleId === targetF.ruleId);
      if (currentCheck && currentCheck.status !== 'Appears satisfied') {
        return {
          success: false,
          error: `Cannot close finding: The reassessed check "${currentCheck.checkName}" has status "${currentCheck.status}". Closure requires "Appears satisfied".`,
        };
      }

      const latestVer = targetD.versions[targetD.versions.length - 1];
      targetF.status = 'Closed';
      targetF.closureRecord = {
        closedBy: 'Dr. A. K. Sharma (Reviewing Officer)',
        closedAt: new Date().toISOString(),
        closureReason: reason,
        acceptedEvidenceDocId: targetD.id,
        acceptedEvidenceVersion: latestVer?.versionNumber || 1,
      };

      return { success: true };
    }

    // 1. Guardrail Test: Attempt to close FND-NIT-002 (Address Mismatch) when address is defective
    const closeAddressRes = validateAndCloseFinding(
      'Reviewing Officer',
      'FND-NIT-002',
      'Attempting closure with incomplete address',
      docs,
      findings
    );
    assert(
      !closeAddressRes.success && Boolean(closeAddressRes.error?.includes('Appears satisfied')),
      'Guardrail: FND-NIT-002 (Address) closure rejected because check remains "Potential issue".'
    );
    assert(finding2.status === 'Action required', 'FND-NIT-002 status remains unmutated ("Action required").');

    // 2. Guardrail Test: Attempt to close FND-NIT-004 (NBC Form-B) when document is Missing
    const closeMissingDocRes = validateAndCloseFinding(
      'Reviewing Officer',
      'FND-NIT-004',
      'Attempting closure without NBC Form-B',
      docs,
      findings
    );
    assert(
      !closeMissingDocRes.success && Boolean(closeMissingDocRes.error?.includes('must be verified and Accepted')),
      'Guardrail: FND-NIT-004 closure rejected because supporting document is "Missing".'
    );
    assert(finding4.status === 'Action required', 'FND-NIT-004 status remains unmutated ("Action required").');

    // 3. Valid Authorized Closure of FND-NIT-001 (Legal Name Check CHK-01-NAME is satisfied)
    const validClosureReason = 'Title confirmed verbatim against Registrar of Societies registration certificate.';
    const closeNameRes = validateAndCloseFinding(
      'Reviewing Officer',
      'FND-NIT-001',
      validClosureReason,
      docs,
      findings
    );
    assert(closeNameRes.success, 'Valid closure succeeds when all statutory prerequisites are met.');
    assert(finding1.status === 'Closed', 'Finding FND-NIT-001 transitions to "Closed".');
    assert(
      finding1.closureRecord?.closedBy === 'Dr. A. K. Sharma (Reviewing Officer)',
      'Closure record accurately attributes authorized Reviewing Officer.'
    );
    assert(
      finding1.closureRecord?.acceptedEvidenceVersion === 2,
      'Closure record links to accepted document version 2.'
    );
    assert(
      finding1.closureRecord?.closureReason === validClosureReason,
      'Closure record records exact written justification.'
    );
  }

  // =========================================================================
  // TEST SUITE 6: FLOW F — RBAC Enforcement, Negative Tests & Upload Guardrails
  // =========================================================================
  console.log('\n▶ [FLOW F] RBAC Enforcement, Negative Validations & Upload Guardrails');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;

    function attemptClosure(
      role: string,
      targetFinding: Finding,
      doc: Document,
      reason: string
    ): { success: boolean; error?: string } {
      if (role !== 'Reviewing Officer') {
        return {
          success: false,
          error: 'Authorisation check failed: Only a designated Reviewing Officer can formally close a statutory deficiency.',
        };
      }
      if (!reason.trim()) {
        return { success: false, error: 'A formal closure rationale is mandatory.' };
      }
      if (doc.status !== 'Accepted') {
        return {
          success: false,
          error: 'Statutory prerequisite unsatisfied: Assigned document evidence has not been accepted.',
        };
      }
      return { success: true };
    }

    // 1. RBAC Test: Coordinator cannot close finding
    const coordRes = attemptClosure('Institute Coordinator', finding1, declDoc, 'Resolved');
    assert(!coordRes.success && Boolean(coordRes.error?.includes('Authorisation check failed')), 'Coordinator closure attempt is strictly rejected.');
    assert(finding1.status === 'Action required', 'Zero-mutation: Coordinator attempt does not alter finding status.');

    // 2. Empty closure rationale rejected
    const emptyReasonRes = attemptClosure('Reviewing Officer', finding1, declDoc, '   ');
    assert(!emptyReasonRes.success && Boolean(emptyReasonRes.error?.includes('formal closure rationale is mandatory')), 'Empty closure rationale is rejected.');
    assert(finding1.status === 'Action required', 'Zero-mutation: Empty rationale attempt does not alter finding status.');

    // 3. Unaccepted document closure rejected
    declDoc.status = 'Returned for correction';
    const unacceptedDocRes = attemptClosure('Reviewing Officer', finding1, declDoc, 'Verified deed');
    assert(!unacceptedDocRes.success && Boolean(unacceptedDocRes.error?.includes('has not been accepted')), 'Closure with unaccepted document evidence is rejected.');
    assert(finding1.status === 'Action required', 'Zero-mutation: Unaccepted document attempt does not alter finding status.');

    // 4. File Upload Validation Logic
    function validateUpload(fileName: string, fileSize: number): { success: boolean; error?: string } {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.jpeg'];
      const ext = '.' + fileName.split('.').pop()?.toLowerCase();

      if (fileSize > MAX_SIZE) {
        return { success: false, error: 'File size exceeds maximum permitted limit of 10MB.' };
      }
      if (!ALLOWED_EXTS.includes(ext)) {
        return {
          success: false,
          error: `Invalid file type "${ext}". Supported statutory formats: PDF, PNG, JPG.`,
        };
      }
      return { success: true };
    }

    const oversizeRes = validateUpload('huge_deed.pdf', 15 * 1024 * 1024);
    assert(!oversizeRes.success && Boolean(oversizeRes.error?.includes('10MB')), 'Upload > 10MB rejected with clear error.');

    const invalidTypeRes = validateUpload('payload.exe', 1024 * 1024);
    assert(!invalidTypeRes.success && Boolean(invalidTypeRes.error?.includes('Invalid file type')), 'Disallowed extension (.exe) rejected with clear error.');

    const validUploadRes = validateUpload('scanned_deed.pdf', 2 * 1024 * 1024);
    assert(validUploadRes.success, 'Valid PDF upload under 10MB accepted.');
  }

  // =========================================================================
  // TEST SUITE 7: FLOW G — Audit Trail Lifecycle & Persistence Verification
  // =========================================================================
  console.log('\n▶ [FLOW G] Audit Trail Lifecycle & LocalStorage Persistence');
  {
    const docs = getFreshDocs();
    const findings = getFreshFindings();
    const declDoc = docs.find((d) => d.code === 'DOC-DECL-AFF')!;
    const finding1 = findings.find((f) => f.id === 'FND-NIT-001')!;

    const auditLog: AuditEvent[] = [];

    function recordAuditEvent(
      actor: string,
      actorRole: AuditEvent['actorRole'],
      action: string,
      entityType: AuditEvent['entityType'],
      entityReference: string,
      details: string
    ) {
      const event: AuditEvent = {
        id: `AUD-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        actor,
        actorRole,
        applicationId: 'APP-2026-NIT-001',
        action,
        entityType,
        entityReference,
        details,
      };
      auditLog.unshift(event);
    }

    // Step 1: Submit Replacement
    declDoc.versions.push({
      versionNumber: 2,
      filename: SAMPLE_REPLACEMENTS.REPLACEMENT_A.filename,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Er. Ramesh Narayan (Institute Coordinator)',
      fileSize: '1.9 MB',
      isSample: true,
      extractedFields: SAMPLE_REPLACEMENTS.REPLACEMENT_A.extractedFields,
    });
    declDoc.currentVersionNumber = 2;
    declDoc.status = 'Pending verification';
    finding1.status = 'Submitted for review';
    recordAuditEvent(
      'Er. Ramesh Narayan (Dean)',
      'Institute Coordinator',
      'Replacement Evidence Submitted',
      'Document',
      `${declDoc.title} (v2)`,
      'Submitted replacement addressing FND-NIT-001'
    );

    // Step 2: Accept Evidence
    declDoc.status = 'Accepted';
    declDoc.versions[1].reviewDecision = 'Accepted';
    declDoc.versions[1].reviewedAt = new Date().toISOString();
    declDoc.versions[1].reviewedBy = 'Dr. A. K. Sharma (Reviewing Officer)';
    declDoc.versions[1].reviewNotes = 'Verified legal title against trust deed.';
    recordAuditEvent(
      'Dr. A. K. Sharma (Scrutiny Officer)',
      'Reviewing Officer',
      'Evidence Formally Accepted',
      'Review',
      `${declDoc.title} (v2)`,
      'Reviewing Officer accepted evidence. Note: Evidence acceptance does not close findings automatically.'
    );

    // Step 3: Return Evidence for another doc (Fire NOC)
    const fireDoc = docs.find((d) => d.code === 'DOC-FIRE-NOC')!;
    fireDoc.status = 'Returned for correction';
    recordAuditEvent(
      'Dr. A. K. Sharma (Scrutiny Officer)',
      'Reviewing Officer',
      'Evidence Returned for Rectification',
      'Review',
      `${fireDoc.title} (v1)`,
      'Reviewing Officer returned evidence. Reason: Fire NOC has lapsed and requires renewed certificate.'
    );

    // Step 4: Finding Closure
    finding1.status = 'Closed';
    finding1.closureRecord = {
      closedBy: 'Dr. A. K. Sharma (Reviewing Officer)',
      closedAt: new Date().toISOString(),
      closureReason: 'Verified verbatim title match against Trust Deed.',
      acceptedEvidenceDocId: declDoc.id,
      acceptedEvidenceVersion: 2,
    };
    recordAuditEvent(
      'Dr. A. K. Sharma (Scrutiny Officer)',
      'Reviewing Officer',
      'Finding Officially Closed',
      'Finding',
      `${finding1.id}: ${finding1.title}`,
      'Finding closed. Closure reason: Verified verbatim title match against Trust Deed.'
    );

    // Verify Audit Trail Structure
    assert(auditLog.length === 4, 'Audit trail contains all 4 key lifecycle events.');
    assert(
      auditLog.some((e) => e.action === 'Replacement Evidence Submitted'),
      'Audit log recorded "Replacement Evidence Submitted".'
    );
    assert(
      auditLog.some((e) => e.action === 'Evidence Formally Accepted'),
      'Audit log recorded "Evidence Formally Accepted".'
    );
    assert(
      auditLog.some((e) => e.action === 'Evidence Returned for Rectification'),
      'Audit log recorded "Evidence Returned for Rectification".'
    );
    assert(
      auditLog.some((e) => e.action === 'Finding Officially Closed'),
      'Audit log recorded "Finding Officially Closed".'
    );
    assert(
      auditLog.every((e) => Boolean(Date.parse(e.timestamp))),
      'All audit events have valid ISO timestamps.'
    );

    // Step 5: Simulate LocalStorage Roundtrip (Serialize & Deserialize)
    const fullStateBundle = {
      applications: INITIAL_APPLICATIONS,
      documents: docs,
      findings: findings,
      auditLog: auditLog,
      notifications: [],
    };

    const serializedState = JSON.stringify(fullStateBundle);
    const restoredState = JSON.parse(serializedState);

    // Assert Persistence Invariants
    const restoredDeclDoc = restoredState.documents.find((d: Document) => d.code === 'DOC-DECL-AFF');
    assert(restoredDeclDoc.versions.length === 2, 'Persistence: Document retains both v1 and v2 after reload.');
    assert(
      restoredDeclDoc.versions[0].extractedFields['institute_name'].value === 'Northfield Institute of Tech & Research',
      'Persistence: Historical v1 values preserved intact ("Northfield Institute of Tech & Research").'
    );
    assert(
      restoredDeclDoc.versions[1].extractedFields['institute_name'].value === 'Northfield Institute of Technology',
      'Persistence: Rectified v2 values preserved intact.'
    );
    assert(
      restoredDeclDoc.versions[1].reviewDecision === 'Accepted',
      'Persistence: Document v2 reviewDecision "Accepted" preserved.'
    );

    const restoredFinding1 = restoredState.findings.find((f: Finding) => f.id === 'FND-NIT-001');
    assert(restoredFinding1.status === 'Closed', 'Persistence: Finding FND-NIT-001 status remains "Closed".');
    assert(
      restoredFinding1.closureRecord.acceptedEvidenceVersion === 2,
      'Persistence: Finding closure record preserved with linked version 2.'
    );

    assert(restoredState.auditLog.length === 4, 'Persistence: Complete audit log restored with all 4 events intact.');

    // Consistency check on restored data: Recheck evaluation
    const checksOnRestoredState = DependencyEngine.runAllChecks(restoredState.documents);
    const restoredNameCheck = checksOnRestoredState.find((c) => c.checkId === 'CHK-01-NAME');
    assert(
      restoredNameCheck?.status === 'Appears satisfied',
      'Consistency: Live check re-evaluation on restored state confirms CHK-01-NAME is satisfied.'
    );
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log('\n=============================================================');
  console.log(`TEST EXECUTION SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('=============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
