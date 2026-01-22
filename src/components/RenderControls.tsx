import { useMemo, useRef } from 'react';
import type { StreamingRenderApi } from '../hooks/useStreamingRender';
import { useRenderStore } from '../store/renderStore';

type Props = {
  stageRef: React.RefObject<HTMLElement>;
  loop: StreamingRenderApi;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const formatProgress = (value: number) => `${Math.round(value * 100)}%`;

export const RenderControls = ({ stageRef, loop }: Props) => {
  const { render, cancel, state } = loop;
  const { durationMs, fps, outputName, setDurationMs, setFps, setOutputName } = useRenderStore();
  const isBusy = state.isRendering;
  const durationSeconds = useMemo(() => (durationMs / 1000).toFixed(2), [durationMs]);
  const fpsInputRef = useRef<HTMLInputElement>(null);

  const handleRender = () => {
    render({
      node: stageRef.current,
      durationMs,
      fps,
      outputName,
    });
  };

  const progressWidth = `${Math.min(100, Math.max(0, state.progress * 100))}%`;

  return (
    <div className="w-full max-w-5xl rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-inner shadow-black/40 backdrop-blur">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-300">Duration</label>
            <input
              type="number"
              min={100}
              className="mt-1 w-32 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none ring-accent/20 focus:border-accent focus:ring-2"
              value={durationMs}
              onChange={(e) => setDurationMs(Number(e.target.value))}
            />
            <span className="text-[11px] text-slate-500">{durationSeconds}s</span>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-300">FPS</label>
            <input
              ref={fpsInputRef}
              type="number"
              min={1}
              max={120}
              className="mt-1 w-24 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none ring-accent/20 focus:border-accent focus:ring-2"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-300">Output name</label>
            <input
              type="text"
              className="mt-1 w-48 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-semibold text-slate-100 outline-none ring-accent/20 focus:border-accent focus:ring-2"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRender}
            disabled={isBusy}
            className={cx(
              'rounded-xl px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-300/20 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
              isBusy
                ? 'bg-slate-600 text-slate-200'
                : 'bg-gradient-to-r from-accent to-lime-300 hover:scale-[1.01]'
            )}
          >
            {isBusy ? 'Rendering…' : 'Render MP4'}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={!isBusy}
            className={cx(
              'rounded-xl px-4 py-2 text-sm font-semibold text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950',
              !isBusy ? 'border border-slate-800 hover:bg-slate-900' : 'border border-rose-400/70 text-rose-200 hover:bg-rose-500/10'
            )}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 overflow-hidden rounded-full bg-slate-900">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-accent via-lime-300 to-emerald-300 transition-[width]"
            style={{ width: progressWidth }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-200">{formatProgress(state.progress)}</span>
      </div>

      <div className="mt-2 text-xs text-slate-400">
        Frames: {state.currentFrame}/{state.totalFrames} · Output: {state.outputPath || 'temp'}{' '}
        {state.framesDir ? `(frames @ ${state.framesDir})` : ''}
      </div>

      {state.error ? (
        <div className="mt-3 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
          {state.error}
        </div>
      ) : null}
    </div>
  );
};
