import { useMemo, useState, useRef } from 'react';
import type { StreamingRenderApi } from '../hooks/useStreamingRender';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

type Props = {
  loop: StreamingRenderApi;
};

export const TimelinePanel = ({ loop }: Props) => {
  const { durationMs, fps } = useRenderStore();
  const { tracks, playheadMs, isPlaying, setPlayhead, setIsPlaying } = useTimelineStore();
  const { state } = loop;

  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);

  const fallbackFrames = useMemo(() => Math.ceil((durationMs / 1000) * fps), [durationMs, fps]);
  const totalFrames = state.totalFrames || fallbackFrames;
  const runtimeLabel = useMemo(() => `${(durationMs / 1000).toFixed(2)}s @ ${fps}fps`, [durationMs, fps]);

  // Get active clips at current playhead position
  const activeClips = useMemo(() => {
    const active: { trackName: string; clipName: string; color: string }[] = [];
    tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (playheadMs >= clip.startMs && playheadMs < clip.startMs + clip.durationMs) {
          active.push({ trackName: track.name, clipName: clip.name, color: clip.color });
        }
      });
    });
    return active;
  }, [tracks, playheadMs]);

  return (
    <div className="rounded-2xl border border-ui-border/70 bg-ui-bg/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-ui-text">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <div className="relative flex items-center justify-center w-4 h-4">
            <span className={`absolute h-2 w-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-accent'} shadow-[0_0_0_3px_var(--color-accent-20)]`} />
            {!isPlaying && <span className="absolute inset-0 rounded-full border border-ui-border/50" />}
          </div>
          <span>Timeline Overview</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-ui-muted font-mono bg-ui-panel/40 px-2 py-0.5 rounded">
          <span>{runtimeLabel}</span>
          <span className="opacity-50">|</span>
          <span>Frame {state.currentFrame}/{totalFrames || '–'}</span>
        </div>
      </div>

      <div
        ref={timelineContainerRef}
        className="relative h-24 overflow-hidden rounded-xl border border-ui-border/80 bg-ui-panel/70 cursor-pointer"
        onMouseMove={(e) => {
          if (!timelineContainerRef.current) return;
          const rect = timelineContainerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = (x / rect.width) * 100;
          setHoverPosition(Math.max(0, Math.min(100, percent)));
        }}
        onMouseLeave={() => setHoverPosition(null)}
        onClick={(e) => {
          if (!timelineContainerRef.current) return;
          const rect = timelineContainerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const ms = (x / rect.width) * durationMs;
          setPlayhead(Math.max(0, Math.min(durationMs, ms)));
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,var(--color-accent-06),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.06),transparent_40%)]" />
        <div className="relative z-10 h-full px-3 py-3">
          <div className="flex h-full items-center gap-2">
            {tracks.map((track) => (
              <div key={track.id} className="group relative h-10 flex-1 rounded-lg bg-ui-panel/60">
                {/* Track clips preview */}
                {track.clips.map((clip) => {
                  const startPercent = (clip.startMs / durationMs) * 100;
                  const widthPercent = (clip.durationMs / durationMs) * 100;
                  return (
                    <div
                      key={clip.id}
                      className="absolute top-1/2 h-3 -translate-y-1/2 rounded-full group-hover:shadow-[0_0_0_6px_var(--color-accent-18)] transition-shadow"
                      style={{
                        left: `${startPercent}%`,
                        width: `${Math.max(widthPercent, 2)}%`,
                        backgroundColor: clip.color,
                      }}
                    />
                  );
                })}
                <span className="absolute left-2 top-2 text-[10px] font-semibold text-ui-text opacity-80">
                  {track.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Hover cursor indicator */}
        {hoverPosition !== null && (
          <div
            className="absolute inset-y-0 w-px bg-white/30 pointer-events-none z-20"
            style={{ left: `${hoverPosition}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-ui-panel text-[9px] font-mono text-white whitespace-nowrap">
              {((hoverPosition / 100) * durationMs / 1000).toFixed(2)}s
            </div>
          </div>
        )}

        {/* Playhead indicator */}
        <div
          className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-accent via-lime-300 to-transparent z-30 pointer-events-none"
          style={{ left: `${Math.min(100, (playheadMs / durationMs) * 100)}%` }}
        />
      </div>

      {/* Active clips indicator */}
      {activeClips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeClips.map((clip, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: `${clip.color}40` }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: clip.color }} />
              {clip.clipName}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
