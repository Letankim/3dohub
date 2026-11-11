'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageFileItem, ProcessedImageResult } from '../types/image';
import { LivePreviewState } from '../components/LiveImageStage';

/**
 * Shared debounced live preview hook for browser image tools.
 * Automatically re-computes preview when active image or options change,
 * freeing obsolete Object URLs to avoid memory leaks.
 */
export function useLiveImagePreview<TOptions>(
  items: ImageFileItem[],
  options: TOptions,
  processorFn: (file: File, opts: TOptions) => Promise<ProcessedImageResult>,
  delayMs: number = 140
) {
  const [activeId, setActiveId] = useState<string>('');
  const [livePreview, setLivePreview] = useState<LivePreviewState | null>(null);
  const [previewLoading, setPreviewLoading] = useState<boolean>(false);
  const lastProcUrlRef = useRef<string | null>(null);
  const jobIdRef = useRef<number>(0);

  // Sync activeId with current items
  useEffect(() => {
    if (items.length === 0) {
      setActiveId('');
      setLivePreview(null);
      return;
    }
    if (!items.some((it) => it.id === activeId)) {
      setActiveId(items[0].id);
    }
  }, [items, activeId]);

  const activeItem = items.find((it) => it.id === activeId) || items[0] || null;

  useEffect(() => {
    if (!activeItem) return;

    const currentJob = ++jobIdRef.current;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await processorFn(activeItem.file, options);
        if (currentJob !== jobIdRef.current) {
          URL.revokeObjectURL(res.downloadUrl);
          return;
        }
        if (lastProcUrlRef.current && lastProcUrlRef.current !== res.downloadUrl) {
          URL.revokeObjectURL(lastProcUrlRef.current);
        }
        lastProcUrlRef.current = res.downloadUrl;

        setLivePreview({
          origUrl: activeItem.previewUrl,
          procUrl: res.downloadUrl,
          blob: res.blob,
          name: res.originalName,
          width: res.width,
          height: res.height,
          origSize: res.originalSize,
          procSize: res.processedSize,
          percentReduction: res.percentReduction,
          isKeptOriginal: res.isKeptOriginal,
        });
      } catch {
        // Fallback to showing original if transient decode fails
      } finally {
        if (currentJob === jobIdRef.current) {
          setPreviewLoading(false);
        }
      }
    }, delayMs);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeItem?.id, activeItem?.file, JSON.stringify(options)]);

  // Cleanup URL on unmount
  useEffect(() => {
    return () => {
      if (lastProcUrlRef.current) {
        URL.revokeObjectURL(lastProcUrlRef.current);
        lastProcUrlRef.current = null;
      }
    };
  }, []);

  return {
    activeId: activeItem?.id || '',
    setActiveId,
    livePreview,
    previewLoading,
  };
}
