/**
 * Core PDF Operations Engine using pdf-lib & JSZip
 */

import { PDFDocument, degrees } from 'pdf-lib';
import JSZip from 'jszip';
import { CompressLevel, PdfLoadedFile, PdfPageItem } from '../types/pdf';

export async function readPdfFile(file: File): Promise<PdfLoadedFile> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  const pageCount = pdfDoc.getPageCount();

  return {
    id: `pdf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    file,
    name: file.name,
    sizeBytes: file.size,
    pageCount,
    arrayBuffer,
  };
}

/**
 * Merge multiple PDF array buffers into a single PDF
 */
export async function mergePdfBuffers(buffers: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const buf of buffers) {
    const srcDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((p) => mergedDoc.addPage(p));
  }

  return await mergedDoc.save({ useObjectStreams: true });
}

/**
 * Extract selected pages into a single new PDF document
 */
export async function extractPdfPages(
  buffer: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const validIndices = pageIndices.filter((idx) => idx >= 0 && idx < srcDoc.getPageCount());
  if (validIndices.length === 0) {
    throw new Error('Vui lòng chọn ít nhất 1 trang để trích xuất.');
  }

  const copiedPages = await newDoc.copyPages(srcDoc, validIndices);
  copiedPages.forEach((p) => newDoc.addPage(p));

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Split each page of PDF into separate PDF files and bundle into a ZIP
 */
export async function splitPdfIntoZip(
  buffer: ArrayBuffer,
  baseFilename: string
): Promise<Blob> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const count = srcDoc.getPageCount();
  const zip = new JSZip();
  const rawBase = baseFilename.replace(/\.pdf$/i, '');

  for (let i = 0; i < count; i++) {
    const singleDoc = await PDFDocument.create();
    const [page] = await singleDoc.copyPages(srcDoc, [i]);
    singleDoc.addPage(page);
    const pdfBytes = await singleDoc.save({ useObjectStreams: true });

    const pageNumStr = String(i + 1).padStart(String(count).length, '0');
    zip.file(`${rawBase}_Trang_${pageNumStr}.pdf`, pdfBytes);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Apply reordering, page rotation, and page deletions
 */
export async function organizePdfPages(
  buffer: ArrayBuffer,
  pages: PdfPageItem[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  const newDoc = await PDFDocument.create();

  const activePages = pages.filter((p) => !p.isDeleted);
  if (activePages.length === 0) {
    throw new Error('Tài liệu phải còn ít nhất một trang hợp lệ.');
  }

  for (const pageItem of activePages) {
    const [copiedPage] = await newDoc.copyPages(srcDoc, [pageItem.pageIndex]);
    if (pageItem.rotation) {
      const currentRot = copiedPage.getRotation().angle;
      copiedPage.setRotation(degrees((currentRot + pageItem.rotation) % 360));
    }
    newDoc.addPage(copiedPage);
  }

  return await newDoc.save({ useObjectStreams: true });
}

/**
 * Compress PDF document: cleans metadata, flattens unused objects, and compresses streams
 */
export async function compressPdfDocument(
  buffer: ArrayBuffer,
  level: CompressLevel
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });

  // Clean unnecessary metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('3DoHub PDF Utility');
  pdfDoc.setCreator('3DoHub Platform');

  // Fast & efficient object streams compression
  const bytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: level === 'HIGH' ? 50 : 20,
  });

  return bytes;
}

/**
 * Format bytes to readable string (e.g. 1.25 MB, 450 KB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Parse page range string like "1-3, 5, 8-10" into 0-based page indices
 */
export function parsePageRangeString(rangeStr: string, totalPages: number): number[] {
  const indices = new Set<number>();
  const parts = rangeStr.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const minP = Math.max(1, Math.min(start, end));
        const maxP = Math.min(totalPages, Math.max(start, end));
        for (let p = minP; p <= maxP; p++) {
          indices.add(p - 1);
        }
      }
    } else {
      const p = parseInt(part, 10);
      if (!isNaN(p) && p >= 1 && p <= totalPages) {
        indices.add(p - 1);
      }
    }
  }

  return Array.from(indices).sort((a, b) => a - b);
}
