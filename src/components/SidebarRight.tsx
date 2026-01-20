import { useRenderStore } from '../store/renderStore';

export const SidebarRight = () => {
  const { setBackgroundGradient } = useRenderStore();

  return (
    <aside className="flex w-64 flex-col border-l border-[#2c393f] bg-[#141b1e]">
      <div className="flex flex-1 flex-col border-b border-[#2c393f]">
        <div className="flex items-center justify-between border-b border-[#2c393f] p-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Layers</h2>
          <button className="rounded p-1 transition-all hover:bg-[#1c3b4a]/40">
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
          </button>
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto p-2">
          {[
            { icon: 'smartphone', label: 'iPhone 15 Pro', active: true },
            { icon: 'image', label: 'Scene Background' },
            { icon: 'flare', label: 'Lens Flare Overlay' },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-lg p-2 ${
                item.active
                  ? 'border border-[#1c3b4a]/40 bg-[#1c3b4a]/30'
                  : 'border border-transparent hover:bg-[#1c3b4a]/10'
              } transition-all`}
            >
              <span className={`material-symbols-outlined text-[18px] ${item.active ? 'text-[#d4ff3f]' : 'text-[#9fb2bc]'}`}>
                {item.icon}
              </span>
              <span className="flex-1 text-xs">{item.label}</span>
              <span className="material-symbols-outlined text-[16px] text-[#9fb2bc]">visibility</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-[300px] flex-col">
        <div className="border-b border-[#2c393f] p-3">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Presets</h2>
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
              className="group aspect-square cursor-pointer rounded-lg border border-[#2c393f] bg-[#1c2529] p-2 transition-all hover:border-[#d4ff3f]"
            >
              <div className={`h-full w-full rounded bg-gradient-to-tr ${gradient} opacity-40 transition-opacity group-hover:opacity-100`} />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
