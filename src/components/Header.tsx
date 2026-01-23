import { getVersion } from '@tauri-apps/api/app';
import { downloadDir } from '@tauri-apps/api/path';
import { BaseDirectory, writeFile } from '@tauri-apps/plugin-fs';
import { Command } from '@tauri-apps/plugin-shell';
import { fetch } from '@tauri-apps/plugin-http';
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
          'https://tavggalbjqwdfobiaoec.supabase.co/storage/v1/object/public/liike-release/version.json'
        );
        if (response.ok) {
          const data = (await response.json()) as RemoteVersionInfo;
          console.log(data);
          // output current and remote versions for debugging
          console.log(`Current: ${ver}, Remote: ${data.version}`);

          const osType = await type();
          let downloadUrl = '';

          if (osType === 'macos') {
            downloadUrl = data.macos_download_url || data.download_url || '';
          } else if (osType === 'windows') {
            downloadUrl = data.windows_download_url || data.download_url || '';
          } else if (osType === 'linux') {
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
    setUpdateProgress(10);

    try {
      // 1. Download the file
      const response = await fetch(updateAvailable.url);
      if (!response.ok) throw new Error('Download failed');

      const contentLength = Number(response.headers.get('content-length')) || 0;
      let receivedLength = 0;

      // Simulate progress if content length is missing or for better UX during stream
      // Since fetch streaming in Tauri might be tricky with standard Response in some versions,
      // we'll use arrayBuffer() but simulate progress with an interval if needed.
      // Actually standard fetch supports arrayBuffer.

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      setUpdateProgress(50);

      // 2. Write to downloads folder (safe bet)
      const fileName = 'liike-update.zip';
      await writeFile(fileName, uint8Array, { baseDir: BaseDirectory.Download });

      setUpdateProgress(80);

      // 3. Unzip
      const downloadPath = await downloadDir();
      const filePath = `${downloadPath}/${fileName}`;
      const extractPath = `${downloadPath}/LiikeUpdate`;

      console.log('Unzipping:', filePath, 'to', extractPath);

      const unzip = Command.create('unzip', ['-o', filePath, '-d', extractPath]);

      const output = await unzip.execute();
      console.log('Unzip output:', output);

      // Open the folder (optional, or we could try to verify/swap)
      // For now just open it so user sees the update
      // const openCmd = Command.create('open', [extractPath]);
      // await openCmd.execute();

      setUpdateProgress(100);

      setTimeout(() => {
        setIsUpdating(false);
        // Reload app
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Update failed:', error);
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
      {/* Full Screen Render Overlay */}
      {renderStatus.isRendering && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
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

            {/* Cancel Button - Since cancel function is in parent, we might need to dispatch an event or use store 
                  However, Header receives onRender. Does it receive cancel? No.
                  We need to trigger cancellation via store if we can't access the hook handle.
                  
                  Earlier I decided to add cancelRender to store or similar.
                  Actually, if 'renderStatus.isRendering' is true, the loop is running.
                  If I add 'abortRequest' to store, the loop can check it.
                  
                  Let's modify useRenderStore to add 'abortRender' action, and useRenderLoop to watch it.
              */}
            <button
              onClick={() => {
                // Dispatch abort event that useRenderLoop listens to, OR
                // slightly hacky but effective: set a global flag or use store
                useRenderStore
                  .getState()
                  .setRenderStatus({ error: 'Cancelled by user', isRendering: false });
                // The loop needs to detect this change!
                // I will add a mechanism in useRenderLoop to watch this.
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
              <img src="logo.png" alt="" className="w-full h-full" />
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
