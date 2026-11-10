# 3DoHub — Enterprise Module Hub Rules & Architecture Standards

You are working on **3DoHub**, an enterprise-grade, high-concurrency modular utility platform built with **Python (FastAPI)** on the backend and **Next.js (App Router, TypeScript, Ant Design, Axios)** on the frontend.

## 1. Core Coding Principles & File Size Constraints
- **Strict Modularity (No Monolithic Files)**: Every source code file (`.py`, `.ts`, `.tsx`) MUST have a single clear responsibility and remain concise (**target <= 250–350 lines per file**). Never bundle unrelated logic into a single giant file.
- **Workflow (Code -> Test -> Pass)**:
  1. Implement or update a module with clean type annotations.
  2. Write or update unit/integration tests (`pytest` for backend, TypeScript build/check for frontend).
  3. Execute the tests and verify 100% pass before proceeding to the next step.

## 2. Mandatory Backend API Contract (`backend/`)
All HTTP responses across every module in `3DoHub` MUST return the exact JSON envelope below, injected with a unique `request_id` (`req_<16-char-hex>`):

### Success Response (`200 OK` / `201 Created`)
```json
{
  "success": true,
  "message": "Mô tả kết quả thực thi thành công",
  "data": {},
  "meta": null,
  "errors": null,
  "request_id": "req_5c56a4cb382a4dbe"
}
```

### Error & Validation Response (`400` / `404` / `422` / `500`)
All validation errors (Pydantic `RequestValidationError` or custom `BusinessValidationException`) MUST return field-level details including `field`, `code`, `message`, and `rejected_value`:
```json
{
  "success": false,
  "message": "Dữ liệu gửi lên không hợp lệ",
  "data": null,
  "meta": null,
  "errors": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "profile_id",
        "code": "INVALID_PROFILE",
        "message": "Khối đơn vị không hợp lệ",
        "rejected_value": "INVALID_VALUE"
      }
    ]
  },
  "request_id": "req_9d2b79f9390ba9c7"
}
```

## 3. Frontend Standards (`frontend/`)
- **Tech Stack**: Next.js (App Router, TypeScript), **Ant Design (`antd`)**, **Axios** (`src/services/api-client.ts`) for all HTTP calls.
- **Enterprise Tech Design System**:
  - Primary color: `#1D4ED8` (Royal Tech Blue), dark accent `#0F172A` (Slate 900), border `#E2E8F0`.
  - Sharp enterprise geometry: `borderRadius: 4` (`4px` for inputs/buttons/tags) and `borderRadiusLG: 6` (`6px` for cards/modals). Do NOT use pill-shaped buttons or oversized `16px+` rounded corners.
  - Responsive layout: Collapsible Left Sidebar (`SidebarNav`), Command Palette (`CTRL+K`), Top Header with breadcrumb & quick unit profile selector, and full mobile/tablet drawer support.
  - **Mandatory Action Button Icons**: All action buttons across the entire platform (e.g., Create, Save, Download, Copy, Delete, Undo, Standardize, Filter, Reset, Close, Open, Share, Cancel) MUST include an intuitive, standard icon from `@ant-design/icons` (e.g., `<PlusOutlined />`, `<DownloadOutlined />`, `<CopyOutlined />`, `<DeleteOutlined />`, `<UndoOutlined />`). Never render bare text-only action buttons.
- **Component Organization**:
  - `src/components/layout/`: Reusable shell (`AppShell`, `SidebarNav`, `TopHeader`).
  - `src/components/common/`: Shared UI widgets (`CommandModal`, `ApiErrorAlert`, `StatBadge`).
  - `src/modules/<module-name>/`: Feature-specific components, hooks, and types.

## 4. Document Normalization Module (`van_ban`) Requirements
- Must preserve **100% feature parity** with `ChuanHoa_VanBanDang.dotm` (`extracted_vba/Module1.bas.bas`):
  - **5 Profiles + Auto-Detection**: `DANG` (QĐ 399-QĐ/TW & HD 05-HD/VPTW), `CHINH_QUYEN` (NĐ 30/2020/NĐ-CP), `CONG_AN` (TT 26/2019/TT-BCA), `QUAN_DOI` (TT 68/2023/TT-BQP), `MTTQ` (QĐ 207/QĐ-MTTW-BTT).
  - **6-Step Normalization Pipeline**: Soft-break cleanup, Auto Header Table creation, Split Glued Title lines, Kính gửi table, Auto Footer Table (Nơi nhận & Chữ ký), A4 margins (`20-20-30-15mm`), Page numbering header, Số/Ký hiệu & Ngày tháng standardization, Heading/Body indentation (`1.27cm`), and 18-rule Logic Validator (`KiemTra_LogicTheThuc`).
  - **17 Standard Templates**: 9 Party templates (`DANG|1..9`) + 8 State templates (`NHA_NUOC|1..8`) with unit info injection and yellow `[...]` placeholder highlighting.
  - **Virtual Web Editor + Dual Export**:
    1. Live A4 Editor where users can paste content from Word/Docs or upload `.docx`.
    2. **Copy with Word Formatting (`mso_html`)**: Rich HTML + MSO CSS so pasting (`Ctrl+V`) into MS Word preserves borderless 2-column tables, Times New Roman fonts, pt sizes, indents, and vector separator lines.
    3. **Download `.docx`**: Native OpenXML `.docx` binary generated via `python-docx` + `lxml`.

## 5. Excel Print Normalization Module (`excel_norm`) Requirements
- Must preserve **100% feature parity** with `ChuanHoa_Excel.xlam` (`excel/extracted/vba_modules/Module1.bas.bas` & `customUI.xml`):
  - **11-Step A4 Print Pipeline**: `get_true_data_bounds` (with stray bottom number trimming), `find_table_header_rows` (29 Vietnamese keywords + multi-row/numbered subheaders), `clamp_last_col_to_header`, `find_table_data_end_row` (separating bottom signature block), `Times New Roman` font + smart `wrap_text`, `FitColumnsSmart` anti-`###`, auto A4 Portrait (`<=6` cols) vs A4 Landscape (`>6` cols), narrow table proportional expansion, `calc_cell_required_height_pt` + `count_word_wrapped_lines` + multi-row vertical merge height distribution (`targetSpan = 2..12`), orphan row prevention, A4 margins (`1.0cm / 1.2cm`), `PrintArea`, repeating `PrintTitleRows`, `Trang &P/&N` footer, `< 8.5pt` small-font warning, and 1-click **Undo (`Hoàn tác` / `HT_KhoiPhuc`)**.

## 6. Enterprise Security, Checksum & Rate Limiting
- Every request to `/api/v1/*` is protected by SHA-256 Payload Checksum (`X-3DoHub-Payload-Hash`), Canonical HMAC-SHA256 Signature (`X-3DoHub-Signature`), Anti-Replay Nonce + Timestamp guard (`X-3DoHub-Nonce`, `X-3DoHub-Timestamp`), OpenXML `.docx`/`.xlsx` anti-zip-bomb verification, and per-IP Sliding-Window Rate Limiting (`120 req/min` general, `35 req/min` compute).

## 7. Modal Architecture & Table Scroll Isolation (`antd` Modals)
- **Zero Full-Body Modal Scrolling for Tables**: When creating modals containing list logs or `<Table />` components, NEVER set `overflowY: 'auto'` or restrictive `maxHeight` on the Modal wrapper (`styles.body`). Doing so pushes top summary banners, action toolbars, and sticky table headers out of sight.
- **Pinned Summaries & Sticky Headers**:
  - Top summary cards, metric badges, search bars, and refresh buttons MUST stay pinned at the top of the modal body.
  - Table column headers (`<thead>`) must remain permanently sticky above data rows.
- **Table-Only Internal Scrolling**:
  - Vertical scrolling must be strictly confined to the `<Table />` body using Ant Design's `scroll={{ y: <height_px>, x: <width_px> }}` (e.g. `scroll={{ y: 280, x: 620 }}`).
  - Pagination bars, record counters, and bottom modal footer actions MUST remain pinned at the bottom.

## 8. Vietnamese Localization & UI Terminology Standards
- **100% User-Facing Vietnamese**: All user-visible labels, system badges, referrers, statuses, table headers, and error messages MUST use clear, idiomatic Vietnamese.
- **Standard Keyword Mappings**:
  - `Direct` -> `Trực tiếp`
  - `Active` / `Inactive` -> `Đang hoạt động` / `Tạm dừng`
  - `Expired` -> `Hết hạn`
  - `Referer` -> `Nguồn giới thiệu`
  - `User Agent` -> `Thiết bị & Trình duyệt`
  - `Clicks` -> `Lượt click`
  - `Total Links` -> `Tổng số liên kết`

## 9. Client Privacy & Anonymous Device Session Isolation
- **No Global Public Entity Dumping**: Utility modules where users generate temporary or personal assets (short links, QR history, scratchpads) MUST NEVER expose an unauthenticated global endpoint that dumps all users' data.
- **Device Session ID (`session_id`)**:
  - Each browser client maintains an anonymous UUID stored in `localStorage` via `getClientSessionId()`.
  - When creating items, `session_id` is sent with the payload and recorded in the database.
  - When fetching/listing items, queries are strictly constrained by the user's `session_id` and/or locally stored item codes (`3dohub_device_created_link_codes`).
  - No user or crawler can view or alter entities belonging to another device.

## 10. Layout Responsiveness & Vector Graphics Standards
- **Anti-Squishing on Mobile Tables**: Data tables must define appropriate `width` and `minWidth` on code/link columns, accompanied by `scroll={{ x: ... }}` and `whiteSpace: 'nowrap'` to prevent characters from wrapping vertically into awkward single-letter columns.
- **Crisp Vector QR Rendering**: Always render QR codes with vector SVG (`<QRCode type="svg" ... />`) rather than raster canvas/PNG on responsive displays to prevent blurry or jagged pixel edges.



## 11. Client-Side Utility Module Architecture (`pdf`, `image`, ...)
- **Folder layout** (mirror `src/modules/pdf/`): `src/modules/<name>/{<Name>HubWorkspace.tsx, components/, services/, hooks/, types/}`; route in `src/app/tien-ich/<slug>/page.tsx` rendering `VanBanHubWorkspace initialMode="<NAME>_WORKSPACE"`.
- **Registering a new module (all 6 places, none optional)**: `config/modules-registry.ts` (entry + `targetTab`), `VanBanHubWorkspace.tsx` (initialMode union, `workspaceTab` union, `navigateTo<Name>`, render branch, breadcrumb title, `isStandaloneTool`), `SidebarNav.tsx` (icon), `UtilitiesHubPage.tsx` (card), the route `page.tsx`, and the `useEffect([pathname])` mapping.
- **Single responsibility**: `services/` = pure logic (no React, no antd); `components/` = UI only; shared UI lives in `components/<Name>Common.tsx`; one tab/feature per file (<= 250–350 lines).
- **File-processing utilities run in the browser.** Never upload user files to the backend. Never write technical wording in the UI such as "client-side", "zero upload", "không gửi lên server".
- **Heavy libraries** (`pdfjs-dist`, image codecs, workers) MUST be dynamically imported inside functions guarded by `typeof window !== 'undefined'`. Worker/WASM assets are served from `frontend/public/` (no CDN dependency).
- **Never freeze the UI**: long loops report progress via callback and yield to the event loop; use `OffscreenCanvas`/Web Worker for batch image work; free canvases (`canvas.width = 0`) and `URL.revokeObjectURL` after use.
- **Original data is never overwritten**: keep the source `File`/`ArrayBuffer`; every operation produces a new Blob. If the output is not smaller/better than the input, return the original and say so.

## 12. Mobile-First Responsive Layout Rules (`antd`)
- Use `useIsMobile()` (`Grid.useBreakpoint`, `md === false`) instead of fixed pixel widths. Breakpoint: `< 768px` = phone.
- **Phone**: primary/result buttons are `block` (full width); button groups stack vertically; card body padding `12`, desktop `20`; thumbnails/cards in CSS grid `repeat(auto-fill, minmax(96px, 1fr))` (desktop `130px`), never fixed `width: 146`.
- Text that can be long (file names, URLs) uses `ellipsis` or `wordBreak: 'break-all'` and the parent has `minWidth: 0`. Tabs stay on one row with short labels (<= 1 word, e.g. "Nén", "Tách", "Gộp").
- Modals use `width="min(94vw, <max>px)"` and `centered`; images inside use `maxHeight: calc(100vh - 230px)`.
- Initial empty state of every tool = **one primary button only** ("Chọn file ...") inside a dashed drop box; no titles, subtitles, tips or hint paragraphs.

## 13. UI Copy Rules (Vietnamese, ultra-concise)
- Section titles <= 3 words: `Phương thức`, `Xem trước`, `Mức nén`, `Kết quả`. Button labels <= 3 words: `Nén file`, `Tải file`, `Đổi file`, `Chọn hết`, `Bỏ chọn`.
- Success banners: one short title (`Đã nén xong`) + the key numbers. No marketing sentences, no tips.
- Expected-result promises ("tiết kiệm 60–80%") are forbidden unless computed from real output.

## 14. Mandatory Icon Map for Action Buttons (`@ant-design/icons`)
EVERY `<Button>` that performs an action MUST have `icon={...}` (icon-only buttons need a `Tooltip`). No exceptions, including small/secondary/toolbar buttons. Standard map:

| Action | Icon | Action | Icon |
|---|---|---|---|
| Chọn file / Thêm file | `UploadOutlined` | Chọn hết | `CheckSquareOutlined` |
| Bỏ chọn | `BorderOutlined` | Xem trước | `EyeOutlined` |
| Tải về | `DownloadOutlined` | Tải ZIP | `FileZipOutlined` |
| Xóa / Xóa hết | `DeleteOutlined` | Hoàn tác | `UndoOutlined` |
| Đổi file / Làm lại | `RedoOutlined` | Xoay | `RotateRightOutlined` |
| Nén | `CompressOutlined` | Tách | `ScissorOutlined` |
| Gộp | `MergeCellsOutlined` | Chuyển đổi định dạng | `SwapOutlined` |
| Lên / Xuống | `ArrowUpOutlined` / `ArrowDownOutlined` | Trước / Sau | `LeftOutlined` / `RightOutlined` |
| Đóng / Hủy | `CloseOutlined` | Sao chép | `CopyOutlined` |
| Lưu | `SaveOutlined` | Cắt ảnh | `ScissorOutlined` / `BorderInnerOutlined` |
| Áp dụng cho tất cả | `CheckCircleOutlined` | Cài đặt | `SettingOutlined` |

## 15. Quality-Preserving Image Processing Rules
- Default output = **lossless or visually lossless**: PNG stays PNG (lossless re-encode), JPEG recompress default quality `0.85–0.9`, never below `0.6` without explicit user choice; WebP default `0.9`.
- Never upscale; resize only when the user sets a target. Use `createImageBitmap` + `imageSmoothingQuality = 'high'`, apply EXIF orientation, preserve ICC/EXIF only when the user opts in (default: strip GPS for privacy).
- Transparency: converting alpha PNG/WebP -> JPEG fills a user-selectable background (default white), warn once.
- Always show before/after size + dimensions + side-by-side (or slider) preview; "keep original" is the fallback if the result is larger.
