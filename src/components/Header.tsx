import { useMemo, useState, useRef, useEffect } from 'react';
import { Video, Undo2, Redo2, ChevronDown, Film, Image as ImageIcon } from 'lucide-react';
import { useRenderStore, type ExportFormat } from '../store/renderStore';

const avatar =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCcsrYtTC_qy7rQZBsuZfyG4ZLH3oWBz2N86U22VRA38uY2NB4eqCVNq01tuQMIF6Ay7ZvbM9oBL7krtOJpIq6wTQ5N9zhEgR-f2yt-YxUvCEPq52WH6rfX8bW7Lu81Upf-9VY-BhEd2c8gmTrAr5qxfW23T871EUjkEv2GBGOSeRNwLnJwCSjoN4lawrs3R18HI-q7KPQUQrR5v2qJuUdCLCiUwMAjGkkc7P0mgeJ53mg-E3ZM30wLDqC5AvjNje98_pl1hjyPilY';

type ExportOption = {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const EXPORT_OPTIONS: ExportOption[] = [
  { id: 'webm', label: 'WebM Video', description: 'Best quality, VP9 codec', icon: <Film className="w-4 h-4" /> },
  { id: 'mov', label: 'MOV Video', description: 'ProRes, for editing', icon: <Film className="w-4 h-4" /> },
  { id: 'mp4', label: 'MP4 Video', description: 'Universal format', icon: <Film className="w-4 h-4" /> },
  { id: 'gif', label: 'GIF', description: 'Animated Image', icon: <ImageIcon className="w-4 h-4" /> },
  { id: 'png', label: 'PNG Image', description: 'Single frame export', icon: <ImageIcon className="w-4 h-4" /> },
];

type HeaderProps = {
  onRender: (format: ExportFormat) => void;
};

export const Header = ({ onRender }: HeaderProps) => {
  const { renderStatus } = useRenderStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statusLabel = useMemo(() => {
    if (renderStatus.error) return 'ERROR';
    if (renderStatus.isRendering) {
      if (renderStatus.phase === 'capturing') return `CAPTURING ${renderStatus.currentFrame}/${renderStatus.totalFrames}`;
      if (renderStatus.phase === 'encoding') return `ENCODING ${Math.round(renderStatus.progress * 100)}%`;
      return 'RENDERING';
    }
    return 'READY';
  }, [renderStatus]);

  const statusColor = useMemo(() => {
    if (renderStatus.error) return 'bg-red-500';
    if (renderStatus.isRendering) return 'bg-amber-500';
    return 'bg-accent';
  }, [renderStatus]);

  const handleExport = (format: ExportFormat) => {
    setIsDropdownOpen(false);
    onRender(format);
  };

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
          <div className={`w-2 h-2 rounded-full ${statusColor} ${renderStatus.isRendering ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-mono ${renderStatus.error ? 'text-red-400' : renderStatus.isRendering ? 'text-amber-400' : 'text-accent'}`}>
            {statusLabel}
          </span>
        </div>
        <div ref={dropdownRef} className="relative">
          <button
            className="flex h-9 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-bold text-black hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={renderStatus.isRendering}
          >
            {renderStatus.isRendering ? 'Rendering…' : 'Export'}
            {!renderStatus.isRendering && <ChevronDown className="w-4 h-4" />}
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 z-50 overflow-hidden rounded-xl border border-ui-border bg-ui-bg/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-1">
                {EXPORT_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left hover:bg-ui-highlight/50 transition-colors group"
                  >
                    <span className="text-ui-muted group-hover:text-accent transition-colors">
                      {option.icon}
                    </span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-white">{option.label}</div>
                      <div className="text-[10px] text-ui-muted">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="w-9 h-9 overflow-hidden rounded-full border border-ui-border bg-ui-highlight/40">
          <img className="h-full w-full object-cover" src={avatar} alt="User avatar" />
        </div>
      </div>
    </header>
  );
};
