import { getVersion } from '@tauri-apps/api/app';
import { downloadDir } from '@tauri-apps/api/path';
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
import { Command } from '@tauri-apps/plugin-shell';
import { fetch } from '@tauri-apps/plugin-http';
import { type as osType } from '@tauri-apps/plugin-os';
import { ChevronDown, Download, Film, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';
import type { ExportFormat } from '../store/renderStore';

type ExportOption = {
  id: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const EXPORT_OPTIONS: ExportOption[] = [
  {
    id: 'webm',
    label: 'WebM Video',
    description: 'Best quality, VP9 codec',
    icon: <Film className="w-4 h-4" />,
  },
  {
    id: 'mov',
    label: 'MOV Video',
    description: 'HEVC, Apple compatible',
    icon: <Film className="w-4 h-4" />,
  },
  {
    id: 'mp4',
    label: 'MP4 Video',
    description: 'Universal format',
    icon: <Film className="w-4 h-4" />,
  },
  {
    id: 'gif',
    label: 'GIF',
    description: 'Animated Image',
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: 'png',
    label: 'PNG Image',
    description: 'Transparent background',
    icon: <ImageIcon className="w-4 h-4" />,
  },
  {
    id: 'webp',
    label: 'WebP Image',
    description: 'Smaller, transparent',
    icon: <ImageIcon className="w-4 h-4" />,
  },
];

type HeaderProps = {
  onRender: (format: ExportFormat) => void;
};

const FPS_OPTIONS = [30, 50, 60] as const;

type VersionInfo = {
  version: string;
  url: string;
  notes?: string;
};

type RemoteVersionInfo = {
  version: string;
  macos_download_url?: string;
  windows_download_url?: string;
  linux_download_url?: string;
  download_url?: string; // fallback
  release_notes?: string;
};

export const Header = ({ onRender }: HeaderProps) => {
  const { renderStatus, fps, setFps, renderQuality, setRenderQuality } = useRenderStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [appVersion, setAppVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState<VersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const checkVersion = async () => {
      // Guard against running in browser (non-Tauri) environment
      if (typeof window !== 'undefined' && !('__TAURI__' in window)) {
        console.log('Running in browser mode, skipping update check');
        setAppVersion('1.0.0-dev');
        return;
      }

      try {
        const ver = await getVersion();
        setAppVersion(ver);

        const response = await fetch(
          'https://tavggalbjqwdfobiaoec.supabase.co/storage/v1/object/public/liike-release/version.json',
          {
            headers: {
              'Cache-Control': 'no-cache',
            },
          }
        );
        if (response.ok) {
          const data = (await response.json()) as RemoteVersionInfo;
          console.log(data);
          // output current and remote versions for debugging
          console.log(`Current: ${ver}, Remote: ${data.version}`);

          const currentOS = osType();
          let downloadUrl = '';

          if (currentOS === 'macos') {
            downloadUrl = data.macos_download_url || data.download_url || '';
          } else if (currentOS === 'windows') {
            downloadUrl = data.windows_download_url || data.download_url || '';
          } else if (currentOS === 'linux') {
            downloadUrl = data.linux_download_url || data.download_url || '';
          } else {
            downloadUrl = data.download_url || '';
          }

          // Simple semantic version comparison (assuming x.y.z)
          if (data.version !== ver && downloadUrl) {
            // Basic check: if strings differ, assume update (or could do proper semver compare)
            // For now, let's assume if they don't match, it's an update,
            // ideally we should check if remote > current.
            const v1 = ver.split('.').map(Number);
            const v2 = data.version.split('.').map(Number);

            let hasUpdate = false;
            for (let i = 0; i < 3; i++) {
              if (v2[i] > v1[i]) {
                hasUpdate = true;
                break;
              } else if (v2[i] < v1[i]) {
                break;
              }
            }

            if (hasUpdate) {
              setUpdateAvailable({
                version: data.version,
                url: downloadUrl,
                notes: data.release_notes,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    checkVersion();
  }, []);

  const handleUpdate = async () => {
    if (!updateAvailable) return;

    setIsUpdating(true);
    setUpdateProgress(5);
    setUpdateError(null);

    try {
      // 1. Download the file
      const response = await fetch(updateAvailable.url);
      if (!response.ok) throw new Error('Download failed');

      setUpdateProgress(20);
      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      setUpdateProgress(45);

      // 2. Write to downloads folder (safe bet)
      const fileName = 'liike-update.zip';
      await writeFile(fileName, uint8Array, { baseDir: BaseDirectory.Download });

      setUpdateProgress(75);

      // 3. Unzip
      const downloadPath = await downloadDir();
      const filePath = `${downloadPath}/${fileName}`;
      const extractPath = `${downloadPath}/LiikeUpdate`;

      console.log('Unzipping:', filePath, 'to', extractPath);

      const currentOS = osType();

      // Cross-platform unzip
      if (currentOS === 'windows') {
        const unzip = Command.create('powershell', [
          '-Command',
          `Expand-Archive -Path "${filePath}" -DestinationPath "${extractPath}" -Force`,
        ]);
        await unzip.execute();
      } else {
        const unzip = Command.create('unzip', ['-o', filePath, '-d', extractPath]);
        await unzip.execute();
      }

      setUpdateProgress(96);

      // Open folder so user can install manually
      if (currentOS === 'macos') {
        await Command.create('open', [extractPath]).execute();
      } else if (currentOS === 'windows') {
        await Command.create('cmd', ['/c', 'start', extractPath]).execute();
      } else {
        await Command.create('xdg-open', [extractPath]).execute();
      }

      setUpdateProgress(100);

      setTimeout(() => {
        setIsUpdating(false);
        setUpdateAvailable(null);
      }, 1500);
    } catch (error) {
      console.error('Update failed:', error);
      setUpdateError(error instanceof Error ? error.message : 'Update failed');
      setIsUpdating(false);
    }
  };

  const statusLabel = useMemo(() => {
    if (renderStatus.error) return 'ERROR';
    if (renderStatus.isRendering) {
      if (renderStatus.phase === 'capturing')
        return `CAPTURING ${renderStatus.currentFrame}/${renderStatus.totalFrames}`;
      if (renderStatus.phase === 'encoding')
        return `ENCODING ${Math.round(renderStatus.progress * 100)}%`;
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
    <>
      {/* Update Error Toast */}
      {updateError && (
        <div className="fixed top-4 right-4 z-101 bg-red-500/90 text-white px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-200 flex items-center gap-3">
          <span className="text-sm">{updateError}</span>
          <button onClick={() => setUpdateError(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Full Screen Update Overlay */}
      {isUpdating && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md p-8 flex flex-col items-center gap-6">
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white font-mono">{updateProgress}%</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Updating Liike</h2>
              <p className="text-sm text-ui-muted">
                {updateProgress < 40
                  ? 'Downloading update...'
                  : updateProgress < 70
                    ? 'Saving file...'
                    : updateProgress < 95
                      ? 'Extracting...'
                      : 'Opening folder...'}
              </p>
            </div>
            <div className="w-full bg-ui-highlight/30 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${updateProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Render Overlay */}
      {renderStatus.isRendering && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/100 backdrop-blur-md animate-in fade-in duration-300">
          <div className="w-full max-w-md p-8 flex flex-col items-center gap-8">
            {/* Progress Circle or Bar */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-ui-border opacity-30"></div>
              <div className="w-32 h-32 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-3xl font-bold text-white font-mono">
                  {Math.round(renderStatus.progress * 100)}%
                </span>
                <span className="text-[10px] text-ui-muted uppercase tracking-widest mt-1">
                  {renderStatus.phase === 'encoding' ? 'Encoding' : 'Capturing'}
                </span>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white">Exporting Video</h2>
              <p className="text-sm text-ui-muted max-w-xs mx-auto">
                Please keep this window in the foreground while we capture your masterpiece.
              </p>
            </div>

            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('cancel-render'));
              }}
              className="mt-8 px-8 py-3 rounded-full bg-ui-panel border border-ui-border text-ui-muted hover:bg-ui-highlight hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              Cancel Export
            </button>
          </div>
        </div>
      )}

      <header className="col-span-3 flex h-14 items-center justify-between border-b border-ui-border bg-ui-bg px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex w-8 h-8 items-center justify-center rounded-md overflow-hidden bg-accent text-black font-bold">
              <img src="logo.png" alt="" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-bold tracking-tight uppercase text-white flex items-center gap-2">
              Liike{' '}
              <span className="text-[10px] text-ui-muted font-normal bg-ui-highlight/20 px-1.5 py-0.5 rounded-md">
                v{appVersion}
              </span>
            </h1>
            {updateAvailable && (
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="ml-2 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {updateProgress}%
                  </>
                ) : (
                  <>
                    <Download className="w-3 h-3" />
                    Update
                  </>
                )}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://www.buymeacoffee.com/funnyturkishdude"
              target="_blank"
              className="w-28"
            >
              <img
                alt="Buy Me A Beer"
                src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
                style={{
                  height: '60px !important',
                  width: '217px !important',
                }}
              />
            </a>
          </div>

          {/* <nav className="flex items-center gap-4 border-l border-ui-border pl-6">
          <div className="flex gap-1">
            <button className="p-1 rounded text-ui-muted hover:bg-ui-highlight/30 transition-all">
              <Undo2 className="w-5 h-5" /> 
            </button>
            <button className="p-1 rounded text-ui-muted hover:bg-ui-highlight/30 transition-all">
              <Redo2 className="w-5 h-5" />
            </button>
          </div>
        </nav> */}
        </div>
        <div className="flex items-center gap-4">
          {/* <div className="flex items-center gap-2 rounded-lg border border-ui-highlight/40 bg-ui-highlight/20 px-3 py-1.5">
          <div className={`w-2 h-2 rounded-full ${statusColor} ${renderStatus.isRendering ? 'animate-pulse' : ''}`} />
          <span className={`text-[10px] font-mono ${renderStatus.error ? 'text-red-400' : renderStatus.isRendering ? 'text-amber-400' : 'text-accent'}`}>
            {statusLabel}
          </span>
        </div> */}
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
                <div className="px-3 py-2.5 border-b border-ui-border">
                  <div className="text-[10px] text-ui-muted uppercase tracking-wider mb-2">
                    Frame Rate
                  </div>
                  <div className="flex gap-1">
                    {FPS_OPTIONS.map((fpsOption) => (
                      <button
                        key={fpsOption}
                        onClick={() => setFps(fpsOption)}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          fps === fpsOption
                            ? 'bg-accent text-black'
                            : 'bg-ui-highlight/30 text-ui-muted hover:bg-ui-highlight/50 hover:text-white'
                        }`}
                      >
                        {fpsOption}fps
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality Selector */}
                <div className="px-3 py-2.5 border-b border-ui-border">
                  <div className="text-[10px] text-ui-muted uppercase tracking-wider mb-2">
                    Quality
                  </div>
                  <div className="flex gap-1">
                    {(['1080p', '4k'] as const).map((q) => (
                      <button
                        key={q}
                        onClick={() => setRenderQuality(q)}
                        className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                          renderQuality === q
                            ? 'bg-accent text-black'
                            : 'bg-ui-highlight/30 text-ui-muted hover:bg-ui-highlight/50 hover:text-white'
                        }`}
                      >
                        {q.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
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
          {/* <div className="w-9 h-9 overflow-hidden rounded-full border border-ui-border bg-ui-highlight/40">
          <img className="h-full w-full object-cover" src={avatar} alt="User avatar" />
        </div> */}
        </div>
      </header>
    </>
  );
};
