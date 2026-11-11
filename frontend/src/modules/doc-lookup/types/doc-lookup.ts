/**
 * Type definitions for Vietnamese Administrative Regulations & Formatting Lookup.
 */

export interface FormatRuleDetail {
  component: string;
  fontStyle: string;
  fontSize: string;
  alignment: string;
  note: string;
}

export interface LegalRegulationItem {
  id: string;
  title: string;
  shortTitle: string;
  category: 'HANH_CHINH' | 'DANG' | 'THI_DUA' | 'CAND' | 'QUAN_DOI' | 'DOAN';
  categoryLabel: string;
  categoryColor: string;
  documentNumber: string;
  issuingOrgan: string;
  effectiveDate: string;
  summary: string;
  marginSpec: {
    top: string;
    bottom: string;
    left: string;
    right: string;
  };
  formatRules: FormatRuleDetail[];
  keyProvisions: string[];
  relatedTemplateTags: string[];
  keywords: string[];
}
