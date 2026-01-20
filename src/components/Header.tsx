import { useMemo } from 'react';
import { useRenderLoop } from '../hooks/useRenderLoop';
// import { useRenderStore } from '../store/renderStore'; // unused for now in header

const avatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcsrYtTC_qy7rQZBsuZfyG4ZLH3oWBz2N86U22VRA38uY2NB4eqCVNq01tuQMIF6Ay7ZvbM9oBL7krtOJpIq6wTQ5N9zhEgR-f2yt-YxUvCEPq52WH6rfX8bW7Lu81Upf-9VY-BhEd2c8gmTrAr5qxfW23T871EUjkEv2GBGOSeRNwLnJwCSjoN4lawrs3R18HI-q7KPQUQrR5v2qJuUdCLCiUwMAjGkkc7P0mgeJ53mg-E3ZM30wLDqC5AvjNje98_pl1hjyPilY';

type HeaderProps = {
  onRender: () => void;
};

export const Header = ({ onRender }: HeaderProps) => {
  const loop = useRenderLoop();

  const statusLabel = useMemo(() => {
    if (loop.state.error) return 'ERROR';
    if (loop.state.isRendering) return 'RENDERING';
    return 'FFMPEG READY';
  }, [loop.state.error, loop.state.isRendering]);

  return (
    <header className="flex h-14 items-center justify-between border-b border-[#2c393f] bg-[#141b1e] px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex w-8 h-8 items-center justify-center rounded bg-[#d4ff3f] text-black font-bold">
            <span className="material-symbols-outlined text-lg">video_camera_back</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase text-white">
            ShotGen <span className="text-[#d4ff3f]/80 font-normal">v1.2</span>
          </h1>
        </div>
        <nav className="flex items-center gap-4 border-l border-[#2c393f] pl-6">
          <button className="text-xs text-[#9fb2bc] hover:text-white transition-colors">Project_Final_v2.mp4</button>
          <div className="flex gap-1">
            <button className="p-1 rounded text-[#9fb2bc] hover:bg-[#1c3b4a]/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">undo</span>
            </button>
            <button className="p-1 rounded text-[#9fb2bc] hover:bg-[#1c3b4a]/30 transition-all">
              <span className="material-symbols-outlined text-[20px]">redo</span>
            </button>
          </div>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-[#1c3b4a]/40 bg-[#1c3b4a]/20 px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-[#d4ff3f] animate-pulse" />
          <span className="text-[10px] font-mono text-[#d4ff3f]">{statusLabel}</span>
        </div>
        <button
          className="flex h-9 items-center justify-center rounded-lg bg-[#d4ff3f] px-6 text-sm font-bold text-black hover:bg-[#c2eb30] transition-colors"
          onClick={onRender}
          disabled={loop.state.isRendering}
        >
          {loop.state.isRendering ? 'Rendering…' : 'Export'}
        </button>
        <div className="w-9 h-9 overflow-hidden rounded-full border border-[#2c393f] bg-[#1c3b4a]/40">
          <img className="h-full w-full object-cover" src={avatar} alt="User avatar" />
        </div>
      </div>
    </header>
  );
};
