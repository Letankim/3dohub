/**
 * Dựng hình trang PDF (hình thu nhỏ, xem trước) bằng pdfjs-dist & HTML5 Canvas
 */

let pdfjsLib: any = null;
const docCache = new WeakMap<ArrayBuffer, Promise<any>>();

export async function getPdfjs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  if (!pdfjsLib) {
    try {
      const mod = await import('pdfjs-dist/build/pdf');
      pdfjsLib = (mod as any).default || mod;
      if (pdfjsLib.GlobalWorkerOptions) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
      }
    } catch (err) {
      console.warn('Không tải được bộ dựng PDF:', err);
    }
  }
  return pdfjsLib;
}

/** Mở tài liệu 1 lần và dùng lại cho mọi trang (nhanh hơn nhiều so với mở lại từng trang). */
export async function getPdfDoc(buffer: ArrayBuffer): Promise<any | null> {
  const pdfjs = await getPdfjs();
  if (!pdfjs) return null;
  let cached: Promise<any> | undefined = docCache.get(buffer);
  if (!cached) {
    cached = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) }).promise as Promise<any>;
    docCache.set(buffer, cached);
  }
  try {
    return await cached;
  } catch {
    docCache.delete(buffer);
    return null;
  }
}

/** Dựng 1 trang ra canvas theo hệ số phóng `scale` (có tính cả hướng xoay gốc của trang). */
export async function renderPageToCanvas(
  page: any,
  scale: number,
  extraRotation = 0
): Promise<HTMLCanvasElement | null> {
  const viewport = page.getViewport({ scale, rotation: (page.rotate + extraRotation) % 360 });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

/** Hình thu nhỏ của 1 trang. */
export async function renderPageThumbnail(
  buffer: ArrayBuffer,
  pageNumber: number,
  targetWidth = 140
): Promise<string> {
  try {
    const pdf = await getPdfDoc(buffer);
    if (!pdf) return createPlaceholderThumbnail(pageNumber);
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1 });
    const canvas = await renderPageToCanvas(page, (targetWidth * 1.5) / base.width);
    if (!canvas) return createPlaceholderThumbnail(pageNumber);
    const url = canvas.toDataURL('image/jpeg', 0.8);
    canvas.width = 0;
    return url;
  } catch (err) {
    console.warn(`Không dựng được hình thu nhỏ trang ${pageNumber}:`, err);
    return createPlaceholderThumbnail(pageNumber);
  }
}

/** Hình xem trước kích thước lớn của 1 trang (dùng trong cửa sổ xem). */
export async function renderPagePreview(
  buffer: ArrayBuffer,
  pageNumber: number,
  rotation = 0,
  targetWidth = 900
): Promise<string | null> {
  try {
    const pdf = await getPdfDoc(buffer);
    if (!pdf) return null;
    const page = await pdf.getPage(pageNumber);
    const base = page.getViewport({ scale: 1, rotation: (page.rotate + rotation) % 360 });
    const canvas = await renderPageToCanvas(page, targetWidth / base.width, rotation);
    if (!canvas) return null;
    const url = canvas.toDataURL('image/jpeg', 0.9);
    canvas.width = 0;
    return url;
  } catch {
    return null;
  }
}

function createPlaceholderThumbnail(pageNumber: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="198" viewBox="0 0 140 198">
    <rect width="140" height="198" fill="#F8FAFC" rx="4" stroke="#CBD5E1" stroke-width="1.5"/>
    <text x="70" y="106" font-family="sans-serif" font-size="16" font-weight="bold" fill="#1D4ED8" text-anchor="middle">${pageNumber}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
