import type { ReactNode } from 'react';

// All available layout types - single source of truth
export type ImageLayout =
  | 'single'
  // 2 Images
  | 'side-by-side'
  | 'stacked'
  // 3 Images
  | 'trio-row'
  | 'trio-column'
  | 'fan'
  | 'masonry'
  | 'mosaic'
  | 'film-strip'
  // 4 Images
  | 'grid'
  | 'overlap'
  | 'creative'
  // New layouts
  | 'diagonal'
  | 'polaroid'
  | 'spotlight'
  | 'cross'
  | 'magazine'
  | 'showcase'
  | 'scattered'
  | 'cascade'
  | 'brick'
  | 'asymmetric';

export type LayoutConfig = {
  value: ImageLayout;
  label: string;
  imageCount: number;
};

// Layout configurations with image counts
export const LAYOUT_CONFIGS: LayoutConfig[] = [
  // 1 Image
  { value: 'single', label: 'Single', imageCount: 1 },

  // 2 Images
  { value: 'side-by-side', label: 'Side by Side', imageCount: 2 },
  { value: 'stacked', label: 'Stacked', imageCount: 2 },
  { value: 'diagonal', label: 'Diagonal', imageCount: 2 },
  { value: 'polaroid', label: 'Polaroid', imageCount: 2 },

  // 3 Images
  { value: 'trio-row', label: 'Row', imageCount: 3 },
  { value: 'trio-column', label: 'Column', imageCount: 3 },
  { value: 'fan', label: 'Triptych', imageCount: 3 },
  { value: 'masonry', label: 'Masonry', imageCount: 3 },
  { value: 'mosaic', label: 'Mosaic', imageCount: 3 },
  { value: 'film-strip', label: 'Film Strip', imageCount: 3 },
  { value: 'spotlight', label: 'Spotlight', imageCount: 3 },

  // 4 Images
  { value: 'grid', label: 'Grid', imageCount: 4 },
  { value: 'overlap', label: 'Overlap', imageCount: 4 },
  { value: 'creative', label: 'Creative', imageCount: 4 },
  { value: 'cross', label: 'Cross', imageCount: 4 },
  { value: 'magazine', label: 'Magazine', imageCount: 4 },
  { value: 'showcase', label: 'Showcase', imageCount: 4 },
  { value: 'scattered', label: 'Scattered', imageCount: 4 },
  { value: 'cascade', label: 'Cascade', imageCount: 4 },
  { value: 'brick', label: 'Brick', imageCount: 4 },
  { value: 'asymmetric', label: 'Asymmetric', imageCount: 3 },
];

// Helper to get layout config by value
export const getLayoutConfig = (value: ImageLayout): LayoutConfig | undefined => {
  return LAYOUT_CONFIGS.find((l) => l.value === value);
};

// Helper to get layouts by image count
export const getLayoutsByImageCount = (count: number): LayoutConfig[] => {
  return LAYOUT_CONFIGS.filter((l) => l.imageCount === count);
};
