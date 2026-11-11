import { ConvertOptions, ProcessedImageResult } from '../types/image';
import { createBitmapSafe } from './image-decode';
import { canvasToBlob } from './image-encode';

export async function processConvert(
  file: File,
  options: ConvertOptions
): Promise<ProcessedImageResult> {
  const bitmap = await createBitmapSafe(file);
  const w = bitmap.width;
  const h = bitmap.height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Không thể khởi tạo bộ xử lý hình ảnh 2D.');

  // Nếu chuyển từ ảnh có alpha (PNG/WebP) sang JPEG -> tô màu nền được chọn (mặc định trắng)
  if (options.targetFormat === 'image/jpeg') {
    ctx.fillStyle = options.backgroundColor || '#FFFFFF';
    ctx.fillRect(0, 0, w, h);
  }

  ctx.drawImage(bitmap, 0, 0);

  const targetQuality = options.targetFormat === 'image/png' ? undefined : options.quality;
  const convertedBlob = await canvasToBlob(canvas, options.targetFormat, targetQuality);

  canvas.width = 0;
  canvas.height = 0;

  const originalSize = file.size;
  const processedSize = convertedBlob.size;
  const savedBytes = Math.max(0, originalSize - processedSize);
  const percentReduction = Math.round((savedBytes / originalSize) * 100);

  // Đổi phần mở rộng tên file
  let newName = file.name;
  const ext = options.targetFormat === 'image/jpeg' ? '.jpg' : options.targetFormat === 'image/png' ? '.png' : '.webp';
  newName = newName.replace(/\.[^/.]+$/, '') + ext;

  return {
    id: `${file.name}_${Date.now()}`,
    originalName: newName,
    originalSize,
    processedSize,
    savedBytes,
    percentReduction,
    blob: convertedBlob,
    downloadUrl: URL.createObjectURL(convertedBlob),
    width: w,
    height: h,
    format: options.targetFormat,
    isKeptOriginal: false,
  };
}
