import type { MediaPosition, TextPosition } from '../../store/renderStore';

type Position = MediaPosition | TextPosition;

type PositionPickerProps = {
  value: Position;
  onChange: (position: Position) => void;
  type: 'text' | 'media';
  size?: 'sm' | 'md';
};

const GRID_POSITIONS: { position: Position; label: string }[] = [
  { position: 'top-left', label: 'TL' },
  { position: 'top-center', label: 'T' },
  { position: 'top-right', label: 'TR' },
  { position: 'center-left', label: 'L' },
  { position: 'center', label: 'C' },
  { position: 'center-right', label: 'R' },
  { position: 'bottom-left', label: 'BL' },
  { position: 'bottom-center', label: 'B' },
  { position: 'bottom-right', label: 'BR' },
];

// Map for media positions (uses slightly different keys)
const MEDIA_POSITION_MAP: Record<string, Position> = {
  'top-left': 'top-left',
  'top-center': 'top',
  'top-right': 'top-right',
  'center-left': 'left',
  center: 'center',
  'center-right': 'right',
  'bottom-left': 'bottom-left',
  'bottom-center': 'bottom',
  'bottom-right': 'bottom-right',
};

const MEDIA_POSITION_REVERSE: Record<string, string> = {
  'top-left': 'top-left',
  top: 'top-center',
  'top-right': 'top-right',
  left: 'center-left',
  center: 'center',
  right: 'center-right',
  'bottom-left': 'bottom-left',
  bottom: 'bottom-center',
  'bottom-right': 'bottom-right',
};

export const PositionPicker = ({ value, onChange, type, size = 'md' }: PositionPickerProps) => {
  const isMedia = type === 'media';
  const activeColor = isMedia ? 'bg-violet-500 border-violet-500' : 'bg-accent border-accent';
  const hoverColor = isMedia ? 'hover:border-violet-500/50' : 'hover:border-accent/50';

  const cellSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  const gap = size === 'sm' ? 'gap-1' : 'gap-1.5';
  const padding = size === 'sm' ? 'p-2' : 'p-3';

  const getCurrentValue = () => {
    if (isMedia) {
      return MEDIA_POSITION_REVERSE[value as string] || 'center';
    }
    return value;
  };

  const handleChange = (gridPosition: Position) => {
    if (isMedia) {
      onChange(MEDIA_POSITION_MAP[gridPosition as string] as Position);
    } else {
      onChange(gridPosition);
    }
  };

  const currentGridValue = getCurrentValue();

  return (
    <div
      className={`grid grid-cols-3 ${gap} ${padding} bg-ui-panel/30 rounded-lg border border-ui-border/50`}
    >
      {GRID_POSITIONS.map(({ position, label }) => {
        const isActive = currentGridValue === position;
        return (
          <button
            key={position}
            onClick={() => handleChange(position)}
            className={`relative ${cellSize} mx-auto rounded-md border transition-all duration-200 flex items-center justify-center ${
              isActive
                ? activeColor
                : `bg-ui-panel/50 border-ui-border ${hoverColor} hover:bg-ui-panel`
            }`}
            title={position}
          >
            <div
              className={`${dotSize} rounded-full transition-all duration-200 ${
                isActive ? 'bg-white scale-110' : 'bg-ui-muted/40'
              }`}
            />
            <span className="sr-only">{label}</span>
          </button>
        );
      })}
    </div>
  );
};
