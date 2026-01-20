export const Timeline = () => {
  return (
    <footer className="z-30 flex h-64 flex-col border-t border-[#2c393f] bg-[#141b1e]">
      <div className="flex h-12 items-center justify-between border-b border-[#2c393f] bg-[#1c2529]/30 px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button className="rounded p-1.5 hover:bg-[#1c3b4a]/40">
              <span className="material-symbols-outlined text-[20px]">skip_previous</span>
            </button>
            <button className="flex w-8 h-8 items-center justify-center rounded-full bg-[#d4ff3f] text-black">
              <span className="material-symbols-outlined">play_arrow</span>
            </button>
            <button className="rounded p-1.5 hover:bg-[#1c3b4a]/40">
              <span className="material-symbols-outlined text-[20px]">skip_next</span>
            </button>
          </div>
          <div className="text-[13px] font-mono text-[#d4ff3f]">
            00:00:03.12 <span className="text-[#9fb2bc]">/ 00:00:10.00</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#9fb2bc]">zoom_out</span>
            <div className="h-1 w-32 overflow-hidden rounded-full bg-[#2c393f]">
              <div className="h-full w-1/2 bg-[#1c3b4a]" />
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#9fb2bc]">zoom_in</span>
          </div>
          <button className="flex items-center gap-2 text-[11px] text-[#9fb2bc] hover:text-white">
            <span className="material-symbols-outlined text-[16px]">settings</span>
            Timeline Settings
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-48 flex-col text-[11px] font-medium uppercase text-[#9fb2bc]">
          <div className="flex h-8 items-center border-b border-[#2c393f] px-4">Timeline</div>
          <div className="flex-1 overflow-hidden">
            {[
              { icon: 'movie', label: 'Screenshot' },
              { icon: 'image', label: 'Background' },
              { icon: 'music_note', label: 'Audio' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex h-12 items-center gap-2 border-b border-[#2c393f] px-4 hover:bg-[#1c3b4a]/10 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex-1 overflow-x-auto overflow-y-hidden">
          <div className="relative flex h-8 min-w-[2000px] items-center border-b border-[#2c393f] bg-[#1c2529]/20">
            <div className="absolute inset-0 flex">
              {['0:00', '0:01', '0:02', '0:03', '0:04', '0:05', '0:06'].map((time) => (
                <div
                  key={time}
                  className="flex w-[200px] items-center border-r border-[#2c393f]/50 px-2 text-[10px] font-mono text-[#9fb2bc]/60"
                >
                  {time}
                </div>
              ))}
            </div>
          </div>

            <div className="relative min-w-[2000px] h-full">
               <div className="absolute top-0 bottom-0 left-[624px] z-40 w-0.5 bg-[#d4ff3f] shadow-[0_0_10px_rgba(212,255,63,0.5)] pointer-events-none">
                <div className="absolute top-0 -left-2 flex h-6 w-4.5 items-center justify-center rounded-b-sm bg-[#d4ff3f]">
                  <div className="h-3 w-0.5 bg-black/50" />
                </div>
              </div>
               {/* Empty State or Droppable Area */}
               <div className="flex h-full items-center justify-center text-[#2c393f] text-sm font-medium uppercase tracking-widest">
                  Drop Media to Start
               </div>
            </div>
        </div>
      </div>
    </footer>
  );
};
