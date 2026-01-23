import { create } from 'zustand';
import bg1 from '../assets/bg/1.webp';
import type { AnimationSpeed } from '../constants/textAnimations';

export type ExportFormat = 'mp4' | 'webm' | 'mov' | 'png' | 'gif' | 'webp';

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
type ShadowType = 'none' | 'soft' | 'float' | 'dream' | 'glow';
export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3' | '21:9' | '2:3' | '3:2';
export type ImageLayout = 'single' | 'side-by-side' | 'stacked' | 'trio-row' | 'trio-column' | 'grid' | 'overlap' | 'fan' | 'creative' | 'masonry' | 'mosaic' | 'film-strip';
export type BackgroundType = 'gradient' | 'solid' | 'image';

export type MediaAsset = {
  url: string;
  type: 'image' | 'video';
};

export type TextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type DevicePosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type TextOverlay = {
  enabled: boolean;
  text: string; // combined text for backwards compat
  headline: string;
  tagline: string;
  fontFamily: string;
  fontSize: number; // headline size in px
  taglineFontSize: number;
  fontWeight: number;
  color: string;
  position: TextPosition;
  animation: string; // text animation type
  layout: string; // text-device layout type
  deviceOffset: number; // negative = overflow bottom
  devicePosition: DevicePosition; // where the device sits
  deviceAnimateIn: boolean; // whether device animates in
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
  canvasBorderWidth: number;
  canvasBorderColor: string;
  deviceScale: number;
  stylePreset: StylePreset;
  shadowType: ShadowType;
  shadowColor: string;
  shadowOpacity: number;
  shadowBlur: number;
  shadowSpread: number;
  shadowX: number;
  shadowY: number;
  imageAspectRatio: AspectRatio;
  imageLayout: ImageLayout;
  // Animation speed
  animationSpeed: AnimationSpeed;
  // Render status
  renderStatus: RenderStatus;
  renderQuality: '1080p' | '4k';
  // Setters
  setRotationX: (deg: number) => void;
  setRotationY: (deg: number) => void;
  setRotationZ: (deg: number) => void;
  setCornerRadius: (px: number) => void;
  setCanvasCornerRadius: (px: number) => void;
  setCanvasBorderWidth: (px: number) => void;
  setCanvasBorderColor: (color: string) => void;
  setDeviceScale: (scale: number) => void;
  setBackgroundGradient: (gradient: string) => void;
  setBackgroundType: (type: BackgroundType) => void;
  setBackgroundColor: (color: string) => void;
  setBackgroundImage: (image: string | null) => void;
  setMediaAssets: (assets: (MediaAsset | null)[]) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDurationMs: (durationMs: number) => void;
  setFps: (fps: number) => void;
  setRenderQuality: (quality: '1080p' | '4k') => void;
  setOutputName: (outputName: string) => void;
  setStylePreset: (preset: StylePreset) => void;
  setShadowType: (type: ShadowType) => void;
  setShadowColor: (color: string) => void;
  setShadowOpacity: (opacity: number) => void;
  setShadowBlur: (px: number) => void;
  setShadowSpread: (px: number) => void;
  setShadowX: (px: number) => void;
  setShadowY: (px: number) => void;
  setImageAspectRatio: (ratio: AspectRatio) => void;
  setImageLayout: (layout: ImageLayout) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  applyPreset: (preset: Partial<RenderStore>) => void;
  setRenderStatus: (status: Partial<RenderStatus>) => void;
  resetRenderStatus: () => void;
  // Frame Settings
  frameMode: 'basic' | 'device';
  deviceType: string;  // Changed to string to support specific device IDs like 'iphone-15-pro-max'
  setFrameMode: (mode: 'basic' | 'device') => void;
  setDeviceType: (type: string) => void;
  // Text Overlay
  textOverlay: TextOverlay;
  setTextOverlay: (overlay: Partial<TextOverlay>) => void;
  clearTextOverlay: () => void;
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
  backgroundType: 'image',
  backgroundColor: '#1a1a2e',
  backgroundImage: bg1,
  mediaAssets: [],
  canvasWidth: 1080,
  canvasHeight: 1080,
  canvasCornerRadius: 20,
  canvasBorderWidth: 0,
  canvasBorderColor: '#ffffff',
  deviceScale: 1,
  stylePreset: 'default',
  shadowType: 'soft',
  shadowColor: '#000000',
  shadowOpacity: 50,
  shadowBlur: 30,
  shadowSpread: 0,
  shadowX: 0,
  shadowY: 20,
  imageAspectRatio: 'free',
  imageLayout: 'single',
  animationSpeed: 'normal',
  renderStatus: initialRenderStatus,
  renderQuality: '1080p',
  
  frameMode: 'basic',
  deviceType: 'iphone',
  
  // Text Overlay defaults
  textOverlay: {
    enabled: false,
    text: '',
    headline: 'Your Headline',
    tagline: 'Your tagline here',
    fontFamily: 'Manrope',
    fontSize: 64,
    taglineFontSize: 24,
    fontWeight: 700,
    color: '#ffffff',
    position: 'top-center',
    animation: 'blur',
    layout: 'text-top-device-bottom',
    deviceOffset: -20,
    devicePosition: 'center',
    deviceAnimateIn: false,
  },

  // Setters
  setRotationX: (rotationX) => set({ rotationX }),
  setRotationY: (rotationY) => set({ rotationY }),
  setRotationZ: (rotationZ) => set({ rotationZ }),
  setCornerRadius: (cornerRadius) => set({ cornerRadius }),
  setCanvasCornerRadius: (canvasCornerRadius) => set({ canvasCornerRadius }),
  setCanvasBorderWidth: (canvasBorderWidth) => set({ canvasBorderWidth }),
  setCanvasBorderColor: (canvasBorderColor) => set({ canvasBorderColor }),
  setDeviceScale: (deviceScale) => set({ deviceScale }),
  setBackgroundGradient: (backgroundGradient) => set({ backgroundGradient, backgroundType: 'gradient' }),
  setBackgroundType: (backgroundType) => set({ backgroundType }),
  setBackgroundColor: (backgroundColor) => set({ backgroundColor, backgroundType: 'solid' }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage, backgroundType: 'image' }),
  setMediaAssets: (mediaAssets) => set({ mediaAssets }),
  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
  setDurationMs: (durationMs) => set({ durationMs }),
  setFps: (fps) => set({ fps }),
  setRenderQuality: (renderQuality) => set({ renderQuality }),
  setOutputName: (outputName) => set({ outputName }),
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setShadowType: (shadowType) => set({ shadowType }),
  setShadowColor: (shadowColor) => set({ shadowColor }),
  setShadowOpacity: (shadowOpacity) => set({ shadowOpacity }),
  setShadowBlur: (shadowBlur) => set({ shadowBlur }),
  setShadowSpread: (shadowSpread) => set({ shadowSpread }),
  setShadowX: (shadowX) => set({ shadowX }),
  setShadowY: (shadowY) => set({ shadowY }),
  setImageAspectRatio: (imageAspectRatio) => set({ imageAspectRatio }),
  setImageLayout: (imageLayout) => set({ imageLayout }),
  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  applyPreset: (preset) => set((state) => ({ ...state, ...preset })),
  setRenderStatus: (status) => set((state) => ({ renderStatus: { ...state.renderStatus, ...status } })),
  resetRenderStatus: () => set({ renderStatus: initialRenderStatus }),

  setFrameMode: (frameMode) => set({ frameMode }),
  setDeviceType: (deviceType) => set({ deviceType }),
  setTextOverlay: (overlay) => set((state) => ({ 
    textOverlay: { ...state.textOverlay, ...overlay } 
  })),
  clearTextOverlay: () => set((state) => ({
    textOverlay: { ...state.textOverlay, enabled: false, text: 'Your Text Here', deviceAnimateIn: false }
  })),
}));
