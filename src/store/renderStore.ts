import { create } from 'zustand';

type RenderSettings = {
  durationMs: number;
  fps: number;
  outputName: string;
};

type RenderStore = RenderSettings & {
  setDurationMs: (durationMs: number) => void;
  setFps: (fps: number) => void;
  setOutputName: (outputName: string) => void;
};

export const useRenderStore = create<RenderStore>((set) => ({
  durationMs: 5000,
  fps: 30,
  outputName: 'liike_render',
  setDurationMs: (durationMs) => set({ durationMs }),
  setFps: (fps) => set({ fps }),
  setOutputName: (outputName) => set({ outputName }),
}));
