import { create } from 'zustand';

export type ExportFormat = 'mp4' | 'webm' | 'mov' | 'png';

type RenderSettings = {
  durationMs: number;
  fps: number;
  outputName: string;
};

export type RenderStatus = {
  isRendering: boolean;
  progress: number;
  currentFrame: number;
  totalFrames: number;
  error: string | null;
  phase: 'idle' | 'capturing' | 'encoding' | 'done';
};

type StylePreset = 'default' | 'glass-light' | 'glass-dark' | 'neon-glow' | 'cyber' | 'gradient-border' | 'frost' | 'liquid' | 'hologram' | 'inset-dark' | 'outline' | 'border' | 'double-border';
type ShadowType = 'none' | 'spread' | 'hug' | 'adaptive';
export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3';
export type ImageLayout = 'single' | 'side-by-side' | 'stacked' | 'trio-row' | 'trio-column' | 'grid' | 'overlap' | 'fan';
export type BackgroundType = 'gradient' | 'solid' | 'image';

export type MediaAsset = {
  url: string;
  type: 'image' | 'video';
};

type RenderStore = RenderSettings & {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  backgroundGradient: string;
  backgroundType: BackgroundType;
  backgroundColor: string;
  backgroundImage: string | null;
  mediaAssets: (MediaAsset | null)[];
  canvasWidth: number;
  canvasHeight: number;
  canvasCornerRadius: number;
  deviceScale: number;
  stylePreset: StylePreset;
  shadowType: ShadowType;
  shadowOpacity: number;
  imageAspectRatio: AspectRatio;
  imageLayout: ImageLayout;
  // Render status
  renderStatus: RenderStatus;
  // Setters
  setRotationX: (deg: number) => void;
  setRotationY: (deg: number) => void;
  setRotationZ: (deg: number) => void;
  setCornerRadius: (px: number) => void;
  setCanvasCornerRadius: (px: number) => void;
  setDeviceScale: (scale: number) => void;
  setBackgroundGradient: (gradient: string) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (image: string | null) => void;
  setMediaAssets: (assets: (MediaAsset | null)[]) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDurationMs: (durationMs: number) => void;
  setFps: (fps: number) => void;
  setOutputName: (outputName: string) => void;
  setStylePreset: (preset: StylePreset) => void;
  setShadowType: (type: ShadowType) => void;
  setShadowOpacity: (opacity: number) => void;
  setImageAspectRatio: (ratio: AspectRatio) => void;
  setImageLayout: (layout: ImageLayout) => void;
  applyPreset: (preset: Partial<RenderStore>) => void;
  setRenderStatus: (status: Partial<RenderStatus>) => void;
  resetRenderStatus: () => void;
};

const initialRenderStatus: RenderStatus = {
  isRendering: false,
  progress: 0,
  currentFrame: 0,
  totalFrames: 0,
  error: null,
  phase: 'idle',
};

export const useRenderStore = create<RenderStore>((set) => ({
  durationMs: 5000,
  fps: 30,
  outputName: 'liike_render',
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  cornerRadius: 12,
  backgroundGradient: 'from-[#1c3b4a] via-[#141b1e] to-[#0a0f12]',
  backgroundType: 'gradient',
  backgroundColor: '#1a1a2e',
  backgroundImage: null,
  mediaAssets: [],
  canvasWidth: 1080,
  canvasHeight: 1080,
  canvasCornerRadius: 20,
  deviceScale: 1,
  stylePreset: 'default',
  shadowType: 'spread',
  shadowOpacity: 40,
  imageAspectRatio: 'free',
  imageLayout: 'single',
  renderStatus: initialRenderStatus,
  // Setters
  setRotationX: (rotationX) => set({ rotationX }),
  setRotationY: (rotationY) => set({ rotationY }),
  setRotationZ: (rotationZ) => set({ rotationZ }),
  setCornerRadius: (cornerRadius) => set({ cornerRadius }),
  setCanvasCornerRadius: (canvasCornerRadius) => set({ canvasCornerRadius }),
  setDeviceScale: (deviceScale) => set({ deviceScale }),
  setBackgroundGradient: (backgroundGradient) => set({ backgroundGradient, backgroundType: 'gradient' }),
  setBackgroundType: (backgroundType) => set({ backgroundType }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor, backgroundType: 'solid' }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage, backgroundType: 'image' }),
  setMediaAssets: (mediaAssets) => set({ mediaAssets }),
  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
  setDurationMs: (durationMs) => set({ durationMs }),
  setFps: (fps) => set({ fps }),
  setOutputName: (outputName) => set({ outputName }),
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setShadowType: (shadowType) => set({ shadowType }),
  setShadowOpacity: (shadowOpacity) => set({ shadowOpacity }),
  setImageAspectRatio: (imageAspectRatio) => set({ imageAspectRatio }),
  setImageLayout: (imageLayout) => set({ imageLayout }),
  applyPreset: (preset) => set((state) => ({ ...state, ...preset })),
  setRenderStatus: (status) => set((state) => ({ renderStatus: { ...state.renderStatus, ...status } })),
  resetRenderStatus: () => set({ renderStatus: initialRenderStatus }),
}));
