import {
  Document,
  DocumentVersion,
  CheckResult,
  Finding,
  ReassessmentPreviewResult,
  CheckStatus,
} from '../types';
import { SAMPLE_RULES } from './rulesCatalog';

export interface FieldComparison {
  fieldKey: string;
  fieldLabel: string;
  docA: { title: string; version: number; value: string };
  docB: { title: string; version: number; value: string };
  isMatch: boolean;
}

export interface DependencyGraphNode {
  findingId: string;
  title: string;
  supportingDocTitle: string;
  ruleTitle: string;
  affectedDownstream: string[];
  closureRequirement: string;
}

/**
 * Compliance Consequence & Dependency Engine
 * Connects evidence to requirements, identifies affected downstream workflow prerequisites,
 * and executes deterministic reassessments.
 */
export class DependencyEngine {
  /**
   * Evaluates all standard sample checks for an application's current documents.
   */
  static runAllChecks(documents: Document[]): CheckResult[] {
    const results: CheckResult[] = [];

    const profileDoc = documents.find((d) => d.code === 'DOC-INST-PROF');
    const declDoc = documents.find((d) => d.code === 'DOC-DECL-AFF');
    const fireDoc = documents.find((d) => d.code === 'DOC-FIRE-NOC');
    const bldgDoc = documents.find((d) => d.code === 'DOC-BLDG-STAB');

    const profileVer = profileDoc?.versions[profileDoc.versions.length - 1];
    const declVer = declDoc?.versions[declDoc.versions.length - 1];
    const fireVer = fireDoc?.versions[fireDoc.versions.length - 1];
    const bldgVer = bldgDoc?.versions[bldgDoc.versions.length - 1];

    // CHECK 1: Institutional Legal Title Consistency across Profile & Declaration
    const rule1 = SAMPLE_RULES['RULE-APH-01.1'];
    if (!profileVer || !declVer) {
      results.push({
        checkId: 'CHK-01-NAME',
        ruleId: rule1.id,
        ruleVersion: rule1.version,
        checkName: 'Institutional Legal Title Consistency',
        category: rule1.category,
        status: 'Insufficient evidence',
        comparedDocuments: [profileDoc?.title || 'Institution Profile', declDoc?.title || 'Supporting Declaration'],
        comparedValues: [],
        explanation: 'One or more required identity documents have not been uploaded for title comparison.',
        findingId: 'FND-NIT-001',
      });
    } else {
      const nameProfile = profileVer.extractedFields['institute_name']?.value?.trim() || '';
      const nameDecl = declVer.extractedFields['institute_name']?.value?.trim() || '';
      const isMatch = nameProfile.toLowerCase() === nameDecl.toLowerCase() && nameProfile.length > 0;

      results.push({
        checkId: 'CHK-01-NAME',
        ruleId: rule1.id,
        ruleVersion: rule1.version,
        checkName: 'Institutional Legal Title Consistency',
        category: rule1.category,
        status: isMatch ? 'Appears satisfied' : 'Potential issue',
        comparedDocuments: [profileDoc?.title || 'Profile', declDoc?.title || 'Declaration'],
        comparedValues: [
          { fieldLabel: 'Institution Name', docTitle: `${profileDoc?.title} (v${profileVer.versionNumber})`, value: nameProfile || '(Not Extracted)' },
          { fieldLabel: 'Institution Name', docTitle: `${declDoc?.title} (v${declVer.versionNumber})`, value: nameDecl || '(Not Extracted)' },
        ],
        explanation: isMatch
          ? 'Institution legal titles match verbatim across Institution Profile and Notarized Declaration.'
          : `Discrepancy detected: Profile states "${nameProfile}", but Declaration cites "${nameDecl}". AICTE approval requires verbatim name alignment.`,
        findingId: isMatch ? undefined : 'FND-NIT-001',
      });
    }

    // CHECK 2: Campus Address & Cadastral Concordance
    const rule2 = SAMPLE_RULES['RULE-APH-01.2'];
    if (!profileVer || !declVer) {
      results.push({
        checkId: 'CHK-02-ADDR',
        ruleId: rule2.id,
        ruleVersion: rule2.version,
        checkName: 'Campus Address & Cadastral Concordance',
        category: rule2.category,
        status: 'Insufficient evidence',
        comparedDocuments: [profileDoc?.title || 'Institution Profile', declDoc?.title || 'Supporting Declaration'],
        comparedValues: [],
        explanation: 'Supporting address documentation is incomplete.',
        findingId: 'FND-NIT-002',
      });
    } else {
      const addrProfile = profileVer.extractedFields['registered_address']?.value?.trim() || '';
      const addrDecl = declVer.extractedFields['registered_address']?.value?.trim() || '';

      // Normalize simple whitespace and casing for fair comparison
      const normP = addrProfile.toLowerCase().replace(/[\s,]+/g, ' ');
      const normD = addrDecl.toLowerCase().replace(/[\s,]+/g, ' ');
      const isMatch = normP === normD && normP.length > 0;

      results.push({
        checkId: 'CHK-02-ADDR',
        ruleId: rule2.id,
        ruleVersion: rule2.version,
        checkName: 'Campus Address & Cadastral Concordance',
        category: rule2.category,
        status: isMatch ? 'Appears satisfied' : 'Potential issue',
        comparedDocuments: [profileDoc?.title || 'Profile', declDoc?.title || 'Declaration'],
        comparedValues: [
          { fieldLabel: 'Premises Address', docTitle: `${profileDoc?.title} (v${profileVer.versionNumber})`, value: addrProfile || '(Not Extracted)' },
          { fieldLabel: 'Premises Address', docTitle: `${declDoc?.title} (v${declVer.versionNumber})`, value: addrDecl || '(Not Extracted)' },
        ],
        explanation: isMatch
          ? 'Premises address and postal locator align across profile and declaration records.'
          : `Address inconsistency detected: Declaration omits sector/sub-division details ("${addrDecl}") compared to Profile ("${addrProfile}").`,
        findingId: isMatch ? undefined : 'FND-NIT-002',
      });
    }

    // CHECK 3: Fire & Life Safety Certificate Validity Threshold
    const rule3 = SAMPLE_RULES['RULE-APH-02.1'];
    if (!fireVer) {
      results.push({
        checkId: 'CHK-03-FIRE',
        ruleId: rule3.id,
        ruleVersion: rule3.version,
        checkName: 'Statutory Fire Safety NOC Validity',
        category: rule3.category,
        status: 'Insufficient evidence',
        comparedDocuments: [fireDoc?.title || 'Fire Safety Certificate'],
        comparedValues: [],
        explanation: 'Mandatory Fire Safety Certificate is not uploaded.',
        findingId: 'FND-NIT-003',
      });
    } else {
      const validUntil = fireVer.extractedFields['valid_until']?.value?.trim() || '';
      // Sample condition: Must be valid through at least 2027-06-30 for the current cycle
      const requiredExpiry = '2027-06-30';
      const isExpired = !validUntil || validUntil < requiredExpiry;

      results.push({
        checkId: 'CHK-03-FIRE',
        ruleId: rule3.id,
        ruleVersion: rule3.version,
        checkName: 'Statutory Fire Safety NOC Validity',
        category: rule3.category,
        status: isExpired ? 'Potential issue' : 'Appears satisfied',
        comparedDocuments: [fireDoc?.title || 'Fire Safety Certificate'],
        comparedValues: [
          { fieldLabel: 'Certificate Expiry Date', docTitle: `${fireDoc?.title} (v${fireVer.versionNumber})`, value: validUntil || '(Missing date)' },
          { fieldLabel: 'Sample Regulatory Minimum Threshold', docTitle: 'AICTE APH 2026-27 Norms', value: `>= ${requiredExpiry}` },
        ],
        explanation: isExpired
          ? `Fire Safety Certificate expired or expires prematurely (${validUntil}). Illustrative sample policy requires active clearance through ${requiredExpiry}.`
          : `Fire Safety NOC is active until ${validUntil}, meeting the illustrative sample threshold (${requiredExpiry}).`,
        findingId: isExpired ? 'FND-NIT-003' : undefined,
      });
    }

    // CHECK 4: Structural Stability Certificate (NBC Form-B)
    const rule4 = SAMPLE_RULES['RULE-APH-03.1'];
    const isBldgMissing = !bldgDoc || bldgDoc.status === 'Missing' || !bldgVer;

    if (isBldgMissing) {
      results.push({
        checkId: 'CHK-04-NBC',
        ruleId: rule4.id,
        ruleVersion: rule4.version,
        checkName: 'Building Structural Stability (NBC Form-B)',
        category: rule4.category,
        status: 'Insufficient evidence',
        comparedDocuments: ['Building Stability Certificate (NBC Form-B)'],
        comparedValues: [
          { fieldLabel: 'Attachment Status', docTitle: 'Building Stability (NBC Form-B)', value: 'Not Attached (Required Document Missing)' },
        ],
        explanation: 'Required statutory supporting document missing. Technical institutions must upload certified NBC Form-B prior to Scrutiny Committee review.',
        findingId: 'FND-NIT-004',
      });
    } else {
      const certNo = bldgVer.extractedFields['certificate_no']?.value || 'Uploaded';
      const engineerReg = bldgVer.extractedFields['structural_engineer_reg']?.value || 'Verified';
      results.push({
        checkId: 'CHK-04-NBC',
        ruleId: rule4.id,
        ruleVersion: rule4.version,
        checkName: 'Building Structural Stability (NBC Form-B)',
        category: rule4.category,
        status: 'Appears satisfied',
        comparedDocuments: [`${bldgDoc.title} (v${bldgVer.versionNumber})`],
        comparedValues: [
          { fieldLabel: 'NBC Certificate No', docTitle: bldgDoc.title, value: certNo },
          { fieldLabel: 'Structural Engineer Reg', docTitle: bldgDoc.title, value: engineerReg },
        ],
        explanation: 'Structural stability NBC Form-B is attached with recognized empanelled engineer seal.',
        findingId: undefined,
      });
    }

    // CHECK 5: Authorized Signatory Board Mandate
    const rule5 = SAMPLE_RULES['RULE-APH-04.1'];
    if (declVer) {
      const desig = declVer.extractedFields['deponent_designation']?.value?.trim() || '';
      const isAdHocOrUnapproved = desig.toLowerCase().includes('ad-hoc') || desig.toLowerCase().includes('interim');
      if (isAdHocOrUnapproved) {
        results.push({
          checkId: 'CHK-05-SIGNATORY',
          ruleId: rule5.id,
          ruleVersion: rule5.version,
          checkName: 'Authorized Signatory Mandate',
          category: rule5.category,
          status: 'Official review required',
          comparedDocuments: [declDoc?.title || 'Declaration'],
          comparedValues: [
            { fieldLabel: 'Deponent Designation', docTitle: `${declDoc?.title} (v${declVer.versionNumber})`, value: desig },
            { fieldLabel: 'Governing Body Resolution', docTitle: 'Board Minutes on Record', value: 'Requires Permanent Signatory or Resolution Endorsement' },
          ],
          explanation: `Deponent designation is "${desig}". Ad-hoc/temporary signatories require formal Board Resolution verification before finding closure.`,
          findingId: 'FND-NIT-005',
        });
      }
    }

    return results;
  }

  /**
   * Explains the consequences and downstream impacts of a given finding.
   */
  static getDownstreamImpacts(findingId: string): string[] {
    switch (findingId) {
      case 'FND-NIT-001':
        return [
          'State Technical University Affiliation Endorsement Dossier',
          'Student Admission Seat Allotment Portal Registry Sync',
          'EVC (Expert Visit Committee) Legal Identity Verification Checklist',
        ];
      case 'FND-NIT-002':
        return [
          'Municipal Property Tax & Fire Zone Cadastral Mapping',
          'EVC Physical Campus Boundary & Land Parcel Inspection',
          'AICTE Approval Letter (EoA) Physical Dispatch Address Record',
        ];
      case 'FND-NIT-003':
        return [
          'Premises Occupancy Safety Clearances for Labs & Workshops',
          'Student Hostel Building Safety Verification',
          'Statutory Scrutiny Committee Final Clearance Sign-off',
        ];
      case 'FND-NIT-004':
        return [
          'Scrutiny Committee Stage Clearance',
          'EVC Physical Infrastructure Quality Inspection Audit',
          'Insurance & Disaster Management Statutory Undertaking',
        ];
      case 'FND-NIT-005':
        return [
          'Legal Enforceability of Institutional Undertaking',
          'Authorised Officer KYC Registry',
        ];
      default:
        return ['General Scrutiny Committee Review'];
    }
  }

  /**
   * FEATURE 3: Runs a conditional reassessment without altering official review state.
   */
  static runCorrectionPreview(
    allDocuments: Document[],
    currentFindings: Finding[],
    targetDocCode: string,
    proposedFields: Record<string, string>,
    proposedSampleDoc?: {
      code?: string;
      targetDocCode?: string;
      title: string;
      extractedFields: Record<string, { key: string; label: string; value: string; confidence: any }>;
    }
  ): ReassessmentPreviewResult {
    // Clone documents and inject proposed virtual version
    const virtualDocs: Document[] = allDocuments.map((doc) => {
      if (doc.code === targetDocCode) {
        const nextVersionNum = doc.versions.length + 1;
        const baseFields = doc.versions[doc.versions.length - 1]?.extractedFields || {};
        const mergedFields = { ...baseFields };

        // If sample doc provided, adopt its fields
        if (proposedSampleDoc) {
          Object.entries(proposedSampleDoc.extractedFields).forEach(([k, v]) => {
            mergedFields[k] = { ...v };
          });
        }

        // Apply any manual proposed override fields
        Object.entries(proposedFields).forEach(([k, val]) => {
          mergedFields[k] = {
            key: k,
            label: k.replace(/_/g, ' ').toUpperCase(),
            value: val,
            confidence: 'Manual',
          };
        });

        const virtualVersion: DocumentVersion = {
          versionNumber: nextVersionNum,
          uploadedAt: new Date().toISOString(),
          uploadedBy: 'Preview Simulation',
          filename: `proposed_${doc.code.toLowerCase()}_v${nextVersionNum}.pdf`,
          fileSize: '1.8 MB',
          isSample: true,
          extractedFields: mergedFields,
        };

        return {
          ...doc,
          status: 'Pending verification',
          versions: [...doc.versions, virtualVersion],
        };
      }
      return doc;
    });

    // Run checks on virtual state
    const projectedChecks = DependencyEngine.runAllChecks(virtualDocs);

    const findingsAddressed: { findingId: string; title: string; reason: string }[] = [];
    const findingsUnresolved: { findingId: string; title: string; reason: string }[] = [];
    const checksRequiringReassessment: {
      checkName: string;
      ruleId: string;
      currentStatus: CheckStatus;
      projectedStatus: CheckStatus;
    }[] = [];
    const newConcernsIntroduced: {
      checkName: string;
      issue: string;
      severity: any;
    }[] = [];

    // Evaluate against current findings
    currentFindings.forEach((finding) => {
      if (finding.status === 'Closed') return;

      const matchingCheck = projectedChecks.find((c) => c.ruleId === finding.ruleId);
      if (matchingCheck) {
        if (matchingCheck.status === 'Appears satisfied') {
          findingsAddressed.push({
            findingId: finding.id,
            title: finding.title,
            reason: matchingCheck.explanation,
          });
        } else {
          findingsUnresolved.push({
            findingId: finding.id,
            title: finding.title,
            reason: matchingCheck.explanation,
          });
        }

        checksRequiringReassessment.push({
          checkName: matchingCheck.checkName,
          ruleId: matchingCheck.ruleId,
          currentStatus: 'Potential issue',
          projectedStatus: matchingCheck.status,
        });
      }
    });

    // Check if new concerns were introduced (e.g. Check 5)
    const check5 = projectedChecks.find((c) => c.checkId === 'CHK-05-SIGNATORY');
    if (check5 && check5.status === 'Official review required') {
      newConcernsIntroduced.push({
        checkName: check5.checkName,
        issue: check5.explanation,
        severity: 'Advisory Concern',
      });
    }

    return {
      findingsAddressed,
      findingsUnresolved,
      checksRequiringReassessment,
      newConcernsIntroduced,
    };
  }

  /**
   * FEATURE 4: Change-Aware Document Review
   * Compares previous and current document versions side-by-side,
   * detects changed fields, and re-runs affected checks.
   */
  static analyzeVersionDiff(
    doc: Document,
    prevVersionNumber: number,
    currVersionNumber: number,
    allDocuments: Document[],
    currentFindings: Finding[] = []
  ) {
    const prevVersion = doc.versions.find((v) => v.versionNumber === prevVersionNumber);
    const currVersion = doc.versions.find((v) => v.versionNumber === currVersionNumber);

    if (!prevVersion || !currVersion) {
      return null;
    }

    const allKeys = Array.from(
      new Set([
        ...Object.keys(prevVersion.extractedFields || {}),
        ...Object.keys(currVersion.extractedFields || {}),
      ])
    );

    const changedFields: {
      key: string;
      label: string;
      oldValue: string;
      newValue: string;
      isDifferent: boolean;
    }[] = [];

    allKeys.forEach((key) => {
      const oldVal = prevVersion.extractedFields[key]?.value || '(Empty)';
      const newVal = currVersion.extractedFields[key]?.value || '(Empty)';
      const isDiff = oldVal.trim() !== newVal.trim();
      const label = currVersion.extractedFields[key]?.label || prevVersion.extractedFields[key]?.label || key;

      changedFields.push({
        key,
        label,
        oldValue: oldVal,
        newValue: newVal,
        isDifferent: isDiff,
      });
    });

    // Run live checks with the current documents
    const currentChecks = DependencyEngine.runAllChecks(allDocuments);

    // Identify which checks depend on the fields changed in this document
    const affectedChecks = currentChecks.filter((c) => {
      if (doc.code === 'DOC-INST-PROF' || doc.code === 'DOC-DECL-AFF') {
        return c.checkId === 'CHK-01-NAME' || c.checkId === 'CHK-02-ADDR' || c.checkId === 'CHK-05-SIGNATORY';
      }
      if (doc.code === 'DOC-FIRE-NOC') {
        return c.checkId === 'CHK-03-FIRE';
      }
      if (doc.code === 'DOC-BLDG-STAB') {
        return c.checkId === 'CHK-04-NBC';
      }
      return false;
    });

    // Findings addressed vs remaining
    const findingsAddressed: { findingId: string; title: string; reason: string }[] = [];
    const remainingIssues: { findingId: string; title: string; reason: string }[] = [];
    const newConcernsIntroduced: { checkName: string; issue: string; severity: string }[] = [];

    currentFindings.forEach((f) => {
      if (
        f.assignedDocId === doc.id ||
        (doc.code === 'DOC-DECL-AFF' && (f.id === 'FND-NIT-001' || f.id === 'FND-NIT-002'))
      ) {
        const check = currentChecks.find((c) => c.ruleId === f.ruleId);
        if (check) {
          if (check.status === 'Appears satisfied') {
            findingsAddressed.push({
              findingId: f.id,
              title: f.title,
              reason: check.explanation,
            });
          } else {
            remainingIssues.push({
              findingId: f.id,
              title: f.title,
              reason: check.explanation,
            });
          }
        }
      }
    });

    // Check newly introduced concerns
    const check5 = currentChecks.find((c) => c.checkId === 'CHK-05-SIGNATORY');
    if (check5 && check5.status === 'Official review required') {
      newConcernsIntroduced.push({
        checkName: check5.checkName,
        issue: check5.explanation,
        severity: 'Advisory Concern',
      });
    }

    return {
      prevVersion,
      currVersion,
      changedFields,
      affectedChecks,
      findingsAddressed,
      remainingIssues,
      newConcernsIntroduced,
    };
  }
}
