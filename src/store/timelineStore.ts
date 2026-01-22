import { create } from 'zustand';
import { useRenderStore } from './renderStore';

export type AnimationType =
  | 'none'
  | 'float'
  | 'bounce'
  | 'rotate'
  | 'zoom-in'
  | 'zoom-out'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'shake'
  | 'pulse'
  | 'swing'
  | 'elastic-rotate'
  | 'converge'
  | 'diverge'
  | 'glitch'
  | 'wobble-3d'
  | 'rotate-3d'
  | 'elevator'
  | 'skew-slide';

export type AnimationPreset = {
  id: string;
  name: string;
  animations: AnimationType[];
  icon: string;
  color: string;
  duration: number;
  easing: string;
  category?: 'Basic' | 'Creative' | '3D' | 'Combo';
};

export type TimelineClip = {
  id: string;
  trackId: string;
  type: 'animation' | 'visual' | 'audio';
  name: string;
  startMs: number;
  durationMs: number;
  color: string;
  icon: string;
  data?: {
    animationPreset?: AnimationPreset;
    mediaUrl?: string;
    volume?: number;
  };
};

export type TimelineTrack = {
  id: string;
  name: string;
  icon: string;
  type: 'animation' | 'visual' | 'audio';
  clips: TimelineClip[];
  muted?: boolean;
  locked?: boolean;
};

type TimelineStore = {
  tracks: TimelineTrack[];
  selectedClipId: string | null;
  playheadMs: number;
  isPlaying: boolean;
  zoom: number;
  // Actions
  addClip: (trackId: string, clip: Omit<TimelineClip, 'id'>) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  removeClip: (clipId: string) => void;
  clearTrack: (trackId: string) => void;
  selectClip: (clipId: string | null) => void;
  setPlayhead: (ms: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setZoom: (zoom: number) => void;
  moveClip: (clipId: string, newStartMs: number, newTrackId?: string) => void;
  resizeClip: (clipId: string, newDurationMs: number, fromStart?: boolean) => void;
  toggleTrackMute: (trackId: string) => void;
  toggleTrackLock: (trackId: string) => void;
};

const generateId = () => Math.random().toString(36).substring(2, 11);

const defaultTracks: TimelineTrack[] = [
  {
    id: 'track-animation',
    name: 'Animation',
    icon: 'animation',
    type: 'animation',
    clips: [],
  },
  {
    id: 'track-visual',
    name: 'Visual',
    icon: 'image',
    type: 'visual',
    clips: [],
  },
  {
    id: 'track-audio',
    name: 'Audio',
    icon: 'music_note',
    type: 'audio',
    clips: [],
  },
];

// Helper to update render duration based on max clip end time
const updateRenderDuration = (tracks: TimelineTrack[]) => {
  let maxEndTime = 0;
  tracks.forEach((track) => {
    track.clips.forEach((clip) => {
      const endTime = clip.startMs + clip.durationMs;
      if (endTime > maxEndTime) {
        maxEndTime = endTime;
      }
    });
  });

  // Minimum duration of 5s or the max clip time
  const newDuration = Math.max(5000, maxEndTime);
  useRenderStore.getState().setDurationMs(newDuration);
};

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  tracks: defaultTracks,
  selectedClipId: null,
  playheadMs: 0,
  isPlaying: false,
  zoom: 1,

  addClip: (trackId, clipData) => {
    const clip: TimelineClip = {
      ...clipData,
      id: generateId(),
    };
    
    set((state) => {
      const newTracks = state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, clip] }
          : track
      );
      updateRenderDuration(newTracks);
      return { tracks: newTracks };
    });
  },

  updateClip: (clipId, updates) => {
    set((state) => {
      const newTracks = state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...updates } : clip
        ),
      }));
      updateRenderDuration(newTracks);
      return { tracks: newTracks };
    });
  },

  removeClip: (clipId) => {
    set((state) => {
      const newTracks = state.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((clip) => clip.id !== clipId),
      }));
      updateRenderDuration(newTracks);
      return {
        tracks: newTracks,
        selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
      };
    });
  },

  clearTrack: (trackId) => {
    set((state) => {
      const newTracks = state.tracks.map((track) =>
        track.id === trackId ? { ...track, clips: [] } : track
      );
      updateRenderDuration(newTracks);
      return {
        tracks: newTracks,
        selectedClipId: null,
      };
    });
  },

  selectClip: (clipId) => {
    set({ selectedClipId: clipId });
  },

  setPlayhead: (ms) => {
    set({ playheadMs: Math.max(0, ms) });
  },

  setIsPlaying: (playing) => {
    set({ isPlaying: playing });
  },

  setZoom: (zoom) => {
    set({ zoom: Math.max(0.25, Math.min(4, zoom)) });
  },

  moveClip: (clipId, newStartMs, newTrackId) => {
    const state = get();
    let clipToMove: TimelineClip | null = null;
    let sourceTrackId: string | null = null;

    // Find the clip
    for (const track of state.tracks) {
      const clip = track.clips.find((c) => c.id === clipId);
      if (clip) {
        clipToMove = clip;
        sourceTrackId = track.id;
        break;
      }
    }

    if (!clipToMove || !sourceTrackId) return;

    const targetTrackId = newTrackId || sourceTrackId;

    set((state) => {
      const newTracks = state.tracks.map((track) => {
        if (track.id === sourceTrackId && track.id === targetTrackId) {
          // Same track, just update position
          return {
            ...track,
            clips: track.clips.map((clip) =>
              clip.id === clipId ? { ...clip, startMs: Math.max(0, newStartMs) } : clip
            ),
          };
        } else if (track.id === sourceTrackId) {
          // Remove from source track
          return {
            ...track,
            clips: track.clips.filter((clip) => clip.id !== clipId),
          };
        } else if (track.id === targetTrackId && clipToMove) {
          // Add to target track
          return {
            ...track,
            clips: [...track.clips, { ...clipToMove, startMs: Math.max(0, newStartMs), trackId: targetTrackId }],
          };
        }
        return track;
      });
      
      updateRenderDuration(newTracks);
      return { tracks: newTracks };
    });
  },

  resizeClip: (clipId, newDurationMs, fromStart = false) => {
    const minDuration = 100;
    const duration = Math.max(minDuration, newDurationMs);

    set((state) => {
      const newTracks = state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) => {
          if (clip.id !== clipId) return clip;
          if (fromStart) {
            const diff = clip.durationMs - duration;
            return {
              ...clip,
              startMs: Math.max(0, clip.startMs + diff),
              durationMs: duration,
            };
          }
          return { ...clip, durationMs: duration };
        }),
      }));
      
      updateRenderDuration(newTracks);
      return { tracks: newTracks };
    });
  },

  toggleTrackMute: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, muted: !track.muted } : track
      ),
    }));
  },

  toggleTrackLock: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, locked: !track.locked } : track
      ),
    }));
  },
}));

// =============================================================================
// Granular Selectors - for performance optimization
// =============================================================================
export const usePlayheadMs = () => useTimelineStore(state => state.playheadMs);
export const useIsPlaying = () => useTimelineStore(state => state.isPlaying);
export const useTracks = () => useTimelineStore(state => state.tracks);
export const useSelectedClipId = () => useTimelineStore(state => state.selectedClipId);
export const useZoom = () => useTimelineStore(state => state.zoom);

// Animation Presets
export const ANIMATION_PRESETS: AnimationPreset[] = [
  // Basic
  {
    id: 'float',
    name: 'Float',
    animations: ['float'],
    icon: 'cloud',
    color: '#60A5FA',
    duration: 2000,
    easing: 'ease-in-out',
    category: 'Basic',
  },
  {
    id: 'bounce',
    name: 'Bounce',
    animations: ['bounce'],
    icon: 'sports_basketball',
    color: '#F472B6',
    duration: 1000,
    easing: 'ease-out',
    category: 'Basic',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    animations: ['pulse'],
    icon: 'favorite',
    color: '#FB7185',
    duration: 800,
    easing: 'ease-in-out',
    category: 'Basic',
  },
  {
    id: 'shake',
    name: 'Shake',
    animations: ['shake'],
    icon: 'vibration',
    color: '#FBBF24',
    duration: 500,
    easing: 'linear',
    category: 'Basic',
  },
  
  // Creative
  {
    id: 'glitch-snap',
    name: 'Glitch Snap',
    animations: ['glitch', 'zoom-in'],
    icon: 'broken_image',
    color: '#22d3ee',
    duration: 600,
    easing: 'linear',
    category: 'Creative',
  },
  {
    id: 'elastic-spin',
    name: 'Elastic Spin',
    animations: ['elastic-rotate', 'zoom-out'],
    icon: 'loop',
    color: '#fb923c',
    duration: 1500,
    easing: 'easeInOutBack',
    category: 'Creative',
  },
  {
    id: 'magnetic-pull',
    name: 'Magnetic',
    animations: ['converge', 'pulse'],
    icon: 'join_inner',
    color: '#818cf8',
    duration: 1200,
    easing: 'ease-out',
    category: 'Creative',
  },
  {
    id: 'explosion',
    name: 'Explosion',
    animations: ['diverge', 'shake'],
    icon: 'flare',
    color: '#f87171',
    duration: 800,
    easing: 'ease-out',
    category: 'Creative',
  },

  // 3D Motion
  {
    id: '3d-wobble',
    name: '3D Wobble',
    animations: ['wobble-3d', 'float'],
    icon: '3d_rotation',
    color: '#34d399',
    duration: 2500,
    easing: 'ease-in-out',
    category: '3D',
  },
  {
    id: 'cube-spin',
    name: 'Cube Spin',
    animations: ['rotate-3d'],
    icon: 'view_in_ar',
    color: '#60a5fa',
    duration: 3000,
    easing: 'linear',
    category: '3D',
  },
  {
    id: 'elevator-pitch',
    name: 'Rise Up',
    animations: ['elevator'],
    icon: 'elevator',
    color: '#4ade80',
    duration: 1500,
    easing: 'ease-out',
    category: '3D',
  },
  {
    id: 'super-skew',
    name: 'Super Skew',
    animations: ['skew-slide'],
    icon: 'bolt',
    color: '#d8b4fe',
    duration: 1000,
    easing: 'ease-out',
    category: '3D',
  },

  // Combos
  {
    id: 'rotate-zoom',
    name: 'Rotate + Zoom',
    animations: ['rotate', 'zoom-in'],
    icon: '360',
    color: '#A78BFA',
    duration: 1500,
    easing: 'ease-in-out',
    category: 'Combo',
  },
];
