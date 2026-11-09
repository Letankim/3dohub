/**
 * Enterprise Tech Design System Tokens for Ant Design (3DoHub)
 * Sharp geometry (borderRadius: 4px), Royal Tech Blue (#1D4ED8) & Cyber Slate (#0F172A)
 */

import type { ThemeConfig } from 'antd';

export const enterpriseTechTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1D4ED8',
    colorInfo: '#1D4ED8',
    colorSuccess: '#059669',
    colorWarning: '#D97706',
    colorError: '#DC2626',
    colorTextBase: '#0F172A',
    colorBgLayout: '#F8FAFC',
    colorBgContainer: '#FFFFFF',
    colorBorder: '#E2E8F0',
    colorBorderSecondary: '#F1F5F9',
    borderRadius: 4,
    borderRadiusSM: 3,
    borderRadiusLG: 6,
    fontFamily:
      "var(--font-be-vietnam-pro), 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    wireframe: false,
  },
  components: {
    Button: {
      borderRadius: 4,
      controlHeight: 36,
      fontWeight: 500,
      primaryShadow: 'none',
      defaultShadow: 'none',
    },
    Input: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Select: {
      borderRadius: 4,
      controlHeight: 36,
    },
    Card: {
      borderRadiusLG: 6,
      headerBg: '#F8FAFC',
    },
    Tag: {
      borderRadiusSM: 3,
    },
    Modal: {
      borderRadiusLG: 6,
    },
    Menu: {
      itemBorderRadius: 4,
      itemSelectedBg: '#EFF6FF',
      itemSelectedColor: '#1D4ED8',
      itemHeight: 38,
    },
  },
};

