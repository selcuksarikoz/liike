import { useRef, useEffect, type ReactNode } from 'react';
import { DURATIONS, EASINGS } from '../../constants/animations';

type SliderControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  icon?: ReactNode;
};

export const SliderControl = ({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  icon,
}: SliderControlProps) => {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (fillRef.current) {
      const percent = ((value - min) / (max - min)) * 100;
      // Clamp percent between 0 and 100
      const clampedPercent = Math.min(Math.max(percent, 0), 100);
      
      fillRef.current.animate(
        [{ width: `${clampedPercent}%` }],
        { duration: DURATIONS.fast, easing: EASINGS.easeOut, fill: 'forwards' }
      );
    }
  }, [value, min, max]);

  const percent = ((value - min) / (max - min)) * 100;
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  return (
    <div className="group w-full">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {icon && (
            <span className="text-ui-muted group-hover:text-accent transition-colors">
              {icon}
            </span>
          )}
          <span className="text-[10px] text-ui-muted group-hover:text-white transition-colors capitalize">{label}</span>
        </div>
        <span className="text-[10px] font-mono text-accent">
          {typeof value === 'number' && !Number.isInteger(step) ? value.toFixed(2) : value}{unit}
        </span>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 bg-ui-border rounded-full overflow-hidden">
          <div
            ref={fillRef}
            className="h-full bg-gradient-to-r from-accent/60 to-accent rounded-full"
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer z-10"
        />
        <div
          className="absolute w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/30 pointer-events-none transition-transform group-hover:scale-125"
          style={{ left: `calc(${clampedPercent}% - 6px)` }}
        />
      </div>
    </div>
  );
};
