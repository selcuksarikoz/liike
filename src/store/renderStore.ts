import { create } from 'zustand';

type RenderSettings = {
  durationMs: number;
  fps: number;
  outputName: string;
};

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
  setDeviceModel: (model: string) => void;
  setRotationX: (deg: number) => void;
  setRotationY: (deg: number) => void;
  setRotationZ: (deg: number) => void;
  setCornerRadius: (px: number) => void;
  setBackgroundGradient: (gradient: string) => void;
  setMockupType: (type: string) => void; //... rest of store
  setMediaAssets: (assets: string[]) => void;
  setCanvasSize: (width: number, height: number) => void;
  setDurationMs: (durationMs: number) => void;
  setFps: (fps: number) => void;
  setOutputName: (outputName: string) => void;
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
  canvasWidth: 1080, // Default to a standard size
  canvasHeight: 1080,
  setDeviceModel: (deviceModel) => set({ deviceModel }),
  setRotationX: (rotationX) => set({ rotationX }),
  setRotationY: (rotationY) => set({ rotationY }),
  setRotationZ: (rotationZ) => set({ rotationZ }),
  setCornerRadius: (cornerRadius) => set({ cornerRadius }),
  setBackgroundGradient: (backgroundGradient) => set({ backgroundGradient }),
  setMockupType: (mockupType) => set({ mockupType }),
  setMediaAssets: (mediaAssets) => set({ mediaAssets }),
  setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
  setDurationMs: (durationMs) => set({ durationMs }),
  setFps: (fps) => set({ fps }),
  setOutputName: (outputName) => set({ outputName }),
}));

