'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { message } from 'antd';
import dynamic from 'next/dynamic';
import { AppShell } from '@/components/layout/AppShell';
import { CommandModal } from '@/components/common/CommandModal';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { HeroOverviewSection } from './components/HeroOverviewSection';
import { UtilitiesHubPage } from './components/UtilitiesHubPage';
import { VirtualDocEditor } from './components/VirtualDocEditor';
import { EditorErrorBoundary } from '@/components/common/EditorErrorBoundary';

const SyncfusionDocEditor = dynamic(
  () => import('./components/SyncfusionDocEditor').then((m) => m.SyncfusionDocEditor),
  { ssr: false, loading: () => <div style={{ padding: 24 }}>Đang tải trình soạn thảo...</div> }
);
import { TemplateModal } from './components/TemplateModal';
import { UnitConfigModal } from './components/UnitConfigModal';
import { LogicReportModal } from './components/LogicReportModal';
import { ExcelNormWorkspace } from '@/modules/excel-norm/ExcelNormWorkspace';
import { ShortLinkWorkspace } from '@/modules/short-link/ShortLinkWorkspace';
import { QrCodeWorkspace } from '@/modules/qr-code/QrCodeWorkspace';
import { PdfHubWorkspace } from '@/modules/pdf/PdfHubWorkspace';
import { HUB_MODULES_REGISTRY, HubNavModule } from '@/config/modules-registry';
import { hubApi, HubApiException } from '@/services/api-client';
import {
  ProfileItem,
  TemplateItem,
  NormalizedDocResult,
  UnitConfig,
} from '@/types/api';

const DEFAULT_SAMPLE_DOC = `ĐẢNG BỘ TỈNH BẾN TRE
ĐẢNG ỦY XÃ THẠNH PHÚ
Số: 5-QĐ/ĐU
ĐẢNG CỘNG SẢN VIỆT NAM
Thạnh Phú, ngày 5 tháng 2 năm 2026
QUYẾT ĐỊNH
về việc thành lập Tổ công tác chuyển đổi số năm 2026
- Căn cứ Điều lệ Đảng Cộng sản Việt Nam;
- Căn cứ Quy chế làm việc của Ban Chấp hành Đảng bộ xã nhiệm kỳ 2025 - 2030;
- Xét đề nghị của Văn phòng Đảng ủy xã.
QUYẾT ĐỊNH:
Điều 1. Thành lập Tổ công tác chuyển đổi số của Đảng ủy xã gồm [Số lượng] đồng chí có tên trong danh sách kèm theo.
Điều 2. Tổ công tác có nhiệm vụ tham mưu Ban Thường vụ Đảng ủy triển khai ứng dụng công nghệ thông tin và số hóa văn bản.
Điều 3. Văn phòng Đảng ủy, các chi bộ trực thuộc và các đồng chí có tên tại Điều 1 chịu trách nhiệm thi hành Quyết định này.
Nơi nhận:
- Như Điều 3
- Thường trực Đảng ủy
- Lưu Văn phòng ĐU
TM. BAN THƯỜNG VỤ
BÍ THƯ
[Họ và tên người ký]`;

const DEFAULT_UNIT_CONFIG: UnitConfig = {
  cap_tren: 'ĐẢNG BỘ TỈNH BẾN TRE',
  co_quan: 'ĐẢNG ỦY XÃ THẠNH PHÚ',
  viet_tat: 'ĐU',
  dia_danh: 'Thạnh Phú',
  tham_quyen: 'T/M BAN THƯỜNG VỤ',
  chuc_vu: 'BÍ THƯ',
  ho_ten: 'Nguyễn Văn A',
};

export interface VanBanHubWorkspaceProps {
  initialMode?:
    | 'HERO_HOME'
    | 'UTILITIES_HUB'
    | 'EDITOR_WORKSPACE'
    | 'EXCEL_WORKSPACE'
    | 'SHORT_LINK_WORKSPACE'
    | 'QR_CODE_WORKSPACE'
    | 'PDF_WORKSPACE';
}

export const VanBanHubWorkspace: React.FC<VanBanHubWorkspaceProps> = ({
  initialMode = 'EDITOR_WORKSPACE',
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [workspaceTab, setWorkspaceTab] = useState<
    | 'HERO_HOME'
    | 'UTILITIES_HUB'
    | 'EDITOR_WORKSPACE'
    | 'EXCEL_WORKSPACE'
    | 'SHORT_LINK_WORKSPACE'
    | 'QR_CODE_WORKSPACE'
    | 'PDF_WORKSPACE'
  >(initialMode);
  const [activeNavKey, setActiveNavKey] = useState<string>(
    initialMode === 'HERO_HOME'
      ? 'home-overview'
      : initialMode === 'EXCEL_WORKSPACE'
      ? 'excel-module'
      : initialMode === 'SHORT_LINK_WORKSPACE'
      ? 'short-link-module'
      : initialMode === 'QR_CODE_WORKSPACE'
      ? 'qr-code-module'
      : initialMode === 'PDF_WORKSPACE'
      ? 'pdf-module'
      : 'van-ban-module'
  );
  const [profiles, setProfiles] = useState<ProfileItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>('AUTO');
  const [rawText, setRawText] = useState<string>(DEFAULT_SAMPLE_DOC);
  const [normResult, setNormResult] = useState<NormalizedDocResult | null>(null);
  const [unitInfo, setUnitInfo] = useState<UnitConfig>(DEFAULT_UNIT_CONFIG);
  const [loading, setLoading] = useState<boolean>(false);
  const [extractingUnit, setExtractingUnit] = useState<boolean>(false);
  const [apiError, setApiError] = useState<HubApiException | null>(null);
  const homeFileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync active mode with browser URL pathname
  useEffect(() => {
    if (pathname === '/') {
      setWorkspaceTab('HERO_HOME');
      setActiveNavKey('home-overview');
    } else if (pathname === '/tien-ich') {
      setWorkspaceTab('UTILITIES_HUB');
      setActiveNavKey('van-ban-module');
    } else if (pathname?.startsWith('/tien-ich/chuan-hoa-van-ban')) {
      setWorkspaceTab('EDITOR_WORKSPACE');
      setActiveNavKey('van-ban-module');
    } else if (pathname?.startsWith('/tien-ich/chuan-hoa-excel')) {
      setWorkspaceTab('EXCEL_WORKSPACE');
      setActiveNavKey('excel-module');
    } else if (pathname?.startsWith('/tien-ich/rut-gon-link')) {
      setWorkspaceTab('SHORT_LINK_WORKSPACE');
      setActiveNavKey('short-link-module');
    } else if (pathname?.startsWith('/tien-ich/tao-ma-qr')) {
      setWorkspaceTab('QR_CODE_WORKSPACE');
      setActiveNavKey('qr-code-module');
    } else if (pathname?.startsWith('/tien-ich/xu-ly-pdf')) {
      setWorkspaceTab('PDF_WORKSPACE');
      setActiveNavKey('pdf-module');
    }
  }, [pathname]);

  // Popup Modals state
  const [commandOpen, setCommandOpen] = useState<boolean>(false);
  const [templateModalOpen, setTemplateModalOpen] = useState<boolean>(false);
  const [unitModalOpen, setUnitModalOpen] = useState<boolean>(false);
  const [logicModalOpen, setLogicModalOpen] = useState<boolean>(false);

  // Load saved unit config from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('3dohub_unit_config');
      if (saved) {
        setUnitInfo(JSON.parse(saved));
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleUpdateUnitInfo = (next: UnitConfig) => {
    setUnitInfo(next);
    try {
      localStorage.setItem('3dohub_unit_config', JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // Global CTRL+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleNormalize = useCallback(
    async (
      textToProcess?: string,
      profileOverride?: string,
      footnotesOverride?: Array<{ n: string; text: string }>
    ) => {
      const targetText = textToProcess !== undefined ? textToProcess : rawText;
      const targetProfile = profileOverride !== undefined ? profileOverride : selectedProfile;
      if (!targetText || !targetText.trim()) {
        message.warning('Vui lòng nhập hoặc dán nội dung văn bản trước khi chuẩn hóa!');
        return;
      }
      setLoading(true);
      setApiError(null);
      try {
        const fnsToPass = footnotesOverride || normResult?.footnotes || undefined;
        const res = await hubApi.normalizeText(targetText, targetProfile, unitInfo, fnsToPass);
        if (res.data) {
          setNormResult(res.data);
          setRawText(res.data.normalized_text);
          if (targetProfile !== 'AUTO' && res.data.applied_profile) {
            setSelectedProfile(res.data.applied_profile);
          }

          if (typeof window !== 'undefined') {
            sessionStorage.setItem('3dohub_active_doc_result', JSON.stringify(res.data));
            sessionStorage.setItem('3dohub_active_raw_text', res.data.normalized_text);
            sessionStorage.setItem('3dohub_active_profile', targetProfile);
          }
          message.success(res.message);
        }
      } catch (err) {
        if (err instanceof HubApiException) {
          setApiError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [rawText, selectedProfile, unitInfo, normResult]
  );

  const handleGenerateTemplate = useCallback(
    async (tag: string, profileOverride?: string) => {
      setLoading(true);
      setApiError(null);
      try {
        const targetProfile = profileOverride || selectedProfile || 'AUTO';
        const res = await hubApi.generateFromTemplate(tag, targetProfile, unitInfo);
        if (res.data) {
          setNormResult(res.data);
          setRawText(res.data.normalized_text);
          if (targetProfile !== 'AUTO' && res.data.applied_profile) {
            setSelectedProfile(res.data.applied_profile);
          }

          // Persist active document to sessionStorage across route transitions
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('3dohub_active_doc_result', JSON.stringify(res.data));
            sessionStorage.setItem('3dohub_active_raw_text', res.data.normalized_text);
            sessionStorage.setItem(
              '3dohub_active_profile',
              targetProfile
            );
            sessionStorage.removeItem('3dohub_pending_template_tag');
          }

          if (pathname !== '/tien-ich/chuan-hoa-van-ban') {
            router.push(`/tien-ich/chuan-hoa-van-ban?template=${encodeURIComponent(tag)}`);
          } else {
            setWorkspaceTab('EDITOR_WORKSPACE');
            setActiveNavKey('van-ban-module');
          }
          message.success(res.message);
        }
      } catch (err) {
        if (err instanceof HubApiException) {
          setApiError(err);
        }
      } finally {
        setLoading(false);
      }
    },
    [pathname, router, selectedProfile, unitInfo]
  );

  // Initial metadata & initial sample normalization
  useEffect(() => {
    const initData = async () => {
      // If on standalone tools (QR Code, Short Link, Excel, PDF), do not fetch doc profiles/templates
      const isStandaloneTool =
        initialMode === 'SHORT_LINK_WORKSPACE' ||
        initialMode === 'QR_CODE_WORKSPACE' ||
        initialMode === 'EXCEL_WORKSPACE' ||
        initialMode === 'PDF_WORKSPACE' ||
        pathname?.startsWith('/tien-ich/rut-gon-link') ||
        pathname?.startsWith('/tien-ich/tao-ma-qr') ||
        pathname?.startsWith('/tien-ich/chuan-hoa-excel') ||
        pathname?.startsWith('/tien-ich/xu-ly-pdf');

      if (isStandaloneTool) {
        return;
      }

      const isDocWorkspace =
        pathname?.startsWith('/tien-ich/chuan-hoa-van-ban') ||
        pathname === '/tien-ich' ||
        initialMode === 'EDITOR_WORKSPACE' ||
        initialMode === 'UTILITIES_HUB';

      if (!isDocWorkspace) {
        return;
      }

      try {
        const [pRes, tRes] = await Promise.all([
          hubApi.getProfiles(),
          hubApi.getTemplates(),
        ]);
        if (pRes.data) setProfiles(pRes.data);
        if (tRes.data) setTemplates(tRes.data);

        // 1. Check if an active document was already saved in sessionStorage
        if (typeof window !== 'undefined') {
          const savedDocStr = sessionStorage.getItem('3dohub_active_doc_result');
          const savedText = sessionStorage.getItem('3dohub_active_raw_text');
          const savedProf = sessionStorage.getItem('3dohub_active_profile');
          if (savedDocStr && savedText) {
            try {
              const parsedDoc = JSON.parse(savedDocStr);
              setNormResult(parsedDoc);
              setRawText(savedText);
              if (savedProf) setSelectedProfile(savedProf);
              return;
            } catch {
              // ignore JSON parse error
            }
          }
        }

        // 2. Check if a specific template was requested via URL query (?template=...) or sessionStorage
        const urlParams =
          typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search)
            : null;
        const requestedTemplate =
          urlParams?.get('template') ||
          (typeof window !== 'undefined'
            ? sessionStorage.getItem('3dohub_pending_template_tag')
            : null);

        if (requestedTemplate) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('3dohub_pending_template_tag');
          }
          await handleGenerateTemplate(requestedTemplate);
          return;
        }

        // 3. Không tự động chuẩn hóa khi mở trang; người dùng chủ động bấm 'Chuẩn hóa'
      } catch {
        // Nếu backend đang khởi động sau deploy (cold start), không hiện lỗi gây gián đoạn giao diện.
        // Đã có sẵn FALLBACK_PROFILES để người dùng sử dụng ngay lập tức.
      }
    };
    initData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToEditor = () => {
    setWorkspaceTab('EDITOR_WORKSPACE');
    setActiveNavKey('van-ban-module');
    if (pathname !== '/tien-ich/chuan-hoa-van-ban') {
      router.push('/tien-ich/chuan-hoa-van-ban');
    }
  };

  const navigateToExcel = () => {
    setWorkspaceTab('EXCEL_WORKSPACE');
    setActiveNavKey('excel-module');
    if (pathname !== '/tien-ich/chuan-hoa-excel') {
      router.push('/tien-ich/chuan-hoa-excel');
    }
  };

  const navigateToShortLink = () => {
    setWorkspaceTab('SHORT_LINK_WORKSPACE');
    setActiveNavKey('short-link-module');
    if (pathname !== '/tien-ich/rut-gon-link') {
      router.push('/tien-ich/rut-gon-link');
    }
  };

  const navigateToQrCode = () => {
    setWorkspaceTab('QR_CODE_WORKSPACE');
    setActiveNavKey('qr-code-module');
    if (pathname !== '/tien-ich/tao-ma-qr') {
      router.push('/tien-ich/tao-ma-qr');
    }
  };

  const navigateToPdf = () => {
    setWorkspaceTab('PDF_WORKSPACE');
    setActiveNavKey('pdf-module');
    if (pathname !== '/tien-ich/xu-ly-pdf') {
      router.push('/tien-ich/xu-ly-pdf');
    }
  };

  const handleUploadDocx = async (file: File) => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await hubApi.normalizeDocxFile(file, selectedProfile);
      if (res.data) {
        setNormResult(res.data);
        setRawText(res.data.normalized_text);
        if (selectedProfile !== 'AUTO' && res.data.applied_profile) {
          setSelectedProfile(res.data.applied_profile);
        }
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('3dohub_active_doc_result', JSON.stringify(res.data));
          sessionStorage.setItem('3dohub_active_raw_text', res.data.normalized_text);
          sessionStorage.setItem(
            '3dohub_active_profile',
            selectedProfile
          );
        }
        navigateToEditor();
        message.success(res.message);
      }
    } catch (err) {
      if (err instanceof HubApiException) {
        setApiError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExtractUnitFromCurrentDoc = async () => {
    setExtractingUnit(true);
    setApiError(null);
    try {
      const res = await hubApi.extractUnitFromText(rawText, selectedProfile);
      if (res.data?.unit_info) {
        handleUpdateUnitInfo(res.data.unit_info);
        message.success('Đã trích xuất thông tin đơn vị từ văn bản đang soạn!');
      }
    } catch (err) {
      if (err instanceof HubApiException) {
        setApiError(err);
      }
    } finally {
      setExtractingUnit(false);
    }
  };

  const handleSelectNavModule = (mod: HubNavModule) => {
    setActiveNavKey(mod.key);
    setWorkspaceTab(mod.targetTab);
    if (mod.path && pathname !== mod.path) {
      router.push(mod.path);
    }
  };

  const handleNavigateBreadcrumb = (target: 'HOME' | 'UTILITIES') => {
    if (target === 'HOME') {
      setActiveNavKey('home-overview');
      setWorkspaceTab('HERO_HOME');
      if (pathname !== '/') router.push('/');
    } else {
      setActiveNavKey('van-ban-module');
      setWorkspaceTab('UTILITIES_HUB');
      if (pathname !== '/tien-ich') router.push('/tien-ich');
    }
  };

  const breadcrumbActiveTitle =
    workspaceTab === 'HERO_HOME'
      ? 'Trang chủ'
      : workspaceTab === 'UTILITIES_HUB'
      ? 'Danh mục tiện ích'
      : workspaceTab === 'EXCEL_WORKSPACE'
      ? 'Chuẩn hóa Excel'
      : workspaceTab === 'SHORT_LINK_WORKSPACE'
      ? 'Rút gọn link'
      : workspaceTab === 'QR_CODE_WORKSPACE'
      ? 'Tạo mã QR'
      : workspaceTab === 'PDF_WORKSPACE'
      ? 'Tiện ích PDF'
      : 'Chuẩn hóa văn bản';

  return (
    <AppShell
      activeKey={activeNavKey}
      activeTitle={breadcrumbActiveTitle}
      onSelectModule={handleSelectNavModule}
      onOpenCommand={() => setCommandOpen(true)}
      onNavigateBreadcrumb={handleNavigateBreadcrumb}
    >
      <ApiErrorAlert
        error={apiError}
        onClose={() => setApiError(null)}
        onRetry={() => handleNormalize()}
      />

      {workspaceTab === 'HERO_HOME' ? (
        <HeroOverviewSection
          onOpenEditor={navigateToEditor}
          onOpenExcel={navigateToExcel}
          onOpenTemplates={() => setTemplateModalOpen(true)}
          onOpenUpload={() => homeFileInputRef.current?.click()}
          onQuickTemplate={(tag) => handleGenerateTemplate(tag)}
        />
      ) : workspaceTab === 'UTILITIES_HUB' ? (
        <UtilitiesHubPage
          onOpenVanBanModule={navigateToEditor}
          onOpenExcelModule={navigateToExcel}
          onOpenShortLinkModule={navigateToShortLink}
          onOpenQrCodeModule={navigateToQrCode}
          onOpenPdfModule={navigateToPdf}
        />
      ) : workspaceTab === 'EXCEL_WORKSPACE' ? (
        <ExcelNormWorkspace />
      ) : workspaceTab === 'SHORT_LINK_WORKSPACE' ? (
        <ShortLinkWorkspace />
      ) : workspaceTab === 'QR_CODE_WORKSPACE' ? (
        <QrCodeWorkspace />
      ) : workspaceTab === 'PDF_WORKSPACE' ? (
        <PdfHubWorkspace />
      ) : (
        <>
        <EditorErrorBoundary
          fallback={
            <VirtualDocEditor
              profiles={profiles}
              selectedProfile={selectedProfile}
              onChangeProfile={(pid, currentText) => {
                setSelectedProfile(pid);
                if (currentText) setRawText(currentText);
              }}
              rawText={rawText}
              onChangeRawText={setRawText}
              normResult={normResult}
              onNormalize={(customText) => {
                void handleNormalize(customText);
              }}
              onUploadDocx={handleUploadDocx}
              onOpenTemplatesModal={() => setTemplateModalOpen(true)}
              onOpenUnitModal={() => setUnitModalOpen(true)}
              onOpenLogicModal={() => setLogicModalOpen(true)}
              loading={loading}
            />
          }
        >
          <SyncfusionDocEditor
            profiles={profiles}
            selectedProfile={selectedProfile}
            onChangeProfile={(pid, currentText) => {
              setSelectedProfile(pid);
              if (currentText) setRawText(currentText);
            }}
            rawText={rawText}
            onChangeRawText={setRawText}
            normResult={normResult}
            onNormalize={(customText, footnotes) => {
              void handleNormalize(customText, undefined, footnotes);
            }}
            onUploadDocx={handleUploadDocx}
            onOpenTemplatesModal={() => setTemplateModalOpen(true)}
            onOpenUnitModal={() => setUnitModalOpen(true)}
            onOpenLogicModal={() => setLogicModalOpen(true)}
            loading={loading}
          />
        </EditorErrorBoundary>
        </>
      )}

      {/* Hidden DOCX Upload input for Home page */}
      <input
        ref={homeFileInputRef}
        type="file"
        accept=".docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleUploadDocx(file);
            e.target.value = '';
          }
        }}
      />

      {/* Popup Modal 1: Kho 17 Mẫu Văn Bản */}
      <TemplateModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleGenerateTemplate}
        onOpenUnitModal={() => {
          setTemplateModalOpen(false);
          setUnitModalOpen(true);
        }}
        loading={loading}
      />

      {/* Popup Modal 2: Cấu Hình Đơn Vị */}
      <UnitConfigModal
        open={unitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        unitInfo={unitInfo}
        onChangeUnitInfo={handleUpdateUnitInfo}
        onExtractFromCurrentDoc={handleExtractUnitFromCurrentDoc}
        extracting={extractingUnit}
      />

      {/* Popup Modal 3: Rà Soát Lỗi Thể Thức */}
      <LogicReportModal
        open={logicModalOpen}
        onClose={() => setLogicModalOpen(false)}
        warnings={normResult?.warnings || []}
        appliedProfileName={normResult?.profile_short_label}
        legalBasis={normResult?.legal_basis}
        executionMs={normResult?.stats.execution_ms}
      />

      {/* Command Palette Modal (CTRL+K) */}
      <CommandModal
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSelectModule={handleSelectNavModule}
      />
    </AppShell>
  );
};
