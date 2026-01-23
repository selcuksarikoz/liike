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

export const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, system-ui, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Playfair', value: 'Playfair Display, serif' },
  { label: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
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
