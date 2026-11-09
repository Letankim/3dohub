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
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

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
  (error: AxiosError<ApiResponse<null>>) => {
    const respData = error.response?.data;
    const status = error.response?.status || 500;
    if (respData && respData.errors) {
      return Promise.reject(
        new HubApiException(
          respData.message || 'Dữ liệu gửi lên không hợp lệ',
          respData.errors,
          respData.request_id || 'req_unknown',
          status
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
                'Hệ thống đang bận hoặc đường truyền gián đoạn, vui lòng thử lại sau ít giây.',
              rejected_value: null,
            },
          ],
        },
        'req_service_busy',
        status
      )
    );
  }
);

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
    return res.data;
  },

  async listShortLinks(params?: {
    search?: string;
    tag?: string;
    limit?: number;
    offset?: number;
    codes?: string;
  }): Promise<ApiResponse<ShortLinkItem[]>> {
    const clientCodes = getDeviceCreatedLinkCodes();
    const sessionId = getClientSessionId();
    const mergedParams: Record<string, string | number | undefined> = {
      ...params,
      session_id: sessionId,
      codes: params?.codes || (clientCodes.length > 0 ? clientCodes.join(',') : undefined),
    };
    const res = await axiosClient.get<ApiResponse<ShortLinkItem[]>>('/links', {
      params: mergedParams,
    });
    return res.data;
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
    return res.data;
  },

  async deleteShortLink(code: string): Promise<ApiResponse<{ deleted_code: string }>> {
    const res = await axiosClient.delete<ApiResponse<{ deleted_code: string }>>(`/links/${code}`);
    removeDeviceCreatedLinkCode(code);
    return res.data;
  },
};

export const apiClient = hubApi;
