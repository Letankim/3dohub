/**
 * Helper utilities for generating standard QR Code payload formats and handling exports.
 */

import { WifiConfig, VCardConfig, EmailConfig, PhoneConfig, QrContentType } from './qr-types';

export function buildWifiPayload(config: WifiConfig): string {
  const enc = config.encryption || 'WPA';
  const hidden = config.hidden ? 'true' : 'false';
  const pass = config.password || '';
  return `WIFI:S:${config.ssid};T:${enc};P:${pass};H:${hidden};;`;
}

export function buildVCardPayload(card: VCardConfig): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.fullName || 'Người liên hệ'}`,
    card.phone ? `TEL:${card.phone}` : '',
    card.email ? `EMAIL:${card.email}` : '',
    card.organization ? `ORG:${card.organization}` : '',
    card.title ? `TITLE:${card.title}` : '',
    card.website ? `URL:${card.website}` : '',
    card.address ? `ADR:;;${card.address};;;;` : '',
    'END:VCARD',
  ];
  return lines.filter(Boolean).join('\n');
}

export function buildEmailPayload(config: EmailConfig): string {
  const params = new URLSearchParams();
  if (config.subject) params.append('subject', config.subject);
  if (config.body) params.append('body', config.body);
  const q = params.toString();
  return `mailto:${config.email}${q ? `?${q}` : ''}`;
}

export function buildPhonePayload(config: PhoneConfig): string {
  if (config.action === 'sms') {
    const body = config.smsBody ? `?body=${encodeURIComponent(config.smsBody)}` : '';
    return `sms:${config.phone}${body}`;
  }
  return `tel:${config.phone}`;
}

export function downloadQrCanvasAsPng(containerId: string, filename: string = 'ma-qr.png'): boolean {
  if (typeof document === 'undefined') return false;
  const container = document.getElementById(containerId);
  if (!container) return false;

  const canvas = container.querySelector('canvas');
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.click();
    return true;
  }

  const svg = container.querySelector('svg');
  if (svg) {
    const xml = new XMLSerializer().serializeToString(svg);
    const svg64 = btoa(unescape(encodeURIComponent(xml)));
    const image64 = 'data:image/svg+xml;base64,' + svg64;
    const img = new Image();
    img.src = image64;
    img.onload = () => {
      const c = document.createElement('canvas');
      const scale = 2;
      c.width = (svg.clientWidth || 300) * scale;
      c.height = (svg.clientHeight || 300) * scale;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        const a = document.createElement('a');
        a.download = filename;
        a.href = c.toDataURL('image/png');
        a.click();
      }
    };
    return true;
  }
  return false;
}

export function downloadQrSvg(containerId: string, filename: string = 'ma-qr.svg'): boolean {
  if (typeof document === 'undefined') return false;
  const container = document.getElementById(containerId);
  const svg = container?.querySelector('svg');
  if (!svg) {
    // If rendered as canvas, fallback to PNG
    return downloadQrCanvasAsPng(containerId, filename.replace('.svg', '.png'));
  }
  const svgData = new XMLSerializer().serializeToString(svg);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = filename;
  a.href = url;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}

export async function copyQrCanvasToClipboard(containerId: string): Promise<boolean> {
  if (typeof document === 'undefined' || !navigator.clipboard) return false;
  const container = document.getElementById(containerId);
  if (!container) return false;

  const canvas = container.querySelector('canvas');
  if (canvas) {
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) return resolve(false);
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          resolve(true);
        } catch {
          resolve(false);
        }
      });
    });
  }

  const svg = container.querySelector('svg');
  if (svg) {
    return new Promise((resolve) => {
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const image64 = 'data:image/svg+xml;base64,' + svg64;
      const img = new Image();
      img.src = image64;
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = (svg.clientWidth || 300) * 2;
        c.height = (svg.clientHeight || 300) * 2;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, c.width, c.height);
          ctx.drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(async (blob) => {
            if (!blob) return resolve(false);
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              resolve(true);
            } catch {
              resolve(false);
            }
          });
        } else {
          resolve(false);
        }
      };
      img.onerror = () => resolve(false);
    });
  }
  return false;
}

export function printQrElement(containerId: string, title: string = 'Mã QR'): void {
  if (typeof window === 'undefined') return;
  const container = document.getElementById(containerId);
  if (!container) return;

  const printWindow = window.open('', '_blank', 'width=600,height=600');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justifyContent: center;
            min-height: 100vh;
            font-family: Arial, sans-serif;
            text-align: center;
          }
          h2 { margin-bottom: 24px; color: #0F172A; }
          .qr-box { padding: 16px; border: 1px solid #E2E8F0; border-radius: 8px; display: inline-block; }
        </style>
      </head>
      <body>
        <h2>${title}</h2>
        <div class="qr-box">${container.innerHTML}</div>
        <script>
          window.onload = function() {
            window.print();
            window.close();
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

