import { useRenderStore } from '../store/renderStore';

export const SidePanel = () => {
  const { durationMs, fps, setDurationMs, setFps } = useRenderStore();

  return (
    <aside className="w-72 shrink-0 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur">
      <div className="flex h-full flex-col gap-6 p-4">
        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Device Config</h2>
          <div className="mt-3 space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-300">Model</span>
              <select className="h-11 rounded-xl border border-slate-800/80 bg-slate-900 px-3 text-sm font-semibold text-white outline-none ring-accent/30 focus:border-accent focus:ring-2">
                <option>iPhone 15 Pro Max</option>
                <option>MacBook Air</option>
                <option>Browser</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Corner Radius</span>
                <span className="font-mono text-accent">32px</span>
              </div>
              <input type="range" min={0} max={64} defaultValue={32} className="accent-accent" />
            </label>
            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Glow</span>
                <span className="font-mono text-accent">40%</span>
              </div>
              <input type="range" min={0} max={100} defaultValue={40} className="accent-accent" />
            </label>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500">Render Settings</h2>
          <div className="mt-3 space-y-4">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-300">Duration (ms)</span>
              <input
                type="number"
                value={durationMs}
                onChange={(e) => setDurationMs(Number(e.target.value))}
                className="h-11 rounded-xl border border-slate-800/80 bg-slate-900 px-3 text-sm font-semibold text-white outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-slate-300">FPS</span>
              <input
                type="number"
                value={fps}
                min={1}
                max={120}
                onChange={(e) => setFps(Number(e.target.value))}
                className="h-11 rounded-xl border border-slate-800/80 bg-slate-900 px-3 text-sm font-semibold text-white outline-none ring-accent/30 focus:border-accent focus:ring-2"
              />
            </label>
          </div>
        </section>

        <section className="mt-auto rounded-xl border border-slate-800/80 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>RAM Usage</span>
            <span className="text-accent">1.2GB / 4GB</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-accent to-lime-400" />
          </div>
        </section>
      </div>
    </aside>
  );
};
