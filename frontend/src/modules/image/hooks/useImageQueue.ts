import { useState, useCallback } from 'react';
import { ImageFileItem, ProcessedImageResult } from '../types/image';
import { loadImageElement } from '../services/image-decode';

export function useImageQueue() {
  const [items, setItems] = useState<ImageFileItem[]>([]);
  const [results, setResults] = useState<ProcessedImageResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });

  const addFiles = useCallback(async (newFiles: File[]) => {
    const valid = newFiles.filter((f) => f.type.startsWith('image/'));
    if (valid.length === 0) return;

    const newItems: ImageFileItem[] = [];
    for (const f of valid) {
      try {
        const { width, height, url } = await loadImageElement(f);
        newItems.push({
          id: `${f.name}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          file: f,
          name: f.name,
          size: f.size,
          width,
          height,
          format: f.type || 'image/jpeg',
          previewUrl: url,
        });
      } catch {
        // bỏ qua ảnh lỗi
      }
    }

    setItems((prev) => [...prev, ...newItems]);
    // Reset kết quả cũ khi nạp thêm ảnh mới
    setResults([]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    setResults((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    items.forEach((item) => {
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    });
    results.forEach((r) => {
      if (r.downloadUrl) URL.revokeObjectURL(r.downloadUrl);
    });
    setItems([]);
    setResults([]);
    setProgress({ current: 0, total: 0 });
  }, [items, results]);

  return {
    items,
    setItems,
    results,
    setResults,
    processing,
    setProcessing,
    progress,
    setProgress,
    addFiles,
    removeFile,
    clearAll,
  };
}
