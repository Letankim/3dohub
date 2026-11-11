/**
 * Client-side Fancybox viewer helper for Image Utilities.
 * Dynamically imports @fancyapps/ui on demand.
 */

export interface FancyboxSlideItem {
  src: string;
  caption?: string;
  thumb?: string;
}

export async function openFancyboxGallery(
  slides: FancyboxSlideItem[],
  startIndex: number = 0
): Promise<void> {
  if (typeof window === 'undefined' || slides.length === 0) return;

  const { Fancybox } = await import('@fancyapps/ui');
  Fancybox.show(
    slides.map((s) => ({
      src: s.src,
      caption: s.caption,
      thumb: s.thumb || s.src,
    })),
    {
      startIndex,
    }
  );
}
