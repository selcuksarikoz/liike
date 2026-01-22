import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronRight, Crop, RatioIcon, Palette, Smartphone, SmartphoneCharging } from 'lucide-react';

type DropdownProps = {
  trigger: ReactNode;
  children: ReactNode;
  className?: string;
};

export const Dropdown = ({ trigger, children, className = '' }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-ui-border bg-ui-bg/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

type DropdownTriggerProps = {
  icon: string;
  label: string;
  value: string;
  onClick?: () => void;
};

const getIcon = (iconName: string) => {
  switch (iconName) {
    case 'crop':
      return <Crop className="w-4.5 h-4.5" />;
    case 'aspect_ratio':
      return <RatioIcon className="w-4.5 h-4.5" />;
    case 'palette':
      return <Palette className="w-4.5 h-4.5" />;
    case 'smartphone':
      return <Smartphone className="w-4.5 h-4.5" />;
    default:
      return <Crop className="w-4.5 h-4.5" />;
  }
};

export const DropdownTrigger = ({ icon, label, value, onClick }: DropdownTriggerProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between bg-ui-panel border border-ui-border rounded-lg px-3 py-3 text-xs text-white hover:border-accent/50 transition-colors group"
  >
    <span className="flex items-center gap-3">
      <span className="text-ui-text group-hover:text-accent">{getIcon(icon)}</span>
      <div className="flex flex-col items-start">
        <span className="font-medium">{label}</span>
        <span className="text-[10px] text-ui-muted">{value}</span>
      </div>
    </span>
    <ChevronRight className="w-4 h-4 text-ui-muted" />
  </button>
);
