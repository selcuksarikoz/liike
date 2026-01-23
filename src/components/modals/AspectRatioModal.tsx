import { Modal } from './Modal';
import { useRenderStore } from '../../store/renderStore';
import type { AspectRatio } from '../../store/renderStore';
import { ASPECT_RATIOS } from '../../constants/ui';

type AspectRatioModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AspectRatioModal = ({ isOpen, onClose }: AspectRatioModalProps) => {
  const { imageAspectRatio, setImageAspectRatio } = useRenderStore();

  const handleSelect = (value: AspectRatio) => {
    setImageAspectRatio(value);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Media Aspect Ratio" position="center">
      <div className="p-4">
        <div className="grid grid-cols-3 gap-3">
          {ASPECT_RATIOS.map(({ value, label, ratio }) => {
            const isActive = imageAspectRatio === value;

            return (
              <button
                key={value}
                onClick={() => handleSelect(value)}
                className={`group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                  isActive
                    ? 'bg-accent/10 border-accent'
                    : 'bg-ui-panel border-ui-border hover:border-accent/50'
                }`}
              >
                {/* Aspect Ratio Preview */}
                <div
                  className={`mb-3 border-2 ${isActive ? 'border-accent' : 'border-ui-muted/50 group-hover:border-accent/50'} transition-colors`}
                  style={{
                    width: ratio === null ? '40px' : ratio >= 1 ? '48px' : `${48 * ratio}px`,
                    height: ratio === null ? '40px' : ratio >= 1 ? `${48 / ratio}px` : '48px',
                    borderStyle: ratio === null ? 'dashed' : 'solid',
                  }}
                />

                <div
                  className={`text-sm font-bold mb-1 ${isActive ? 'text-accent' : 'text-white'}`}
                >
                  {value}
                </div>
                <div className="text-[10px] text-ui-muted text-center leading-tight">{label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
