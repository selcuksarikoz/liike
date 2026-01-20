import { useMemo } from 'react';
import type { RenderLoopApi } from '../hooks/useRenderLoop';
import { useRenderStore } from '../store/renderStore';

type Props = {
  loop: RenderLoopApi;
};

const cues = [
  { label: 'Intro', start: 0, width: 18, tone: 'bg-blue-400/80' },
  { label: 'Action', start: 20, width: 30, tone: 'bg-cyan-400/80' },
  { label: 'Outro', start: 55, width: 25, tone: 'bg-lime-300/80' },
];

export const TimelinePanel = ({ loop }: Props) => {
  const { durationMs, fps } = useRenderStore();
  const { state } = loop;

  const fallbackFrames = useMemo(() => Math.ceil((durationMs / 1000) * fps), [durationMs, fps]);
  const totalFrames = state.totalFrames || fallbackFrames;
  const runtimeLabel = useMemo(() => `${(durationMs / 1000).toFixed(2)}s @ ${fps}fps`, [durationMs, fps]);

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between text-xs font-semibold text-slate-300">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_3px_rgba(212,255,63,0.2)]" />
          <span>Timeline</span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span>{runtimeLabel}</span>
          <span>Frame {state.currentFrame}/{totalFrames || '–'}</span>
        </div>
      </div>

      <div className="relative h-24 overflow-hidden rounded-xl border border-slate-800/80 bg-slate-900/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(212,255,63,0.06),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.06),transparent_40%)]" />
        <div className="relative z-10 h-full px-3 py-3">
          <div className="flex h-full items-center gap-2">
            {cues.map((cue) => (
              <div key={cue.label} className="group relative h-10 flex-1 rounded-lg bg-slate-800/60">
                <div
                  className={`absolute top-1/2 h-3 -translate-y-1/2 rounded-full ${cue.tone} group-hover:shadow-[0_0_0_6px_rgba(212,255,63,0.18)]`}
                  style={{ left: `${cue.start}%`, width: `${cue.width}%` }}
                />
                <span className="absolute left-2 top-2 text-[10px] font-semibold text-slate-200 opacity-80">{cue.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div
          className="absolute inset-y-0 w-[2px] bg-gradient-to-b from-accent via-lime-300 to-transparent"
          style={{ left: `${Math.min(100, state.progress * 100)}%` }}
        />
      </div>
    </div>
  );
};
