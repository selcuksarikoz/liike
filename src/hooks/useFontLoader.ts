// Lazy Google Font loader - only loads fonts when selected
const loadedFonts = new Set<string>();

export const loadGoogleFont = (fontFamily: string): void => {
  if (loadedFonts.has(fontFamily)) return;

  // Mark as loading to prevent duplicate requests
  loadedFonts.add(fontFamily);

  // Create link element for Google Fonts
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
