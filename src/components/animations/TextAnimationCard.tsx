import type { TextDevicePreset } from '../../constants/textAnimations';

type Props = {
  preset: TextDevicePreset;
  isActive: boolean;
  onApply: () => void;
};

export const TextAnimationCard = ({ preset, isActive, onApply }: Props) => (
  <button
    onClick={onApply}
    className={`w-full p-4 rounded-xl border text-left transition-all ${
      isActive
        ? 'bg-accent/10 border-accent'
        : 'bg-ui-panel/50 border-ui-border hover:border-accent/50'
    }`}
  >
    <div className="flex items-start gap-3">
      {preset.icon && <span className="text-xl mt-0.5">{preset.icon}</span>}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-bold mb-1 ${isActive ? 'text-accent' : 'text-white'}`}>
          {preset.name}
        </div>
        <div className="text-[11px] text-white/90 font-medium">{preset.headline}</div>
        <div className="text-[10px] text-ui-muted">{preset.tagline}</div>
      </div>
      <div className="text-[9px] text-ui-muted whitespace-nowrap">
        {preset.durationMs / 1000}s
      </div>
    </div>
  </button>
);
