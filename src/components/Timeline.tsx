import { useRef, useState, useCallback, useEffect } from 'react';
import { 
  X, SkipBack, Play, Pause, SkipForward, Clapperboard, ZoomOut, ZoomIn,
  Cloud, Trophy, Heart, Smartphone, Zap, RefreshCw, Magnet, Sparkles, 
  Box, BoxSelect, ArrowUpFromLine, Component, Maximize, Scan
} from 'lucide-react';
import { useTimelineStore, ANIMATION_PRESETS, type TimelineClip, type AnimationPreset } from '../store/timelineStore';
import { useRenderStore } from '../store/renderStore';

const MS_PER_SECOND = 1000;
const PIXELS_PER_SECOND = 200;

const getPresetIcon = (iconName: string, className?: string) => {
  const props = { className };
  switch (iconName) {
    case 'cloud': return <Cloud {...props} />;
    case 'sports_basketball': return <Trophy {...props} />;
    case 'favorite': return <Heart {...props} />;
    case 'vibration': return <Smartphone {...props} />; // Closest to vibration
    case 'broken_image': return <Zap {...props} />;
    case 'loop': return <RefreshCw {...props} />;
    case 'join_inner': return <Magnet {...props} />;
    case 'flare': return <Sparkles {...props} />;
    case '3d_rotation': return <Box {...props} />;
    case 'view_in_ar': return <BoxSelect {...props} />;
    case 'elevator': return <ArrowUpFromLine {...props} />;
    case 'bolt': return <Component {...props} />;
    case '360': return <Maximize {...props} />;
    case 'flip': return <Scan {...props} />;
    default: return <Clapperboard {...props} />;
  }
};

type DragState = {
  clipId: string;
  type: 'move' | 'resize-start' | 'resize-end';
  startX: number;
  initialStartMs: number;
  initialDurationMs: number;
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
  onDragStart: (e: React.MouseEvent, type: DragState['type']) => void;
  onDelete: () => void;
}) => {
  const width = (clip.durationMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;
  const left = (clip.startMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-lg cursor-pointer group ${
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
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-lg"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, 'resize-start');
        }}
      />

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
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-lg"
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart(e, 'resize-end');
        }}
      />

      {/* Duration tooltip on hover */}
      <div className="absolute top-0.5 left-1 px-1.5 py-0.5 bg-black/60 rounded text-[8px] text-white/80 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        {(clip.durationMs / 1000).toFixed(2)}s
      </div>
    </div>
  );
};

const AnimationPresetItem = ({
  preset,
  onDragStart,
}: {
  preset: AnimationPreset;
  onDragStart: (e: React.DragEvent, preset: AnimationPreset) => void;
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, preset)}
      className="flex flex-col items-center gap-1 p-2 rounded-lg bg-ui-panel hover:bg-ui-highlight cursor-grab active:cursor-grabbing transition-colors group"
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
        style={{ backgroundColor: preset.color }}
      >
        {getPresetIcon(preset.icon, "w-4 h-4 text-white")}
      </div>
      <span className="text-[9px] text-ui-text font-medium">{preset.name}</span>
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
  } = useTimelineStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is on an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      // Space: play/pause
      if (e.code === 'Space') {
        e.preventDefault();
        if (playheadMs >= durationMs && !isPlaying) {
          setPlayhead(0);
          setIsPlaying(true);
        } else {
          setIsPlaying(!isPlaying);
        }
      }

      // Backspace/Delete: remove selected clip
      if ((e.code === 'Backspace' || e.code === 'Delete') && selectedClipId) {
        e.preventDefault();
        removeClip(selectedClipId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playheadMs, durationMs, isPlaying, selectedClipId, setPlayhead, setIsPlaying, removeClip]);

  const totalWidth = (durationMs / MS_PER_SECOND) * PIXELS_PER_SECOND * zoom;
  const timeMarkers = Array.from(
    { length: Math.ceil(durationMs / MS_PER_SECOND) + 1 },
    (_, i) => i
  );

  // Handle dragging
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !timelineRef.current) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaMs = (deltaX / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND;

      if (dragState.type === 'move') {
        const newStartMs = Math.max(0, dragState.initialStartMs + deltaMs);
        moveClip(dragState.clipId, newStartMs);
      } else if (dragState.type === 'resize-end') {
        const newDuration = Math.max(100, dragState.initialDurationMs + deltaMs);
        resizeClip(dragState.clipId, newDuration);
      } else if (dragState.type === 'resize-start') {
        const newDuration = Math.max(100, dragState.initialDurationMs - deltaMs);
        resizeClip(dragState.clipId, newDuration, true);
      }
    },
    [dragState, zoom, moveClip, resizeClip]
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

  const handleClipDragStart = (
    e: React.MouseEvent,
    clip: TimelineClip,
    type: DragState['type']
  ) => {
    e.preventDefault();
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
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'animation-preset', preset }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleTrackDrop = (e: React.DragEvent, trackId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (!data || !timelineRef.current) return;

    try {
      const parsed = JSON.parse(data);
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const startMs = Math.max(0, (x / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND);

      if (parsed.type === 'animation-preset') {
        const preset = parsed.preset as AnimationPreset;
        addClip(trackId, {
          trackId,
          type: 'animation',
          name: preset.name,
          startMs,
          durationMs: preset.duration,
          color: preset.color,
          icon: preset.icon,
          data: { animationPreset: preset },
        });
      } else if (parsed.type === 'layout-preset') {
        const preset = parsed.preset;
        const hasAnimation = preset.animations?.some((a: { type: string }) => a.type !== 'none');

        if (hasAnimation) {
          addClip(trackId, {
            trackId,
            type: 'animation',
            name: preset.name,
            startMs,
            durationMs: preset.durationMs,
            color: preset.color,
            icon: preset.icon,
            data: {
              animationPreset: {
                id: preset.id,
                name: preset.name,
                animations: preset.animations.map((a: { type: string }) => a.type).filter((t: string) => t !== 'none'),
                icon: preset.icon,
                color: preset.color,
                duration: preset.durationMs,
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

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ms = Math.max(0, (x / (PIXELS_PER_SECOND * zoom)) * MS_PER_SECOND);
    setPlayhead(ms);
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
      {/* Toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-ui-border bg-ui-panel/30 px-4">
        <div className="flex items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
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

          {/* Time Display */}
          <div className="text-[13px] font-mono text-accent">
            {currentTimeFormatted}s <span className="text-ui-text">/ {totalTimeFormatted}s</span>
          </div>

          {/* Toggle Presets Panel */}
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
            <span className="text-[10px] text-ui-muted font-mono w-10">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Animation Presets Panel */}
        {showPresets && (
          <div className="w-48 border-r border-ui-border bg-ui-panel/20 overflow-y-auto no-scrollbar">
            <div className="p-2 pb-6">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-ui-muted mb-3 px-1">
                Drag to Timeline
              </h3>
              
              {/* Group by category */}
              {['Basic', 'Creative', '3D', 'Combo'].map((category) => {
                const categoryPresets = ANIMATION_PRESETS.filter(p => (p.category || 'Basic') === category);
                if (categoryPresets.length === 0) return null;
                
                return (
                  <div key={category} className="mb-4 last:mb-0">
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="h-px flex-1 bg-ui-border/50" />
                      <span className="text-[9px] font-semibold text-ui-muted/80 uppercase tracking-wider">{category}</span>
                      <div className="h-px flex-1 bg-ui-border/50" />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {categoryPresets.map((preset) => (
                        <AnimationPresetItem
                          key={preset.id}
                          preset={preset}
                          onDragStart={handlePresetDragStart}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Track Labels */}
        <div className="flex w-28 flex-col text-[11px] font-medium uppercase text-ui-text flex-shrink-0">
          <div className="flex h-8 items-center border-b border-ui-border px-3 text-[9px] tracking-widest">
            Tracks
          </div>
          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex h-14 items-center border-b border-ui-border px-3 hover:bg-ui-highlight/10"
              >
                <span className="text-[10px]">{track.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div
          ref={timelineRef}
          className="relative flex-1 overflow-x-auto overflow-y-hidden z-10"
          onClick={handleTimelineClick}
        >
          {/* Time Ruler */}
          <div className="relative flex h-8 items-center border-b border-ui-border bg-ui-panel/20">
            <div className="absolute inset-0 flex" style={{ width: `${totalWidth}px` }}>
              {timeMarkers.map((second) => (
                <div
                  key={second}
                  className="flex items-center border-r border-ui-border/50 px-2 text-[10px] font-mono text-ui-text/60"
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
                <div className="absolute inset-0 pointer-events-none">
                  {timeMarkers.map((second) => (
                    <div
                      key={second}
                      className="absolute top-0 bottom-0 border-l border-ui-border/20 group-hover/track:border-ui-border/30"
                      style={{ left: `${second * PIXELS_PER_SECOND * zoom}px` }}
                    />
                  ))}
                </div>

                {/* Clips container with slight padding */}
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

                {/* Drop zone indicator - visible when empty */}
                {track.clips.length === 0 && (
                  <div className="absolute inset-2 flex items-center justify-center border-2 border-dashed border-ui-border/40 rounded-lg text-[10px] text-ui-muted uppercase tracking-widest font-medium group-hover/track:border-ui-border/60 group-hover/track:text-ui-text/60 transition-all pointer-events-none">
                    Drop {track.type} here
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Playhead - GPU accelerated with transform */}
          <div
            className="absolute top-0 bottom-0 z-40 pointer-events-none will-change-transform"
            style={{ transform: `translateX(${playheadPosition}px)` }}
          >
            {/* Playhead line */}
            <div className="absolute top-0 bottom-0 left-0 w-0.5 -translate-x-1/2 bg-accent shadow-[0_0_8px_var(--color-accent)] opacity-80" />
            
            {/* Playhead handle */}
            <div className="absolute -top-1 left-0 -translate-x-1/2 w-4 h-5 bg-accent rounded-b-md flex items-center justify-center shadow-lg cursor-ew-resize pointer-events-auto hover:bg-accent-hover transition-colors">
              <div className="w-0.5 h-2.5 bg-black/40 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
