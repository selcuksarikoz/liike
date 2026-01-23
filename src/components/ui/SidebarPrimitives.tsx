import { ChevronRight, Plus, X } from 'lucide-react';
import React from 'react';

// Wrapper for the entire sidebar
export const SidebarContainer = ({
  children,
  side = 'left',
  className = '',
}: {
  children: React.ReactNode;
  side?: 'left' | 'right';
  className?: string;
}) => (
  <aside
    className={`flex w-80 flex-col bg-ui-bg-secondary h-full overflow-hidden ${
      side === 'left' ? 'border-r' : 'border-l'
    } border-ui-border relative z-20 ${className}`}
  >
    {children}
  </aside>
);

// Scrollable content area
export const SidebarContent = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`flex-1 overflow-y-auto no-scrollbar ${className}`}>{children}</div>;

// Section with optional border
export const SidebarSection = ({
  children,
  className = '',
  borderBottom = false,
  padded = true,
}: {
  children: React.ReactNode;
  className?: string;
  borderBottom?: boolean;
  padded?: boolean;
}) => (
  <div
    className={`${padded ? 'p-4' : ''} ${
      borderBottom ? 'border-b border-ui-border' : ''
    } ${className}`}
  >
    {children}
  </div>
);

// Section Header (H2 style)
export const SidebarHeader = ({
  children,
  icon,
  action,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-[11px] font-bold uppercase tracking-widest text-ui-text flex items-center gap-2">
      {icon && <span className="text-accent">{icon}</span>}
      {children}
    </h2>
    {action}
  </div>
);

// Tab Switcher Container
export const TabContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="flex border-b border-ui-border shrink-0">{children}</div>
);

// Individual Tab
export const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
      active
        ? 'text-white border-b-2 border-accent bg-ui-panel'
        : 'text-ui-muted hover:text-ui-text'
    }`}
  >
    {children}
  </button>
);

// Action Card (like Background button)
export const ActionCard = ({
  icon,
  label,
  value,
  onClick,
  preview,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
  preview?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-2 rounded-xl border border-ui-border hover:border-accent/50 hover:bg-ui-panel/50 transition-all group text-left"
  >
    {preview ? (
      preview
    ) : icon ? (
      <div className="w-10 h-10 rounded-lg border border-ui-border bg-ui-panel flex items-center justify-center text-ui-muted group-hover:text-accent transition-colors">
        {icon}
      </div>
    ) : null}

    <div className="flex-1">
      <div className="text-[11px] font-medium text-white">{label}</div>
      {value && <div className="text-[9px] text-ui-muted capitalize">{value}</div>}
    </div>
    <ChevronRight className="w-4.5 h-4.5 text-ui-muted group-hover:text-accent transition-colors shrink-0" />
  </button>
);

// Grid Button (for Layouts, Filters etc)
export const GridButton = ({
  active,
  onClick,
  icon,
  label,
  children,
  className = '',
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  children?: React.ReactNode;
  className?: string;
  title?: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl border transition-all hover:scale-105 active:scale-95 ${
      active
        ? 'bg-accent/20 border-accent text-accent'
        : 'border-ui-border hover:border-ui-muted bg-ui-panel/30 text-ui-muted hover:text-white'
    } ${className}`}
  >
    {children || icon}
    {label && <span className="text-[8px] font-medium">{label}</span>}
  </button>
);

// Media Upload Box
export const UploadBox = ({
  onClick,
  maxItems = 4,
}: {
  onClick: () => void;
  maxItems?: number;
}) => (
  <div
    onClick={onClick}
    className="mb-4 flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-ui-border bg-ui-panel/40 py-2 hover:bg-ui-highlight hover:border-accent/50 cursor-pointer transition-colors group"
  >
    <div className="text-center">
      <p className="text-[10px] font-medium text-ui-text group-hover:text-white">Click to Upload</p>
      <p className="text-[9px] text-ui-muted">Max {maxItems} items</p>
    </div>
  </div>
);

// Media Slot (for the grid of uploaded items)
export const MediaSlot = ({
  index,
  mediaAsset,
  onClick,
  onRemove,
  isActive,
}: {
  index: number;
  mediaAsset: { url: string; type: 'image' | 'video' } | null;
  onClick: () => void;
  onRemove: (e: React.MouseEvent) => void;
  isActive?: boolean;
}) => (
  <div
    onClick={onClick}
    className={`aspect-square rounded-lg border bg-ui-panel/40 relative overflow-hidden group ${
      !mediaAsset
        ? 'opacity-30 border-dashed border-ui-border hover:opacity-100 hover:border-accent/50 cursor-pointer'
        : 'cursor-pointer border-ui-border'
    } ${isActive ? 'ring-2 ring-accent' : ''}`}
  >
    {mediaAsset ? (
      <>
        {mediaAsset.type === 'video' ? (
          <video
            src={mediaAsset.url}
            className="w-full h-full object-cover"
            muted
            autoPlay
            loop
            playsInline
          />
        ) : (
          <img
            src={mediaAsset.url}
            alt={`Upload ${index + 1}`}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onRemove}
            className="rounded-full bg-black/50 p-1 hover:bg-red-500/80 text-white backdrop-blur-sm transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </>
    ) : (
      <div className="flex h-full w-full items-center justify-center">
        <Plus className="w-4 h-4 text-ui-muted group-hover:text-accent" />
      </div>
    )}
  </div>
);

// Grouped controls container (like a card)
export const ControlGroup = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`bg-ui-panel/40 rounded-xl p-3 space-y-3 ${className}`}>{children}</div>;
