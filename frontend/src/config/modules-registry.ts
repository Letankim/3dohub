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
    | 'QR_CODE_WORKSPACE';
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
];
