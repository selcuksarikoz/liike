import { useTimelineStore } from '../store/timelineStore';
import { useRenderStore, type ExportFormat, type TextPosition } from '../store/renderStore';
import { downloadDir, join } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';
import { getEmbeddedFontCSS, loadFontsForExport, fetchGoogleFontCSS } from '../services/fontService';
import {
  generateTextKeyframes,
  generateDeviceKeyframes,
  ANIMATION_SPEED_MULTIPLIERS,
  TEXT_ANIMATIONS,
  type TextAnimationType,
  type DeviceAnimationType,
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
  const seconds = timeMs / 1000;

  const seekPromises = Array.from(videos).map((video) => {
    return new Promise<void>((resolve) => {
      video.pause();

      // If already at target time and has data, resolve immediately
      if (Math.abs(video.currentTime - seconds) < 0.02 && video.readyState >= 2) {
        resolve();
        return;
      }

      // Wait for video to have enough data before seeking
      const doSeek = () => {
        const onSeeked = () => {
          video.removeEventListener('seeked', onSeeked);
          // Wait for frame to actually render
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        };

        // Timeout fallback
        const timeout = setTimeout(() => {
          video.removeEventListener('seeked', onSeeked);
          resolve();
        }, 1000);

        video.addEventListener('seeked', () => clearTimeout(timeout), { once: true });
        video.addEventListener('seeked', onSeeked, { once: true });
        video.currentTime = seconds;
      };

      // Ensure video has enough data to seek
      if (video.readyState >= 2) {
        doSeek();
      } else {
        video.addEventListener('canplay', () => doSeek(), { once: true });
        // Fallback if canplay doesn't fire
        setTimeout(() => {
          if (video.readyState < 2) doSeek();
        }, 500);
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
export const getVideoFilename = (baseName: string, width: number, height: number, ext: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}_${width}x${height}.${ext}`;
};

export const getFileExtension = (format: ExportFormat): string => {
  switch (format) {
    case 'webm': return 'webm';
    case 'mov': return 'mov';
    case 'png': return 'png';
    case 'gif': return 'gif';
    case 'webp': return 'webp';
    case 'mp4':
    default: return 'mp4';
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
  'filter',
  'clip-path',
  'visibility',
  'will-change',
];

// Helper: Inline computed styles from source to clone (optimized)
// Uses array join instead of reduce for O(n) instead of O(n²) string building
const inlineStyles = (source: HTMLElement, clone: HTMLElement) => {
  const sourceStyles = window.getComputedStyle(source);

  // Build CSS text using array (O(n) instead of O(n²) with string concat)
  const props = [];
  for (let i = 0; i < sourceStyles.length; i++) {
    const prop = sourceStyles[i];
    props.push(`${prop}:${sourceStyles.getPropertyValue(prop)}`);
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

// Helper: Fetch and convert URL to DataURL with caching + optimization
const getCachedDataUrl = async (url: string): Promise<string> => {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    // Optimize large images (> 500KB) to reduce memory during export
    let dataUrl: string;
    if (blob.size > 500 * 1024) {
      console.log(`[StreamRender] Optimizing large image: ${(blob.size / 1024 / 1024).toFixed(1)}MB -> max ${MAX_IMAGE_DIMENSION}px`);
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
    img.src = dataUrl;
    try { await img.decode(); } catch {}

    imageCache.set(url, dataUrl);
    return dataUrl;
  } catch (e) {
    console.warn('[StreamRender] Image load failed:', url, e);
    return url; // Fallback to original URL
  }
};

// Helper: Convert all images in node to data URLs
const convertImagesToDataUrls = async (node: HTMLElement) => {
  const images = node.querySelectorAll('img');
  
  for (const img of images) {
    if (img.src.startsWith('data:')) continue;
    const dataUrl = await getCachedDataUrl(img.src);
    img.src = dataUrl;
  }
};

// Helper: Convert background images to data URLs
const convertBackgroundImagesToDataUrls = async (node: HTMLElement) => {
  const elements = node.querySelectorAll('*');
  const allElements = [node, ...Array.from(elements)] as HTMLElement[];

  for (const el of allElements) {
    const computed = window.getComputedStyle(el);
    const style = el.style.backgroundImage || computed.backgroundImage;
    
    if (style && style !== 'none') {
      const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch && urlMatch[1] && !urlMatch[1].startsWith('data:')) {
        // Preserve layout properties
        const size = el.style.backgroundSize || computed.backgroundSize;
        const pos = el.style.backgroundPosition || computed.backgroundPosition;
        const repeat = el.style.backgroundRepeat || computed.backgroundRepeat;

        const dataUrl = await getCachedDataUrl(urlMatch[1]);
        
        el.style.backgroundImage = `url("${dataUrl}")`;
        // Re-apply layout
        if (size) el.style.backgroundSize = size;
        if (pos) el.style.backgroundPosition = pos;
        if (repeat) el.style.backgroundRepeat = repeat;
      }
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
          img.onload = () => img.decode().then(() => resolve()).catch(() => resolve());
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
  const allVideos = node.querySelectorAll('video');
  const videoPromises: Promise<void>[] = [];
  for (const video of allVideos) {
    videoPromises.push(
      new Promise<void>((resolve) => {
        // Already has enough data
        if (video.readyState >= 3) {
          resolve();
          return;
        }

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

        // Trigger load if needed
        if (video.preload !== 'auto') {
          video.preload = 'auto';
        }
        video.load();
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
      const families = fontFamily.split(',').map(f => f.trim().replace(/['"]/g, ''));
      for (const family of families) {
        if (family && !['sans-serif', 'serif', 'monospace', 'cursive', 'fantasy', 'system-ui'].includes(family)) {
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
    if (fontName.startsWith('-apple') || fontName === 'system-ui' || fontName === 'BlinkMacSystemFont') {
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

  // Apply device animation explicitly (React state-based animations need manual application)
  // We rebuild the transform from scratch using data attributes to avoid timing issues
  const deviceAnimElement = clone.querySelector('[data-device-animation]') as HTMLElement | null;
  if (deviceAnimElement) {
    const animationType = deviceAnimElement.dataset.deviceAnimation as DeviceAnimationType;
    const baseTransform = deviceAnimElement.dataset.baseTransform || 'none';
    const posTransform = deviceAnimElement.dataset.posTransform || 'none';
    const baseOpacity = parseFloat(deviceAnimElement.dataset.baseOpacity || '1');

    // Calculate device animation for current playhead
    let deviceAnimTransform = 'none';
    let deviceOpacity = 1;

    if (animationType && animationType !== 'none') {
      const { animationSpeed } = useRenderStore.getState();
      const { playheadMs } = useTimelineStore.getState();
      const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed] || 1;
      const startDelay = 400 / speedMultiplier;
      const animDuration = 800 / speedMultiplier;
      const delayedPlayhead = Math.max(0, playheadMs - startDelay);
      const progress = Math.min(1, delayedPlayhead / animDuration);
      const animStyle = generateDeviceKeyframes(animationType, progress);
      deviceAnimTransform = animStyle.transform;
      deviceOpacity = animStyle.opacity;
    }

    // Combine transforms (same logic as Workarea)
    const transforms = [baseTransform, posTransform, deviceAnimTransform]
      .filter((t) => t && t !== 'none')
      .join(' ');
    deviceAnimElement.style.transform = transforms || 'none';
    deviceAnimElement.style.opacity = String(baseOpacity * deviceOpacity);
  }

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
    const headlineProgress = headlineDelayed === 0 ? 0 : Math.min(1, headlineDelayed / textAnimDuration);

    // Calculate tagline progress (staggered)
    const taglineDelayed = Math.max(0, playheadMs - staggerDelay);
    const taglineProgress = Math.min(1, taglineDelayed / textAnimDuration);

    // Get animation styles
    const headlineAnim = generateTextKeyframes(textOverlay.animation as TextAnimationType, headlineProgress);
    const taglineAnim = generateTextKeyframes(textOverlay.animation as TextAnimationType, taglineProgress);

    // Find text elements in clone (they are direct children of the text overlay container)
    // Text overlay container has pointerEvents: 'none' and zIndex: 50
    const textContainer = clone.querySelector('[style*="pointer-events: none"][style*="z-index: 50"]') as HTMLElement | null;
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
    if (fontName.startsWith('-apple') || fontName === 'system-ui' || fontName === 'BlinkMacSystemFont') {
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
  console.log(`[SVG Export] Embedding fonts, CSS length: ${fontCss.length}`);

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
  const headlineProgress = delayedPlayhead <= 0 ? 0 : Math.min(1, delayedPlayhead / headlineAnimDuration);

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
  const validAnimationIds = new Set<string>(TEXT_ANIMATIONS.map(a => a.id));
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
    delayedPlayhead: Math.max(0, playheadMs - (300 / speedMultiplier)),
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

  // Vertical position
  if (pos.startsWith('center')) {
    textY = canvasHeight / 2 - (fontSize * scale) / 2;
  } else if (pos.startsWith('bottom')) {
    textY = canvasHeight - padding * 1.5 - (taglineFontSize * scale) - 12;
  }

  ctx.save();
  ctx.textAlign = textAlign;
  ctx.textBaseline = 'top';

  // Helper to parse transform values
  const parseTransform = (transform: string | undefined) => {
    if (!transform || transform === 'none') return { translateX: 0, translateY: 0, scaleVal: 1, rotate: 0, skewX: 0 };

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
  const taglineY = textY + (fontSize * scale) + 12 * scale;
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

    // Handle object-fit
    if (objectFit === 'cover') {
      const videoAspect = video.videoWidth / video.videoHeight;
      const containerAspect = relW / relH;

      let srcX = 0, srcY = 0, srcW = video.videoWidth, srcH = video.videoHeight;

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

      let destX = relX, destY = relY, destW = relW, destH = relH;

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

    ctx.restore();
  }
};

// Helper: Capture a single frame from DOM to Canvas
export const captureFrame = async (
  node: HTMLElement,
  outputWidth: number,
  outputHeight: number,
  _durationMs?: number,
  _playheadMs?: number
): Promise<Uint8ClampedArray> => {
  // Create an offscreen canvas at exact output dimensions
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d', {
    willReadFrequently: true,
    alpha: true
  })!;

  // High quality scaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Get display dimensions (what's actually rendered on screen)
  const nodeRect = node.getBoundingClientRect();

  // Scale factor from display to output
  // Display: 200x200 (what user sees) -> Output: 1080x1080 (what user wants)
  const scale = outputWidth / nodeRect.width;

  // Get computed styles for background
  const computedStyle = window.getComputedStyle(node);

  // Apply clipping for rounded corners (scale radius to output size)
  const radius = (parseFloat(computedStyle.borderRadius) || 0) * scale;

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

  // Fill background first
  ctx.fillStyle = computedStyle.backgroundColor || '#000000';
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // Use foreignObject SVG approach for non-video content
  // Videos are handled separately below because SVG foreignObject can't render them
  // Pass display dimensions as source, output dimensions as target - SVG will scale up
  const svgUrl = await nodeToSvgDataUrl(node, nodeRect.width, nodeRect.height, outputWidth, outputHeight);
  const img = await loadImage(svgUrl);

  // Draw SVG at full output size (already scaled internally)
  ctx.drawImage(img, 0, 0, outputWidth, outputHeight);

  ctx.restore();

  // Draw video frames DIRECTLY on top of SVG render
  // This bypasses SVG foreignObject limitation for video elements
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
  // Video frames need display-to-output scale since videos are positioned in display space
  const displayToOutputScale = outputWidth / nodeRect.width;
  captureVideoFrames(node, ctx, nodeRect, displayToOutputScale, 0, 0);
  ctx.restore();

  // Render text overlay AFTER videos so text appears on top
  // This ensures z-index is respected even when videos are present
  renderTextOverlay(ctx, outputWidth, outputHeight, scale, _durationMs, _playheadMs);

  // Get raw RGBA pixel data
  const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
  return imageData.data;
};
