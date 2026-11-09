import { NextResponse } from 'next/server';

const FALLBACK_KEY =
  'Ngo9BigBOggjGy1/VkN+XU9HcVRAXWFPY1J0WGNQb192f1ZFal1RT3RFQFtiSH5ad0NgXH1ddnJQRGtfVA==';

export async function GET() {
  const key =
    process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ||
    process.env.SYNCFUSION_LICENSE_KEY ||
    FALLBACK_KEY;
  return NextResponse.json({ key });
}

