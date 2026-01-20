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
  | 'flip';

export type AnimationPreset = {
  id: string;
  name: string;
  animations: AnimationType[];
  icon: string;
  color: string;
  duration: number;
  easing: string;
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
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, clips: [...track.clips, clip] }
          : track
      ),
    }));
  },

  updateClip: (clipId, updates) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.map((clip) =>
          clip.id === clipId ? { ...clip, ...updates } : clip
        ),
      })),
    }));
  },

  removeClip: (clipId) => {
    set((state) => ({
      tracks: state.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((clip) => clip.id !== clipId),
      })),
      selectedClipId: state.selectedClipId === clipId ? null : state.selectedClipId,
    }));
  },

  clearTrack: (trackId) => {
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, clips: [] } : track
      ),
      selectedClipId: null,
    }));
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

    set((state) => ({
      tracks: state.tracks.map((track) => {
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
      }),
    }));

    // Update render duration if clip end exceeds current duration
    if (clipToMove) {
      const newEndTime = Math.max(0, newStartMs) + clipToMove.durationMs;
      const currentDuration = useRenderStore.getState().durationMs;
      if (newEndTime > currentDuration) {
        useRenderStore.getState().setDurationMs(newEndTime);
      }
    }
  },

  resizeClip: (clipId, newDurationMs, fromStart = false) => {
    const minDuration = 100;
    const duration = Math.max(minDuration, newDurationMs);

    set((state) => ({
      tracks: state.tracks.map((track) => ({
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
      })),
    }));

    // Update render duration to match longest clip end time
    const state = get();
    let maxEndTime = 0;
    state.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const endTime = clip.startMs + clip.durationMs;
        if (endTime > maxEndTime) {
          maxEndTime = endTime;
        }
      });
    });

    if (maxEndTime > 0) {
      useRenderStore.getState().setDurationMs(maxEndTime);
    }
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

// Animation Presets
export const ANIMATION_PRESETS: AnimationPreset[] = [
  {
    id: 'float',
    name: 'Float',
    animations: ['float'],
    icon: 'cloud',
    color: '#60A5FA',
    duration: 2000,
    easing: 'ease-in-out',
  },
  {
    id: 'bounce',
    name: 'Bounce',
    animations: ['bounce'],
    icon: 'sports_basketball',
    color: '#F472B6',
    duration: 1000,
    easing: 'ease-out',
  },
  {
    id: 'rotate-zoom',
    name: 'Rotate + Zoom',
    animations: ['rotate', 'zoom-in'],
    icon: '360',
    color: '#A78BFA',
    duration: 1500,
    easing: 'ease-in-out',
  },
  {
    id: 'slide-bounce',
    name: 'Slide + Bounce',
    animations: ['slide-right', 'bounce'],
    icon: 'swipe_right',
    color: '#34D399',
    duration: 1200,
    easing: 'ease-out',
  },
  {
    id: 'pulse',
    name: 'Pulse',
    animations: ['pulse'],
    icon: 'favorite',
    color: '#FB7185',
    duration: 800,
    easing: 'ease-in-out',
  },
  {
    id: 'shake',
    name: 'Shake',
    animations: ['shake'],
    icon: 'vibration',
    color: '#FBBF24',
    duration: 500,
    easing: 'linear',
  },
  {
    id: 'swing',
    name: 'Swing',
    animations: ['swing'],
    icon: 'swap_horiz',
    color: '#2DD4BF',
    duration: 1000,
    easing: 'ease-in-out',
  },
  {
    id: 'flip-zoom',
    name: 'Flip + Zoom',
    animations: ['flip', 'zoom-out'],
    icon: 'flip',
    color: '#E879F9',
    duration: 1500,
    easing: 'ease-in-out',
  },
  {
    id: 'float-rotate',
    name: 'Float + Rotate',
    animations: ['float', 'rotate'],
    icon: 'cyclone',
    color: '#38BDF8',
    duration: 2500,
    easing: 'ease-in-out',
  },
  {
    id: 'zoom-pulse',
    name: 'Zoom + Pulse',
    animations: ['zoom-in', 'pulse'],
    icon: 'radio_button_checked',
    color: '#F97316',
    duration: 1500,
    easing: 'ease-out',
  },
];
