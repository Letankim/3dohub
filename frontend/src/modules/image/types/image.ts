export type ImageFormat = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' | 'image/bmp';

export interface ImageFileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  width: number;
  height: number;
  format: string;
  previewUrl: string;
}

export type CompressMode = 'KEEP_SHARP' | 'BALANCED' | 'SMALLEST' | 'TARGET_SIZE';

export interface CompressOptions {
  mode: CompressMode;
  targetKb?: number;
  stripMetadata?: boolean;
}

export type ConvertFormat = 'image/jpeg' | 'image/png' | 'image/webp';

export interface ConvertOptions {
  targetFormat: ConvertFormat;
  quality: number; // 0.6 - 1.0
  backgroundColor: string; // for alpha -> jpeg
}

export type ResizeMode = 'PX' | 'PERCENT' | 'PRESET';

export interface ResizeOptions {
  mode: ResizeMode;
  width?: number;
  height?: number;
  percent?: number;
  keepAspectRatio: boolean;
  presetId?: string;
  rotate: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
}

export interface ResizePreset {
  id: string;
  name: string;
  category: string;
  width: number;
  height: number;
}

export type PdfPageSize = 'A4' | 'FIT' | 'LETTER';
export type PdfOrientation = 'PORTRAIT' | 'LANDSCAPE' | 'AUTO';

export interface ImageToPdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  marginMm: number;
}

export interface ProcessedImageResult {
  id: string;
  originalName: string;
  originalSize: number;
  processedSize: number;
  savedBytes: number;
  percentReduction: number;
  blob: Blob;
  downloadUrl: string;
  width: number;
  height: number;
  format: string;
  isKeptOriginal: boolean;
}

