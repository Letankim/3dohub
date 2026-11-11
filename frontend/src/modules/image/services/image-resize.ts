import { ResizeOptions, ResizePreset, ProcessedImageResult } from '../types/image';
import { createBitmapSafe } from './image-decode';
import { stepDownScale, renderWithTransform, canvasToBlob } from './image-encode';

export const RESIZE_PRESETS: ResizePreset[] = [
  { id: 'THE_3X4', name: 'Ảnh thẻ 3x4 (300 DPI)', category: 'Hồ sơ & Thẻ', width: 354, height: 472 },
  { id: 'THE_4X6', name: 'Ảnh thẻ 4x6 (300 DPI)', category: 'Hồ sơ & Thẻ', width: 472, height: 709 },
  { id: 'THE_2X3', name: 'Ảnh thẻ 2x3 (300 DPI)', category: 'Hồ sơ & Thẻ', width: 236, height: 354 },
  { id: 'AVATAR', name: 'Avatar đại diện', category: 'Mạng xã hội', width: 800, height: 800 },
  { id: 'BANNER_FB', name: 'Ảnh bìa (1200x630)', category: 'Mạng xã hội', width: 1200, height: 630 },
  { id: 'STORY_IG', name: 'Story / Dọc (1080x1920)', category: 'Mạng xã hội', width: 1080, height: 1920 },
  { id: 'FULL_HD', name: 'Full HD (1920x1080)', category: 'Màn hình & Web', width: 1920, height: 1080 },
  { id: 'HD', name: 'HD chuẩn (1280x720)', category: 'Màn hình & Web', width: 1280, height: 720 },
];

export function computeTargetDimensions(
  origW: number,
  origH: number,
  options: ResizeOptions
): { width: number; height: number } {
  if (options.mode === 'PERCENT') {
    const pct = Math.max(1, Math.min(200, options.percent || 100)) / 100;
    return {
      width: Math.max(1, Math.round(origW * pct)),
      height: Math.max(1, Math.round(origH * pct)),
    };
  }

  if (options.mode === 'PRESET') {
    const p = RESIZE_PRESETS.find((item) => item.id === options.presetId);
    if (p) {
      if (options.keepAspectRatio) {
        const ratio = Math.min(p.width / origW, p.height / origH);
        return {
          width: Math.max(1, Math.round(origW * ratio)),
          height: Math.max(1, Math.round(origH * ratio)),
        };
      }
      return { width: p.width, height: p.height };
    }
  }

  // Chế độ PX
  let targetW = options.width || origW;
  let targetH = options.height || origH;

  if (options.keepAspectRatio) {
    if (options.width && !options.height) {
      targetH = Math.round((options.width / origW) * origH);
    } else if (!options.width && options.height) {
      targetW = Math.round((options.height / origH) * origW);
    } else if (options.width && options.height) {
      // Fit trong khung bounding box
      const ratio = Math.min(options.width / origW, options.height / origH);
      targetW = Math.round(origW * ratio);
      targetH = Math.round(origH * ratio);
    }
  }

  return {
    width: Math.max(1, targetW),
    height: Math.max(1, targetH),
  };
}

export async function processResize(
  file: File,
  options: ResizeOptions
): Promise<ProcessedImageResult> {
  const bitmap = await createBitmapSafe(file);
  const origW = bitmap.width;
  const origH = bitmap.height;

  const { width: targetW, height: targetH } = computeTargetDimensions(origW, origH, options);

  // 1. Thu nhỏ mượt mà
  const scaledCanvas = stepDownScale(bitmap, targetW, targetH);

  // 2. Xoay / Lật nếu có
  const transformedCanvas = renderWithTransform(scaledCanvas, {
    rotate: options.rotate,
    flipH: options.flipH,
    flipV: options.flipV,
  });

  const finalW = transformedCanvas.width;
  const finalH = transformedCanvas.height;

  const mime = file.type || 'image/jpeg';
  const blob = await canvasToBlob(transformedCanvas, mime, 0.92);

  // Dọn dẹp canvas
  scaledCanvas.width = 0;
  scaledCanvas.height = 0;
  transformedCanvas.width = 0;
  transformedCanvas.height = 0;

  const originalSize = file.size;
  const processedSize = blob.size;
  const savedBytes = Math.max(0, originalSize - processedSize);
  const percentReduction = Math.round((savedBytes / originalSize) * 100);

  return {
    id: `${file.name}_${Date.now()}`,
    originalName: file.name,
    originalSize,
    processedSize,
    savedBytes,
    percentReduction,
    blob,
    downloadUrl: URL.createObjectURL(blob),
    width: finalW,
    height: finalH,
    format: mime,
    isKeptOriginal: false,
  };
}

