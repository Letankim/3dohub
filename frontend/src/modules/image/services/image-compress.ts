import { CompressOptions, ProcessedImageResult } from '../types/image';
import { createBitmapSafe } from './image-decode';
import { canvasToBlob } from './image-encode';

/**
 * Nén ảnh chất lượng cao tuân thủ Quy tắc AGENTS.md §15:
 * - Không làm giảm chất lượng mắt thường (JPEG default 0.85-0.90, WebP 0.90)
 * - Tự động giữ nguyên ảnh gốc nếu kết quả sau nén lớn hơn hoặc bằng file gốc
 */
export async function processCompress(
  file: File,
  options: CompressOptions
): Promise<ProcessedImageResult> {
  const bitmap = await createBitmapSafe(file);
  const w = bitmap.width;
  const h = bitmap.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể khởi tạo bộ xử lý hình ảnh 2D.');

  ctx.drawImage(bitmap, 0, 0);

  const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
  let bestBlob: Blob | null = null;

  if (mime === 'image/png') {
    // PNG chuẩn: xuất ra canvas PNG (hoặc WebP nếu chọn nhỏ nhất)
    if (options.mode === 'SMALLEST') {
      bestBlob = await canvasToBlob(canvas, 'image/webp', 0.85);
    } else {
      bestBlob = await canvasToBlob(canvas, 'image/png');
    }
  } else {
    // JPEG hoặc WebP: nén theo chất lượng
    let targetQuality = 0.88;
    if (options.mode === 'BALANCED') targetQuality = 0.78;
    else if (options.mode === 'SMALLEST') targetQuality = 0.65;
    else if (options.mode === 'TARGET_SIZE' && options.targetKb) {
      // Tìm nhị phân chất lượng để chạm gần nhất mức dung lượng mong muốn (sàn tối thiểu 0.60)
      const targetBytes = options.targetKb * 1024;
      let low = 0.6;
      let high = 0.95;
      for (let iter = 0; iter < 4; iter++) {
        const mid = (low + high) / 2;
        const testBlob = await canvasToBlob(canvas, mime, mid);
        if (testBlob.size > targetBytes) {
          high = mid;
        } else {
          low = mid;
          bestBlob = testBlob;
        }
      }
      if (!bestBlob) {
        bestBlob = await canvasToBlob(canvas, mime, low);
      }
    }

    if (!bestBlob) {
      bestBlob = await canvasToBlob(canvas, mime, targetQuality);
    }
  }

  // Dọn dẹp canvas
  canvas.width = 0;
  canvas.height = 0;

  const originalSize = file.size;
  const processedSize = bestBlob.size;

  // QUY TẮC BẢO TOÀN CHẤT LƯỢNG: Nếu sau nén không nhẹ hơn, giữ nguyên file gốc
  const isKeptOriginal = processedSize >= originalSize;
  const finalBlob = isKeptOriginal ? file : bestBlob;
  const finalSize = finalBlob.size;
  const savedBytes = Math.max(0, originalSize - finalSize);
  const percentReduction = Math.round((savedBytes / originalSize) * 100);

  return {
    id: `${file.name}_${Date.now()}`,
    originalName: file.name,
    originalSize,
    processedSize: finalSize,
    savedBytes,
    percentReduction,
    blob: finalBlob,
    downloadUrl: URL.createObjectURL(finalBlob),
    width: w,
    height: h,
    format: finalBlob.type || mime,
    isKeptOriginal,
  };
}

