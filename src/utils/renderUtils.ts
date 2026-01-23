import { flushSync } from 'react-dom';
import { useTimelineStore } from '../store/timelineStore';
import { useRenderStore, type ExportFormat, type TextPosition } from '../store/renderStore';
import { downloadDir, join } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';
import { getEmbeddedFontCSS, loadFontsForExport } from '../services/fontService';
import {
  generateTextKeyframes,
  ANIMATION_SPEED_MULTIPLIERS,
  type TextAnimationType,
} from '../constants/textAnimations';

// Seek timeline synchronously
export const seekTimeline = (timeMs: number) => {
  flushSync(() => {
    useTimelineStore.getState().setPlayhead(timeMs);
  });
};

// Pause/seek Web Animations API animations
export const pauseAndSeekAnimations = (node: HTMLElement, timeMs: number) => {
  const animations = node.getAnimations({ subtree: true });
  for (const animation of animations) {
    animation.pause();
    animation.currentTime = timeMs;
  }
};

// Pause/seek HTML5 Video elements
export const pauseAndSeekVideos = (node: HTMLElement, timeMs: number) => {
  const videos = node.querySelectorAll('video');
  const seconds = timeMs / 1000;
  for (const video of videos) {
    video.pause();
    video.currentTime = seconds;
  }
};

// Wait for DOM update (minimal wait for speed)
export const waitForRender = (ms = 16) =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, ms);
      });
    });
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

// Image Cache: URL -> DataURL
const imageCache = new Map<string, string>();

// Animation-related CSS properties that should be preserved from inline styles
const ANIMATION_PROPERTIES = [
  'opacity',
  'transform',
  'filter',
  'clip-path',
  'visibility',
  'will-change',
];

// Helper: Inline computed styles from source to clone
// Preserves inline animation styles (opacity, transform, filter) set by React
const inlineStyles = async (source: HTMLElement, clone: HTMLElement) => {
  const sourceStyles = window.getComputedStyle(source);

  // Start with computed styles
  const cssText = Array.from(sourceStyles).reduce((css, prop) => {
    return `${css}${prop}:${sourceStyles.getPropertyValue(prop)};`;
  }, '');
  clone.style.cssText = cssText;

  // Override with explicit inline styles for animation properties
  // These are set by React for text/device animations and must be preserved
  for (const prop of ANIMATION_PROPERTIES) {
    const inlineValue = source.style.getPropertyValue(prop);
    if (inlineValue) {
      clone.style.setProperty(prop, inlineValue);
    }
  }

  // Recursively process children
  const sourceChildren = source.children;
  const cloneChildren = clone.children;
  for (let i = 0; i < sourceChildren.length; i++) {
    if (sourceChildren[i] instanceof HTMLElement && cloneChildren[i] instanceof HTMLElement) {
      await inlineStyles(sourceChildren[i] as HTMLElement, cloneChildren[i] as HTMLElement);
    }
  }
};

// Helper: Fetch and convert URL to DataURL with caching
const getCachedDataUrl = async (url: string): Promise<string> => {
  if (imageCache.has(url)) return imageCache.get(url)!;

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    // Pre-decode
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
    if (fontCssCache.has(fontName)) continue;
    try {
      const fontCSS = await getEmbeddedFontCSS(fontName);
      if (fontCSS) {
        fontCssCache.set(fontName, fontCSS);
      }
    } catch (e) {
      console.warn('[StreamRender] Font CSS cache failed:', fontName, e);
    }
  }
};

// Helper: Convert DOM node to SVG data URL using foreignObject
export const nodeToSvgDataUrl = async (node: HTMLElement, width: number, height: number): Promise<string> => {
  // Clone the node
  const clone = node.cloneNode(true) as HTMLElement;

  // Remove elements marked for export skip (text overlays are rendered separately via Canvas)
  const skipElements = clone.querySelectorAll('[data-export-skip]');
  skipElements.forEach((el) => el.remove());

  // Inline all computed styles for the clone
  await inlineStyles(node, clone);

  // Fix potential layout shifts in SVG
  clone.style.margin = '0';

  // Convert images to data URLs (using cache)
  await convertImagesToDataUrls(clone);

  // Convert background images to data URLs (using cache)
  await convertBackgroundImagesToDataUrls(clone);

  // Convert videos to static images (frame capture)
  await convertVideosToImages(node, clone);

  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);

  // Simple SVG with foreignObject - fonts will be handled by Rust/FFmpeg
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
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

// Helper: Convert Uint8ClampedArray to base64 string
export const arrayToBase64 = (data: Uint8ClampedArray): string => {
  let binary = '';
  const bytes = new Uint8Array(data.buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Helper: Render text overlay directly on canvas using Canvas 2D API
// This bypasses SVG foreignObject font issues
export const renderTextOverlay = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) => {
  const { textOverlay, durationMs, animationSpeed } = useRenderStore.getState();
  const { playheadMs } = useTimelineStore.getState();

  if (!textOverlay.enabled) return;

  const speedMultiplier = ANIMATION_SPEED_MULTIPLIERS[animationSpeed];
  const startDelay = 300 / speedMultiplier;

  // Calculate headline animation progress
  const delayedPlayhead = Math.max(0, playheadMs - startDelay);
  const headlineAnimDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
  const headlineProgress = delayedPlayhead === 0 ? 0 : Math.min(1, delayedPlayhead / headlineAnimDuration);

  // Calculate tagline animation progress (staggered)
  const staggerDelay = startDelay + ((durationMs || 3000) * 0.15) / speedMultiplier;
  const taglineAnimDuration = ((durationMs || 3000) * 0.3) / speedMultiplier;
  const taglineDelayedPlayhead = Math.max(0, playheadMs - staggerDelay);
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

  // Get animation styles
  const animationType = (animation || 'blur') as TextAnimationType;
  const headlineAnim = generateTextKeyframes(animationType, headlineProgress);
  const taglineAnim = generateTextKeyframes(animationType, taglineProgress);

  // Skip if both are invisible
  if (headlineAnim.opacity === 0 && taglineAnim.opacity === 0) return;

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
  renderAnimatedText(headline, headlineAnim, textX, textY, fontSize * scale, fontWeight);

  // Render tagline
  const taglineY = textY + (fontSize * scale) + 12 * scale;
  renderAnimatedText(tagline, taglineAnim, textX, taglineY, taglineFontSize * scale, 400, 0.9);

  ctx.restore();
};

// Helper: Capture a single frame from DOM to Canvas
export const captureFrame = async (
  node: HTMLElement,
  outputWidth: number,
  outputHeight: number
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

  // Get the current computed styles and render state
  const nodeRect = node.getBoundingClientRect();
  const scaleX = outputWidth / nodeRect.width;
  const scaleY = outputHeight / nodeRect.height;
  const scale = Math.min(scaleX, scaleY);
  
  
  // Get computed styles
  const computedStyle = window.getComputedStyle(node);

  // Center the content
  const offsetX = (outputWidth - nodeRect.width * scale) / 2;
  const offsetY = (outputHeight - nodeRect.height * scale) / 2;

  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // Apply clipping for rounded corners to enable transparency
  const radius = parseFloat(computedStyle.borderRadius) || 0;
  if (radius > 0) {
      ctx.beginPath();
      // Use roundRect if available, otherwise simple rect (most modern environments support roundRect)
      if (ctx.roundRect) {
          ctx.roundRect(0, 0, nodeRect.width, nodeRect.height, radius);
      } else {
          ctx.rect(0, 0, nodeRect.width, nodeRect.height);
      }
      ctx.clip();
  }

  // Fill background inside the clipped area
  ctx.fillStyle = computedStyle.backgroundColor || '#000000';
  ctx.fillRect(0, 0, nodeRect.width, nodeRect.height);

  // Use drawImage if node has a canvas child, otherwise use html2canvas-like approach
  // For now, we use foreignObject SVG approach (fast, supports CSS)
  const svgUrl = await nodeToSvgDataUrl(node, nodeRect.width, nodeRect.height);
  const img = await loadImage(svgUrl);

  ctx.drawImage(img, 0, 0, nodeRect.width, nodeRect.height);

  // Reset transform for text overlay (text is rendered in output coordinates)
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Render text overlay using Canvas API (bypasses SVG font issues)
  renderTextOverlay(ctx, outputWidth, outputHeight, scale);

  // Get raw RGBA pixel data
  const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
  return imageData.data;
};
