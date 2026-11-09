'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Drawer } from 'antd';
import { SidebarNav } from './SidebarNav';
import { TopHeader } from './TopHeader';
import { AppFooter } from './AppFooter';
import { HubNavModule } from '@/config/modules-registry';

interface AppShellProps {
  activeKey: string;
  activeTitle: string;
  onSelectModule: (mod: HubNavModule) => void;
  onOpenCommand: () => void;
  onNavigateBreadcrumb?: (target: 'HOME' | 'UTILITIES') => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeKey,
  activeTitle,
  onSelectModule,
  onOpenCommand,
  onNavigateBreadcrumb,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const handleToggleCollapse = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleToggleFocusMode = useCallback(() => {
    setIsFocusMode((prev) => {
      const next = !prev;
      try {
        if (next && !document.fullscreenElement) {
          document.documentElement.requestFullscreen?.();
        } else if (!next && document.fullscreenElement) {
          document.exitFullscreen?.();
        }
      } catch {
        // Ignore browser fullscreen permission errors; layout still expands 100%
      }
      return next;
    });
  }, []);

  // Sync focus state if user presses ESC to exit browser fullscreen
  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement && isFocusMode) {
        setIsFocusMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [isFocusMode]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Desktop Left Sidebar (Hidden when Focus Mode is active) */}
      {!isMobile && !isFocusMode && (
        <aside
          style={{
            width: collapsed ? 64 : 236,
            transition: 'width 0.18s ease',
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            zIndex: 30,
          }}
        >
          <SidebarNav
            activeKey={activeKey}
            collapsed={collapsed}
            onSelectModule={onSelectModule}
            onOpenCommand={onOpenCommand}
          />
        </aside>
      )}

      {/* Mobile Drawer Sidebar */}
      {isMobile && !isFocusMode && (
        <Drawer
          placement="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          width={240}
          styles={{ body: { padding: 0 } }}
          closable={false}
        >
          <SidebarNav
            activeKey={activeKey}
            collapsed={false}
            onSelectModule={(mod) => {
              onSelectModule(mod);
              setMobileOpen(false);
            }}
            onOpenCommand={() => {
              setMobileOpen(false);
              onOpenCommand();
            }}
          />
        </Drawer>
      )}

      {/* Right Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopHeader
          collapsed={isMobile ? !mobileOpen : collapsed}
          onToggleCollapse={handleToggleCollapse}
          activeTitle={activeTitle}
          isFocusMode={isFocusMode}
          onToggleFocusMode={handleToggleFocusMode}
          onNavigateBreadcrumb={onNavigateBreadcrumb}
        />
        <main
          style={{
            flex: 1,
            padding: isFocusMode ? '8px 10px' : '12px 16px',
            width: '100%',
            minWidth: 0,
          }}
        >
          {children}
        </main>
        {!isFocusMode && <AppFooter />}
      </div>
    </div>
  );
};
