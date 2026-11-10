/**
 * 3DoHub Document Normalizer — Microsoft Office (MSO) Clipboard Exporter
 * Writes full MSO HTML and plain text to system clipboard for MS Word & Google Docs fidelity.
 */

export async function copyMsoHtmlToClipboard(
  htmlContent: string,
  plainText: string
): Promise<boolean> {
  // 1. Modern Async Clipboard API with ClipboardItem (Chrome, Edge, Firefox, Safari)
  if (typeof window !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
    try {
      const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
      const textBlob = new Blob([plainText || ''], { type: 'text/plain' });
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': htmlBlob,
          'text/plain': textBlob,
        }),
      ]);
      return true;
    } catch (err) {
      console.warn('navigator.clipboard.write failed, falling back:', err);
    }
  }

  // 2. Legacy execCommand('copy') fallback with custom ClipboardEvent
  if (typeof document !== 'undefined') {
    try {
      let copied = false;
      const listener = (e: ClipboardEvent) => {
        e.preventDefault();
        if (e.clipboardData) {
          e.clipboardData.setData('text/html', htmlContent);
          e.clipboardData.setData('text/plain', plainText || '');
          copied = true;
        }
      };
      document.addEventListener('copy', listener);
      document.execCommand('copy');
      document.removeEventListener('copy', listener);
      if (copied) return true;
    } catch (exErr) {
      console.warn('execCommand fallback failed:', exErr);
    }
  }

  return false;
}

