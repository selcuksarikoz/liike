// Lazy Google Font loader - loads from local cache first, falls back to Google Fonts
const loadedFonts = new Set<string>();

export const loadGoogleFont = (fontFamily: string): void => {
  if (loadedFonts.has(fontFamily)) return;

  // Mark as loading to prevent duplicate requests
  loadedFonts.add(fontFamily);

  // Check if local fonts style already exists (injected by fontService)
  const localFontsStyle = document.getElementById('liike-local-fonts');
  if (localFontsStyle?.textContent?.includes(`font-family: '${fontFamily}'`)) {
    // Font is available locally, no need to load from Google
    return;
  }

  // Fallback: Create link element for Google Fonts
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@100;200;300;400;500;600;700;800;900&display=swap`;

  document.head.appendChild(link);
};

// Preload a list of common fonts
export const preloadCommonFonts = (): void => {
  ['Inter', 'Poppins', 'Montserrat'].forEach(loadGoogleFont);
};

// Check if font is already loaded
export const isFontLoaded = (fontFamily: string): boolean => {
  return loadedFonts.has(fontFamily);
};
