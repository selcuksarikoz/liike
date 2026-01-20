import { useRef, useState, useCallback, useEffect } from 'react';
import { useTimelineStore, ANIMATION_PRESETS, type TimelineClip, type AnimationPreset } from '../store/timelineStore';
import { useRenderStore } from '../store/renderStore';

const MS_PER_SECOND = 1000;
const PIXELS_PER_SECOND = 200;

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
        isSelected ? 'ring-2 ring-accent ring-offset-1 ring-offset-[#1c2529]' : ''
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

      {/* Clip content */}
      <div className="flex items-center h-full px-2 overflow-hidden">
        <span className="material-symbols-outlined text-[14px] text-white/80 mr-1">
          {clip.icon}
        </span>
        <span className="text-[10px] font-medium text-white/90 truncate">
          {clip.name}
        </span>
      </div>

      {/* Delete button - visible when selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-6 right-0 w-5 h-5 rounded bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <span className="material-symbols-outlined text-[12px] text-white">delete</span>
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
      <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-black/80 rounded text-[9px] text-white font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
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
        <span className="material-symbols-outlined text-[16px] text-white">
          {preset.icon}
        </span>
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
    <footer className="col-span-3 flex h-64 flex-col border-t border-ui-border bg-ui-bg">
      {/* Toolbar */}
      <div className="flex h-12 items-center justify-between border-b border-[#2c393f] bg-[#1c2529]/30 px-4">
        <div className="flex items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPlayhead(0)}
              className="rounded p-1.5 hover:bg-[#1c3b4a]/40"
            >
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex w-8 h-8 items-center justify-center rounded-full bg-[#d4ff3f] text-black"
            >
              <span className="material-symbols-outlined">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={() => setPlayhead(durationMs)}
              className="rounded p-1.5 hover:bg-[#1c3b4a]/40"
            >
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>

          {/* Time Display */}
          <div className="text-[13px] font-mono text-[#d4ff3f]">
            {currentTimeFormatted}s <span className="text-[#9fb2bc]">/ {totalTimeFormatted}s</span>
          </div>

          {/* Toggle Presets Panel */}
          <button
            onClick={() => setShowPresets(!showPresets)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
              showPresets ? 'bg-accent/20 text-accent' : 'text-[#9fb2bc] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">animation</span>
            Animations
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setZoom(zoom - 0.25)} className="hover:text-white text-[#9fb2bc]">
              <span className="material-symbols-outlined text-[18px]">zoom_out</span>
            </button>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-[#2c393f]">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${((zoom - 0.25) / 3.75) * 100}%` }}
              />
            </div>
            <button onClick={() => setZoom(zoom + 0.25)} className="hover:text-white text-[#9fb2bc]">
              <span className="material-symbols-outlined text-[18px]">zoom_in</span>
            </button>
            <span className="text-[10px] text-[#9fb2bc] font-mono w-10">{Math.round(zoom * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Animation Presets Panel */}
        {showPresets && (
          <div className="w-48 border-r border-[#2c393f] bg-[#1c2529]/20 overflow-y-auto no-scrollbar">
            <div className="p-2">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-ui-muted mb-2 px-1">
                Drag to Timeline
              </h3>
              <div className="grid grid-cols-3 gap-1">
                {ANIMATION_PRESETS.map((preset) => (
                  <AnimationPresetItem
                    key={preset.id}
                    preset={preset}
                    onDragStart={handlePresetDragStart}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Track Labels */}
        <div className="flex w-28 flex-col text-[11px] font-medium uppercase text-[#9fb2bc] flex-shrink-0">
          <div className="flex h-8 items-center border-b border-[#2c393f] px-3 text-[9px] tracking-widest">
            Tracks
          </div>
          <div className="flex-1 overflow-hidden">
            {tracks.map((track) => (
              <div
                key={track.id}
                className="flex h-12 items-center border-b border-[#2c393f] px-3 hover:bg-[#1c3b4a]/10"
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
          <div className="relative flex h-8 items-center border-b border-[#2c393f] bg-[#1c2529]/20">
            <div className="absolute inset-0 flex" style={{ width: `${totalWidth}px` }}>
              {timeMarkers.map((second) => (
                <div
                  key={second}
                  className="flex items-center border-r border-[#2c393f]/50 px-2 text-[10px] font-mono text-[#9fb2bc]/60"
                  style={{ width: `${PIXELS_PER_SECOND * zoom}px` }}
                >
                  {formatTime(second)}
                </div>
              ))}
            </div>
          </div>

          {/* Track Rows */}
          <div className="relative" style={{ width: `${Math.max(totalWidth, 2000)}px` }}>
            {tracks.map((track) => (
              <div
                key={track.id}
                className="relative left-4 h-12 border-b border-[#2c393f] bg-[#1c2529]/10"
                onDrop={(e) => handleTrackDrop(e, track.id)}
                onDragOver={handleTrackDragOver}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  {timeMarkers.map((second) => (
                    <div
                      key={second}
                      className="absolute top-0 bottom-0 border-l border-[#2c393f]/30"
                      style={{ left: `${second * PIXELS_PER_SECOND * zoom}px` }}
                    />
                  ))}
                </div>

                {/* Clips */}
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

                {/* Drop zone indicator */}
                {track.clips.length === 0 && (
                  <div className="absolute inset-y-2 left-2 right-2 flex items-center justify-center border border-dashed border-[#2c393f] rounded-lg text-[10px] text-[#2c393f] uppercase tracking-widest">
                    Drop {track.type} here
                  </div>
                )}
              </div>
            ))}

            {/* Playhead */}
            <div
              className="absolute top-0 bottom-0 z-40 w-0.5 bg-[#d4ff3f] shadow-[0_0_10px_rgba(212,255,63,0.5)] pointer-events-none"
              style={{ left: `${playheadPosition}px` }}
            >
              <div className="absolute -top-8 -left-2 flex h-6 w-4.5 items-center justify-center rounded-b-sm bg-[#d4ff3f]">
                <div className="h-3 w-0.5 bg-black/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
