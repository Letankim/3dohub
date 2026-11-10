/**
 * PDF Page Thumbnail Rendering Service using pdfjs-dist & HTML5 Canvas
 */

let pdfjsLib: any = null;

async function getPdfjs() {
  if (typeof window === 'undefined') return null;
  if (!pdfjsLib) {
    try {
      const mod = await import('pdfjs-dist/build/pdf');
      pdfjsLib = mod.default || mod;
      if (pdfjsLib.GlobalWorkerOptions && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
    } catch (err) {
      console.warn('Could not load pdfjs-dist, will use lightweight fallback:', err);
    }
  }
  return pdfjsLib;
}

/**
 * Render thumbnail for a specific page of a PDF document
 */
export async function renderPageThumbnail(
  buffer: ArrayBuffer,
  pageNumber: number,
  targetWidth = 140
): Promise<string> {
  const pdfjs = await getPdfjs();

  if (!pdfjs) {
    return createPlaceholderThumbnail(pageNumber);
  }

  try {
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer.slice(0)) });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const originalViewport = page.getViewport({ scale: 1.0 });
    const scale = targetWidth / originalViewport.width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return createPlaceholderThumbnail(pageNumber);

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.warn(`Thumbnail generation failed for page ${pageNumber}:`, err);
    return createPlaceholderThumbnail(pageNumber);
  }
}

/**
 * Lightweight SVG data URL thumbnail fallback
 */
function createPlaceholderThumbnail(pageNumber: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="140" height="198" viewBox="0 0 140 198">
    <rect width="140" height="198" fill="#F8FAFC" rx="4" stroke="#CBD5E1" stroke-width="1.5"/>
    <rect x="18" y="24" width="104" height="10" fill="#E2E8F0" rx="2"/>
    <rect x="18" y="42" width="90" height="8" fill="#E2E8F0" rx="2"/>
    <rect x="18" y="58" width="100" height="8" fill="#E2E8F0" rx="2"/>
    <rect x="18" y="74" width="75" height="8" fill="#E2E8F0" rx="2"/>
    <circle cx="70" cy="130" r="22" fill="#EFF6FF" stroke="#93C5FD" stroke-width="1.5"/>
    <text x="70" y="136" font-family="'Times New Roman', serif" font-size="14" font-weight="bold" fill="#1D4ED8" text-anchor="middle">${pageNumber}</text>
    <text x="70" y="172" font-family="sans-serif" font-size="11" fill="#64748B" text-anchor="middle">Trang ${pageNumber}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
