import { useRef, useEffect, useState } from 'react';
import { useStreamingRender } from './hooks/useStreamingRender';
import { useRenderStore } from './store/renderStore';
import type { ExportFormat } from './store/renderStore';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { Workarea } from './components/Workarea';
import { Timeline } from './components/Timeline';
import { initializeFonts } from './services/fontService';
import { preloadDeviceImages } from './constants/devices';
import { getExportFolder } from './utils/renderUtils';

const App = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    code?: string;
    stack?: string;
  } | null>(null);

  // Initialize fonts, preload device images, and prompt export folder access on startup
  useEffect(() => {
    // Preload in parallel for faster startup
    Promise.all([
      initializeFonts((progress, fontName) => {
        console.log(`[Fonts] ${Math.round(progress * 100)}% - ${fontName}`);
      }),
      preloadDeviceImages(),
      getExportFolder(),
    ]).catch(console.error);
  }, []);

  // Global error modal for runtime errors (shows error code if present)
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      const anyErr = event.error as any;
      setErrorInfo({
        message: event.message || 'Unexpected error',
        code: anyErr?.code ? String(anyErr.code) : undefined,
        stack: anyErr?.stack ? String(anyErr.stack) : undefined,
      });
    };

    const onRejection = (event: PromiseRejectionEvent) => {
      const reason: any = event.reason;
      setErrorInfo({
        message: reason?.message ? String(reason.message) : String(reason || 'Unhandled rejection'),
        code: reason?.code ? String(reason.code) : undefined,
        stack: reason?.stack ? String(reason.stack) : undefined,
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  // Fast streaming hook for all formats (video & image)
  const loop = useStreamingRender();

  // Listen for cancel-render event from Header
  useEffect(() => {
    const handleCancelRender = () => {
      loop.cancel();
    };
    window.addEventListener('cancel-render', handleCancelRender);
    return () => window.removeEventListener('cancel-render', handleCancelRender);
  }, [loop.cancel]);

  const { durationMs, fps, outputName, fastExport, renderStatus, setRenderStatus } =
    useRenderStore();

  const handleRender = (format: ExportFormat) => {
    loop.render({
      node: stageRef.current,
      durationMs,
      fps,
      outputName,
      format,
      captureScale: fastExport ? 0.75 : 0.9,
    });
  };

  return (
    <div className="h-screen bg-ui-bg text-white grid grid-rows-[auto_1fr_auto] grid-cols-[320px_1fr]">
      {errorInfo && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg bg-ui-panel border border-ui-border rounded-xl p-5 shadow-2xl">
            <div className="text-sm font-bold text-red-400">Runtime Error</div>
            <div className="mt-2 text-sm text-white/90">{errorInfo.message}</div>
            {errorInfo.code && (
              <div className="mt-2 text-xs font-mono text-amber-300">Code: {errorInfo.code}</div>
            )}
            {errorInfo.stack && (
              <pre className="mt-3 max-h-48 overflow-auto text-[10px] text-ui-muted bg-black/40 rounded p-2">
                {errorInfo.stack}
              </pre>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setErrorInfo(null)}
                className="px-3 py-1.5 rounded-md bg-ui-highlight/40 text-white text-xs hover:bg-ui-highlight/60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {renderStatus.error && (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center">
          <div className="w-full max-w-lg bg-ui-panel border border-ui-border rounded-xl p-5 shadow-2xl">
            <div className="text-sm font-bold text-red-400">Export Error</div>
            <div className="mt-2 text-sm text-white/90">{renderStatus.error}</div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setRenderStatus({ error: null })}
                className="px-3 py-1.5 rounded-md bg-ui-highlight/40 text-white text-xs hover:bg-ui-highlight/60"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header - spans all columns */}
      <Header onRender={handleRender} />

      {/* Main content row */}
      <SidebarLeft />
      <Workarea stageRef={stageRef} />

      {/* Timeline - spans all columns */}
      <Timeline />
    </div>
  );
};

export default App;
