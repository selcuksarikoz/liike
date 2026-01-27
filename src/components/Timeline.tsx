import { useRef, useState, useCallback, useEffect } from 'react';
import {
  X,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Clapperboard,
  ZoomOut,
  ZoomIn,
  Cloud,
  Trophy,
  Heart,
  Smartphone,
  Zap,
  RefreshCw,
  Magnet,
  Sparkles,
  Box,
  BoxSelect,
  ArrowUpFromLine,
  Component,
  Maximize,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { open } from '@tauri-apps/plugin-dialog';
import { useTimelineStore, ANIMATION_PRESETS } from '../store/timelineStore';
import type { TimelineClip, AnimationPreset } from '../store/timelineStore';
import { useRenderStore } from '../store/renderStore';
import { ANIMATION_SPEED_MULTIPLIERS } from '../constants/layoutAnimationPresets';

const MS_PER_SECOND = 1000;
const PIXELS_PER_SECOND = 200;

// Animation preview keyframes for hover effects
const ANIMATION_KEYFRAMES: Record<string, string> = {
  float: 'animate-float',
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  shake: 'animate-shake',
  rotate: 'animate-spin',
  'zoom-in': 'animate-zoom-pulse',
  glitch: 'animate-glitch',
  swing: 'animate-swing',
};

const getPresetIcon = (iconName: string, className?: string) => {
  const props = { className };
  switch (iconName) {
    case 'cloud':
      return <Cloud {...props} />;
    case 'sports_basketball':
      return <Trophy {...props} />;
    case 'favorite':
      return <Heart {...props} />;
    case 'vibration':
      return <Smartphone {...props} />; // Closest to vibration
    case 'broken_image':
      return <Zap {...props} />;
    case 'loop':
      return <RefreshCw {...props} />;
    case 'join_inner':
      return <Magnet {...props} />;
    case 'flare':
      return <Sparkles {...props} />;
    case '3d_rotation':
      return <Box {...props} />;
    case 'view_in_ar':
      return <BoxSelect {...props} />;
    case 'elevator':
      return <ArrowUpFromLine {...props} />;
    case 'bolt':
      return <Component {...props} />;
    case '360':
      return <Maximize {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'volume':
      return <Volume2 {...props} />;
    default:
      return <Clapperboard {...props} />;
  }
};

type DragState = {
  type: 'move' | 'resize-start' | 'resize-end' | 'scrub';
  clipId?: string;
  startX: number;
  initialStartMs?: number;
  initialDurationMs?: number;
  initialPlayheadMs?: number;
};

const TimelineClipComponent = ({
  clip,
  zoom,
  isSelected,
  onSelect,
  onDragStart,
  onDelete,
}: {
  clip: TimelineClip;
  zoom: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent, type: Exclude<DragState['type'], 'scrub'>) => void;
  onDelete: () => void;
}) => {
  const width = (clip.durationMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;
  const left = (clip.startMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-lg cursor-pointer group translate-x-1.5 ${
        isSelected ? 'ring-2 ring-accent ring-offset-1 ring-offset-ui-panel z-20' : 'z-10'
      }`}
      style={{
        left: `${left}px`,
        width: `${Math.max(width, 40)}px`,
        backgroundColor: clip.color,
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onMouseDown={(e) => {
        if (e.button === 0) {
          onDragStart(e, 'move');
        }
      }}
    >
      {/* Resize handle left */}
      <div
        className="absolute left-0 -translate-x-1/2 top-0 bottom-0 w-3 cursor-ew-resize group/resize-left rounded-l-lg"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, 'resize-start');
        }}
      >
        <div className="absolute left-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-zinc-800/90 transition-colors" />
      </div>

      {/* Delete button - visible when selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors z-30"
        >
          <X className="w-2.5 h-2.5 text-white" />
        </button>
      )}

      {/* Resize handle right */}
      <div
        className="absolute right-0 translate-x-1/2 top-0 bottom-0 w-3 cursor-ew-resize group/resize-right rounded-r-lg"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, 'resize-end');
        }}
      >
        <div className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full bg-zinc-800/90 transition-colors" />
      </div>

      {/* Duration tooltip on hover */}
      <div className="absolute top-0.5 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[8px] text-white/80 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {(clip.durationMs / 1000).toFixed(2)}s
      </div>

      {/* Icon only if width permits */}
      {width > 30 && clip.icon && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white/50">
          {getPresetIcon(clip.icon, 'w-4 h-4')}
        </div>
      )}

      {/* Name if width permits */}
      {width > 60 && (
        <div className="absolute bottom-1 left-2 text-[9px] font-medium text-white/90 pointer-events-none truncate max-w-[80%]">
          {clip.name}
        </div>
      )}
    </div>
  );
};

const AnimationPresetItem = ({
  preset,
  onDragStart,
  onDoubleClick,
}: {
  preset: AnimationPreset;
  onDragStart: (e: React.DragEvent, preset: AnimationPreset) => void;
  onDoubleClick: (preset: AnimationPreset) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getAnimationClass = () => {
    if (!isHovered) return '';
    const anim = preset.animations[0];
    return ANIMATION_KEYFRAMES[anim] || '';
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, preset)}
      onDoubleClick={() => onDoubleClick(preset)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-ui-panel/80 hover:bg-ui-highlight border border-transparent hover:border-ui-border/50 cursor-grab active:cursor-grabbing transition-all duration-200 group relative overflow-hidden"
    >
      {/* Glow effect on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl"
        style={{
          background: `radial-gradient(circle at center, ${preset.color}, transparent 70%)`,
        }}
      />

      <div
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg ${getAnimationClass()}`}
        style={{
          backgroundColor: preset.color,
          boxShadow: isHovered ? `0 4px 20px ${preset.color}50` : 'none',
        }}
      >
        {getPresetIcon(preset.icon, 'w-4 h-4 text-white drop-shadow-sm')}
      </div>
      <span className="text-[9px] text-ui-text font-medium group-hover:text-white transition-colors truncate max-w-full">
        {preset.name}
      </span>

      {/* Duration badge */}
      <div className="absolute top-0.5 right-0.5 px-1 py-0.5 rounded text-[7px] font-mono text-ui-muted opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        {(preset.duration / 1000).toFixed(1)}s
      </div>
    </div>
  );
};

export const Timeline = () => {
  const { durationMs } = useRenderStore();
  const {
    tracks,
    selectedClipId,
    playheadMs,
    isPlaying,
    zoom,
    addClip,
    selectClip,
    moveClip,
    resizeClip,
    removeClip,
    setPlayhead,
    setIsPlaying,
    setZoom,
    toggleTrackMute,
  } = useTimelineStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  // Get current audio clip
  const audioTrack = tracks.find((t) => t.type === 'audio');
  const audioClip = audioTrack?.clips[0];
  const audioUrl = audioClip?.data?.mediaUrl;

  // Audio playback sync
  const isAudioMuted = audioTrack?.muted ?? false;

  useEffect(() => {
    if (!audioUrl || isAudioMuted) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Create or update audio element
    if (!audioRef.current || audioRef.current.src !== `file://${audioUrl}`) {
      audioRef.current = new Audio(`file://${audioUrl}`);
    }

    const audio = audioRef.current;
    const audioStartMs = audioClip?.startMs || 0;
    const audioDurationMs = audioClip?.durationMs || 0;

    // Check if playhead is within audio clip range
    const isInRange = playheadMs >= audioStartMs && playheadMs <= audioStartMs + audioDurationMs;

    if (isPlaying && isInRange) {
      const audioTime = (playheadMs - audioStartMs) / 1000;
      if (Math.abs(audio.currentTime - audioTime) > 0.1) {
        audio.currentTime = audioTime;
      }
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }

    return () => {
      if (!isPlaying) audio.pause();
    };
  }, [isPlaying, playheadMs, audioUrl, audioClip?.startMs, audioClip?.durationMs, isAudioMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'Backspace':
        case 'Delete':
          if (selectedClipId) {
            e.preventDefault();
            removeClip(selectedClipId);
          }
          break;
        case 'Escape':
          selectClip(null);
          break;
        case 'Home':
          e.preventDefault();
          setPlayhead(0);
          break;
        case 'End':
          e.preventDefault();
          setPlayhead(durationMs);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setPlayhead(Math.max(0, playheadMs - (e.shiftKey ? 1000 : 100)));
          break;
        case 'ArrowRight':
          e.preventDefault();
          setPlayhead(Math.min(durationMs, playheadMs + (e.shiftKey ? 1000 : 100)));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    selectedClipId,
    playheadMs,
    durationMs,
    setIsPlaying,
    removeClip,
    selectClip,
    setPlayhead,
  ]);

  const totalWidth = (durationMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;
  const timeMarkers = Array.from(
    { length: Math.ceil(durationMs / MS_PER_SECOND) + 1 },
    (_, i) => i
  );

  // Handle dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState) return;

      if (dragState.type === 'scrub') {
        const deltaX = e.clientX - dragState.startX;
        const deltaMs = (deltaX / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND;
        const newPlayheadMs = Math.max(0, (dragState.initialPlayheadMs || 0) + deltaMs);
        setPlayhead(newPlayheadMs);
        return;
      }

      const deltaX = e.clientX - dragState.startX;
      const deltaMs = (deltaX / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND;

      if (dragState.type === 'move' && dragState.clipId && dragState.initialStartMs !== undefined) {
        const newStartMs = Math.max(0, dragState.initialStartMs + deltaMs);
        moveClip(dragState.clipId, newStartMs);
      } else if (
        dragState.type === 'resize-end' &&
        dragState.clipId &&
        dragState.initialDurationMs !== undefined
      ) {
        const newDuration = Math.max(100, dragState.initialDurationMs + deltaMs);
        resizeClip(dragState.clipId, newDuration);
      } else if (
        dragState.type === 'resize-start' &&
        dragState.clipId &&
        dragState.initialDurationMs !== undefined
      ) {
        const newDuration = Math.max(100, dragState.initialDurationMs - deltaMs);
        resizeClip(dragState.clipId, newDuration, true);
      }
    },
    [dragState, zoom, moveClip, resizeClip, setPlayhead]
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  // Handle scrubbing start (ruler or playhead)
  const handleScrubStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!timelineRef.current) return;

    // Calculate initial playhead position based on click
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const scrollLeft = timelineRef.current.scrollLeft;
    const ms = Math.max(0, ((x + scrollLeft) / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND);

    // If clicking directly, jump there first
    setPlayhead(ms);

    setDragState({
      type: 'scrub',
      startX: e.clientX,
      initialPlayheadMs: ms,
    });
  };

  const handleClipDragStart = (
    e: React.MouseEvent,
    clip: TimelineClip,
    type: Exclude<DragState['type'], 'scrub'>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragState({
      clipId: clip.id,
      type,
      startX: e.clientX,
      initialStartMs: clip.startMs,
      initialDurationMs: clip.durationMs,
    });
    selectClip(clip.id);
  };

  const handlePresetDragStart = (e: React.DragEvent, preset: AnimationPreset) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'animation-preset', preset })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Double-click to add preset at playhead position
  const handlePresetDoubleClick = (preset: AnimationPreset) => {
    const animationTrack = tracks.find((t) => t.type === 'animation');
    if (animationTrack) {
      const speed = useRenderStore.getState().animationSpeed;
      const multiplier = ANIMATION_SPEED_MULTIPLIERS[speed] || 1;
      const effectiveDuration = preset.duration / multiplier;

      addClip(animationTrack.id, {
        trackId: animationTrack.id,
        type: 'animation',
        name: preset.name,
        startMs: playheadMs,
        durationMs: effectiveDuration,
        color: preset.color,
        icon: preset.icon,
        data: { animationPreset: preset },
      });
    }
  };

  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data || !timelineRef.current) return;

    try {
      const parsed = JSON.parse(data);
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const scrollLeft = timelineRef.current.scrollLeft;
      const startMs = Math.max(0, ((x + scrollLeft) / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND);

      const speed = useRenderStore.getState().animationSpeed;
      const multiplier = ANIMATION_SPEED_MULTIPLIERS[speed] || 1;

      if (parsed.type === 'animation-preset') {
        const preset = parsed.preset as AnimationPreset;
        const effectiveDuration = preset.duration / multiplier;
        addClip(trackId, {
          trackId,
          type: 'animation',
          name: preset.name,
          startMs,
          durationMs: effectiveDuration,
          color: preset.color,
          icon: preset.icon,
          data: { animationPreset: preset },
        });
      } else if (parsed.type === 'layout-preset') {
        const preset = parsed.preset;
        const hasAnimation = preset.animations?.some((a: { type: string }) => a.type !== 'none');

        if (hasAnimation) {
          const effectiveDuration = preset.durationMs / multiplier;
          addClip(trackId, {
            trackId,
            type: 'animation',
            name: preset.name,
            startMs,
            durationMs: effectiveDuration,
            color: preset.color,
            icon: preset.icon,
            data: {
              animationPreset: {
                id: preset.id,
                name: preset.name,
                animations: preset.animations
                  .map((a: any) => a.type)
                  .filter((t: any) => t !== 'none') as any[],
                icon: preset.icon,
                color: preset.color,
                duration: effectiveDuration,
                easing: preset.animations[0]?.easing || 'ease-in-out',
              },
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to parse drop data:', err);
    }
  };

  const handleTrackDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Handle audio file import
  const handleAudioImport = async () => {
    const file = await open({
      multiple: false,
      filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'aac', 'm4a', 'ogg'] }],
    });

    if (!file) return;

    const audioTrack = tracks.find((t) => t.type === 'audio');
    if (!audioTrack) return;

    // Get audio duration
    const audio = new Audio(`file://${file}`);
    await new Promise<void>((resolve) => {
      audio.onloadedmetadata = () => resolve();
      audio.onerror = () => resolve();
    });

    const audioDurationMs = audio.duration ? audio.duration * 1000 : durationMs;

    addClip(audioTrack.id, {
      trackId: audioTrack.id,
      type: 'audio',
      name: file.split('/').pop() || 'Audio',
      startMs: 0,
      durationMs: audioDurationMs,
      color: '#22c55e',
      icon: 'music',
      data: { mediaUrl: file, volume: 1 },
    });
  };

  const playheadPosition = (playheadMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTimeFormatted = `${(playheadMs / 1000).toFixed(2)}`;
  const totalTimeFormatted = `${(durationMs / 1000).toFixed(2)}`;

  return (
    <footer className="col-span-3 flex h-64 flex-col border-t border-ui-border bg-ui-bg cursor-pointer">
      {/* ... Toolbar ... */}
      <div className="flex h-12 items-center justify-between border-b border-ui-border bg-ui-panel/30 px-4">
        {/* ... existing toolbar ... */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {/* ... playback controls ... */}
            <button
              onClick={() => setPlayhead(0)}
              className="rounded p-1.5 hover:bg-ui-highlight/40 flex items-center justify-center"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex w-8 h-8 items-center justify-center rounded-full bg-accent text-black"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setPlayhead(durationMs)}
              className="rounded p-1.5 hover:bg-ui-highlight/40 flex items-center justify-center"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          {/* ... Time Display ... */}
          <div className="text-[13px] font-mono text-accent">
            {currentTimeFormatted}s <span className="text-ui-text">/ {totalTimeFormatted}s</span>
          </div>

          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              showPresets ? 'bg-accent/20 text-accent' : 'text-ui-text hover:text-white'
            }`}
          >
            <Clapperboard className="w-4 h-4" />
            Animations
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(zoom - 0.25)} className="hover:text-white text-ui-muted">
              <ZoomOut className="w-4.5 h-4.5" />
            </button>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-ui-border">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${((zoom - 0.25) / 3.75) * 100}%` }}
              />
            </div>
            <button onClick={() => setZoom(zoom + 0.25)} className="hover:text-white text-ui-muted">
              <ZoomIn className="w-4.5 h-4.5" />
            </button>
            <span className="text-[10px] text-ui-muted font-mono w-10">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Animation Presets Panel */}
        {showPresets && (
          <div className="w-48 border-r border-ui-border bg-ui-panel/20 overflow-y-auto no-scrollbar flex-shrink-0">
            {/* ... content ... */}
            <div className="p-2 pb-6">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-ui-muted mb-3 px-1">
                Drag to Timeline
              </h3>

              {['Basic', 'Creative', '3D', 'Combo'].map((category) => {
                const categoryPresets = ANIMATION_PRESETS.filter(
                  (p) => (p.category || 'Basic') === category
                );
                if (categoryPresets.length === 0) return null;

                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="h-px flex-1 bg-ui-border/50" />
                      <span className="text-[9px] font-semibold text-ui-muted/80 uppercase tracking-wider">
                        {category}
                      </span>
                      <div className="h-px flex-1 bg-ui-border/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {categoryPresets.map((preset) => (
                        <AnimationPresetItem
                          key={preset.id}
                          preset={preset}
                          onDragStart={handlePresetDragStart}
                          onDoubleClick={handlePresetDoubleClick}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Track Labels - Added z-30, relative, bg-ui-bg to prevent scroll overlap */}
        <div className="flex w-28 flex-col text-[11px] font-medium uppercase text-ui-text flex-shrink-0 z-30 relative bg-ui-bg border-r border-ui-border shadow-md">
          <div className="flex h-8 items-center border-b border-ui-border px-3 text-[9px] tracking-widest bg-ui-panel/10">
            Tracks
          </div>
          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`flex h-14 items-center border-b border-ui-border px-3 hover:bg-ui-highlight/10 truncate gap-2 ${
                  track.type === 'audio' ? 'cursor-pointer' : ''
                }`}
                onClick={
                  track.type === 'audio' && track.clips.length === 0 ? handleAudioImport : undefined
                }
              >
                {track.type === 'audio' && <Music className="w-3 h-3 text-green-400" />}
                <span className="text-[10px] truncate flex-1">{track.name}</span>
                {track.type === 'audio' && track.clips.length === 0 && (
                  <span className="text-[8px] text-ui-muted">+ Add</span>
                )}
                {track.type === 'audio' && track.clips.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackMute(track.id);
                    }}
                    className={`p-1 rounded hover:bg-ui-highlight/30 ${track.muted ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {track.muted ? (
                      <VolumeX className="w-3.5 h-3.5" />
                    ) : (
                      <Volume2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div
          ref={timelineRef}
          className="relative flex-1 overflow-x-auto overflow-y-hidden z-10 select-none"
          onMouseDown={(e) => {
            // Only scrub if clicking on empty space (ruler or track bg, not clips)
            // Clips stopPropagation so this works
            handleScrubStart(e);
          }}
        >
          {/* Time Ruler */}
          <div className="relative flex h-8 items-center border-b border-ui-border bg-ui-panel/20">
            <div className="absolute inset-0 flex" style={{ width: `${totalWidth}px` }}>
              {timeMarkers.map((second) => (
                <div
                  key={second}
                  className="flex items-center border-r border-ui-border/50 px-2 text-[10px] font-mono text-ui-text/60 pointer-events-none"
                  style={{ width: `${PIXELS_PER_SECOND * zoom}px` }}
                >
                  {formatTime(second)}
                </div>
              ))}
            </div>
          </div>

          {/* Track Rows */}
          <div className="relative min-w-full" style={{ width: `${Math.max(totalWidth, 2000)}px` }}>
            {tracks.map((track) => (
              <div
                key={track.id}
                className="relative h-14 border-b border-ui-border bg-ui-panel/5 hover:bg-ui-panel/10 transition-colors group/track"
                onDrop={(e) => handleTrackDrop(e, track.id)}
                onDragOver={handleTrackDragOver}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none opacity-50">
                  {timeMarkers.map((second) => (
                    <div
                      key={second}
                      className="absolute top-0 bottom-0 border-l border-ui-border/20 group-hover/track:border-ui-border/30"
                      style={{ left: `${second * PIXELS_PER_SECOND * zoom}px` }}
                    />
                  ))}
                </div>

                {/* Clips container */}
                <div className="absolute inset-y-0 left-0 right-0">
                  {track.clips.map((clip) => (
                    <TimelineClipComponent
                      key={clip.id}
                      clip={clip}
                      zoom={zoom}
                      isSelected={selectedClipId === clip.id}
                      onSelect={() => selectClip(clip.id)}
                      onDragStart={(e, type) => handleClipDragStart(e, clip, type)}
                      onDelete={() => removeClip(clip.id)}
                    />
                  ))}
                </div>

                {/* Drop zone indicator */}
                {track.clips.length === 0 && (
                  <div className="absolute inset-2 flex items-center justify-center border-2 border-dashed border-ui-border/40 rounded-lg text-[10px] text-ui-muted uppercase tracking-widest font-medium group-hover/track:border-ui-border/60 group-hover/track:text-ui-text/60 transition-all pointer-events-none opacity-0 group-hover/track:opacity-100">
                    Drop {track.type} here
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 z-40 will-change-transform pointer-events-none"
            style={{ transform: `translateX(${playheadPosition}px)` }}
          >
            {/* Playhead line */}
            <div className="absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2 bg-accent shadow-[0_0_8px_var(--color-accent)] opacity-80" />

            {/* Playhead handle */}
            <div
              className="absolute -top-1 left-0 -translate-x-1/2 w-4 h-5 bg-accent rounded-b-md flex items-center justify-center shadow-lg cursor-ew-resize pointer-events-auto hover:bg-accent-hover transition-colors"
              onMouseDown={(e) => {
                e.stopPropagation();
                handleScrubStart(e);
              }}
            >
              <div className="w-0.5 h-2.5 bg-black/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
