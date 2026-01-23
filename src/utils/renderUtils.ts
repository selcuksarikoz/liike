import { flushSync } from 'react-dom';
import { useTimelineStore } from '../store/timelineStore';
import type { ExportFormat } from '../store/renderStore';
import { downloadDir, join } from '@tauri-apps/api/path';
import { mkdir } from '@tauri-apps/plugin-fs';
import { getEmbeddedFontCSS } from '../services/fontService';

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

// Helper: Inline computed styles from source to clone
const inlineStyles = async (source: HTMLElement, clone: HTMLElement) => {
  const sourceStyles = window.getComputedStyle(source);
  if (source.style.cssText) {
      clone.style.cssText = source.style.cssText;
  }
  const cssText = Array.from(sourceStyles).reduce((css, prop) => {
    return `${css}${prop}:${sourceStyles.getPropertyValue(prop)};`;
  }, '');
  clone.style.cssText = cssText;

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

// Helper: Convert DOM node to SVG data URL using foreignObject
export const nodeToSvgDataUrl = async (node: HTMLElement, width: number, height: number): Promise<string> => {
  // Clone the node
  const clone = node.cloneNode(true) as HTMLElement;

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

  // Extract and embed fonts used in the node
  const usedFonts = extractUsedFonts(node);
  let fontStyles = '';
  for (const fontName of usedFonts) {
    try {
      const fontCSS = await getEmbeddedFontCSS(fontName);
      fontStyles += fontCSS;
    } catch {
      // Font not available locally, skip
    }
  }

  const serializer = new XMLSerializer();
  const nodeString = serializer.serializeToString(clone);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <defs>
        <style type="text/css">
          ${fontStyles}
        </style>
      </defs>
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
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
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
  const svgData = await nodeToSvgDataUrl(node, nodeRect.width, nodeRect.height);
  const img = await loadImage(svgData);
  
  ctx.drawImage(img, 0, 0, nodeRect.width, nodeRect.height);

  // Get raw RGBA pixel data
  const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
  return imageData.data;
};
