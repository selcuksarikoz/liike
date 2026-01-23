/**
 * Font Service - Downloads and caches Google Fonts locally
 * Ensures fonts are available for video export
 */

import { appDataDir, join } from '@tauri-apps/api/path';
import { exists, mkdir, writeFile, readTextFile, BaseDirectory } from '@tauri-apps/plugin-fs';
import { fetch } from '@tauri-apps/plugin-http';
import { FONT_OPTIONS } from '../constants/ui';

// Font weights we need for all fonts
const FONT_WEIGHTS = [400, 500, 600, 700, 800, 900];

type FontCacheManifest = {
  version: number;
  fonts: string[];
  lastUpdated: string;
};

const CACHE_VERSION = 1;

// Get the fonts directory path
async function getFontsDir(): Promise<string> {
  const dataDir = await appDataDir();
  return join(dataDir, 'fonts');
}

// Check if fonts are already cached
async function isFontCached(fontName: string): Promise<boolean> {
  try {
    const fontsDir = await getFontsDir();
    const fontFile = await join(fontsDir, `${fontName.replace(/\s+/g, '-')}-400.woff2`);
    return await exists(fontFile);
  } catch {
    return false;
  }
}

// Parse Google Fonts CSS to extract woff2 URLs
function parseGoogleFontsCSS(css: string): Map<number, string> {
  const urls = new Map<number, string>();

  // Match font-face blocks
  const fontFaceRegex = /@font-face\s*\{[^}]*font-weight:\s*(\d+)[^}]*src:[^}]*url\(([^)]+\.woff2)\)[^}]*\}/g;
  let match;

  while ((match = fontFaceRegex.exec(css)) !== null) {
    const weight = parseInt(match[1], 10);
    const url = match[2];
    urls.set(weight, url);
  }

  return urls;
}

// Download a single font from Google Fonts
async function downloadFont(fontName: string): Promise<void> {
  const fontsDir = await getFontsDir();

  // Ensure fonts directory exists
  try {
    if (!(await exists(fontsDir))) {
      await mkdir(fontsDir, { recursive: true });
    }
  } catch {
    // Directory might already exist
  }

  try {
    // Fetch the CSS from Google Fonts API
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${FONT_WEIGHTS.join(';')}&display=swap`;

    const cssResponse = await fetch(cssUrl, {
      headers: {
        // Use a modern user-agent to get woff2 format
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!cssResponse.ok) {
      console.warn(`[FontService] Failed to fetch CSS for ${fontName}`);
      return;
    }

    const css = await cssResponse.text();
    const fontUrls = parseGoogleFontsCSS(css);

    // Download each weight
    for (const [weight, url] of fontUrls) {
      try {
        const fontResponse = await fetch(url);
        if (!fontResponse.ok) continue;

        const fontData = await fontResponse.arrayBuffer();
        const fileName = `${fontName.replace(/\s+/g, '-')}-${weight}.woff2`;
        const filePath = await join(fontsDir, fileName);

        await writeFile(filePath, new Uint8Array(fontData));
      } catch (e) {
        console.warn(`[FontService] Failed to download ${fontName} weight ${weight}:`, e);
      }
    }

    console.log(`[FontService] Downloaded: ${fontName}`);
  } catch (e) {
    console.warn(`[FontService] Error downloading ${fontName}:`, e);
  }
}

// Create @font-face CSS rules for local fonts
async function createFontFaceRules(): Promise<string> {
  const fontsDir = await getFontsDir();
  let css = '';

  for (const font of FONT_OPTIONS) {
    for (const weight of FONT_WEIGHTS) {
      const fileName = `${font.value.replace(/\s+/g, '-')}-${weight}.woff2`;
      const filePath = await join(fontsDir, fileName);

      if (await exists(filePath)) {
        css += `
@font-face {
  font-family: '${font.value}';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('${filePath}') format('woff2');
}
`;
      }
    }
  }

  return css;
}

// Inject local font styles into the document
async function injectLocalFontStyles(): Promise<void> {
  const css = await createFontFaceRules();

  // Remove existing local font styles
  const existingStyle = document.getElementById('liike-local-fonts');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject new style element
  const style = document.createElement('style');
  style.id = 'liike-local-fonts';
  style.textContent = css;
  document.head.appendChild(style);

  console.log('[FontService] Local font styles injected');
}

// Save manifest
async function saveManifest(fonts: string[]): Promise<void> {
  const fontsDir = await getFontsDir();
  const manifestPath = await join(fontsDir, 'manifest.json');

  const manifest: FontCacheManifest = {
    version: CACHE_VERSION,
    fonts,
    lastUpdated: new Date().toISOString(),
  };

  await writeFile(manifestPath, new TextEncoder().encode(JSON.stringify(manifest, null, 2)));
}

// Load manifest
async function loadManifest(): Promise<FontCacheManifest | null> {
  try {
    const fontsDir = await getFontsDir();
    const manifestPath = await join(fontsDir, 'manifest.json');

    if (!(await exists(manifestPath))) {
      return null;
    }

    const content = await readTextFile(manifestPath);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

// Main initialization function - call on app startup
export async function initializeFonts(onProgress?: (progress: number, fontName: string) => void): Promise<void> {
  console.log('[FontService] Initializing fonts...');

  const manifest = await loadManifest();
  const allFontNames = FONT_OPTIONS.map(f => f.value);

  // Check if we need to download new fonts
  const cachedFonts = manifest?.fonts || [];
  const newFonts = allFontNames.filter(f => !cachedFonts.includes(f));
  const outdatedCache = manifest?.version !== CACHE_VERSION;

  const fontsToDownload = outdatedCache ? allFontNames : newFonts;

  if (fontsToDownload.length === 0) {
    console.log('[FontService] All fonts cached');
    await injectLocalFontStyles();
    return;
  }

  console.log(`[FontService] Downloading ${fontsToDownload.length} fonts...`);

  // Download fonts in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < fontsToDownload.length; i += batchSize) {
    const batch = fontsToDownload.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadFont));

    const progress = Math.min(1, (i + batch.length) / fontsToDownload.length);
    onProgress?.(progress, batch[batch.length - 1]);
  }

  // Save manifest
  await saveManifest(allFontNames);

  // Inject styles
  await injectLocalFontStyles();

  console.log('[FontService] Font initialization complete');
}

// Get base64 data URL for a font (for SVG embedding in export)
export async function getFontAsDataUrl(fontName: string, weight: number = 400): Promise<string | null> {
  try {
    const fontsDir = await getFontsDir();
    const fileName = `${fontName.replace(/\s+/g, '-')}-${weight}.woff2`;
    const filePath = await join(fontsDir, fileName);

    if (!(await exists(filePath))) {
      return null;
    }

    // Read file and convert to base64
    const { readFile } = await import('@tauri-apps/plugin-fs');
    const data = await readFile(filePath);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(data)));

    return `data:font/woff2;base64,${base64}`;
  } catch {
    return null;
  }
}

// Generate @font-face CSS with embedded base64 fonts for export
export async function getEmbeddedFontCSS(fontName: string): Promise<string> {
  let css = '';

  for (const weight of FONT_WEIGHTS) {
    const dataUrl = await getFontAsDataUrl(fontName, weight);
    if (dataUrl) {
      css += `
@font-face {
  font-family: '${fontName}';
  font-style: normal;
  font-weight: ${weight};
  src: url('${dataUrl}') format('woff2');
}
`;
    }
  }

  return css;
}

// Check if a specific font is available locally
export async function isFontAvailable(fontName: string): Promise<boolean> {
  return isFontCached(fontName);
}

// Load fonts into the browser's FontFace API for reliable rendering
// This ensures fonts are available when rendering SVG to canvas
export async function loadFontsForExport(fontNames: string[]): Promise<void> {
  console.log('[FontService] Loading fonts for export:', fontNames);

  for (const fontName of fontNames) {
    for (const weight of FONT_WEIGHTS) {
      try {
        const dataUrl = await getFontAsDataUrl(fontName, weight);
        if (!dataUrl) continue;

        // Check if font is already loaded
        const existingFonts = Array.from(document.fonts).filter(
          (f) => f.family === fontName && String(f.weight) === String(weight)
        );

        if (existingFonts.length > 0 && existingFonts.every((f) => f.status === 'loaded')) {
          continue; // Already loaded
        }

        // Convert data URL to ArrayBuffer
        const base64 = dataUrl.split(',')[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Create and load FontFace
        const fontFace = new FontFace(fontName, bytes.buffer, {
          weight: String(weight),
          style: 'normal',
        });

        await fontFace.load();
        document.fonts.add(fontFace);
        console.log(`[FontService] Loaded: ${fontName} weight ${weight}`);
      } catch (e) {
        console.warn(`[FontService] Failed to load ${fontName} weight ${weight}:`, e);
      }
    }
  }

  // Wait for all fonts to be ready
  await document.fonts.ready;
  console.log('[FontService] All fonts ready for export');
}

// Fetch font CSS directly from Google Fonts (for SVG embedding)
// This fetches the CSS and converts font URLs to base64 data URLs
export async function fetchGoogleFontCSS(fontName: string): Promise<string> {
  try {
    const weights = [400, 500, 600, 700, 800, 900];
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@${weights.join(';')}&display=swap`;

    const response = await fetch(cssUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      console.warn(`[FontService] Failed to fetch Google Font CSS for ${fontName}`);
      return '';
    }

    let css = await response.text();

    // Find all font URLs and convert to base64
    const urlRegex = /url\(([^)]+\.woff2)\)/g;
    const matches = css.matchAll(urlRegex);

    for (const match of matches) {
      const fontUrl = match[1];
      try {
        const fontResponse = await fetch(fontUrl);
        if (fontResponse.ok) {
          const fontData = await fontResponse.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(fontData)));
          const dataUrl = `data:font/woff2;base64,${base64}`;
          css = css.replace(fontUrl, dataUrl);
        }
      } catch (e) {
        console.warn(`[FontService] Failed to convert font URL to base64: ${fontUrl}`);
      }
    }

    console.log(`[FontService] Fetched Google Font CSS for ${fontName} (${css.length} chars)`);
    return css;
  } catch (e) {
    console.warn(`[FontService] Error fetching Google Font: ${fontName}`, e);
    return '';
  }
}

// Force re-download all fonts
export async function refreshFonts(onProgress?: (progress: number, fontName: string) => void): Promise<void> {
  const allFontNames = FONT_OPTIONS.map(f => f.value);

  console.log(`[FontService] Force refreshing ${allFontNames.length} fonts...`);

  const batchSize = 5;
  for (let i = 0; i < allFontNames.length; i += batchSize) {
    const batch = allFontNames.slice(i, i + batchSize);
    await Promise.all(batch.map(downloadFont));

    const progress = Math.min(1, (i + batch.length) / allFontNames.length);
    onProgress?.(progress, batch[batch.length - 1]);
  }

  await saveManifest(allFontNames);
  await injectLocalFontStyles();

  console.log('[FontService] Font refresh complete');
}
