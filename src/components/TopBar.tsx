import { useMemo } from 'react';
import type { RenderLoopApi } from '../hooks/useRenderLoop';

type Props = {
  onRender: () => void;
  loop: RenderLoopApi;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const TopBar = ({ onRender, loop, theme, toggleTheme }: Props) => {
  const { state } = loop;
  const statusLabel = useMemo(() => {
    if (state.error) return 'ERROR';
    if (state.isRendering) return 'RENDERING';
    return 'READY';
  }, [state.error, state.isRendering]);

  const statusTone = useMemo(() => {
    if (state.error) return 'bg-rose-400 text-rose-900';
    if (state.isRendering) return 'bg-amber-300 text-amber-950 animate-pulse';
    return 'bg-accent text-slate-900';
  }, [state.error, state.isRendering]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-5 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-slate-900 shadow-inner">
            L
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-400">Liike</p>
            <p className="text-sm font-semibold text-white">Render Pipeline</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full border border-slate-800/70 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-300 lg:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_0_3px_rgba(212,255,63,0.15)]" />
          <span className="uppercase tracking-[0.12em]">{statusLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-slate-800/60 bg-slate-900/70 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-accent/50 hover:text-accent transition"
        >
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          type="button"
          onClick={onRender}
          disabled={state.isRendering}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-accent to-lime-300 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-lime-300/20 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="h-2 w-2 rounded-full bg-slate-900" />
          {state.isRendering ? 'Rendering…' : 'Render MP4'}
        </button>
        <div className={`hidden items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] lg:flex ${statusTone}`}>
          {statusLabel}
        </div>
      </div>
    </header>
  );
};
