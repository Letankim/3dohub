/**
 * Central Registry of Top-Level Modules in 3DoHub
 * Every entry has a dedicated route path so users can navigate or share direct URLs.
 */

export interface HubNavModule {
  key: string;
  code: string;
  label: string;
  path: string;
  shortDesc: string;
  category: 'MAIN_HUB';
  targetTab:
    | 'HERO_HOME'
    | 'UTILITIES_HUB'
    | 'EDITOR_WORKSPACE'
    | 'EXCEL_WORKSPACE'
    | 'SHORT_LINK_WORKSPACE'
    | 'QR_CODE_WORKSPACE'
    | 'PDF_WORKSPACE'
    | 'IMAGE_WORKSPACE'
    | 'DOC_LOOKUP_WORKSPACE'
    | 'SPELL_CHECK_WORKSPACE';
}

export const HUB_MODULES_REGISTRY: HubNavModule[] = [
  {
    key: 'home-overview',
    code: 'TRANG_CHU',
    label: 'Trang chủ',
    path: '/',
    shortDesc: 'Bảng điều khiển trung tâm 3DoHub & tổng quan nền tảng',
    category: 'MAIN_HUB',
    targetTab: 'HERO_HOME',
  },
  {
    key: 'van-ban-module',
    code: 'CHUAN_HOA_VB',
    label: 'Chuẩn hóa văn bản',
    path: '/tien-ich/chuan-hoa-van-ban',
    shortDesc:
      'Trình soạn thảo Word A4 nhiều trang, chuẩn hóa thể thức 5 khối, 17 mẫu văn bản & rà soát 18 quy tắc',
    category: 'MAIN_HUB',
    targetTab: 'EDITOR_WORKSPACE',
  },
  {
    key: 'excel-module',
    code: 'CHUAN_HOA_EXCEL',
    label: 'Chuẩn hóa Excel',
    path: '/tien-ich/chuan-hoa-excel',
    shortDesc:
      'Chuẩn hóa bảng tính & trang in Excel A4 dọc/ngang, chống lỗi ###, chống mất chữ ở cả ô gộp dọc/ngang & hoàn tác 1 chạm',
    category: 'MAIN_HUB',
    targetTab: 'EXCEL_WORKSPACE',
  },
  {
    key: 'doc-lookup-module',
    code: 'TRA_CUU_VB',
    label: 'Tra cứu thể thức',
    path: '/tien-ich/tra-cuu-van-ban',
    shortDesc:
      'Tra cứu quy chuẩn thể thức NĐ 30/2020, HD 05-HD/VPTW, NĐ 152/2025, TT 26/2019, TT 68/2023 & liên kết biểu mẫu chuẩn',
    category: 'MAIN_HUB',
    targetTab: 'DOC_LOOKUP_WORKSPACE',
  },
  {
    key: 'spell-check-module',
    code: 'CHECK_CHINH_TA',
    label: 'Soát lỗi chính tả',
    path: '/tien-ich/check-chinh-ta',
    shortDesc:
      'Soát lỗi chính tả gõ phím Telex/VNI, từ ngữ hành chính dễ nhầm lẫn, quy tắc viết hoa chức vụ & dấu câu',
    category: 'MAIN_HUB',
    targetTab: 'SPELL_CHECK_WORKSPACE',
  },
  {
    key: 'short-link-module',
    code: 'RUT_GON_LINK',
    label: 'Rút gọn link',
    path: '/tien-ich/rut-gon-link',
    shortDesc:
      'Rút gọn link nhanh chóng, tùy biến mã rút gọn và theo dõi lượt click trực quan',
    category: 'MAIN_HUB',
    targetTab: 'SHORT_LINK_WORKSPACE',
  },
  {
    key: 'qr-code-module',
    code: 'TAO_MA_QR',
    label: 'Tạo mã QR',
    path: '/tien-ich/tao-ma-qr',
    shortDesc:
      'Tạo mã QR đa năng cho URL, Wi-Fi, danh thiếp vCard, văn bản, email với tùy biến màu sắc, logo và tải ảnh PNG/SVG',
    category: 'MAIN_HUB',
    targetTab: 'QR_CODE_WORKSPACE',
  },
  {
    key: 'pdf-module',
    code: 'TIEN_ICH_PDF',
    label: 'Tiện ích PDF',
    path: '/tien-ich/xu-ly-pdf',
    shortDesc:
      'Bộ công cụ nén file, trích xuất trang, ghép nối và sắp xếp tài liệu PDF nhanh chóng, tiện lợi',
    category: 'MAIN_HUB',
    targetTab: 'PDF_WORKSPACE',
  },
  {
    key: 'image-module',
    code: 'TIEN_ICH_ANH',
    label: 'Tiện ích Ảnh',
    path: '/tien-ich/xu-ly-anh',
    shortDesc:
      'Nén ảnh giữ nét, đổi định dạng JPG/PNG/WebP, thay đổi kích cỡ theo mẫu CCCD/Avatar và chuyển ảnh sang PDF',
    category: 'MAIN_HUB',
    targetTab: 'IMAGE_WORKSPACE',
  },
];
