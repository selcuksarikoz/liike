import { useRenderStore } from '../store/renderStore';

export const RenderOverlay = () => {
  const renderStatus = useRenderStore((state) => state.renderStatus);

  if (!renderStatus.isRendering) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/100 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md p-8 flex flex-col items-center gap-8">
        {/* Progress Circle */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-ui-border opacity-30" />
          <div className="w-32 h-32 rounded-full border-4 border-accent border-t-transparent animate-spin" />
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
          {renderStatus.phase === 'capturing' && (
            <p className="text-xs text-ui-muted font-mono">
              Frame {renderStatus.currentFrame} / {renderStatus.totalFrames}
            </p>
          )}
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
  );
};
