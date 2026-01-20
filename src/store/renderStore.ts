import { create } from 'zustand';

type RenderSettings = {
  durationMs: number;
  fps: number;
  outputName: string;
};

type StylePreset = 'default' | 'glass-light' | 'glass-dark' | 'liquid' | 'inset-light' | 'inset-dark' | 'outline' | 'border';
type BorderType = 'sharp' | 'curved' | 'round';
type ShadowType = 'none' | 'spread' | 'hug' | 'adaptive';

type RenderStore = RenderSettings & {
  deviceModel: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  backgroundGradient: string;
  mockupType: string;
  mediaAssets: string[];
  canvasWidth: number;
  canvasHeight: number;
  canvasCornerRadius: number;
  shadowIntensity: number;
  deviceScale: number;
  // New style properties
  stylePreset: StylePreset;
  borderType: BorderType;
  borderRadius: number;
  shadowType: ShadowType;
  shadowOpacity: number;
  framePreset: string;
  // Setters
  setDeviceModel: (model: string) => void;
  setRotationX: (deg: number) => void;
  setRotationY: (deg: number) => void;
  setRotationZ: (deg: number) => void;
  setCornerRadius: (px: number) => void;
  setCanvasCornerRadius: (px: number) => void;
  setShadowIntensity: (percent: number) => void;
  setDeviceScale: (scale: number) => void;
  setBackgroundGradient: (gradient: string) => void;
  setMockupType: (type: string) => void;
  setMediaAssets: (assets: string[]) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDurationMs: (durationMs: number) => void;
  setFps: (fps: number) => void;
  setOutputName: (outputName: string) => void;
  // New setters
  setStylePreset: (preset: StylePreset) => void;
  setBorderType: (type: BorderType) => void;
  setBorderRadius: (radius: number) => void;
  setShadowType: (type: ShadowType) => void;
  setShadowOpacity: (opacity: number) => void;
  setFramePreset: (preset: string) => void;
  applyPreset: (preset: Partial<RenderStore>) => void;
};

export const useRenderStore = create<RenderStore>((set) => ({
  durationMs: 5000,
  fps: 30,
  outputName: 'liike_render',
  deviceModel: 'iPhone 15 Pro Max',
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  cornerRadius: 0,
  backgroundGradient: 'from-[#1c3b4a] via-[#141b1e] to-[#0a0f12]',
  mockupType: 'iphone',
  mediaAssets: [],
  canvasWidth: 1080,
  canvasHeight: 1080,
  canvasCornerRadius: 20,
  shadowIntensity: 40,
  deviceScale: 1,
  // New style defaults
  stylePreset: 'default',
  borderType: 'curved',
  borderRadius: 20,
  shadowType: 'spread',
  shadowOpacity: 40,
  framePreset: 'instagram-post',
  // Setters
  setDeviceModel: (deviceModel) => set({ deviceModel }),
  setRotationX: (rotationX) => set({ rotationX }),
  setRotationY: (rotationY) => set({ rotationY }),
  setRotationZ: (rotationZ) => set({ rotationZ }),
  setCornerRadius: (cornerRadius) => set({ cornerRadius }),
  setCanvasCornerRadius: (canvasCornerRadius) => set({ canvasCornerRadius }),
  setShadowIntensity: (shadowIntensity) => set({ shadowIntensity }),
  setDeviceScale: (deviceScale) => set({ deviceScale }),
  setBackgroundGradient: (backgroundGradient) => set({ backgroundGradient }),
  setMockupType: (mockupType) => set({ mockupType }),
  setMediaAssets: (mediaAssets) => set({ mediaAssets }),
  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
  setDurationMs: (durationMs) => set({ durationMs }),
  setFps: (fps) => set({ fps }),
  setOutputName: (outputName) => set({ outputName }),
  // New setters
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setBorderType: (borderType) => set({ borderType }),
  setBorderRadius: (borderRadius) => set({ borderRadius }),
  setShadowType: (shadowType) => set({ shadowType }),
  setShadowOpacity: (shadowOpacity) => set({ shadowOpacity }),
  setFramePreset: (framePreset) => set({ framePreset }),
  applyPreset: (preset) => set((state) => ({ ...state, ...preset })),
}));

