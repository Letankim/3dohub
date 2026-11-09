import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint xử lý yêu cầu Import từ Syncfusion Document Editor.
 * Khi người dùng chọn mở file .docx, endpoint này nhận file,
 * chuyển tiếp sang backend để chuẩn hóa và trả về định dạng SFDT JSON.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('files') || formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: 'Không tìm thấy tệp tải lên' },
        { status: 400 }
      );
    }

    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000';

    const backendFormData = new FormData();
    const fileName = (file as File).name || 'document.docx';
    backendFormData.append('file', file, fileName);
    backendFormData.append('profile_id', 'AUTO');

    const res = await fetch(`${backendUrl}/api/v1/van-ban/normalize-docx`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Không thể xử lý tệp .docx' },
        { status: res.status }
      );
    }

    const result = await res.json();
    if (result?.data?.sfdt) {
      // Syncfusion DocumentEditor Import mong đợi trả về chuỗi SFDT JSON
      return NextResponse.json(result.data.sfdt);
    }

    return NextResponse.json(
      { error: 'Tệp không chứa dữ liệu SFDT hợp lệ' },
      { status: 422 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: 'Lỗi máy chủ khi đọc tệp văn bản', details: String(err) },
      { status: 500 }
    );
  }
}

