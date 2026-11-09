import { NextRequest, NextResponse } from 'next/server';
import { createSignedSecurityHeaders, generateNonce } from '@/utils/security-signer';

function createErrorEnvelope(
  message: string,
  field: string,
  code: string,
  rejectedValue: unknown = null,
  status: number = 400
) {
  const reqId = `req_${generateNonce(16)}`;
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
      meta: null,
      errors: {
        code: 'VALIDATION_ERROR',
        details: [
          {
            field,
            code,
            message,
            rejected_value: rejectedValue,
          },
        ],
      },
      request_id: reqId,
    },
    { status }
  );
}

/**
 * Enterprise Endpoint xử lý yêu cầu Import từ Syncfusion Document Editor
 * Tuân thủ nghiêm ngặt:
 * - RULE 2: Chuẩn envelope { success, message, data, meta, errors, request_id } khi có lỗi
 * - RULE 6: Ký HMAC-SHA256, Nonce, Timestamp & Checksum sang Backend
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('files') || formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return createErrorEnvelope(
        'Không tìm thấy tệp tải lên',
        'file',
        'MISSING_FILE',
        null,
        400
      );
    }

    const rawUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000';
    const cleanBase = rawUrl.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    const targetUrl = `${cleanBase}/api/v1/van-ban/normalize-docx`;

    const backendFormData = new FormData();
    const fileName = (file as File).name || 'document.docx';
    backendFormData.append('file', file, fileName);
    backendFormData.append('profile_id', 'AUTO');

    // Ký xác thực mật mã doanh nghiệp HMAC-SHA256 theo Rule 6
    const secHeaders = createSignedSecurityHeaders(
      'POST',
      '/api/v1/van-ban/normalize-docx',
      'multipart:form-data'
    );

    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        ...secHeaders,
        'ngrok-skip-browser-warning': 'true',
      },
      body: backendFormData,
    });

    const result = await res.json().catch(() => null);

    if (!res.ok || !result?.success) {
      const errMsg = result?.message || 'Không thể xử lý tệp .docx';
      const errDetails = result?.errors?.details?.[0];
      return createErrorEnvelope(
        errMsg,
        errDetails?.field || 'file',
        errDetails?.code || 'DOCX_PROCESSING_FAILED',
        errDetails?.rejected_value ?? fileName,
        res.status || 400
      );
    }

    if (result?.data?.sfdt) {
      // Syncfusion DocumentEditor Import mong đợi trả về đối tượng SFDT JSON trực tiếp
      return NextResponse.json(result.data.sfdt);
    }

    return createErrorEnvelope(
      'Tệp không chứa dữ liệu SFDT hợp lệ',
      'file',
      'INVALID_SFDT_DATA',
      fileName,
      422
    );
  } catch (err) {
    return createErrorEnvelope(
      'Lỗi hệ thống khi đọc tệp văn bản',
      'server',
      'INTERNAL_SERVER_ERROR',
      String(err),
      500
    );
  }
}
