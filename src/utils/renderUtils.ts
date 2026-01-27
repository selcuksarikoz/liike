import { downloadDir, join } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';
import {
  ANIMATION_SPEED_MULTIPLIERS,
  generateDeviceKeyframes,
  generateTextKeyframes,
  LAYOUT_PRESETS,
  TEXT_ANIMATIONS,
  type DeviceAnimationType,
  type TextAnimationType,
} from '../constants/layoutAnimationPresets';
import {
  fetchGoogleFontCSS,
  getEmbeddedFontCSS,
  loadFontsForExport,
} from '../services/fontService';
import { useRenderStore, type ExportFormat, type TextPosition } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

// Convert Blob to data URL using native FileReader (faster than manual encoding)
// Defined early because it's used by multiple functions
const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// WebKit/Safari SVG foreignObject renders rotateY mirrored - negate Y rotation to fix
const fixWebKitPerspective = (transform: string): string => {
  if (!transform || transform === 'none') return transform;

  // Fix rotateY values - negate them for WebKit SVG rendering
  return transform.replace(/rotateY\(([^)]+)\)/g, (match, value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return match;
    const unit = value.replace(/[0-9.-]/g, '') || 'deg';
    return `rotateY(${-num}${unit})`;
  });
};

// Helper to manually drive animations on the clones without React overhead
// Uses the same timing logic as Workarea.tsx for consistency
// Returns animation progress (0-1) for caching optimization
export const updateExportAnimations = (timeMs: number, effectiveDuration: number): number => {
  if (!cachedExportContext) return 1;

  const { deviceClone } = cachedExportContext;
  const { textOverlay, animationSpeed } = useRenderStore.getState();

  // Get speed multiplier (same as Workarea)
  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1;

  // Device animation uses same timing as Workarea.tsx
  const deviceAnim = textOverlay.deviceAnimation;
  if (!deviceAnim || deviceAnim === 'none' || !textOverlay.enabled) {
    // No animation - device is static from frame 0
    cachedExportContext.deviceAnimationComplete = true;
    return 1;
  }

  const deviceWrapper = deviceClone.querySelector('[data-device-animation]') as HTMLElement;
  if (!deviceWrapper) return 1;

  // Same timing as Workarea.tsx deviceAnimationStyle
  const startDelay = 400 / speedMultiplier;
  const animDuration = 800 / speedMultiplier;

  const delayedPlayhead = Math.max(0, timeMs - startDelay);
  const progress = Math.min(1, delayedPlayhead / animDuration);

  // Track animation completion for caching
  if (progress >= 1 && !cachedExportContext.deviceAnimationComplete) {
    cachedExportContext.deviceAnimationComplete = true;
  }
  cachedExportContext.lastDeviceAnimProgress = progress;

  // Use the same keyframe generator as Workarea
  const style = generateDeviceKeyframes(deviceAnim as DeviceAnimationType, progress);

  // Apply to wrapper (fix WebKit perspective mirroring)
  if (style.transform) deviceWrapper.style.transform = fixWebKitPerspective(style.transform);
  if (style.opacity !== undefined) deviceWrapper.style.opacity = style.opacity.toString();

  return progress;
};

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

// Wait for browser to process with RAF for proper style computation
// RAF ensures styles are computed before we read them
export const waitForRender = (ms = 0) =>
  new Promise<void>((resolve) => {
    if (ms > 0) {
      // Wait for timeout THEN RAF to ensure styles are fully computed
      setTimeout(() => requestAnimationFrame(() => resolve()), ms);
    } else {
      // Just RAF for immediate style computation
      requestAnimationFrame(() => resolve());
    }
  });

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

// Image Cache: URL -> DataURL (HIGH QUALITY for export)
const imageCache = new Map<string, string>();

// Max dimension for cached images - increased for 4K+ exports
const MAX_IMAGE_DIMENSION = 4320; // 4K * 2 for safety

// Convert image to high-quality data URL (minimal/no compression)
// Uses data URL loading to avoid WebKit canvas taint
const convertImageToDataUrl = async (blob: Blob): Promise<string> => {
  // First convert blob to data URL (WebKit-safe)
  const blobDataUrl = await blobToDataUrl(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { width, height } = img;

      // Draw to canvas at FULL SIZE for maximum quality
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Use PNG for lossless quality - critical for export
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = blobDataUrl;
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

// Helper: Fetch and convert URL to DataURL with caching (HIGH QUALITY - no compression)
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

    // Convert to high-quality PNG data URL (no lossy compression)
    // This preserves image quality for export
    let dataUrl: string;
    if (blob.type.startsWith('image/')) {
      // Use canvas for proper image handling
      dataUrl = await convertImageToDataUrl(blob);
      console.log(`[StreamRender] Converted image: ${(blob.size / 1024).toFixed(0)}KB -> PNG`);
    } else {
      // Non-image blobs: direct conversion
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

// Helper: Convert image element to data URL using canvas (fallback for bundled assets)
const convertImageElementToDataUrl = async (img: HTMLImageElement): Promise<string> => {
  return new Promise((resolve, reject) => {
    const doConvert = () => {
      try {
        // Use displayed dimensions if natural dimensions aren't available
        const width = img.naturalWidth || img.width || img.clientWidth;
        const height = img.naturalHeight || img.height || img.clientHeight;

        if (width === 0 || height === 0) {
          reject(new Error(`Image has no dimensions: ${width}x${height}`));
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Verify canvas isn't tainted before converting
        try {
          ctx.getImageData(0, 0, 1, 1);
        } catch {
          reject(new Error('Canvas tainted - cannot convert'));
          return;
        }

        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };

    // If image is already loaded, convert immediately
    if (img.complete && (img.naturalWidth > 0 || img.width > 0)) {
      doConvert();
      return;
    }

    // Wait for load with timeout
    const timeout = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 5000);

    img.onload = () => {
      clearTimeout(timeout);
      doConvert();
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Image load failed'));
    };

    // If src is set but not loading, trigger reload
    if (img.src && !img.complete) {
      const src = img.src;
      img.src = '';
      img.src = src;
    }
  });
};

// Helper: Load an image from URL and convert to data URL
const loadAndConvertImage = async (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timeout = setTimeout(() => {
      reject(new Error('Image load timeout'));
    }, 10000);

    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Image load failed'));
    };

    img.src = src;
  });
};

// Helper: Convert all images in node to data URLs
const convertImagesToDataUrls = async (node: HTMLElement) => {
  const images = node.querySelectorAll('img');
  console.log(`[convertImages] Found ${images.length} img elements`);

  // Process images in parallel for better performance
  const conversions = Array.from(images).map(async (img) => {
    if (img.src.startsWith('data:')) {
      return; // Already converted
    }

    const originalSrc = img.src;
    console.log('[convertImages] Converting:', originalSrc.slice(0, 100));

    try {
      let dataUrl: string;

      if (originalSrc.startsWith('blob:')) {
        dataUrl = await blobUrlToDataUrl(originalSrc);
      } else {
        // Try multiple methods in order of preference
        // 1. First try fetching (works for most URLs)
        // 2. Then try loading fresh (works for bundled assets)
        // 3. Finally try using the existing element (if already loaded)
        try {
          dataUrl = await getCachedDataUrl(originalSrc);
        } catch {
          console.log('[convertImages] Fetch failed, trying fresh load for:', originalSrc.slice(0, 50));
          try {
            // Create a new image and load it fresh
            dataUrl = await loadAndConvertImage(originalSrc);
          } catch {
            // Last resort: try using the existing element
            console.log('[convertImages] Fresh load failed, trying existing element');
            dataUrl = await convertImageElementToDataUrl(img);
          }
        }
      }

      img.src = dataUrl;
      img.setAttribute('crossorigin', 'anonymous');
      console.log('[convertImages] Success:', originalSrc.slice(0, 50));
    } catch (e) {
      console.error('[convertImages] All methods FAILED for:', originalSrc, e);
    }
  });

  await Promise.all(conversions);

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

// Helper: Convert video elements to images (HIGH QUALITY)
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
      // Use native video dimensions for maximum quality
      const width = sourceVideo.videoWidth;
      const height = sourceVideo.videoHeight;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d', {
        alpha: false, // Video frames don't need alpha
        willReadFrequently: false,
      });
      if (ctx) {
        // High quality scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(sourceVideo, 0, 0, width, height);

        // Use PNG for lossless quality - critical for export
        const dataUrl = canvas.toDataURL('image/png');

        const img = document.createElement('img');
        img.src = dataUrl;
        img.style.cssText = cloneVideo.style.cssText;
        img.className = cloneVideo.className;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        // Ensure high quality rendering
        img.style.imageRendering = 'auto';

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
interface CachedExportContext {
  fontCss: string;
  sourceWidth: number;
  sourceHeight: number;
  outputWidth: number;
  outputHeight: number;
  scaleX: number;
  scaleY: number;
  // Locked node rect - prevents dimension changes during export
  lockedNodeRect: { left: number; top: number; width: number; height: number };
  // Optimized rendering with layers
  bgClone: HTMLElement;
  deviceClone: HTMLElement;
  animatedElements: Array<{ source: HTMLElement; target: HTMLElement; layer: 'bg' | 'device' }>;
  bgImg: HTMLImageElement;
  deviceImg: HTMLImageElement;
  // ImageBitmap cache for faster rendering (used when available)
  bgBitmap: ImageBitmap | null;
  deviceBitmap: ImageBitmap | null;
  svgPrefix: string;
  svgSuffix: string;
  bgIsStatic: boolean;      // Optimization: if true, only render BG once
  deviceIsStatic: boolean;  // Optimization: if true, only render Device once (except video)
  bgRendered: boolean;
  deviceRendered: boolean;
  // Animation completion tracking for smart caching
  deviceAnimationComplete: boolean;
  lastDeviceAnimProgress: number;
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

  // Lock the node rect NOW to prevent dimension jitter during export
  const actualNodeRect = node.getBoundingClientRect();
  const lockedNodeRect = {
    left: actualNodeRect.left,
    top: actualNodeRect.top,
    width: actualNodeRect.width,
    height: actualNodeRect.height,
  };

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

  // Sanitize external URLs that could cause security issues or canvas taint
  // BUT preserve local/bundled assets that are already loaded
  const transparentPixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

  // Check if URL is external (http/https) and not converted
  const isProblematicUrl = (url: string): boolean => {
    if (!url) return false;
    if (url.startsWith('data:')) return false; // Already converted
    if (url.startsWith('blob:')) return true; // Blob URLs won't work in SVG
    // External URLs that weren't converted
    if (url.startsWith('http://') || url.startsWith('https://')) {
      // Check if it's NOT a localhost URL (those are bundled assets)
      return !url.includes('localhost') && !url.includes('127.0.0.1');
    }
    return false; // Local paths like /assets/... are OK
  };

  const sanitizeNode = (root: HTMLElement) => {
    // 1. Sanitize Images - only remove truly external URLs
    const images = root.querySelectorAll('img');
    for (const img of images) {
      if (isProblematicUrl(img.src)) {
        console.warn('[sanitizeNode] Replacing problematic image:', img.src.slice(0, 100));
        img.src = transparentPixel;
      }
      if (img.hasAttribute('srcset')) img.removeAttribute('srcset');
    }

    // 2. Sanitize SVG <image>
    const svgImages = root.querySelectorAll('image');
    for (const img of svgImages) {
      const href = img.getAttribute('href') || img.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
      if (href && isProblematicUrl(href)) {
        img.setAttribute('href', transparentPixel);
        img.removeAttributeNS('http://www.w3.org/1999/xlink', 'href');
      }
    }

    // 3. Sanitize Video Posters
    const videos = root.querySelectorAll('video');
    for (const video of videos) {
      if (video.hasAttribute('poster') && isProblematicUrl(video.poster)) {
        video.removeAttribute('poster');
      }
    }

    // 4. Sanitize Styles (Background Images) - only external URLs
    const allElements = root.querySelectorAll('*');
    for (const el of allElements) {
       const htmlEl = el as HTMLElement;
       const bg = htmlEl.style.backgroundImage;
       if (bg && bg.includes('url(')) {
          const urlMatch = bg.match(/url\(['"]?(.*?)['"]?\)/);
          if (urlMatch && urlMatch[1] && isProblematicUrl(urlMatch[1])) {
             htmlEl.style.backgroundImage = 'none';
          }
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

  // NOTE: Device content rasterization optimization removed - it was causing
  // device mockup images to disappear when SVG rendering failed.
  // The device layer is now rendered directly via renderCloneToImage like other layers.

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
    // Locked at preparation time to prevent dimension jitter during export
    lockedNodeRect,
    bgClone,
    deviceClone,
    animatedElements,
    bgImg,
    deviceImg,
    bgBitmap: null,    // Will be populated on first render
    deviceBitmap: null, // Will be populated on each frame
    svgPrefix,
    svgSuffix,
    bgIsStatic: !bgHasAnimations,       // Flag for optimization
    deviceIsStatic: !deviceHasAnimations, // Flag for optimization
    bgRendered: false,     // Track if rendered
    deviceRendered: false, // Track if rendered
    deviceAnimationComplete: false,  // Track when entrance animation is done
    lastDeviceAnimProgress: -1,      // Track animation progress to detect changes
  };

  console.log(
    `[Export] Context prepared. BG Static: ${!bgHasAnimations}, Device Static: ${!deviceHasAnimations}`
  );
};

// Clear export context after rendering is complete
export const clearExportContext = () => {
  // Close ImageBitmaps to free GPU memory
  if (cachedExportContext?.bgBitmap) {
    cachedExportContext.bgBitmap.close();
  }
  if (cachedExportContext?.deviceBitmap) {
    cachedExportContext.deviceBitmap.close();
  }
  cachedExportContext = null;
  // Clear reusable elements
  reusableBgImg = null;
  reusableDeviceImg = null;
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
    const rawTransform = source.style.transform || computed.transform;
    // Fix WebKit/Safari perspective mirroring in SVG foreignObject
    target.style.transform = fixWebKitPerspective(rawTransform);
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

// Reusable image elements for faster rendering (avoid creating new elements each frame)
let reusableBgImg: HTMLImageElement | null = null;
let reusableDeviceImg: HTMLImageElement | null = null;

// Render clone to ImageBitmap using data URL (WebKit-safe, avoids cross-origin taint)
const renderCloneToImageBitmap = async (
  clone: HTMLElement,
  layerType: 'bg' | 'device'
): Promise<ImageBitmap> => {
  if (!cachedExportContext) {
    throw new Error('Export context not prepared');
  }

  const { svgPrefix, svgSuffix } = cachedExportContext;

  // 1. Fast serialization
  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);
  const svg = svgPrefix + nodeString + svgSuffix;

  // 2. Create data URL (WebKit requires this to avoid canvas taint)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const dataUrl = await blobToDataUrl(blob);

  // 3. Load into Image element first (SVG needs to be rasterized before ImageBitmap)
  const img = layerType === 'bg'
    ? (reusableBgImg ||= new Image())
    : (reusableDeviceImg ||= new Image());

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = dataUrl;
  });

  // 4. Create ImageBitmap from rendered Image (fast, hardware-accelerated)
  return createImageBitmap(img);
};

// Fallback renderer using HTMLImageElement directly
const renderCloneToImage = async (
  clone: HTMLElement,
  outputImg: HTMLImageElement
): Promise<HTMLImageElement> => {
  if (!cachedExportContext) {
    throw new Error('Export context not prepared');
  }

  const { svgPrefix, svgSuffix } = cachedExportContext;
  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);
  const svg = svgPrefix + nodeString + svgSuffix;

  // Use data URL (WebKit-safe)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const dataUrl = await blobToDataUrl(blob);

  return new Promise((resolve, reject) => {
    outputImg.onload = () => resolve(outputImg);
    outputImg.onerror = () => reject(new Error('SVG render failed.'));
    outputImg.src = dataUrl;
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
    // Use alpha: false for better performance and color accuracy in video export
    captureCtx = captureCanvas.getContext('2d', {
      willReadFrequently: true,
      alpha: false, // Faster compositing, no transparency needed for final output
      desynchronized: true, // Better performance - don't sync with display
    })!;
    lastCanvasSize = { width: outputWidth, height: outputHeight };
  }

  const ctx = captureCtx!;

  // HIGH QUALITY rendering settings
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
    // Use locked dimensions to prevent jitter from DOM changes
    const lockedScale = outputWidth / cachedExportContext.sourceWidth;

    // 1. Sync base styles from source (non-animated properties)
    syncFrameAnimations();

    // 2. Apply time-based animation values (AFTER sync to override stale values)
    // This ensures entrance animations start at correct state (opacity=0)
    let animProgress = 1;
    if (_playheadMs !== undefined) {
      animProgress = updateExportAnimations(_playheadMs, _durationMs || 3000);
    }

    // 3. Render Layers to ImageBitmaps (much faster than base64 data URLs)
    // Smart caching: cache device layer once animation completes
    const { bgClone, deviceClone, bgIsStatic, lockedNodeRect, deviceAnimationComplete } = cachedExportContext;

    // Check if we can reuse cached device layer (animation done + already rendered)
    const canReuseDeviceCache = deviceAnimationComplete && cachedExportContext.deviceBitmap;

    // Use ImageBitmap for faster rendering (fallback to HTMLImageElement if needed)
    let bgSource: ImageBitmap | HTMLImageElement;
    let deviceSource: ImageBitmap | HTMLImageElement;

    try {
      // Background: render once if static
      if (!bgIsStatic || !cachedExportContext.bgRendered) {
        if (cachedExportContext.bgBitmap) {
          cachedExportContext.bgBitmap.close();
        }
        cachedExportContext.bgBitmap = await renderCloneToImageBitmap(bgClone, 'bg');
        cachedExportContext.bgRendered = true;
      }
      bgSource = cachedExportContext.bgBitmap!;

      // Device: reuse cache if animation is complete, otherwise re-render
      if (canReuseDeviceCache) {
        // Animation done - reuse cached bitmap (FAST PATH)
        deviceSource = cachedExportContext.deviceBitmap!;
      } else {
        // Animation in progress - must re-render
        if (cachedExportContext.deviceBitmap) {
          cachedExportContext.deviceBitmap.close();
        }
        cachedExportContext.deviceBitmap = await renderCloneToImageBitmap(deviceClone, 'device');
        deviceSource = cachedExportContext.deviceBitmap;
      }
    } catch (e) {
      // Fallback to HTMLImageElement if ImageBitmap fails
      console.warn('[captureFrame] ImageBitmap failed, using fallback:', e);
      if (!bgIsStatic || !cachedExportContext.bgRendered) {
        await renderCloneToImage(bgClone, cachedExportContext.bgImg);
        cachedExportContext.bgRendered = true;
      }
      bgSource = cachedExportContext.bgImg;
      await renderCloneToImage(deviceClone, cachedExportContext.deviceImg);
      deviceSource = cachedExportContext.deviceImg;
    }

    // 3. Composite to Canvas (Sandwich: BG -> Video -> Device -> Text)
    const context = captureCtx!;

    // HIGH QUALITY rendering settings
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';

    // Clear with solid background for better color accuracy
    context.fillStyle = '#000000';
    context.fillRect(0, 0, outputWidth, outputHeight);

    // A. Background Layer
    context.drawImage(bgSource, 0, 0);

    // B. Video Layer (captured directly from source videos at full quality)
    // Use locked rect to prevent jitter from DOM position changes
    const lockedDOMRect = new DOMRect(
      lockedNodeRect.left,
      lockedNodeRect.top,
      lockedNodeRect.width,
      lockedNodeRect.height
    );
    captureVideoFrames(node, context, lockedDOMRect, lockedScale, 0, 0);

    // C. Device Layer (Transparent frame on top)
    context.drawImage(deviceSource, 0, 0);

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
