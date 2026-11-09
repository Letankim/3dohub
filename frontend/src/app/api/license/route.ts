import { NextResponse } from 'next/server';

export async function GET() {
  const key =
    process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ||
    process.env.SYNCFUSION_LICENSE_KEY ||
    '';
  return NextResponse.json({ key });
}

