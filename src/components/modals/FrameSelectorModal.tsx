import { Modal } from './Modal';
import { useRenderStore } from '../../store/renderStore';

type FrameSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ASPECT_RATIOS = [
  { label: '1:1', width: 1080, height: 1080 },
  { label: '4:3', width: 1440, height: 1080 },
  { label: '3:4', width: 1080, height: 1440 },
  { label: '16:9', width: 1920, height: 1080 },
  { label: '9:16', width: 1080, height: 1920 },
  { label: '21:9', width: 2560, height: 1080 },
];

export const FrameSelectorModal = ({ isOpen, onClose }: FrameSelectorModalProps) => {
  const { canvasWidth, canvasHeight, setCanvasSize } = useRenderStore();

  const handleSelect = (ratio: typeof ASPECT_RATIOS[0]) => {
    setCanvasSize(ratio.width, ratio.height);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Aspect Ratio" position="center">
      <div className="p-4 grid grid-cols-3 gap-3">
        {ASPECT_RATIOS.map((ratio) => {
          const isActive = canvasWidth === ratio.width && canvasHeight === ratio.height;
          const ar = ratio.width / ratio.height;

          return (
            <button
              key={ratio.label}
              onClick={() => handleSelect(ratio)}
              className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                isActive
                  ? 'bg-accent/10 border-accent'
                  : 'bg-ui-panel border-ui-border hover:border-accent/50'
              }`}
            >
              <div
                className={`mb-3 border-2 ${isActive ? 'border-accent' : 'border-ui-muted/50 group-hover:border-accent/50'} transition-colors`}
                style={{
                  width: ar >= 1 ? '48px' : `${48 * ar}px`,
                  height: ar >= 1 ? `${48 / ar}px` : '48px',
                }}
              />
              <div className={`text-sm font-bold ${isActive ? 'text-accent' : 'text-white'}`}>
                {ratio.label}
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};
