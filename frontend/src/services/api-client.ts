/**
 * Enterprise Axios Client for 3DoHub Platform
 * - Automatically attaches SHA-256 Payload Checksum & HMAC-SHA256 Canonical Signature headers
 * - Verifies response payload_checksum integrity from Backend
 * - Enforces standardized { success, message, data, meta, errors, request_id } envelope
 */

import axios, { AxiosError, AxiosInstance } from 'axios';
import {
  ApiResponse,
  ApiErrorBlock,
  HubModuleItem,
  ProfileItem,
  TemplateItem,
  NormalizedDocResult,
  UnitConfig,
  ExcelSampleItem,
  ExcelNormalizedResult,
  ExcelGridData,
  ShortLinkItem,
  ShortLinkStatsData,
  CreateShortLinkPayload,
  UpdateShortLinkPayload,
  ExtendedTemplateItem,
  SpellCheckResultData,
  SpellCheckAutoFixData,
  LegalRegulationApiItem,
} from '@/types/api';
import {
  getClientSessionId,
  getDeviceCreatedLinkCodes,
  recordCreatedLinkCode,
  removeDeviceCreatedLinkCode,
} from '@/utils/session-manager';
import { createSignedSecurityHeaders, sha256Hex } from '@/utils/security-signer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

export class HubApiException extends Error {
  public readonly requestId: string;
  public readonly errors: ApiErrorBlock;
  public readonly statusCode: number;

  constructor(
    message: string,
    errors: ApiErrorBlock,
    requestId: string,
    statusCode: number = 400
  ) {
    super(message);
    this.name = 'HubApiException';
    this.errors = errors;
    this.requestId = requestId;
    this.statusCode = statusCode;
  }
}

export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

const MAX_AUTO_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 1500;

// Outgoing Request Interceptor: Sign every request with SHA-256 Checksum & HMAC-SHA256 Signature
axiosClient.interceptors.request.use((config) => {
  const method = (config.method || 'GET').toUpperCase();
  const relUrl = config.url || '';
  const fullPath = relUrl.startsWith('/api/v1')
    ? relUrl.split('?')[0]
    : `/api/v1${relUrl.startsWith('/') ? '' : '/'}${relUrl.split('?')[0]}`;

  let rawBodyStr = '';
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

  if (!isFormData && config.data !== undefined && config.data !== null) {
    rawBodyStr =
      typeof config.data === 'string' ? config.data : JSON.stringify(config.data);
    // Keep config.data as exact serialized string so axios sends the exact bytes we hashed
    config.data = rawBodyStr;
  } else if (isFormData) {
    rawBodyStr = 'multipart:form-data';
  }

  const secHeaders = createSignedSecurityHeaders(method, fullPath, rawBodyStr);
  Object.entries(secHeaders).forEach(([k, v]) => {
    config.headers.set(k, v);
  });

  const clientSessionId = getClientSessionId();
  if (clientSessionId) {
    config.headers.set('X-Client-Session-Id', clientSessionId);
  }

  return config;
});

// Incoming Response Interceptor: Verify response checksum & normalize errors safely
axiosClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<NormalizedDocResult | null>;
    if (
      body &&
      body.data &&
      typeof body.data === 'object' &&
      'payload_checksum' in body.data &&
      body.data.payload_checksum &&
      typeof body.data.normalized_text === 'string'
    ) {
      const computed = sha256Hex(body.data.normalized_text);
      if (computed !== body.data.payload_checksum) {
        return Promise.reject(
          new HubApiException(
            'Dữ liệu tải về bị gián đoạn, vui lòng thử lại',
            {
              code: 'RESPONSE_CHECKSUM_MISMATCH',
              details: [
                {
                  field: 'payload_checksum',
                  code: 'INTEGRITY_ERROR',
                  message: 'Vui lòng thực hiện lại thao tác để đồng bộ dữ liệu.',
                  rejected_value: null,
                },
              ],
            },
            body.request_id || 'req_checksum_err',
            400
          )
        );
      }
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<null>>) => {
    const config = error.config as (typeof error.config & { __retryCount?: number });
    const status = error.response?.status;
    const isTransient =
      !error.response ||
      status === 502 ||
      status === 503 ||
      status === 504 ||
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error');

    // Tự động thử lại tối đa 2 lần khi backend khởi động sau deploy (cold start) hoặc mạng chập chờn
    if (config && isTransient && (config.__retryCount || 0) < MAX_AUTO_RETRIES) {
      config.__retryCount = (config.__retryCount || 0) + 1;
      const delay = BASE_RETRY_DELAY_MS * config.__retryCount;
      await new Promise((r) => setTimeout(r, delay));
      return axiosClient.request(config);
    }

    const respData = error.response?.data;
    const errStatus = status || 500;
    if (respData && respData.errors) {
      return Promise.reject(
        new HubApiException(
          respData.message || 'Dữ liệu gửi lên không hợp lệ',
          respData.errors,
          respData.request_id || 'req_unknown',
          errStatus
        )
      );
    }
    return Promise.reject(
      new HubApiException(
        'Kết nối tạm thời gián đoạn, vui lòng thử lại sau',
        {
          code: 'SERVICE_UNAVAILABLE',
          details: [
            {
              field: 'connection',
              code: 'CONNECTION_INTERRUPTED',
              message:
                'Máy chủ đang khởi động hoặc đường truyền gián đoạn, vui lòng bấm thử lại.',
              rejected_value: null,
            },
          ],
        },
        'req_service_busy',
        errStatus
      )
    );
  }
);

// In-flight request deduplication & short-term anti-burst cache
let inFlightListShortLinksPromise: Promise<ApiResponse<ShortLinkItem[]>> | null = null;
let lastListShortLinksTime = 0;
let lastListShortLinksResult: ApiResponse<ShortLinkItem[]> | null = null;

export const hubApi = {
  async getModules(): Promise<ApiResponse<HubModuleItem[]>> {
    const res = await axiosClient.get<ApiResponse<HubModuleItem[]>>('/hub/modules');
    return res.data;
  },

  async getProfiles(): Promise<ApiResponse<ProfileItem[]>> {
    const res = await axiosClient.get<ApiResponse<ProfileItem[]>>('/van-ban/profiles');
    return res.data;
  },

  async getTemplates(group?: string): Promise<ApiResponse<TemplateItem[]>> {
    const res = await axiosClient.get<ApiResponse<TemplateItem[]>>('/van-ban/templates', {
      params: group ? { group } : undefined,
    });
    return res.data;
  },

  async getExtendedTemplates(category?: string): Promise<ApiResponse<ExtendedTemplateItem[]>> {
    const res = await axiosClient.get<ApiResponse<ExtendedTemplateItem[]>>('/van-ban/templates', {
      params: category && category !== 'ALL' ? { catalog: 'all', category } : { catalog: 'all' },
    });
    return res.data;
  },

  async analyzeSpelling(text: string): Promise<ApiResponse<SpellCheckResultData>> {
    const res = await axiosClient.post<ApiResponse<SpellCheckResultData>>('/spell-check/analyze', {
      text,
    });
    return res.data;
  },

  async autoFixSpelling(text: string): Promise<ApiResponse<SpellCheckAutoFixData>> {
    const res = await axiosClient.post<ApiResponse<SpellCheckAutoFixData>>('/spell-check/auto-fix', {
      text,
    });
    return res.data;
  },

  async getLegalRegulations(
    category?: string,
    q?: string
  ): Promise<ApiResponse<LegalRegulationApiItem[]>> {
    const params: Record<string, string> = {};
    if (category && category !== 'ALL') params.category = category;
    if (q && q.trim()) params.q = q.trim();
    const res = await axiosClient.get<ApiResponse<LegalRegulationApiItem[]>>(
      '/doc-lookup/regulations',
      { params }
    );
    return res.data;
  },

  async normalizeText(
    rawText: string,
    profileId: string = 'AUTO',
    unitInfo?: UnitConfig,
    footnotes?: Array<{ n: string; text: string }>
  ): Promise<ApiResponse<NormalizedDocResult>> {
    const res = await axiosClient.post<ApiResponse<NormalizedDocResult>>(
      '/van-ban/normalize',
      {
        raw_text: rawText,
        profile_id: profileId,
        unit_info: unitInfo,
        footnotes: footnotes,
      }
    );
    return res.data;
  },

  async generateFromTemplate(
    templateTag: string,
    profileId: string,
    unitInfo: UnitConfig
  ): Promise<ApiResponse<NormalizedDocResult>> {
    const res = await axiosClient.post<ApiResponse<NormalizedDocResult>>(
      '/van-ban/templates/generate',
      {
        template_tag: templateTag,
        profile_id: profileId,
        unit_info: unitInfo,
      }
    );
    return res.data;
  },

  async normalizeDocxFile(
    file: File,
    profileId: string = 'AUTO'
  ): Promise<ApiResponse<NormalizedDocResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('profile_id', profileId);

    const res = await axiosClient.post<ApiResponse<NormalizedDocResult>>(
      '/van-ban/normalize-docx',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async extractUnitFromText(
    rawText: string,
    profileId: string = 'AUTO'
  ): Promise<
    ApiResponse<{
      detected_profile: string;
      applied_profile: string;
      unit_info: UnitConfig;
      updated_at: string;
    }>
  > {
    const res = await axiosClient.post('/van-ban/extract-unit', {
      raw_text: rawText,
      profile_id: profileId,
    });
    return res.data;
  },

  async getExcelSamples(): Promise<ApiResponse<ExcelSampleItem[]>> {
    const res = await axiosClient.get<ApiResponse<ExcelSampleItem[]>>('/excel/samples');
    return res.data;
  },

  async generateExcelSample(
    sampleCode: string,
    orientationMode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE' = 'AUTO',
    activeSheet?: string
  ): Promise<ApiResponse<ExcelNormalizedResult>> {
    const res = await axiosClient.post<ApiResponse<ExcelNormalizedResult>>(
      '/excel/samples/generate',
      {
        sample_code: sampleCode,
        orientation_mode: orientationMode,
        active_sheet: activeSheet || null,
      }
    );
    return res.data;
  },

  async normalizeExcelFile(
    file: File,
    orientationMode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE' = 'AUTO',
    activeSheet: string = ''
  ): Promise<ApiResponse<ExcelNormalizedResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orientation_mode', orientationMode);
    formData.append('active_sheet', activeSheet);

    const res = await axiosClient.post<ApiResponse<ExcelNormalizedResult>>(
      '/excel/normalize-xlsx',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async normalizeExcelBase64(
    xlsxBase64: string,
    orientationMode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE' = 'AUTO',
    activeSheet?: string,
    filename: string = 'Bang_Chuan_Hoa_A4.xlsx'
  ): Promise<ApiResponse<ExcelNormalizedResult>> {
    const res = await axiosClient.post<ApiResponse<ExcelNormalizedResult>>(
      '/excel/normalize-base64',
      {
        xlsx_base64: xlsxBase64,
        orientation_mode: orientationMode,
        active_sheet: activeSheet || null,
        filename,
      }
    );
    return res.data;
  },

  async normalizeExcelTsv(
    rawTsv: string,
    sheetTitle: string = 'Bang_In_A4',
    orientationMode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE' = 'AUTO'
  ): Promise<ApiResponse<ExcelNormalizedResult>> {
    const res = await axiosClient.post<ApiResponse<ExcelNormalizedResult>>(
      '/excel/normalize-tsv',
      {
        raw_tsv: rawTsv,
        sheet_title: sheetTitle,
        orientation_mode: orientationMode,
      }
    );
    return res.data;
  },

  async normalizeExcelGrid(
    gridData: ExcelGridData,
    orientationMode: 'AUTO' | 'PORTRAIT' | 'LANDSCAPE' = 'AUTO',
    activeSheet: string = 'Bang_In_A4',
    filename: string = 'Bang_Chuan_Hoa_A4.xlsx',
    baseXlsxBase64?: string
  ): Promise<ApiResponse<ExcelNormalizedResult>> {
    const res = await axiosClient.post<ApiResponse<ExcelNormalizedResult>>(
      '/excel/normalize-grid',
      {
        grid_data: gridData,
        orientation_mode: orientationMode,
        active_sheet: activeSheet,
        filename,
        base_xlsx_base64: baseXlsxBase64 || null,
      }
    );
    return res.data;
  },

  // Short Link & QR API Methods
  async createShortLink(
    payload: CreateShortLinkPayload
  ): Promise<ApiResponse<ShortLinkItem>> {
    const session_id = getClientSessionId();
    const finalPayload = { ...payload, session_id: payload.session_id || session_id };
    const res = await axiosClient.post<ApiResponse<ShortLinkItem>>('/links', finalPayload);
    if (res.data?.data?.code) {
      recordCreatedLinkCode(res.data.data.code);
    }
    // Invalidate short-term cache on new link creation
    lastListShortLinksResult = null;
    return res.data;
  },

  async listShortLinks(params?: {
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    codes?: string;
    forceRefresh?: boolean;
  }): Promise<ApiResponse<ShortLinkItem[]>> {
    const now = Date.now();
    // 1. If an identical list request is currently in-flight, reuse it (prevents duplicate calls on mount)
    if (inFlightListShortLinksPromise) {
      return inFlightListShortLinksPromise;
    }
    // 2. Debounce burst requests within 1.5 seconds unless explicitly forced
    if (!params?.forceRefresh && lastListShortLinksResult && now - lastListShortLinksTime < 1500) {
      return lastListShortLinksResult;
    }

    const clientCodes = getDeviceCreatedLinkCodes();
    const sessionId = getClientSessionId();
    const { forceRefresh, ...queryParamProps } = params || {};
    const mergedParams: Record<string, string | number | undefined> = {
      ...queryParamProps,
      session_id: sessionId,
      codes: queryParamProps?.codes || (clientCodes.length > 0 ? clientCodes.join(',') : undefined),
    };

    inFlightListShortLinksPromise = (async () => {
      try {
        const res = await axiosClient.get<ApiResponse<ShortLinkItem[]>>('/links', {
          params: mergedParams,
        });
        lastListShortLinksResult = res.data;
        lastListShortLinksTime = Date.now();
        return res.data;
      } finally {
        inFlightListShortLinksPromise = null;
      }
    })();

    return inFlightListShortLinksPromise;
  },

  async getShortLinkDetails(code: string): Promise<ApiResponse<ShortLinkItem>> {
    const res = await axiosClient.get<ApiResponse<ShortLinkItem>>(`/links/${code}`);
    return res.data;
  },

  async getShortLinkStats(code: string): Promise<ApiResponse<ShortLinkStatsData>> {
    const res = await axiosClient.get<ApiResponse<ShortLinkStatsData>>(`/links/${code}/stats`);
    return res.data;
  },

  async updateShortLink(
    code: string,
    payload: UpdateShortLinkPayload
  ): Promise<ApiResponse<ShortLinkItem>> {
    const res = await axiosClient.put<ApiResponse<ShortLinkItem>>(`/links/${code}`, payload);
    lastListShortLinksResult = null;
    return res.data;
  },

  async deleteShortLink(code: string): Promise<ApiResponse<{ deleted_code: string }>> {
    const res = await axiosClient.delete<ApiResponse<{ deleted_code: string }>>(`/links/${code}`);
    removeDeviceCreatedLinkCode(code);
    lastListShortLinksResult = null;
    return res.data;
  },
};

export const apiClient = hubApi;
