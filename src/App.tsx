import { useRef } from 'react';
import { useRenderLoop } from './hooks/useRenderLoop';
import { useRenderStore } from './store/renderStore';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { SidebarRight } from './components/SidebarRight';
import { Workarea } from './components/Workarea';
import { Timeline } from './components/Timeline';

const App = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const loop = useRenderLoop();
  const { durationMs, fps, outputName } = useRenderStore();

  const handleRender = () => {
    loop.render({
      node: stageRef.current,
      durationMs,
      fps,
      outputName,
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
