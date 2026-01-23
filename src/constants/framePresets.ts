export type FramePreset = {
  label: string;
  width: number;
  height: number;
  ratio: string;
};

export type FrameCategory = {
  category: string;
  frames: FramePreset[];
};

export const FRAMES_DATA: FrameCategory[] = [
  {
    category: 'Social Media',
    frames: [
      { label: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1' },
      { label: 'Instagram Portrait', width: 1080, height: 1350, ratio: '4:5' },
      { label: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
      { label: 'Twitter Tweet', width: 1200, height: 675, ratio: '16:9' },
      { label: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
      { label: 'YouTube Video', width: 1920, height: 1080, ratio: '16:9' },
      { label: 'Facebook Post', width: 1200, height: 630, ratio: '1.9:1' },
      { label: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.9:1' },
      { label: 'Pinterest Standard', width: 1000, height: 1500, ratio: '2:3' },
    ]
  },
  {
    category: 'App Store (iOS)',
    frames: [
      { label: 'iPhone 6.5"', width: 1284, height: 2778, ratio: '19.5:9' },
      { label: 'iPhone 5.5"', width: 1242, height: 2208, ratio: '16:9' },
      { label: 'iPad Pro 12.9"', width: 2048, height: 2732, ratio: '4:3' },
      { label: 'Mac App Preview', width: 2880, height: 1800, ratio: '16:10' },
    ]
  },
  {
    category: 'Standard Ratios',
    frames: [
      { label: '16:9', width: 1920, height: 1080, ratio: '16:9' },
      { label: '4:3', width: 1600, height: 1200, ratio: '4:3' },
      { label: '1:1', width: 1080, height: 1080, ratio: '1:1' },
      { label: '9:16', width: 1080, height: 1920, ratio: '9:16' },
    ]
  }
];

export const getFrameLabel = (width: number, height: number): string => {
  for (const group of FRAMES_DATA) {
    const frame = group.frames.find((f) => f.width === width && f.height === height);
    if (frame) return frame.label;
  }
  return `${width} × ${height}`;
};
