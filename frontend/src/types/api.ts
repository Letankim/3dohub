/**
 * Standardized API Contract & Domain Types for 3DoHub
 */

export interface ApiErrorDetail {
  field: string;
  code: string;
  message: string;
  rejected_value: unknown;
}

export interface ApiErrorBlock {
  code: string;
  details: ApiErrorDetail[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  meta: Record<string, unknown> | null;
  errors: ApiErrorBlock | null;
  request_id: string;
}

export interface HubModuleItem {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryLabel: string;
  route: string;
  icon: string;
  badge: string;
  status: 'ACTIVE' | 'INACTIVE';
  statusLabel: string;
  note: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ProfileItem {
  id: string;
  code: string;
  name: string;
  short_label: string;
  legal_basis: string;
  template_group: 'DANG' | 'NHA_NUOC';
  status: string;
  statusLabel: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface TemplateItem {
  id: string;
  tag: string;
  group: 'DANG' | 'NHA_NUOC';
  index: number;
  code: string;
  name: string;
  doc_type: string;
  status: string;
  statusLabel: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface UnitConfig {
  cap_tren: string;
  co_quan: string;
  viet_tat: string;
  dia_danh: string;
  tham_quyen: string;
  chuc_vu: string;
  ho_ten: string;
}

export interface LogicWarningItem {
  index: number;
  code: string;
  category: string;
  severity: 'ERROR' | 'WARNING' | 'INFO';
  message: string;
}

export interface NormalizedDocResult {
  id: string;
  detected_profile: string;
  applied_profile: string;
  profile_source: string;
  profile_name: string;
  profile_short_label: string;
  legal_basis: string;
  mismatch_warning?: string;
  normalized_text: string;
  a4_preview_html: string;
  mso_clipboard_html: string;
  sfdt?: Record<string, unknown>;
  docx_base64: string;
  docx_filename: string;
  payload_checksum?: string;
  extracted_unit: UnitConfig;
  warnings: LogicWarningItem[];
  warnings_count: number;
  stats: {
    lines_processed: number;
    body_paragraphs: number;
    execution_ms: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ExcelSampleItem {
  id: string;
  code: string;
  name: string;
  orientation_hint: 'PORTRAIT' | 'LANDSCAPE';
  description: string;
  status: string;
  statusLabel: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ExcelSheetMeta {
  sheet_name: string;
  has_data: boolean;
  orientation: 'PORTRAIT' | 'LANDSCAPE';
  orientation_label: string;
  zoom_percent: number;
  estimated_pages: number;
  print_area: string;
  data_bounds: {
    first_row: number;
    last_row: number;
    first_col: number;
    last_col: number;
    visible_cols: number;
    logical_cols: number;
  };
  header_detected: boolean;
  header_rows: string | null;
  repeating_title_rows: string | null;
  table_end_row: number;
  effective_min_font_pt: number;
  warnings: Array<{
    code: string;
    severity: string;
    message: string;
  }>;
}

export interface ExcelCellData {
  value: string;
  display?: string;
  fontName?: string;
  fontSize?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'center' | 'bottom';
  wrapText?: boolean;
  bg?: string;
  color?: string;
  border?: boolean;
  numFmt?: string;
}

export interface ExcelMergeRange {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

export interface ExcelPrintGuides {
  firstRow: number;
  lastRow: number;
  firstCol: number;
  lastCol: number;
  headerDetected: boolean;
  headerStartRow: number;
  headerEndRow: number;
  tableEndRow: number;
  pageBreakRows: number[];
}

export interface ExcelGridData {
  rowCount: number;
  colCount: number;
  colWidthsPx: Record<string, number>;
  rowHeightsPx: Record<string, number>;
  merges: ExcelMergeRange[];
  cells: Record<string, ExcelCellData>;
  printGuides: ExcelPrintGuides;
}

export interface ExcelNormalizedResult {
  id: string;
  filename: string;
  orientation_mode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE';
  active_sheet: string;
  active_sheet_meta: ExcelSheetMeta;
  sheets_meta: ExcelSheetMeta[];
  grid_data: ExcelGridData;
  original_grid_data: ExcelGridData;
  a4_preview_html: string;
  original_preview_html: string;
  mso_clipboard_html: string;
  sfdt?: Record<string, unknown>;
  xlsx_base64: string;
  original_xlsx_base64: string;
  payload_checksum: string;
  original_checksum: string;
  status: string;
  statusLabel: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ShortLinkItem {
  id: string;
  code: string;
  original_url: string;
  short_url: string;
  title: string;
  description?: string | null;
  click_count: number;
  is_active: boolean;
  is_expired: boolean;
  expires_at?: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ShortLinkClickLog {
  id: string;
  clicked_at: string;
  referer: string;
  user_agent: string;
}

export interface ShortLinkStatsData {
  link: ShortLinkItem;
  total_clicks: number;
  recent_clicks: ShortLinkClickLog[];
}

export interface CreateShortLinkPayload {
  original_url: string;
  custom_code?: string;
  title?: string;
  description?: string;
  expires_at?: string;
  tags?: string;
  session_id?: string;
}

export interface UpdateShortLinkPayload {
  title?: string;
  description?: string;
  is_active?: boolean;
  expires_at?: string;
  tags?: string;
  session_id?: string;
}
