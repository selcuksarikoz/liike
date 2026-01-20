import { useRenderStore } from '../store/renderStore';

export const SidebarRight = () => {
  const { setBackgroundGradient } = useRenderStore();

  return (
    <aside className="flex w-64 flex-col border-l border-ui-border bg-ui-bg">
      <div className="flex h-[300px] flex-col">
        <div className="border-b border-ui-border p-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-ui-muted">Presets</h2>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-2 overflow-y-auto p-3">
          {[
            'from-blue-500 to-purple-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-zinc-700 to-zinc-900',
          ].map((gradient) => (
            <div
              key={gradient}
              onClick={() => setBackgroundGradient(gradient)}
              className="group aspect-square cursor-pointer rounded-lg border border-ui-border bg-ui-panel p-2 transition-all hover:border-accent"
            >
              <div className={`h-full w-full rounded bg-gradient-to-tr ${gradient} opacity-40 transition-opacity group-hover:opacity-100`} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
