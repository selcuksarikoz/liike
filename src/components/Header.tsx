import { useMemo } from 'react';
import { Video, Undo2, Redo2 } from 'lucide-react';
import { useRenderLoop } from '../hooks/useRenderLoop';

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
    return 'READY';
  }, [loop.state.error, loop.state.isRendering]);

  return (
    <header className="col-span-3 flex h-14 items-center justify-between border-b border-ui-border bg-ui-bg px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex w-8 h-8 items-center justify-center rounded bg-accent text-black font-bold">
            <Video className="w-4.5 h-4.5" />
          </div>
          <h1 className="text-sm font-bold tracking-tight uppercase text-white">
            {/* // appname */}
          </h1>
        </div>
        <nav className="flex items-center gap-4 border-l border-ui-border pl-6">
          <div className="flex gap-1">
            <button className="p-1 rounded text-ui-muted hover:bg-ui-highlight/30 transition-all">
              <Undo2 className="w-5 h-5" />
            </button>
            <button className="p-1 rounded text-ui-muted hover:bg-ui-highlight/30 transition-all">
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-ui-highlight/40 bg-ui-highlight/20 px-3 py-1.5">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-mono text-accent">{statusLabel}</span>
        </div>
        <button
          className="flex h-9 items-center justify-center rounded-lg bg-accent px-6 text-sm font-bold text-black hover:bg-accent-hover transition-colors"
          onClick={onRender}
          disabled={loop.state.isRendering}
        >
          {loop.state.isRendering ? 'Rendering…' : 'Export'}
        </button>
        <div className="w-9 h-9 overflow-hidden rounded-full border border-ui-border bg-ui-highlight/40">
          <img className="h-full w-full object-cover" src={avatar} alt="User avatar" />
        </div>
      </div>
    </header>
  );
};
