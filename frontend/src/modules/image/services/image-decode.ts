/**
 * Dịch vụ giải mã và nạp ảnh an toàn trong trình duyệt
 */

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function loadImageElement(
  source: File | Blob
): Promise<{ img: HTMLImageElement; width: number; height: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      resolve({
        img,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        url,
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Không thể giải mã tệp hình ảnh.'));
    };

    img.src = url;
  });
}

export async function createBitmapSafe(source: File | Blob): Promise<ImageBitmap> {
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      return await createImageBitmap(source, {
        imageOrientation: 'from-image',
      });
    } catch {
      // Fallback nếu options không hỗ trợ
      return await createImageBitmap(source);
    }
  }
  const { img, url } = await loadImageElement(source);
  // Khởi tạo canvas phụ để tạo ImageBitmap
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(img, 0, 0);
  URL.revokeObjectURL(url);
  return await createImageBitmap(canvas);
}

