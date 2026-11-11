/**
 * Dịch vụ mã hóa ảnh sang Blob và điều phối Canvas chất lượng cao
 */

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Lỗi xuất dữ liệu hình ảnh từ canvas.'));
        }
      },
      format,
      quality
    );
  });
}

/**
 * Thu nhỏ nhiều bước (Step-down scale) chống răng cưa và giữ chi tiết sắc nét tuyệt đối
 */
export function stepDownScale(
  source: HTMLImageElement | ImageBitmap,
  targetW: number,
  targetH: number
): HTMLCanvasElement {
  let curW = source.width || (source as HTMLImageElement).naturalWidth;
  let curH = source.height || (source as HTMLImageElement).naturalHeight;

  let curCanvas = document.createElement('canvas');
  curCanvas.width = curW;
  curCanvas.height = curH;
  let curCtx = curCanvas.getContext('2d');
  if (!curCtx) return curCanvas;

  curCtx.imageSmoothingEnabled = true;
  curCtx.imageSmoothingQuality = 'high';
  curCtx.drawImage(source, 0, 0);

  // Thu nhỏ phân nửa từng bước cho đến khi gần sát target
  while (curW * 0.5 > targetW && curH * 0.5 > targetH) {
    curW = Math.round(curW * 0.5);
    curH = Math.round(curH * 0.5);

    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = curW;
    nextCanvas.height = curH;
    const nextCtx = nextCanvas.getContext('2d');
    if (nextCtx) {
      nextCtx.imageSmoothingEnabled = true;
      nextCtx.imageSmoothingQuality = 'high';
      nextCtx.drawImage(curCanvas, 0, 0, curW, curH);
    }
    curCanvas.width = 0;
    curCanvas.height = 0;
    curCanvas = nextCanvas;
    curCtx = nextCtx;
  }

  // Bước cuối cùng đạt chính xác targetW, targetH
  if (curW !== targetW || curH !== targetH) {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    const finalCtx = finalCanvas.getContext('2d');
    if (finalCtx) {
      finalCtx.imageSmoothingEnabled = true;
      finalCtx.imageSmoothingQuality = 'high';
      finalCtx.drawImage(curCanvas, 0, 0, targetW, targetH);
    }
    curCanvas.width = 0;
    curCanvas.height = 0;
    return finalCanvas;
  }

  return curCanvas;
}

export interface RenderOptions {
  bg?: string;
  rotate?: number; // 0, 90, 180, 270
  flipH?: boolean;
  flipV?: boolean;
}

export function renderWithTransform(
  canvas: HTMLCanvasElement,
  options: RenderOptions
): HTMLCanvasElement {
  const { bg, rotate = 0, flipH = false, flipV = false } = options;
  const isRotated90or270 = rotate === 90 || rotate === 270;
  const finalW = isRotated90or270 ? canvas.height : canvas.width;
  const finalH = isRotated90or270 ? canvas.width : canvas.height;

  const out = document.createElement('canvas');
  out.width = finalW;
  out.height = finalH;
  const ctx = out.getContext('2d');
  if (!ctx) return canvas;

  if (bg) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, finalW, finalH);
  }

  ctx.save();
  ctx.translate(finalW / 2, finalH / 2);
  if (rotate) {
    ctx.rotate((rotate * Math.PI) / 180);
  }
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
  ctx.restore();

  return out;
}

