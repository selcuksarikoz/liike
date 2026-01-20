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
    <div className="min-h-screen bg-[#0a0f12] text-white flex flex-col h-screen">
      <Header onRender={handleRender} />
      
      <main className="flex flex-1 overflow-hidden bg-[#141b1e]">
        <SidebarLeft />
        <Workarea stageRef={stageRef} />
        <SidebarRight />
      </main>

      <Timeline />
    </div>
  );
};

export default App;
