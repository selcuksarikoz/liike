import { create } from 'zustand';
import bg1 from '../assets/bg/1.webp';
import type { AnimationSpeed } from '../constants/layoutAnimationPresets';
export type { ImageLayout } from '../constants/layouts';
import type { ImageLayout } from '../constants/layouts';

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
  format?: ExportFormat;
  isImageExport?: boolean;
};

type StylePreset = 'default' | 'glass-light' | 'glass-dark' | 'neon-glow' | 'cyber' | 'gradient-border' | 'frost' | 'liquid' | 'hologram' | 'inset-dark' | 'outline' | 'border' | 'double-border';
type ShadowType = 'none' | 'soft' | 'float' | 'dream' | 'glow';
export type AspectRatio = 'free' | '1:1' | '4:5' | '9:16' | '16:9' | '3:4' | '4:3' | '21:9' | '2:3' | '3:2';
export type BackgroundType = 'gradient' | 'solid' | 'image';

export type MediaAsset = {
  url: string;
  type: 'image' | 'video';
  duration?: number; // Video duration in milliseconds
  relativePlayheadMs?: number; // Added for timeline sync
  clipStartMs?: number; // Track where the clip begins on the timeline
};

export type TextPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'center-left' | 'center' | 'center-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';

export type MediaPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center-left'
  | 'center-right';

// Convert semantic position to offset values (smaller values to stay in canvas)
const MEDIA_POSITION_OFFSETS: Record<MediaPosition, { offsetX: number; offsetY: number }> = {
  'center': { offsetX: 0, offsetY: 0 },
  'top': { offsetX: 0, offsetY: -25 },
  'bottom': { offsetX: 0, offsetY: 25 },
  'left': { offsetX: -30, offsetY: 0 },
  'right': { offsetX: 30, offsetY: 0 },
  'top-left': { offsetX: -25, offsetY: -20 },
  'top-right': { offsetX: 25, offsetY: -20 },
  'bottom-left': { offsetX: -25, offsetY: 20 },
  'bottom-right': { offsetX: 25, offsetY: 20 },
  'center-left': { offsetX: -30, offsetY: 0 },
  'center-right': { offsetX: 30, offsetY: 0 },
};

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
  deviceAnimateIn: boolean;
  deviceAnimation: string;
  // Text shadow settings
  shadowEnabled: boolean;
  shadowBlur: number;
  shadowOffsetY: number;
  shadowColor: string;
  shadowOpacity: number;
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
  shadowX: number;
  shadowY: number;
  imageLayout: ImageLayout;
  // Media positioning (image/video)
  mediaPosition: MediaPosition;
  mediaOffsetX: number;
  mediaOffsetY: number;
  // Media Inner Constraints (inside the device screen)
  mediaFit: 'cover' | 'contain' | 'fill';
  mediaInnerScale: number;
  mediaInnerX: number; // percent
  mediaInnerY: number; // percent
  mediaInnerWidth: number; // percent
  mediaInnerHeight: number; // percent
  mediaInnerAspectRatio: string; // "free", "16/9", etc.
  mediaInnerRadius: number;

  // Animation speed
  animationSpeed: AnimationSpeed;
  // Render status
  renderStatus: RenderStatus;
  renderQuality: '1080p' | '4k';
  fastExport: boolean;
  includeAudio: boolean;
  cameraAudioEnabled: boolean;
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
  setFastExport: (fast: boolean) => void;
  setIncludeAudio: (include: boolean) => void;
  setCameraAudioEnabled: (enabled: boolean) => void;
  setOutputName: (outputName: string) => void;
  setStylePreset: (preset: StylePreset) => void;
  setShadowType: (type: ShadowType) => void;
  setShadowColor: (color: string) => void;
  setShadowOpacity: (opacity: number) => void;
  setShadowBlur: (px: number) => void;
  setShadowX: (px: number) => void;
  setShadowY: (px: number) => void;
  setImageLayout: (layout: ImageLayout) => void;
  setMediaPosition: (position: MediaPosition) => void;
  setMediaOffsetX: (x: number) => void;
  setMediaOffsetY: (y: number) => void;
  
  // Media Inner Constraints Setters
  setMediaFit: (fit: 'cover' | 'contain' | 'fill') => void;
  setMediaInnerScale: (scale: number) => void;
  setMediaInnerX: (x: number) => void;
  setMediaInnerY: (y: number) => void;
  setMediaInnerWidth: (w: number) => void;
  setMediaInnerHeight: (h: number) => void;
  setMediaInnerAspectRatio: (ratio: string) => void;
  setMediaInnerRadius: (radius: number) => void;

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
  format: undefined,
  isImageExport: false,
};

export const useRenderStore = create<RenderStore>((set) => ({
  durationMs: 0,
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
  canvasWidth: 1920,
  canvasHeight: 1080,
  canvasCornerRadius: 12,
  canvasBorderWidth: 0,
  canvasBorderColor: '#ffffff',
  deviceScale: 1,
  stylePreset: 'default',
  shadowType: 'soft',
  shadowColor: '#000000',
  shadowOpacity: 25,
  shadowBlur: 6,
  shadowX: 0,
  shadowY: 0,
  imageLayout: 'single',
  mediaPosition: 'center',
  mediaOffsetX: 0,
  mediaOffsetY: 0,
  animationSpeed: 'normal',
  renderStatus: initialRenderStatus,
  renderQuality: '1080p',
  fastExport: false,
  includeAudio: true,
  cameraAudioEnabled: true,
  
  frameMode: 'device',
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
    position: 'center',
    animation: 'blur',
    layout: 'text-top-device-bottom',
    deviceOffset: 0,
    deviceAnimateIn: false,
    deviceAnimation: 'none',
    // Text shadow defaults
    shadowEnabled: true,
    shadowBlur: 6,
    shadowOffsetY: 2,
    shadowColor: '#000000',
    shadowOpacity: 50,
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
  setDurationMs: (durationMs) => set((state) => {
    // If there's a video, never let duration go below video duration
    const maxVideoDuration = state.mediaAssets.reduce((max, asset) => {
      if (asset?.type === 'video' && asset.duration) {
        return Math.max(max, asset.duration);
      }
      return max;
    }, 0);
    // Use whichever is longer: requested duration or video duration
    const effectiveDuration = Math.max(durationMs, maxVideoDuration);
    return { durationMs: effectiveDuration };
  }),
  setFps: (fps) => set({ fps }),
  setRenderQuality: (renderQuality) => set({ renderQuality }),
  setFastExport: (fastExport) => set({ fastExport }),
  setIncludeAudio: (includeAudio) => set({ includeAudio }),
  setCameraAudioEnabled: (cameraAudioEnabled) => set({ cameraAudioEnabled }),
  setOutputName: (outputName) => set({ outputName }),
  setStylePreset: (stylePreset) => set({ stylePreset }),
  setShadowType: (shadowType) => set({ shadowType }),
  setShadowColor: (shadowColor) => set({ shadowColor }),
  setShadowOpacity: (shadowOpacity) => set({ shadowOpacity }),
  setShadowBlur: (shadowBlur) => set({ shadowBlur }),
  setShadowX: (shadowX) => set({ shadowX }),
  setShadowY: (shadowY) => set({ shadowY }),
  setImageLayout: (imageLayout) => set({ imageLayout }),
  setMediaPosition: (position) => {
    const offsets = MEDIA_POSITION_OFFSETS[position];
    return set({ mediaPosition: position, mediaOffsetX: offsets.offsetX, mediaOffsetY: offsets.offsetY });
  },
  setMediaOffsetX: (mediaOffsetX) => set({ mediaOffsetX }),
  setMediaOffsetY: (mediaOffsetY) => set({ mediaOffsetY }),
  
  // Media Inner Constraints Defaults
  mediaFit: 'cover',
  mediaInnerScale: 1,
  mediaInnerX: 0,
  mediaInnerY: 0,
  mediaInnerWidth: 100,
  mediaInnerHeight: 100,
  mediaInnerAspectRatio: 'free',
  mediaInnerRadius: 0,

  setMediaFit: (mediaFit) => set({ mediaFit }),
  setMediaInnerScale: (mediaInnerScale) => set({ mediaInnerScale }),
  setMediaInnerX: (mediaInnerX) => set({ mediaInnerX }),
  setMediaInnerY: (mediaInnerY) => set({ mediaInnerY }),
  setMediaInnerWidth: (mediaInnerWidth) => set({ mediaInnerWidth }),
  setMediaInnerHeight: (mediaInnerHeight) => set({ mediaInnerHeight }),
  setMediaInnerAspectRatio: (mediaInnerAspectRatio) => set({ mediaInnerAspectRatio }),
  setMediaInnerRadius: (mediaInnerRadius) => set({ mediaInnerRadius }),

  setAnimationSpeed: (animationSpeed) => set({ animationSpeed }),
  applyPreset: (preset) => set((state) => {
    // If preset has durationMs, respect video duration
    let effectiveDuration = preset.durationMs;
    if (effectiveDuration !== undefined) {
      const maxVideoDuration = state.mediaAssets.reduce((max, asset) => {
        if (asset?.type === 'video' && asset.duration) {
          return Math.max(max, asset.duration);
        }
        return max;
      }, 0);
      effectiveDuration = Math.max(effectiveDuration, maxVideoDuration);
    }
    return {
      ...state,
      ...preset,
      ...(effectiveDuration !== undefined ? { durationMs: effectiveDuration } : {})
    };
  }),
  setRenderStatus: (status) => set((state) => ({ renderStatus: { ...state.renderStatus, ...status } })),
  resetRenderStatus: () => set({ renderStatus: initialRenderStatus }),

  setFrameMode: (frameMode) => set({ frameMode }),
  setDeviceType: (deviceType) => set({ deviceType }),
  setTextOverlay: (overlay) => set((state) => ({
    textOverlay: { ...state.textOverlay, ...overlay }
  })),
  clearTextOverlay: () => set((state) => ({
    textOverlay: { ...state.textOverlay, enabled: false, text: 'Your Text Here', deviceAnimateIn: false, deviceAnimation: 'none' }
  })),
}));
