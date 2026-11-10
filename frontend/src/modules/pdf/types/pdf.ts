/**
 * Type Definitions for 3DoHub PDF Toolkit
 */

export type PdfTabKey = 'compress' | 'split' | 'merge' | 'organize';

export type CompressLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface CompressPreset {
  key: CompressLevel;
  label: string;
  desc: string;
  badge: string;
  expectedReduction: string;
}

export type SplitMode = 'CUSTOM_RANGE' | 'SPLIT_EACH' | 'FIXED_STEP';

export interface PdfLoadedFile {
  id: string;
  file: File;
  name: string;
  sizeBytes: number;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
}

export interface PdfPageItem {
  pageIndex: number; // 0-based
  pageNumber: number; // 1-based
  rotation: number; // 0, 90, 180, 270
  selected: boolean;
  thumbnailUrl?: string;
  isDeleted?: boolean;
}

export interface CompressResult {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  savedBytes: number;
  ratioPercent: number;
  pdfBlob: Blob;
  downloadFilename: string;
}

export interface SplitResult {
  mode: SplitMode;
  files: Array<{ name: string; blob: Blob }>;
  zipBlob?: Blob;
  singleBlob?: Blob;
  downloadFilename: string;
}

export interface MergeResult {
  pdfBlob: Blob;
  totalPageCount: number;
  sizeBytes: number;
  downloadFilename: string;
}
