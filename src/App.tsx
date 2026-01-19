import { useEffect, useRef, useState } from 'react';
import { RenderControls } from './components/RenderControls';
import { RenderStage } from './components/RenderStage';

const App = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 transition-colors dark:from-slate-950 dark:via-slate-900 dark:to-black dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Render Pipeline</p>
            <h1 className="text-3xl font-bold">Liike — Animation to MP4</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Capture the stage, write frames to temp, and stitch them via FFmpeg sidecar without exhausting memory.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-blue-400 dark:hover:text-blue-200 dark:focus:ring-blue-900"
          >
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-inner dark:bg-sky-400" />
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
        </header>

        <RenderStage stageRef={stageRef} />
        <RenderControls stageRef={stageRef} />
      </div>
    </div>
  );
};

export default App;
