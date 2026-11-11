import { ImageToPdfOptions } from '../types/image';
import { createBitmapSafe } from './image-decode';
import { canvasToBlob } from './image-encode';

// 1mm = 2.83465 pt
const MM_TO_PT = 2.83465;

const PAGE_SIZES = {
  A4: [595.28, 841.89], // pt (210 x 297 mm)
  LETTER: [612.0, 792.0], // pt (8.5 x 11 in)
};

export async function processImagesToPdf(
  files: File[],
  options: ImageToPdfOptions,
  onProgress?: (current: number, total: number) => void
): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  const marginPt = options.marginMm * MM_TO_PT;

  for (let idx = 0; idx < files.length; idx++) {
    const file = files[idx];
    if (onProgress) onProgress(idx + 1, files.length);

    let imgBytes: Uint8Array;
    let isPng = file.type === 'image/png';
    let isJpg = file.type === 'image/jpeg' || file.type === 'image/jpg';

    if (isJpg || isPng) {
      const arrayBuffer = await file.arrayBuffer();
      imgBytes = new Uint8Array(arrayBuffer);
    } else {
      // Chuyển đổi định dạng khác (WebP, BMP, GIF) sang JPEG để nhúng vào PDF
      const bitmap = await createBitmapSafe(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bitmap, 0, 0);
      }
      const blob = await canvasToBlob(canvas, 'image/jpeg', 0.92);
      canvas.width = 0;
      canvas.height = 0;
      imgBytes = new Uint8Array(await blob.arrayBuffer());
      isJpg = true;
      isPng = false;
    }

    let embeddedImage;
    if (isPng) {
      try {
        embeddedImage = await pdfDoc.embedPng(imgBytes);
      } catch {
        // Fallback nhúng JPG nếu PNG bị lỗi header
        embeddedImage = await pdfDoc.embedJpg(imgBytes);
      }
    } else {
      embeddedImage = await pdfDoc.embedJpg(imgBytes);
    }

    const { width: imgW, height: imgH } = embeddedImage;

    let pageW: number;
    let pageH: number;

    if (options.pageSize === 'FIT') {
      // Khổ trang khớp đúng kích thước ảnh + lề
      pageW = imgW + marginPt * 2;
      pageH = imgH + marginPt * 2;
    } else {
      const base = options.pageSize === 'LETTER' ? PAGE_SIZES.LETTER : PAGE_SIZES.A4;
      const isLandscape =
        options.orientation === 'LANDSCAPE' ||
        (options.orientation === 'AUTO' && imgW > imgH);

      pageW = isLandscape ? base[1] : base[0];
      pageH = isLandscape ? base[0] : base[1];
    }

    const page = pdfDoc.addPage([pageW, pageH]);

    // Tính toán tỷ lệ vừa vặn trong khung trừ lề
    const availableW = Math.max(10, pageW - marginPt * 2);
    const availableH = Math.max(10, pageH - marginPt * 2);

    const scale = Math.min(availableW / imgW, availableH / imgH, 1.0);
    const drawW = imgW * scale;
    const drawH = imgH * scale;

    const posX = marginPt + (availableW - drawW) / 2;
    const posY = marginPt + (availableH - drawH) / 2;

    page.drawImage(embeddedImage, {
      x: posX,
      y: posY,
      width: drawW,
      height: drawH,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
}
