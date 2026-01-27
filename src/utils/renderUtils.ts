import { useTimelineStore } from '../store/timelineStore';
import { useRenderStore, type ExportFormat, type TextPosition } from '../store/renderStore';
import { downloadDir, join } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';
import {
  getEmbeddedFontCSS,
  loadFontsForExport,
  fetchGoogleFontCSS,
} from '../services/fontService';
import {
  generateTextKeyframes,
  ANIMATION_SPEED_MULTIPLIERS,
  TEXT_ANIMATIONS,
  type TextAnimationType,
} from '../constants/layoutAnimationPresets';

// Seek timeline - no flushSync needed, animations are calculated directly from store
export const seekTimeline = (timeMs: number) => {
  useTimelineStore.getState().setPlayhead(timeMs);
};

// Pause/seek Web Animations API animations
export const pauseAndSeekAnimations = (node: HTMLElement, timeMs: number) => {
  const animations = node.getAnimations({ subtree: true });
  for (const animation of animations) {
    animation.pause();
    animation.currentTime = timeMs;
    // Commit computed styles to inline - ensures transforms are captured correctly
    try {
      animation.commitStyles();
    } catch {
      // commitStyles() can throw if animation is not in a valid state
    }
  }
  // Force style recalculation - ensures transform/opacity are computed
  // before frame capture (fixes animation stuttering in export)
  void node.offsetHeight;
};

// Pause/seek HTML5 Video elements and wait for seek to complete
export const pauseAndSeekVideos = async (node: HTMLElement, timeMs: number): Promise<void> => {
  const videos = node.querySelectorAll('video');
  if (videos.length === 0) return;

  const seconds = timeMs / 1000;

  const seekPromises = Array.from(videos).map((video) => {
    return new Promise<void>((resolve) => {
      video.pause();

      // If already at target time and has data, resolve immediately (more tolerance)
      if (Math.abs(video.currentTime - seconds) < 0.05 && video.readyState >= 2) {
        resolve();
        return;
      }

      // Video ready - just seek
      if (video.readyState >= 2) {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        };

        // Timeout fallback (reduced from 1000ms)
        const timeout = setTimeout(() => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        }, 200);

        video.addEventListener('seeked', () => clearTimeout(timeout), { once: true });
        video.addEventListener('seeked', onSeeked, { once: true });
        video.currentTime = seconds;
      } else {
        // Video not ready - wait for canplay then seek
        const doSeek = () => {
          video.currentTime = seconds;
          resolve(); // Don't wait for seeked event if we had to wait for canplay
        };

        video.addEventListener('canplay', doSeek, { once: true });
        // Fallback
        setTimeout(() => {
          if (video.readyState < 2) resolve();
        }, 300);
      }
    });
  });

  await Promise.all(seekPromises);
};

// Wait for browser to process (optimized for speed)
// Uses setTimeout only - RAF not needed since animations are calculated explicitly
export const waitForRender = (ms = 0) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : Promise.resolve();

// Get Liike export folder
export const getExportFolder = async (): Promise<string> => {
  const downloads = await downloadDir();
  const liikeFolder = await join(downloads, 'Liike');
  try {
    await mkdir(liikeFolder, { recursive: true });
  } catch {
    // Folder might already exist
  }
  return liikeFolder;
};

// Generate unique filename
export const getVideoFilename = (
  baseName: string,
  width: number,
  height: number,
  ext: string
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}_${width}x${height}.${ext}`;
};

export const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case 'webm':
      return 'webm';
    case 'mov':
      return 'mov';
    case 'png':
      return 'png';
    case 'gif':
      return 'gif';
    case 'webp':
      return 'webp';
    case 'mp4':
    default:
      return 'mp4';
  }
};

// Image Cache: URL -> DataURL (optimized for export resolution)
const imageCache = new Map<string, string>();

// Max dimension for cached images (matches 4K export)
const MAX_IMAGE_DIMENSION = 2160;

// Optimize image: resize to max dimension and compress
const optimizeImage = async (blob: Blob, maxDim: number = MAX_IMAGE_DIMENSION): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height / width) * maxDim);
          width = maxDim;
        } else {
          width = Math.round((width / height) * maxDim);
          height = maxDim;
        }
      }

      // Draw to canvas at optimized size
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Use WebP for best compression, fallback to JPEG
      // Quality 0.92 is visually lossless for most images
      const dataUrl = canvas.toDataURL('image/webp', 0.92);
      if (dataUrl.startsWith('data:image/webp')) {
        resolve(dataUrl);
      } else {
        // Browser doesn't support WebP, use JPEG
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for optimization'));
    };

    img.src = url;
  });
};

// Animation-related CSS properties that should be preserved from inline styles
const ANIMATION_PROPERTIES = [
  'opacity',
  'transform',
  'transform-style',
  'perspective',
  'backface-visibility',
  'filter',
  'clip-path',
  'visibility',
  'will-change',
];

// Properties that may contain URL values
const URL_PROPERTIES = [
  'background-image',
  'background',
  'mask-image',
  '-webkit-mask-image',
  'list-style-image',
  'border-image',
  'border-image-source',
  'content',
  'cursor',
];

// Helper: Check if a CSS value contains an external (non-data) URL
const hasExternalUrl = (value: string): boolean => {
  if (!value || !value.includes('url(')) return false;
  // Check for http/https/relative URLs (not data: or blob:)
  return /url\(['"]?(https?:\/\/|\/(?!\/))/.test(value);
};

// Helper: Inline computed styles from source to clone (optimized)
// Uses array join instead of reduce for O(n) instead of O(n²) string building
const inlineStyles = (source: HTMLElement, clone: HTMLElement) => {
  const sourceStyles = window.getComputedStyle(source);

  // Build CSS text using array (O(n) instead of O(n²) with string concat)
  const props = [];
  for (let i = 0; i < sourceStyles.length; i++) {
    const prop = sourceStyles[i];
    const value = sourceStyles.getPropertyValue(prop);

    // Skip properties with external URLs - these will be converted separately
    if (URL_PROPERTIES.includes(prop) && hasExternalUrl(value)) {
      console.warn('[inlineStyles] Skipping external URL in:', prop, value.slice(0, 100));
      continue;
    }

    props.push(`${prop}:${value}`);
  }
  clone.style.cssText = props.join(';');

  // Override with explicit inline styles for animation properties
  for (const prop of ANIMATION_PROPERTIES) {
    const inlineValue = source.style.getPropertyValue(prop);
    if (inlineValue) {
      clone.style.setProperty(prop, inlineValue);
    }
  }

  // Recursively process children (synchronous for speed)
  const sourceChildren = source.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    if (sourceChildren[i] instanceof HTMLElement && cloneChildren[i] instanceof HTMLElement) {
      inlineStyles(sourceChildren[i] as HTMLElement, cloneChildren[i] as HTMLElement);
    }
  }
};

// Helper: Convert image via canvas (fallback when fetch fails)
const convertImageViaCanvas = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = url;
  });
};

// Helper: Fetch and convert URL to DataURL with caching + optimization
const getCachedDataUrl = async (url: string): Promise<string> => {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    // Use native fetch for localhost/local assets, tauriFetch for external URLs
    const isLocalUrl = url.startsWith('http://localhost') ||
                       url.startsWith('http://127.0.0.1') ||
                       url.startsWith('/') ||
                       url.startsWith('./');

    let response: Response;
    if (isLocalUrl) {
      response = await fetch(url);
    } else {
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(url);
    }
    const blob = await response.blob();

    // Optimize large images (> 500KB) to reduce memory during export
    let dataUrl: string;
    if (blob.size > 500 * 1024) {
      console.log(
        `[StreamRender] Optimizing large image: ${(blob.size / 1024 / 1024).toFixed(1)}MB -> max ${MAX_IMAGE_DIMENSION}px`
      );
      dataUrl = await optimizeImage(blob);
      console.log(`[StreamRender] Optimized to: ${(dataUrl.length / 1024 / 1024).toFixed(1)}MB`);
    } else {
      // Small images: just convert to dataURL
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // Pre-decode for faster rendering
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = dataUrl;
    try {
      await img.decode();
    } catch {}

    imageCache.set(url, dataUrl);
    return dataUrl;
  } catch (e) {
    console.warn('[StreamRender] Fetch failed, trying canvas fallback:', url, e);
    // Try canvas-based conversion as fallback
    try {
      const dataUrl = await convertImageViaCanvas(url);
      imageCache.set(url, dataUrl);
      return dataUrl;
    } catch (canvasError) {
      console.warn('[StreamRender] Canvas fallback also failed:', url, canvasError);
      // Return transparent pixel to avoid canvas taint
      return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    }
  }
};

// Helper: Convert blob URL to data URL
const blobUrlToDataUrl = async (blobUrl: string): Promise<string> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    // Return transparent pixel to avoid canvas taint
    return 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  }
};

// Helper: Convert all images in node to data URLs
const convertImagesToDataUrls = async (node: HTMLElement) => {
  const images = node.querySelectorAll('img');
  console.log(`[convertImages] Found ${images.length} img elements`);

  for (const img of images) {
    if (img.src.startsWith('data:')) {
      console.log('[convertImages] Already data URL, skipping');
      continue;
    }

    console.log('[convertImages] Converting:', img.src.slice(0, 100));
    try {
      let dataUrl: string;
      if (img.src.startsWith('blob:')) {
        dataUrl = await blobUrlToDataUrl(img.src);
      } else {
        dataUrl = await getCachedDataUrl(img.src);
      }
      img.src = dataUrl;
      img.setAttribute('crossorigin', 'anonymous');
      console.log('[convertImages] Success:', img.src.slice(0, 50));
    } catch (e) {
      console.error('[convertImages] FAILED to convert:', img.src, e);
    }
  }

  // Also convert video poster attributes
  const videos = node.querySelectorAll('video');
  for (const video of videos) {
    if (video.poster && !video.poster.startsWith('data:')) {
      console.log('[convertImages] Converting video poster:', video.poster.slice(0, 100));
      try {
        const dataUrl = video.poster.startsWith('blob:')
          ? await blobUrlToDataUrl(video.poster)
          : await getCachedDataUrl(video.poster);
        video.poster = dataUrl;
      } catch {
        console.warn('[convertImages] Removing poster that failed to convert');
        video.removeAttribute('poster');
      }
    }
  }

  // Convert SVG <image> elements (xlink:href or href)
  const svgImages = node.querySelectorAll('image');
  for (const svgImg of svgImages) {
    const href = svgImg.getAttribute('href') || svgImg.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
    if (href && !href.startsWith('data:')) {
      console.log('[convertImages] Converting SVG image:', href.slice(0, 100));
      try {
        const dataUrl = href.startsWith('blob:')
          ? await blobUrlToDataUrl(href)
          : await getCachedDataUrl(href);
        svgImg.setAttribute('href', dataUrl);
        svgImg.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
      } catch {
        console.warn('[convertImages] Failed to convert SVG image');
      }
    }
  }

  // Clear srcset attributes (they cause issues and aren't needed for export)
  const imgsWithSrcset = node.querySelectorAll('img[srcset]');
  for (const img of imgsWithSrcset) {
    console.log('[convertImages] Removing srcset from img');
    img.removeAttribute('srcset');
  }
};

// Helper: Convert a CSS url() value to data URL
const convertCssUrlToDataUrl = async (cssValue: string): Promise<string> => {
  const urlMatch = cssValue.match(/url\(['"]?(.*?)['"]?\)/);
  if (!urlMatch || !urlMatch[1] || urlMatch[1].startsWith('data:')) {
    return cssValue;
  }

  const originalUrl = urlMatch[1];
  try {
    const dataUrl = originalUrl.startsWith('blob:')
      ? await blobUrlToDataUrl(originalUrl)
      : await getCachedDataUrl(originalUrl);
    return cssValue.replace(/url\(['"]?.*?['"]?\)/, `url("${dataUrl}")`);
  } catch {
    return cssValue;
  }
};

// Helper: Convert background images to data URLs
const convertBackgroundImagesToDataUrls = async (node: HTMLElement) => {
  const elements = node.querySelectorAll('*');
  const allElements = [node, ...Array.from(elements)] as HTMLElement[];

  // CSS properties that can contain url() values
  const urlProperties = [
    'backgroundImage',
    'maskImage',
    'webkitMaskImage',
    'listStyleImage',
    'borderImage',
    'content',
  ] as const;

  for (const el of allElements) {
    const computed = window.getComputedStyle(el);

    for (const prop of urlProperties) {
      const inlineValue = el.style[prop as keyof CSSStyleDeclaration] as string;
      const computedValue = computed[prop as keyof CSSStyleDeclaration] as string;
      const value = inlineValue || computedValue;

      if (value && value !== 'none' && value.includes('url(')) {
        const convertedValue = await convertCssUrlToDataUrl(value);
        if (convertedValue !== value) {
          el.style.setProperty(prop, convertedValue);
        }
      }
    }

    // Handle background-image specifically with layout preservation
    const bgImage = el.style.backgroundImage || computed.backgroundImage;
    if (bgImage && bgImage !== 'none' && bgImage.includes('url(') && !bgImage.includes('data:')) {
      const size = el.style.backgroundSize || computed.backgroundSize;
      const pos = el.style.backgroundPosition || computed.backgroundPosition;
      const repeat = el.style.backgroundRepeat || computed.backgroundRepeat;

      el.style.backgroundImage = await convertCssUrlToDataUrl(bgImage);
      if (size) el.style.backgroundSize = size;
      if (pos) el.style.backgroundPosition = pos;
      if (repeat) el.style.backgroundRepeat = repeat;
    }
  }
};

// Helper: Convert video elements to images
export const convertVideosToImages = async (sourceNode: HTMLElement, cloneNode: HTMLElement) => {
  const sourceVideos = sourceNode.querySelectorAll('video');
  const cloneVideos = cloneNode.querySelectorAll('video');

  const sourceVideoArray = Array.from(sourceVideos);
  const cloneVideoArray = Array.from(cloneVideos);

  for (let i = 0; i < sourceVideoArray.length; i++) {
    const sourceVideo = sourceVideoArray[i];
    const cloneVideo = cloneVideoArray[i];

    if (!sourceVideo || !cloneVideo) continue;
    if (sourceVideo.videoWidth === 0 || sourceVideo.videoHeight === 0) continue;

    try {
      const width = sourceVideo.videoWidth;
      const height = sourceVideo.videoHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(sourceVideo, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/png'); // Using PNG for quality

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = cloneVideo.style.cssText;
        img.className = cloneVideo.className;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        if (cloneVideo.parentNode) {
          cloneVideo.parentNode.replaceChild(img, cloneVideo);
        }
      }
    } catch (e) {
      console.error('[StreamRender] Video conversion failed:', e);
    }
  }
};

// Preload all resources in the node
export const preloadResources = async (node: HTMLElement) => {
  console.log('[StreamRender] Preloading resources...');
  await convertImagesToDataUrls(node); // This will populate cache
  await convertBackgroundImagesToDataUrls(node);

  // Ensure ALL images are decoded (including bundled assets like device mockups)
  const allImages = node.querySelectorAll('img');
  const decodePromises: Promise<void>[] = [];
  for (const img of allImages) {
    if (img.complete && img.naturalWidth > 0) {
      // Already loaded, but ensure decoded
      decodePromises.push(img.decode().catch(() => {}));
    } else {
      // Wait for load then decode
      decodePromises.push(
        new Promise<void>((resolve) => {
          img.onload = () =>
            img
              .decode()
              .then(() => resolve())
              .catch(() => resolve());
          img.onerror = () => resolve();
          // Trigger load if src is set but not loading
          if (img.src && !img.complete) {
            const src = img.src;
            img.src = '';
            img.src = src;
          }
        })
      );
    }
  }
  await Promise.all(decodePromises);

  // Preload videos - ensure they have enough data for seeking
  // Set crossOrigin to prevent canvas taint (must reload if already loaded without it)
  const allVideos = node.querySelectorAll('video');
  const videoPromises: Promise<void>[] = [];
  for (const video of allVideos) {
    // Check if we need to set/reload for crossOrigin
    const needsReload = !video.crossOrigin && video.readyState > 0;
    video.crossOrigin = 'anonymous';

    videoPromises.push(
      new Promise<void>((resolve) => {
        const onCanPlay = () => {
          video.removeEventListener('canplaythrough', onCanPlay);
          resolve();
        };

        video.addEventListener('canplaythrough', onCanPlay, { once: true });

        // Timeout fallback
        setTimeout(() => {
          video.removeEventListener('canplaythrough', onCanPlay);
          resolve();
        }, 3000);

        // Trigger load/reload
        video.preload = 'auto';
        if (needsReload || video.readyState < 3) {
          video.load();
        } else {
          resolve();
        }
      })
    );
  }
  await Promise.all(videoPromises);
  console.log('[StreamRender] Videos preloaded:', allVideos.length);

  console.log('[StreamRender] Resources preloaded.');
};

// Extract font families used in a DOM tree
const extractUsedFonts = (node: HTMLElement): Set<string> => {
  const fonts = new Set<string>();
  const elements = [node, ...Array.from(node.querySelectorAll('*'))] as HTMLElement[];

  for (const el of elements) {
    const computed = window.getComputedStyle(el);
    const fontFamily = computed.fontFamily;
    if (fontFamily) {
      // Parse font-family string (e.g., "'Manrope', sans-serif")
      const families = fontFamily.split(',').map((f) => f.trim().replace(/['"]/g, ''));
      for (const family of families) {
        if (
          family &&
          !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'].includes(family)
        ) {
          fonts.add(family);
        }
      }
    }
  }

  return fonts;
};

// Font cache for embedded CSS (avoids re-fetching during frame capture)
const fontCssCache = new Map<string, string>();

// Preload fonts into the font cache and browser's FontFace API
export const preloadFonts = async (node: HTMLElement): Promise<void> => {
  const usedFonts = extractUsedFonts(node);
  const fontArray = Array.from(usedFonts);
  console.log('[StreamRender] Preloading fonts:', fontArray);

  // Load fonts into browser's FontFace API for reliable canvas rendering
  await loadFontsForExport(fontArray);

  // Also cache embedded CSS for SVG fallback
  for (const fontName of usedFonts) {
    // Skip system fonts
    if (
      fontName.startsWith('-apple') ||
      fontName === 'system-ui' ||
      fontName === 'BlinkMacSystemFont'
    ) {
      console.log(`[StreamRender] Skipping system font: ${fontName}`);
      continue;
    }
    if (fontCssCache.has(fontName)) {
      console.log(`[StreamRender] Font already cached: ${fontName}`);
      continue;
    }
    try {
      const fontCSS = await getEmbeddedFontCSS(fontName);
      if (fontCSS && fontCSS.length > 0) {
        fontCssCache.set(fontName, fontCSS);
        console.log(`[StreamRender] Cached font CSS: ${fontName} (${fontCSS.length} chars)`);
      } else {
        console.warn(`[StreamRender] No CSS returned for font: ${fontName}`);
      }
    } catch (e) {
      console.warn('[StreamRender] Font CSS cache failed:', fontName, e);
    }
  }
  console.log(`[StreamRender] Font cache size: ${fontCssCache.size}`);
};

// Cached export context - reused across frames for performance
interface ExportContext {
  fontCss: string;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  scaleX: number;
  scaleY: number;
  // Optimized rendering with layers
  bgClone: HTMLElement;
  deviceClone: HTMLElement;
  animatedElements: Array<{ source: HTMLElement; target: HTMLElement }>;
  bgImg: HTMLImageElement;
  deviceImg: HTMLImageElement;
  svgPrefix: string;
  svgSuffix: string;
  bgIsStatic: boolean;      // Optimization: if true, only render BG once
  deviceIsStatic: boolean;  // Optimization: if true, only render Device once (except video)
  bgRendered: boolean;
  deviceRendered: boolean;
}

let cachedExportContext: CachedExportContext | null = null;

// Yield to main thread to prevent blocking
export const yieldToMain = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

// Prepare export context once before frame loop
export const prepareExportContext = async (
  node: HTMLElement,
  sourceWidth: number,
  sourceHeight: number,
  outputWidth: number,
  outputHeight: number
): Promise<void> => {
  console.log('[Export] Preparing optimized export context (layered)...');
  const startTime = performance.now();

  const scaleX = outputWidth / sourceWidth;
  const scaleY = outputHeight / sourceHeight;

  // 1. Master Clone - Clone and Clean once
  const masterClone = node.cloneNode(true) as HTMLElement;
  masterClone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

  // Remove skip elements early
  const skipElements = masterClone.querySelectorAll('[data-export-skip]');
  skipElements.forEach((el) => el.remove());

  // Remove problematic elements
  masterClone.querySelectorAll('link, script, iframe, object, embed').forEach((el) => el.remove());

  // 2. Convert Images & Inline Styles on Master
  // Convert images to data URLs FIRST
  await convertImagesToDataUrls(masterClone);
  await convertBackgroundImagesToDataUrls(masterClone);

  // Inline all computed styles ONCE
  inlineStyles(node, masterClone);
  masterClone.style.margin = '0';

  // Convert AGAIN in case inlineStyles copied URLs
  await convertImagesToDataUrls(masterClone);
  await convertBackgroundImagesToDataUrls(masterClone);

  // AGGRESSIVE OPTIMIZATION: Sanitize DOM directly (safer & faster than serialize->regex->parse)
  const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  
  const sanitizeNode = (root: HTMLElement) => {
    // 1. Sanitize Images
    const images = root.querySelectorAll('img');
    for (const img of images) {
      if (img.src && !img.src.startsWith('data:')) {
        img.src = transparentPixel;
      }
      if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
    }

    // 2. Sanitize SVG <image>
    const svgImages = root.querySelectorAll('image');
    for (const img of svgImages) {
      const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (href && !href.startsWith('data:')) {
        img.setAttribute('href', transparentPixel);
        img.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
      }
    }

    // 3. Sanitize Video Posters
    const videos = root.querySelectorAll('video');
    for (const video of videos) {
      if (video.hasAttribute('poster') && !video.poster.startsWith('data:')) {
        video.removeAttribute('poster'); 
      }
    }
    
    // 4. Sanitize Styles (Background Images)
    // Note: convertBackgroundImagesToDataUrls should have handled this, but as a fallback:
    const allElements = root.querySelectorAll('*');
    for (const el of allElements) {
       const htmlEl = el as HTMLElement;
       const bg = htmlEl.style.backgroundImage;
       if (bg && bg.includes('url(') && !bg.includes('data:')) {
          htmlEl.style.backgroundImage = 'none';
       }
    }
  };

  sanitizeNode(masterClone);

  // 3. Create Layers from sanitized master
  const bgClone = masterClone.cloneNode(true) as HTMLElement;
  const deviceClone = masterClone.cloneNode(true) as HTMLElement;

  // Prepare Background Clone: Hide Device Layer
  const deviceLayerInBg = bgClone.querySelector('[data-layer="device"]') as HTMLElement;
  if (deviceLayerInBg) deviceLayerInBg.style.display = 'none';

  // Prepare Device Clone: Hide Background Layer & Make Transparent
  const bgLayerInDevice = deviceClone.querySelector('[data-layer="background"]') as HTMLElement;
  if (bgLayerInDevice) bgLayerInDevice.style.display = 'none';

  // Set root transparent
  deviceClone.style.backgroundColor = 'transparent';
  deviceClone.style.backgroundImage = 'none';

  // Make screen container transparent so video shows through
  const screenContainer = deviceClone.querySelector('[data-screen-container]') as HTMLElement;
  if (screenContainer) {
    screenContainer.style.backgroundColor = 'transparent';
    screenContainer.style.backgroundImage = 'none';
  }

  // 4. Map Animated Elements & Detect Static Layers
  const animatedElements: Array<{ source: HTMLElement; target: HTMLElement; layer: 'bg' | 'device' }> = [];
  let bgHasAnimations = false;
  let deviceHasAnimations = false;

  // Get all animated elements from source to build a fast lookup
  const animations = node.getAnimations({ subtree: true });
  const animatedSourceElements = new Set(
    animations
      .map((a) => (a.effect as KeyframeEffect | null)?.target as HTMLElement | null)
      .filter((el): el is HTMLElement => el !== null)
  );

  // Helper to determine which layer an element belongs to
  const getLayerType = (el: HTMLElement): 'bg' | 'device' | 'unknown' => {
    // Check closest data-layer parent in the CLONE structure
    // Since we are walking source/target in parallel, we can check target's parents
    let current: HTMLElement | null = el;
    while (current) {
        if (current.getAttribute('data-layer') === 'background') return 'bg';
        if (current.getAttribute('data-layer') === 'device') return 'device';
        current = current.parentElement;
    }
    return 'unknown';
  };

  // Simultanously walk trees to build mapping
  const walkAndMap = (source: HTMLElement, target: HTMLElement, rootLayer: 'bg' | 'device') => {
    const isDeviceAnim = source.hasAttribute('data-device-animation');
    const isLayoutAnim = source.hasAttribute('data-layout-animation');
    const hasWebAnim = animatedSourceElements.has(source);
    const isTextChild = source.parentElement &&
                        source.parentElement.style.zIndex === '50' &&
                        source.parentElement.style.pointerEvents === 'none';
    
    // Check for inline animated styles (React state-driven)
    // Note: We only care if these change over time, but for safety we track them all.
    const hasAnimatedStyle = source.style.transform || source.style.opacity ||
                             source.style.filter || source.style.clipPath;

    if (isDeviceAnim || isLayoutAnim || hasWebAnim || isTextChild || hasAnimatedStyle) {
      animatedElements.push({ source, target, layer: rootLayer });
      
      if (rootLayer === 'bg') bgHasAnimations = true;
      if (rootLayer === 'device') deviceHasAnimations = true;
    }

    const sourceChildren = source.children;
    const targetChildren = target.children;
    for (let i = 0; i < sourceChildren.length; i++) {
        if (sourceChildren[i] instanceof HTMLElement && targetChildren[i] instanceof HTMLElement) {
            walkAndMap(sourceChildren[i] as HTMLElement, targetChildren[i] as HTMLElement, rootLayer);
        }
    }
  };

  walkAndMap(node, bgClone, 'bg');
  // Device layers in BG clone are hidden, but root mapping might still traverse?
  // Actually, wait. bgClone has 'device' layer HIDDEN (display:none).
  // But the DOM nodes still exist inside it.
  // We want to map animations relevant to the visible part.
  
  // Correction: We should only map animations that are VISIBLE in that layer.
  // Since we hide the other layer's container, effectively those animations don't matter for that clone.
  // The 'target' in walkAndMap is the clone node.
  // If we are in bgClone, we shouldn't map into the hidden device layer.
  // But traversing the whole tree is simpler. 
  // Optimization: Stop traversal at hidden layers?
  
  // Let's refine walkAndMap to stop at data-layer boundary of the OTHER type.
  const walkAndMapIdeally = (source: HTMLElement, target: HTMLElement, layerType: 'bg' | 'device') => {
      // If we hit the OTHER layer's container, stop traversing down
      const targetLayerAttr = target.getAttribute('data-layer');
      if (layerType === 'bg' && targetLayerAttr === 'device') return; 
      if (layerType === 'device' && targetLayerAttr === 'background') return;

      const isDeviceAnim = source.hasAttribute('data-device-animation');
      const isLayoutAnim = source.hasAttribute('data-layout-animation');
      const hasWebAnim = animatedSourceElements.has(source);
      // Text children usually overlay everything, treated separately or as top level?
      // Actually text overlay is usually separate canvas now.
      
      const hasAnimatedStyle = source.style.transform || source.style.opacity ||
                               source.style.filter || source.style.clipPath;

      if (isDeviceAnim || isLayoutAnim || hasWebAnim || hasAnimatedStyle) {
          animatedElements.push({ source, target, layer: layerType });
          if (layerType === 'bg') bgHasAnimations = true;
          if (layerType === 'device') deviceHasAnimations = true;
      }

      const sourceChildren = source.children;
      const targetChildren = target.children;
      // Use efficient loop
      const len = sourceChildren.length;
      for (let i = 0; i < len; i++) {
          const sChild = sourceChildren[i];
          const tChild = targetChildren[i];
          if (sChild instanceof HTMLElement && tChild instanceof HTMLElement) {
               walkAndMapIdeally(sChild, tChild, layerType);
          }
      }
  };
  
  walkAndMapIdeally(node, bgClone, 'bg');
  walkAndMapIdeally(node, deviceClone, 'device');


  // 5. Get font CSS ONCE
  const usedFonts = extractUsedFonts(node);
  let fontCss = '';
  for (const fontName of usedFonts) {
    if (fontName.startsWith('-apple') || fontName === 'system-ui' || fontName === 'BlinkMacSystemFont') {
      continue;
    }
    if (fontCssCache.has(fontName)) {
      fontCss += fontCssCache.get(fontName);
    }
  }

  // Pre-create re-usable Image objects
  const bgImg = new Image();
  bgImg.crossOrigin = 'anonymous';
  const deviceImg = new Image();
  deviceImg.crossOrigin = 'anonymous';
  
  // NEW: SVG Prefix
  const svgPrefix = `<svg xmlns="http://www.w3.org/2000/svg" width="${outputWidth}" height="${outputHeight}">
<defs><style type="text/css">${fontCss}</style></defs>
<foreignObject width="${outputWidth}" height="${outputHeight}">
<div xmlns="http://www.w3.org/1999/xhtml" style="transform:scale(${scaleX},${scaleY});transform-origin:top left;width:${sourceWidth}px;height:${sourceHeight}px;">`;
  const svgSuffix = `</div>
</foreignObject>
</svg>`;

  cachedExportContext = {
    fontCss,
    sourceWidth,
    sourceHeight,
    outputWidth,
    outputHeight,
    scaleX,
    scaleY,
    bgClone,
    deviceClone,
    animatedElements,
    bgImg,
    deviceImg,
    svgPrefix,
    svgSuffix,
    bgIsStatic: !bgHasAnimations,       // Flag for optimization
    deviceIsStatic: !deviceHasAnimations, // Flag for optimization
    bgRendered: false,     // Track if rendered
    deviceRendered: false, // Track if rendered
  };

  console.log(
    `[Export] Context prepared. BG Static: ${!bgHasAnimations}, Device Static: ${!deviceHasAnimations}`
  );
};

// Clear export context after rendering is complete
export const clearExportContext = () => {
  cachedExportContext = null;
  // Also clear reusable canvas
  captureCanvas = null;
  captureCtx = null;
};

// Accelerated SVG rendering using Blob URLs and direct style synchronization
// Helper: Sync animation styles from real DOM to clone(s)
const syncFrameAnimations = () => {
  if (!cachedExportContext) return;

  const { animatedElements, bgIsStatic, deviceIsStatic, bgRendered, deviceRendered } = cachedExportContext;

  for (const { source, target, layer } of animatedElements) {
    // OPTIMIZATION: Skip syncing if the target layer is static and already rendered
    if (layer === 'bg' && bgIsStatic && bgRendered) continue;
    if (layer === 'device' && deviceIsStatic && deviceRendered) continue;

    target.style.transition = 'none'; // DISABLE TRANSITIONS to ensure immediate update

    // Prefer inline style (source of truth for React state animations)
    // Fallback to computed style if inline is missing
    const computed = window.getComputedStyle(source);
    target.style.transform = source.style.transform || computed.transform;
    target.style.opacity = source.style.opacity || computed.opacity;

    // Sync 3D transform properties
    const transformStyle = source.style.transformStyle || computed.transformStyle;
    const perspective = source.style.perspective || computed.perspective;
    const backfaceVisibility = source.style.backfaceVisibility || computed.backfaceVisibility;
    if (transformStyle && transformStyle !== 'flat') target.style.transformStyle = transformStyle;
    if (perspective && perspective !== 'none') target.style.perspective = perspective;
    if (backfaceVisibility) target.style.backfaceVisibility = backfaceVisibility;

    // Sync origin properties (critical for correct rotation pivots)
    const transformOrigin = source.style.transformOrigin || computed.transformOrigin;
    const transformBox = source.style.transformBox || computed.transformBox;
    const perspectiveOrigin = source.style.perspectiveOrigin || computed.perspectiveOrigin;
    
    if (transformOrigin) target.style.transformOrigin = transformOrigin;
    if (transformBox) target.style.transformBox = transformBox;
    if (perspectiveOrigin) target.style.perspectiveOrigin = perspectiveOrigin;

    // Sync filter and clipPath (important for blur/reveal animations)
    const filterVal = source.style.filter || computed.filter;
    const clipPathVal = source.style.clipPath || computed.clipPath;
    if (filterVal && filterVal !== 'none') target.style.filter = filterVal;
    if (clipPathVal && clipPathVal !== 'none') target.style.clipPath = clipPathVal;
  }
};

// accelerated SVG rendering using Data URLs (Blob URLs taint canvas in WebKit with foreignObject)
const renderCloneToImage = async (
  clone: HTMLElement,
  outputImg: HTMLImageElement
): Promise<HTMLImageElement> => {
  if (!cachedExportContext) {
    throw new Error('Export context not prepared');
  }

  const { svgPrefix, svgSuffix } = cachedExportContext;

  // Optimistic assumption: clone is already clean from prepareExportContext
  // Only sync styles (already done in syncFrameAnimations)

  // 1. Fast serialization (Use XMLSerializer for well-formed XML)
  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);

  // 2. Build SVG as Data URL
  // We use Data URL because Blob URLs with foreignObject often taint the canvas in WebKit (Safari/Tauri)
  const svg = svgPrefix + nodeString + svgSuffix;
  const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  // 3. Load into reused Image object
  return new Promise((resolve, reject) => {
    outputImg.onload = () => resolve(outputImg);
    outputImg.onerror = (e) => {
      console.error('[StreamRender] SVG load failed:', e);
      reject(new Error('SVG render failed.'));
    };
    outputImg.src = svgDataUrl;
  });
};

// Helper: Convert DOM node to SVG data URL using foreignObject
// outputWidth/outputHeight = final export size, sourceWidth/sourceHeight = DOM element size
export const nodeToSvgDataUrl = async (
  node: HTMLElement,
  sourceWidth: number,
  sourceHeight: number,
  outputWidth?: number,
  outputHeight?: number
): Promise<string> => {
  const finalWidth = outputWidth || sourceWidth;
  const finalHeight = outputHeight || sourceHeight;

  // Note: Fast path is now in captureFrame via loadSvgImageFast
  // This function is used for single image export (slow path)
  const scaleX = finalWidth / sourceWidth;
  const scaleY = finalHeight / sourceHeight;
  // Clone the node
  const clone = node.cloneNode(true) as HTMLElement;

  // Remove elements marked for export skip
  const skipElements = clone.querySelectorAll('[data-export-skip]');
  skipElements.forEach((el) => el.remove());

  // Inline all computed styles for the clone
  inlineStyles(node, clone);

  // Fix potential layout shifts in SVG
  clone.style.margin = '0';

  // Explicitly sync animations from source to clone
  // This matches the logic in prepareExportContext and ensures layout/device animations are captured
  // regardless of inlineStyle limitations or React timing quirks (since we waited for render)
  const syncAnimationStyles = (selector: string) => {
    const sourceElements = node.querySelectorAll(selector);
    const targetElements = clone.querySelectorAll(selector);

    if (sourceElements.length === targetElements.length) {
      for (let i = 0; i < sourceElements.length; i++) {
        const source = sourceElements[i] as HTMLElement;
        const target = targetElements[i] as HTMLElement;

        // Force sync critical animation properties from the "live" authorized source
        target.style.transition = 'none'; // Critical: Disable transitions to prevent SVG capture interpolation

        const computed = window.getComputedStyle(source);

        // Sync all animation-related properties
        target.style.transform = source.style.transform || computed.transform;
        target.style.opacity = source.style.opacity || computed.opacity;
        target.style.transformStyle = source.style.transformStyle || computed.transformStyle;
        target.style.perspective = source.style.perspective || computed.perspective;
        target.style.backfaceVisibility = source.style.backfaceVisibility || computed.backfaceVisibility;

        // Conditional properties
        if (source.style.filter || computed.filter !== 'none') {
          target.style.filter = source.style.filter || computed.filter;
        }
        if (source.style.clipPath || computed.clipPath !== 'none') {
          target.style.clipPath = source.style.clipPath || computed.clipPath;
        }
      }
    }
  };

  syncAnimationStyles('[data-layout-animation]');
  syncAnimationStyles('[data-device-animation]');

  // Apply text animation explicitly (React state-based animations need manual application)
  const { textOverlay, durationMs, animationSpeed } = useRenderStore.getState();
  const { playheadMs } = useTimelineStore.getState();

  if (textOverlay.enabled && textOverlay.animation && textOverlay.animation !== 'none') {
    const textSpeedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1;
    const textStartDelay = 300 / textSpeedMultiplier;
    const textAnimDuration = ((durationMs || 3000) * 0.3) / textSpeedMultiplier;
    const staggerDelay = textStartDelay + ((durationMs || 3000) * 0.15) / textSpeedMultiplier;

    // Calculate headline progress
    const headlineDelayed = Math.max(0, playheadMs - textStartDelay);
    const headlineProgress =
      headlineDelayed === 0 ? 0 : Math.min(1, headlineDelayed / textAnimDuration);

    // Calculate tagline progress (staggered)
    const taglineDelayed = Math.max(0, playheadMs - staggerDelay);
    const taglineProgress = Math.min(1, taglineDelayed / textAnimDuration);

    // Get animation styles
    const headlineAnim = generateTextKeyframes(
      textOverlay.animation as TextAnimationType,
      headlineProgress
    );
    const taglineAnim = generateTextKeyframes(
      textOverlay.animation as TextAnimationType,
      taglineProgress
    );

    // Find text elements in clone (they are direct children of the text overlay container)
    const textContainer = clone.querySelector('[data-text-overlay]') as HTMLElement | null;
    if (textContainer) {
      const textElements = textContainer.children;
      // First child is headline, second is tagline
      if (textElements[0]) {
        const headlineEl = textElements[0] as HTMLElement;
        headlineEl.style.opacity = String(headlineAnim.opacity);
        headlineEl.style.transform = headlineAnim.transform;
        if (headlineAnim.filter) headlineEl.style.filter = headlineAnim.filter;
        if (headlineAnim.clipPath) headlineEl.style.clipPath = headlineAnim.clipPath;
      }
      if (textElements[1]) {
        const taglineEl = textElements[1] as HTMLElement;
        taglineEl.style.opacity = String(taglineAnim.opacity * 0.9);
        taglineEl.style.transform = taglineAnim.transform;
        if (taglineAnim.filter) taglineEl.style.filter = taglineAnim.filter;
        if (taglineAnim.clipPath) taglineEl.style.clipPath = taglineAnim.clipPath;
      }
    }
  }

  // Convert images to data URLs (using cache)
  await convertImagesToDataUrls(clone);

  // Convert background images to data URLs (using cache)
  await convertBackgroundImagesToDataUrls(clone);

  // Convert videos to static images (frame capture)
  await convertVideosToImages(node, clone);

  // Get embedded font CSS from cache or fetch directly
  const usedFonts = extractUsedFonts(node);
  let fontCss = '';
  for (const fontName of usedFonts) {
    // Skip system fonts
    if (
      fontName.startsWith('-apple') ||
      fontName === 'system-ui' ||
      fontName === 'BlinkMacSystemFont'
    ) {
      continue;
    }

    if (fontCssCache.has(fontName)) {
      fontCss += fontCssCache.get(fontName);
    } else {
      // Try local cache first, then Google Fonts API
      try {
        let css = await getEmbeddedFontCSS(fontName);
        if (!css || css.length === 0) {
          // Fallback: fetch directly from Google Fonts
          console.log(`[SVG Export] Local cache empty, fetching from Google: ${fontName}`);
          css = await fetchGoogleFontCSS(fontName);
        }
        if (css && css.length > 0) {
          fontCssCache.set(fontName, css);
          fontCss += css;
          console.log(`[SVG Export] Cached font: ${fontName} (${css.length} chars)`);
        } else {
          console.warn(`[SVG Export] No CSS for font: ${fontName}`);
        }
      } catch (e) {
        console.warn(`[SVG Export] Failed to get font: ${fontName}`, e);
      }
    }
  }

  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);

  // SVG with embedded fonts and foreignObject
  // Apply scale transform to render at output resolution
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${finalWidth}" height="${finalHeight}">
      <defs>
        <style type="text/css">
          ${fontCss}
        </style>
      </defs>
      <foreignObject width="${finalWidth}" height="${finalHeight}">
        <div xmlns="http://www.w3.org/1999/xhtml" style="transform: scale(${scaleX}, ${scaleY}); transform-origin: top left; width: ${sourceWidth}px; height: ${sourceHeight}px;">
          ${nodeString}
        </div>
      </foreignObject>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

// Helper: Load an image from URL
export const loadImage = async (src: string): Promise<HTMLImageElement> => {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;

  // Use decode() to ensure image is fully ready including embedded fonts
  try {
    await img.decode();
  } catch {
    // Fallback to onload if decode fails
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
    });
  }

  return img;
};

// Helper: Render text overlay directly on canvas using Canvas 2D API
// This bypasses SVG foreignObject font issues
export const renderTextOverlay = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number,
  overrideDurationMs?: number,
  overridePlayheadMs?: number
) => {
  const { textOverlay, durationMs: storeDurationMs, animationSpeed } = useRenderStore.getState();
  const { playheadMs: storePlayheadMs } = useTimelineStore.getState();

  // Use override values if provided (for export), otherwise use store values (for preview)
  const durationMs = overrideDurationMs ?? storeDurationMs;
  const playheadMs = overridePlayheadMs ?? storePlayheadMs;

  console.log('[TextOverlay] Rendering:', {
    enabled: textOverlay.enabled,
    animation: textOverlay.animation,
    durationMs,
    playheadMs,
    animationSpeed,
    headline: textOverlay.headline?.slice(0, 20),
  });

  if (!textOverlay.enabled) return;

  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1;
  const startDelay = 300 / speedMultiplier;

  // Calculate headline animation progress
  const effectiveDuration = durationMs || 3000;
  const delayedPlayhead = Math.max(0, (playheadMs || 0) - startDelay);
  const headlineAnimDuration = Math.max(1, (effectiveDuration * 0.3) / speedMultiplier);
  const headlineProgress =
    delayedPlayhead <= 0 ? 0 : Math.min(1, delayedPlayhead / headlineAnimDuration);

  // Calculate tagline animation progress (staggered)
  const staggerDelay = startDelay + (effectiveDuration * 0.15) / speedMultiplier;
  const taglineAnimDuration = Math.max(1, (effectiveDuration * 0.3) / speedMultiplier);
  const taglineDelayedPlayhead = Math.max(0, (playheadMs || 0) - staggerDelay);
  const taglineProgress = Math.min(1, taglineDelayedPlayhead / taglineAnimDuration);

  const {
    headline,
    tagline,
    fontFamily,
    fontSize,
    taglineFontSize,
    fontWeight,
    color,
    animation,
    position,
  } = textOverlay;

  // Get animation styles - use all defined text animations
  const validAnimationIds = new Set<string>(TEXT_ANIMATIONS.map((a) => a.id));
  validAnimationIds.add('none'); // Always allow none
  const animationType: TextAnimationType = validAnimationIds.has(animation || '')
    ? (animation as TextAnimationType)
    : 'slide-in-left';

  const headlineAnim = generateTextKeyframes(animationType, headlineProgress);
  const taglineAnim = generateTextKeyframes(animationType, taglineProgress);

  console.log('[TextOverlay] Animation:', {
    animationType,
    headlineProgress: headlineProgress.toFixed(3),
    taglineProgress: taglineProgress.toFixed(3),
    headlineOpacity: headlineAnim.opacity.toFixed(3),
    taglineOpacity: taglineAnim.opacity.toFixed(3),
    delayedPlayhead: Math.max(0, playheadMs - 300 / speedMultiplier),
  });

  // Skip if both are invisible (but allow small opacity values)
  if (headlineAnim.opacity <= 0.001 && taglineAnim.opacity <= 0.001) {
    console.log('[TextOverlay] Skipping - both nearly invisible');
    return;
  }

  // DEBUG: Draw a small test marker to verify canvas rendering is working
  // ctx.fillStyle = 'red';
  // ctx.fillRect(10, 10, 20, 20);

  const padding = 40 * scale;
  const pos = (position || 'top-center') as TextPosition;

  // Calculate text position
  let textX = canvasWidth / 2;
  let textY = padding * 1.5;
  let textAlign: CanvasTextAlign = 'center';

  // Horizontal position
  if (pos.endsWith('left')) {
    textX = padding;
    textAlign = 'left';
  } else if (pos.endsWith('right')) {
    textX = canvasWidth - padding;
    textAlign = 'right';
  }

  // Calculate text dimensions
  const headlineHeight = headline ? fontSize * scale * 1.1 : 0;
  const gap = headline && tagline ? 12 * scale : 0;
  const taglineHeight = tagline ? taglineFontSize * scale * 1.3 : 0;
  const totalTextHeight = headlineHeight + gap + taglineHeight;

  // Vertical position
  if (pos.startsWith('center')) {
    textY = (canvasHeight - totalTextHeight) / 2;
  } else if (pos.startsWith('bottom')) {
    textY = canvasHeight - padding * 1.5 - totalTextHeight;
  }

  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  // Helper to parse transform values
  const parseTransform = (transform: string | undefined) => {
    if (!transform || transform === 'none')
      return { translateX: 0, translateY: 0, scaleVal: 1, rotate: 0, skewX: 0 };

    const translateYMatch = transform.match(/translateY\(([^)]+)\)/);
    const translateXMatch = transform.match(/translateX\(([^)]+)\)/);
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
    const skewXMatch = transform.match(/skewX\(([^)]+)\)/);

    return {
      translateX: translateXMatch ? parseFloat(translateXMatch[1]) : 0,
      translateY: translateYMatch ? parseFloat(translateYMatch[1]) : 0,
      scaleVal: scaleMatch ? parseFloat(scaleMatch[1]) : 1,
      rotate: rotateMatch ? parseFloat(rotateMatch[1]) : 0,
      skewX: skewXMatch ? parseFloat(skewXMatch[1]) : 0,
    };
  };

  // Helper to render text with animation transforms
  const renderAnimatedText = (
    text: string,
    anim: { opacity: number; transform: string; filter?: string },
    x: number,
    y: number,
    fontSizePx: number,
    weight: number | string,
    alphaMultiplier = 1
  ) => {
    if (!text || anim.opacity === 0) return;

    ctx.save();

    const { translateX, translateY, scaleVal, rotate, skewX } = parseTransform(anim.transform);

    // Apply blur filter if present
    if (anim.filter) {
      const blurMatch = anim.filter.match(/blur\(([^)]+)\)/);
      if (blurMatch) {
        ctx.filter = `blur(${parseFloat(blurMatch[1]) * scale}px)`;
      }
    }

    ctx.globalAlpha = anim.opacity * alphaMultiplier;
    ctx.font = `${weight} ${fontSizePx}px "${fontFamily}"`;
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 4 * scale;
    ctx.shadowOffsetY = 2 * scale;

    // Apply transforms around text center
    const textMetrics = ctx.measureText(text);
    const textWidth = textMetrics.width;
    const textHeight = fontSizePx;

    // Calculate center point based on text alignment
    let centerX = x;
    if (textAlign === 'center') centerX = x;
    else if (textAlign === 'left') centerX = x + textWidth / 2;
    else if (textAlign === 'right') centerX = x - textWidth / 2;
    const centerY = y + textHeight / 2;

    // Apply transformations
    ctx.translate(centerX + translateX * scale, centerY + translateY * scale);
    if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
    if (skewX !== 0) ctx.transform(1, 0, Math.tan((skewX * Math.PI) / 180), 1, 0, 0);
    ctx.scale(scaleVal, scaleVal);
    ctx.translate(-centerX, -centerY);

    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Render headline
  console.log('[TextOverlay] Drawing headline:', {
    text: headline?.slice(0, 20),
    x: textX.toFixed(0),
    y: textY.toFixed(0),
    fontSize: (fontSize * scale).toFixed(0),
    fontFamily,
    color,
  });
  renderAnimatedText(headline, headlineAnim, textX, textY, fontSize * scale, fontWeight);

  // Render tagline
  const taglineY = textY + headlineHeight + gap;
  renderAnimatedText(tagline, taglineAnim, textX, taglineY, taglineFontSize * scale, 400, 0.9);

  ctx.restore();
};

// Helper: Find effective border-radius from element or its parents
const getEffectiveBorderRadius = (element: HTMLElement): number => {
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    const radius = parseFloat(style.borderRadius) || 0;
    if (radius > 0) return radius;
    // Also check for overflow:hidden with radius on parent
    if (style.overflow === 'hidden' || style.overflow === 'clip') {
      const parentRadius = parseFloat(style.borderRadius) || 0;
      if (parentRadius > 0) return parentRadius;
    }
    current = current.parentElement;
  }
  return 0;
};

// Helper: Capture video frames directly to canvas (bypasses SVG foreignObject limitation)
const captureVideoFrames = (
  node: HTMLElement,
  ctx: CanvasRenderingContext2D,
  nodeRect: DOMRect,
  scale: number,
  offsetX: number,
  offsetY: number
) => {
  const videos = node.querySelectorAll('video');

  for (const video of videos) {
    // Skip if video not ready or has no dimensions
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn('[captureFrame] Video not ready:', video.readyState);
      continue;
    }

    // Skip if video doesn't have crossOrigin set (would taint canvas)
    if (!video.crossOrigin) {
      console.warn('[captureFrame] Skipping video without crossOrigin - would taint canvas');
      continue;
    }

    const videoRect = video.getBoundingClientRect();

    // Calculate position relative to node, scaled to output
    const relX = (videoRect.left - nodeRect.left) * scale + offsetX;
    const relY = (videoRect.top - nodeRect.top) * scale + offsetY;
    const relW = videoRect.width * scale;
    const relH = videoRect.height * scale;

    // Get video's computed styles for object-fit handling
    const videoStyle = window.getComputedStyle(video);
    const objectFit = videoStyle.objectFit || 'fill';
    // Check video and parent containers for border-radius
    const borderRadius = getEffectiveBorderRadius(video);

    ctx.save();

    // Apply border radius clipping if needed
    if (borderRadius > 0) {
      ctx.beginPath();
      const scaledRadius = borderRadius * scale;
      if (ctx.roundRect) {
        ctx.roundRect(relX, relY, relW, relH, scaledRadius);
      } else {
        ctx.rect(relX, relY, relW, relH);
      }
      ctx.clip();
    }

    // Handle object-fit - wrap in try-catch to prevent canvas taint errors
    try {
      if (objectFit === 'cover') {
        const videoAspect = video.videoWidth / video.videoHeight;
        const containerAspect = relW / relH;

        let srcX = 0,
          srcY = 0,
          srcW = video.videoWidth,
          srcH = video.videoHeight;

        if (videoAspect > containerAspect) {
          // Video is wider - crop sides
          srcW = video.videoHeight * containerAspect;
          srcX = (video.videoWidth - srcW) / 2;
        } else {
          // Video is taller - crop top/bottom
          srcH = video.videoWidth / containerAspect;
          srcY = (video.videoHeight - srcH) / 2;
        }

        ctx.drawImage(video, srcX, srcY, srcW, srcH, relX, relY, relW, relH);
      } else if (objectFit === 'contain') {
        const videoAspect = video.videoWidth / video.videoHeight;
        const containerAspect = relW / relH;

        let destX = relX,
          destY = relY,
          destW = relW,
          destH = relH;

        if (videoAspect > containerAspect) {
          destH = relW / videoAspect;
          destY = relY + (relH - destH) / 2;
        } else {
          destW = relH * videoAspect;
          destX = relX + (relW - destW) / 2;
        }

        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, destX, destY, destW, destH);
      } else {
        // fill or other - stretch to fit
        ctx.drawImage(video, relX, relY, relW, relH);
      }
    } catch (e) {
      console.warn('[captureFrame] Failed to draw video - possible CORS issue:', e);
    }

    ctx.restore();
  }
};

// Reusable canvas for frame capture (avoids recreating every frame)
let captureCanvas: HTMLCanvasElement | null = null;
let captureCtx: CanvasRenderingContext2D | null = null;
let lastCanvasSize = { width: 0, height: 0 };

// Helper: Capture a single frame from DOM to Canvas
export const captureFrame = async (
  node: HTMLElement,
  outputWidth: number,
  outputHeight: number,
  _durationMs?: number,
  _playheadMs?: number
): Promise<Uint8ClampedArray> => {
  // Reuse canvas if same size
  if (
    !captureCanvas ||
    lastCanvasSize.width !== outputWidth ||
    lastCanvasSize.height !== outputHeight
  ) {
    captureCanvas = document.createElement('canvas');
    captureCanvas.width = outputWidth;
    captureCanvas.height = outputHeight;
    captureCtx = captureCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: true,
    })!;
    lastCanvasSize = { width: outputWidth, height: outputHeight };
  }

  const ctx = captureCtx!;

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Get display dimensions (what's actually rendered on screen)
  const nodeRect = node.getBoundingClientRect();

  // Scale factor from display to output
  const scale = outputWidth / nodeRect.width;

  // Get computed styles for background
  const computedStyle = window.getComputedStyle(node);

  // Apply clipping for rounded corners (scale radius to output size)
  const radius = (parseFloat(computedStyle.borderRadius) || 0) * scale;

  // Clear canvas
  ctx.clearRect(0, 0, outputWidth, outputHeight);

  ctx.save();
  if (radius > 0) {
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(0, 0, outputWidth, outputHeight, radius);
    } else {
      ctx.rect(0, 0, outputWidth, outputHeight);
    }
    ctx.clip();
  }

  // Fill background first (fallback color)
  ctx.fillStyle = computedStyle.backgroundColor || '#000000';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // Use fast path if export context is prepared and matches size
  if (
    cachedExportContext &&
    cachedExportContext.outputWidth === outputWidth &&
    cachedExportContext.outputHeight === outputHeight
  ) {
    // Fast path: Layered Rendering

    // 1. Sync Animations
    // We perform this even for static layers initially, but we could skip if static.
    // Actually, for static layers, we only need to sync once (or 0 times if they are truly static properties).
    // But our 'static' check is "has animations".
    syncFrameAnimations();

    // 2. Render Layers to Images (with caching)
    const { bgClone, deviceClone, bgImg, deviceImg, bgIsStatic, deviceIsStatic } = cachedExportContext;
    if (!bgIsStatic || !cachedExportContext.bgRendered) {
      await renderCloneToImage(bgClone, bgImg);
      cachedExportContext.bgRendered = true;
    }

    if (!deviceIsStatic || !cachedExportContext.deviceRendered) {
      await renderCloneToImage(deviceClone, deviceImg);
      cachedExportContext.deviceRendered = true;
    }

    // 3. Composite to Canvas (Sandwich: BG -> Video -> Device -> Text)
    // Let's reuse a global canvas or create one.
    // Ideally, useOffscreen if available.
    const canvas = document.createElement('canvas'); // Or reuse 
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d', { alpha: false, willReadFrequently: true })!;

    // Clear
    context.clearRect(0, 0, outputWidth, outputHeight);

    // A. Background Layer
    context.drawImage(bgImg, 0, 0);

    // B. Video Layer (captured directly from source videos)
    // We need to capture from the REAL DOM node videos, aligned with device screen
    // The video element might be inside the device container.
    // We need to find the video element in the source and map its position?
    // Our captureVideoFrames helper does exactly that.

    // Find the video container in the source?
    // Actually, captureVideoFrames scans `node` for videos.
    // It handles placement internally?
    // It iterates all videos in `node` and draws them.
    // This works assuming the video position logic (getBoundingClientRect) is accurate relative to the root node.
    // Note: syncFrameAnimations handles the transforms on the clones.
    // Does it handle transforms on the SOURCE? No, source is driven by React.
    // But for export, we are driving the source via `playheadMs` prop in `Workarea`.
    // Wait, `captureFrame` is called inside a loop where `playheadMs` is updated.
    // React renders the updates to the SOURCE DOM.
    // So `node` (source) has the correct transforms. We can rely on getBoundingClientRect.

    captureVideoFrames(node, context, node.getBoundingClientRect(), scale, 0, 0);

    // C. Device Layer (Transparent frame on top)
    context.drawImage(deviceImg, 0, 0);

    // D. Text Overlay (Rendered directly to canvas)
    renderTextOverlay(context, outputWidth, outputHeight, scale, _durationMs, _playheadMs);

    // Return raw pixel data
    return context.getImageData(0, 0, outputWidth, outputHeight).data;
  } else {
    // Slow path: Full single-pass SVG generation (no layering optimization)
    // Z-order of video vs frame might be incorrect here, but acceptable for single screenshots
    const svgUrl = await nodeToSvgDataUrl(
      node,
      nodeRect.width,
      nodeRect.height,
      outputWidth,
      outputHeight
    );
    const img = await loadImage(svgUrl);
    ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

    // Draw videos on top (fallback)
    const displayToOutputScale = outputWidth / nodeRect.width;
    captureVideoFrames(node, ctx, nodeRect, displayToOutputScale, 0, 0);
  }

  // Check valid rendering (taint check)
  try {
    ctx.getImageData(0, 0, 1, 1);
  } catch (e) {
    console.error('[captureFrame] Canvas tainted! SVG or Video may contain external URLs.');
    throw new Error('Canvas tainted. Check that all resources are converted to data URLs.');
  }

  ctx.restore(); // Remove global clip

  // Render text overlay AFTER everything (TextOverlayRenderer draws directly to canvas)
  renderTextOverlay(ctx, outputWidth, outputHeight, scale, _durationMs, _playheadMs);

  // Get raw RGBA pixel data
  const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
  return imageData.data;
};
