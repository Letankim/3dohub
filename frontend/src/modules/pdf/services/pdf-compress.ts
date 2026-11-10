/**
 * Nén PDF thực sự: dựng lại từng trang thành ảnh JPEG nén rồi ghép lại thành PDF mới.
 * Luôn chọn kết quả nhỏ nhất; nếu không nhỏ hơn bản gốc thì giữ nguyên bản gốc.
 */

import { PDFDocument } from 'pdf-lib';
import { CompressLevel, CompressMethod } from '../types/pdf';
import { getPdfDoc, renderPageToCanvas } from './pdf-thumbnail';

interface LevelConfig {
  scale: number; // hệ số phóng so với 72 dpi (2.0 ≈ 144 dpi)
  quality: number; // chất lượng JPEG 0..1
  maxSidePx: number;
}

const LEVEL_CONFIG: Record<CompressLevel, LevelConfig> = {
  LOW: { scale: 2.0, quality: 0.78, maxSidePx: 2600 },
  MEDIUM: { scale: 1.5, quality: 0.6, maxSidePx: 2000 },
  HIGH: { scale: 1.15, quality: 0.45, maxSidePx: 1500 },
};

export interface CompressOutput {
  bytes: Uint8Array;
  method: CompressMethod;
}

function canvasToJpeg(canvas: HTMLCanvasElement, quality: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) return reject(new Error('Không tạo được ảnh nén.'));
        resolve(new Uint8Array(await blob.arrayBuffer()));
      },
      'image/jpeg',
      quality
    );
  });
}

async function rasterCompress(
  buffer: ArrayBuffer,
  cfg: LevelConfig,
  onProgress?: (percent: number) => void
): Promise<Uint8Array | null> {
  const pdf = await getPdfDoc(buffer);
  if (!pdf) return null;
  const out = await PDFDocument.create();

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const base = page.getViewport({ scale: 1 });
    const fit = cfg.maxSidePx / Math.max(base.width, base.height);
    const canvas = await renderPageToCanvas(page, Math.min(cfg.scale, fit));
    if (!canvas) return null;
    const jpg = await canvasToJpeg(canvas, cfg.quality);
    canvas.width = 0;
    const img = await out.embedJpg(jpg);
    const outPage = out.addPage([base.width, base.height]);
    outPage.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
    onProgress?.(Math.round((i / pdf.numPages) * 100));
  }
  return out.save({ useObjectStreams: true });
}

async function losslessResave(buffer: ArrayBuffer): Promise<Uint8Array> {
  const doc = await PDFDocument.load(buffer, { ignoreEncryption: true });
  doc.setTitle('');
  doc.setAuthor('');
  doc.setSubject('');
  doc.setKeywords([]);
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

export async function compressPdfDocument(
  buffer: ArrayBuffer,
  level: CompressLevel,
  onProgress?: (percent: number) => void
): Promise<CompressOutput> {
  const original = new Uint8Array(buffer);
  let best: CompressOutput = { bytes: original, method: 'ORIGINAL' };

  try {
    const lossless = await losslessResave(buffer);
    if (lossless.byteLength < best.bytes.byteLength) best = { bytes: lossless, method: 'LOSSLESS' };
  } catch {
    // bỏ qua, dùng bước tiếp theo
  }

  try {
    const raster = await rasterCompress(buffer, LEVEL_CONFIG[level], onProgress);
    if (raster && raster.byteLength < best.bytes.byteLength) best = { bytes: raster, method: 'RASTER' };
  } catch {
    // giữ kết quả tốt nhất hiện có
  }

  return best;
}

