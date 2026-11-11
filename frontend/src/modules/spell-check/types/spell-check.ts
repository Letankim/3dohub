/**
 * Type definitions for 3DoHub Spell & Administrative Style Engine.
 */

export type IssueCategory =
  | 'SPELLING'
  | 'CONFUSABLE'
  | 'CAPITALIZATION'
  | 'PUNCTUATION';

export type IssueSeverity = 'error' | 'warning' | 'info';

export interface SpellIssue {
  id: string;
  startIndex: number;
  endIndex: number;
  original: string;
  replacement: string;
  category: IssueCategory;
  categoryLabel: string;
  severity: IssueSeverity;
  message: string;
  context: string;
  ruleId: string;
  isSafeAutoFix: boolean;
}

export interface SpellStats {
  total: number;
  spelling: number;
  confusable: number;
  capitalization: number;
  punctuation: number;
  wordsCount: number;
  charsCount: number;
  executionMs: number;
}

export interface SpellCheckResult {
  issues: SpellIssue[];
  stats: SpellStats;
}
