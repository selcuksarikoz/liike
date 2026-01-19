import { useMemo, useRef } from 'react';
import { useRenderLoop } from '../hooks/useRenderLoop';
import { useRenderStore } from '../store/renderStore';

type Props = {
  stageRef: React.RefObject<HTMLElement>;
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const formatProgress = (value: number) => `${Math.round(value * 100)}%`;

export const RenderControls = ({ stageRef }: Props) => {
  const { render, cancel, state } = useRenderLoop();
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
    <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Duration</label>
            <input
              type="number"
              min={100}
              className="mt-1 w-32 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              value={durationMs}
              onChange={(e) => setDurationMs(Number(e.target.value))}
            />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{durationSeconds}s</span>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">FPS</label>
            <input
              ref={fpsInputRef}
              type="number"
              min={1}
              max={120}
              className="mt-1 w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
              value={fps}
              onChange={(e) => setFps(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Output name</label>
            <input
              type="text"
              className="mt-1 w-48 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900"
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
              'rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900',
              isBusy
                ? 'bg-slate-400 dark:bg-slate-600'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600'
            )}
          >
            {isBusy ? 'Rendering…' : 'Render MP4'}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={!isBusy}
            className={cx(
              'rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 dark:text-slate-100 dark:focus:ring-offset-slate-900',
              !isBusy
                ? 'border border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'
                : 'border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-400/70 dark:text-rose-200 dark:hover:bg-rose-500/10'
            )}
          >
            Cancel
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-[width]"
            style={{ width: progressWidth }}
          />
        </div>
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{formatProgress(state.progress)}</span>
      </div>

      <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
        Frames: {state.currentFrame}/{state.totalFrames} · Output: {state.outputPath || 'temp'}{' '}
        {state.framesDir ? `(frames @ ${state.framesDir})` : ''}
      </div>

      {state.error ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/40 dark:bg-rose-500/10 dark:text-rose-100">
          {state.error}
        </div>
      ) : null}
    </div>
  );
};
