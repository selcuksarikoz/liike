import type { AspectRatio } from '../store/renderStore';

export const ASPECT_RATIOS: { value: AspectRatio; label: string; ratio: number | null }[] = [
  { value: 'free', label: 'Free', ratio: null },
  { value: '1:1', label: 'Square', ratio: 1 },
  { value: '4:5', label: 'Portrait', ratio: 0.8 },
  { value: '9:16', label: 'Story', ratio: 9 / 16 },
  { value: '16:9', label: 'Landscape', ratio: 16 / 9 },
  { value: '4:3', label: 'Standard', ratio: 4 / 3 },
  { value: '3:2', label: 'Classic', ratio: 1.5 },
  { value: '2:3', label: 'Classic V', ratio: 2 / 3 },
  { value: '21:9', label: 'Cinema', ratio: 21 / 9 },
  { value: '3:4', label: 'Portrait 3:4', ratio: 3 / 4 },
];

export type FontCategory = 'sans' | 'serif' | 'mono' | 'display';

export type FontOption = {
  label: string;
  value: string;
  category: FontCategory;
};

export const FONT_OPTIONS: FontOption[] = [
  // Sans-serif - Modern
  { label: 'Inter', value: 'Inter', category: 'sans' },
  { label: 'DM Sans', value: 'DM Sans', category: 'sans' },
  { label: 'Space Grotesk', value: 'Space Grotesk', category: 'sans' },
  { label: 'Manrope', value: 'Manrope', category: 'sans' },
  { label: 'Syne', value: 'Syne', category: 'sans' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans', category: 'sans' },
  { label: 'Urbanist', value: 'Urbanist', category: 'sans' },
  { label: 'Sora', value: 'Sora', category: 'sans' },
  // Sans-serif - Classic
  { label: 'Poppins', value: 'Poppins', category: 'sans' },
  { label: 'Montserrat', value: 'Montserrat', category: 'sans' },
  { label: 'Work Sans', value: 'Work Sans', category: 'sans' },
  { label: 'IBM Plex Sans', value: 'IBM Plex Sans', category: 'sans' },
  { label: 'Rubik', value: 'Rubik', category: 'sans' },
  { label: 'Roboto', value: 'Roboto', category: 'sans' },
  { label: 'Open Sans', value: 'Open Sans', category: 'sans' },
  { label: 'Lato', value: 'Lato', category: 'sans' },
  { label: 'Raleway', value: 'Raleway', category: 'sans' },
  { label: 'Nunito Sans', value: 'Nunito Sans', category: 'sans' },
  { label: 'Fira Sans', value: 'Fira Sans', category: 'sans' },
  { label: 'Cabin', value: 'Cabin', category: 'sans' },
  { label: 'Karla', value: 'Karla', category: 'sans' },
  { label: 'Quicksand', value: 'Quicksand', category: 'sans' },
  { label: 'Exo 2', value: 'Exo 2', category: 'sans' },
  { label: 'Ubuntu', value: 'Ubuntu', category: 'sans' },
  { label: 'Oswald', value: 'Oswald', category: 'sans' },
  { label: 'Archivo Narrow', value: 'Archivo Narrow', category: 'sans' },
  // Serif - Elegant
  { label: 'Playfair Display', value: 'Playfair Display', category: 'serif' },
  { label: 'Cormorant Garamond', value: 'Cormorant Garamond', category: 'serif' },
  { label: 'Fraunces', value: 'Fraunces', category: 'serif' },
  { label: 'Lora', value: 'Lora', category: 'serif' },
  { label: 'Spectral', value: 'Spectral', category: 'serif' },
  { label: 'Merriweather', value: 'Merriweather', category: 'serif' },
  { label: 'PT Serif', value: 'PT Serif', category: 'serif' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville', category: 'serif' },
  { label: 'EB Garamond', value: 'EB Garamond', category: 'serif' },
  { label: 'Crimson Text', value: 'Crimson Text', category: 'serif' },
  { label: 'Vollkorn', value: 'Vollkorn', category: 'serif' },
  { label: 'Alegreya', value: 'Alegreya', category: 'serif' },
  { label: 'DM Serif Display', value: 'DM Serif Display', category: 'display' },
  { label: 'Instrument Serif', value: 'Instrument Serif', category: 'serif' },
  { label: 'Bitter', value: 'Bitter', category: 'serif' },
  // Mono
  { label: 'Space Mono', value: 'Space Mono', category: 'mono' },
  { label: 'Inconsolata', value: 'Inconsolata', category: 'mono' },
  { label: 'Roboto Mono', value: 'Roboto Mono', category: 'mono' },
  { label: 'IBM Plex Mono', value: 'IBM Plex Mono', category: 'mono' },
  { label: 'Source Code Pro', value: 'Source Code Pro', category: 'mono' },
  { label: 'Ubuntu Mono', value: 'Ubuntu Mono', category: 'mono' },
];

export const TEXT_POSITION_OPTIONS: { label: string; value: 'top' | 'center' | 'bottom' }[] = [
  { label: 'Top', value: 'top' },
  { label: 'Center', value: 'center' },
  { label: 'Bottom', value: 'bottom' },
];

export const getAspectRatioValue = (ratio: AspectRatio): number | null => {
  const match = ASPECT_RATIOS.find((r) => r.value === ratio);
  return match ? match.ratio : null;
};
