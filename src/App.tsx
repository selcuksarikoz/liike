import { useRef, useEffect } from 'react';
import { useStreamingRender } from './hooks/useStreamingRender';
import { useRenderStore } from './store/renderStore';
import type { ExportFormat } from './store/renderStore';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Workarea } from './components/Workarea';
import { Timeline } from './components/Timeline';
import { initializeFonts } from './services/fontService';

const App = () => {
  const stageRef = useRef<HTMLDivElement>(null);

  // Initialize fonts on app startup
  useEffect(() => {
    initializeFonts((progress, fontName) => {
      console.log(`[Fonts] ${Math.round(progress * 100)}% - ${fontName}`);
    }).catch(console.error);
  }, []);

  // Fast streaming hook for all formats (video & image)
  const loop = useStreamingRender();

  const { durationMs, fps, outputName } = useRenderStore();

  const handleRender = (format: ExportFormat) => {
    loop.render({
      node: stageRef.current,
      durationMs,
      fps,
      outputName,
      format,
    });
  };

  return (
    <div className="h-screen bg-ui-bg text-white grid grid-rows-[auto_1fr_auto] grid-cols-[320px_1fr_320px]">
      {/* Header - spans all columns */}
      <Header onRender={handleRender} />

      {/* Main content row */}
      <SidebarLeft />
      <Workarea stageRef={stageRef} />
      <SidebarRight />

      {/* Timeline - spans all columns */}
      <Timeline />
    </div>
  );
};

export default App;
