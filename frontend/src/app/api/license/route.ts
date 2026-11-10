import { NextResponse } from 'next/server';

// Luôn đọc biến môi trường ở thời điểm chạy (không prerender lúc build).
export const dynamic = 'force-dynamic';

export async function GET() {
  const key =
    process.env.SYNCFUSION_LICENSE_KEY ||
    process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ||
    '';
  return NextResponse.json({ key: key.trim() }, { headers: { 'Cache-Control': 'no-store' } });
}
