import { useRef, useEffect } from 'react';
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

  const { durationMs, fps, outputName, fastExport } = useRenderStore();

  const handleRender = (format: ExportFormat) => {
    loop.render({
      node: stageRef.current,
      durationMs,
      fps,
      outputName,
      format,
      captureScale: fastExport ? 0.8 : 0.1,
    });
  };

  return (
    <div className="h-screen bg-ui-bg text-white grid grid-rows-[auto_1fr_auto] grid-cols-[320px_1fr]">
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
