import { useState, useRef, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { CameraStylePanel } from './CameraStylePanel';
import { LayoutsPanel } from './LayoutsPanel';
import { BackgroundModal } from './BackgroundModal';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { ANIMATION_PRESETS, STAGGER_DEFAULTS } from '../constants/animations';

export type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad';

const FILTER_OPTIONS: { id: LayoutFilter; label: string; icon: string }[] = [
  { id: 'single', label: 'Single', icon: 'crop_square' },
  { id: 'duo', label: 'Duo', icon: 'view_column_2' },
  { id: 'trio', label: 'Trio', icon: 'view_week' },
  { id: 'quad', label: 'Quad', icon: 'grid_view' },
];

// Mini preview animation component
const FilterPreview = ({ filter, isActive }: { filter: LayoutFilter; isActive: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationsRef = useRef<Animation[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const elements = elementsRef.current.filter(Boolean) as Element[];
    if (elements.length === 0) return;

    // Cancel previous animations
    animationsRef.current.forEach(anim => anim.cancel());
    animationsRef.current = [];

    // Animate with stagger using Web Animations API
    const { keyframes, options } = ANIMATION_PRESETS.filterPreview;
    elements.forEach((el, i) => {
      const anim = el.animate([...keyframes], {
        ...options,
        delay: i * STAGGER_DEFAULTS.filters,
      });
      animationsRef.current.push(anim);
    });

    return () => {
      animationsRef.current.forEach(anim => anim.cancel());
    };
  }, [isActive, filter]);

  // Different layouts for each filter type
  if (filter === 'single') {
    return (
      <div ref={containerRef} className="flex items-center justify-center w-6 h-5">
        <div
          ref={(el) => { elementsRef.current[0] = el; }}
          className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
          style={{ width: 16, height: 16 }}
        />
      </div>
    );
  }

  if (filter === 'duo') {
    return (
      <div ref={containerRef} className="flex items-center justify-center gap-0.5 w-6 h-5">
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => { elementsRef.current[i] = el; }}
            className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
            style={{ width: 7, height: 14 }}
          />
        ))}
      </div>
    );
  }

  if (filter === 'trio') {
    return (
      <div ref={containerRef} className="flex items-center justify-center gap-0.5 w-6 h-5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            ref={(el) => { elementsRef.current[i] = el; }}
            className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
            style={{ width: 5, height: 12 }}
          />
        ))}
      </div>
    );
  }

  // Quad - 2x2 grid
  return (
    <div ref={containerRef} className="grid grid-cols-2 gap-0.5 w-6 h-5 place-items-center">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className={`rounded-sm ${isActive ? 'bg-black/90' : 'bg-current opacity-50'}`}
          style={{ width: 7, height: 7 }}
        />
      ))}
    </div>
  );
};

// Map imageLayout from store to filter type
const getFilterFromLayout = (layout: string): LayoutFilter => {
  switch (layout) {
    case 'side-by-side':
    case 'stacked':
      return 'duo';
    case 'trio-row':
    case 'trio-column':
    case 'overlap':
    case 'fan':
      return 'trio';
    case 'grid':
      return 'quad';
    default:
      return 'single';
  }
};

export const SidebarRight = () => {
  const [activeTab, setActiveTab] = useState<'layouts' | 'style'>('layouts');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  const { backgroundType, backgroundGradient, backgroundColor, backgroundImage, setImageLayout, imageLayout } = useRenderStore();
  const { setIsPlaying, setPlayhead, clearTrack } = useTimelineStore();

  // Derive initial layoutFilter from store's imageLayout
  const [layoutFilter, setLayoutFilter] = useState<LayoutFilter>(getFilterFromLayout(imageLayout));

  // Sync internal filter state when global store changes (e.g. from SidebarLeft)
  useEffect(() => {
    setLayoutFilter(getFilterFromLayout(imageLayout));
  }, [imageLayout]);

  // Handle filter change - update canvas layout (filter will auto-derive)
  const handleFilterChange = (filter: LayoutFilter) => {
    // Pause video and reset timeline
    setIsPlaying(false);
    setPlayhead(0);
    clearTrack('track-animation');

    // Update canvas layout based on filter
    switch (filter) {
      case 'single':
        setImageLayout('single');
        break;
      case 'duo':
        setImageLayout('side-by-side');
        break;
      case 'trio':
        setImageLayout('trio-row');
        break;
      case 'quad':
        setImageLayout('grid');
        break;
    }
    setLayoutFilter(filter);
  };

  // Generate preview style for background button
  const getBackgroundPreviewStyle = () => {
    switch (backgroundType) {
      case 'solid':
        return { backgroundColor };
      case 'image':
        return backgroundImage
          ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {};
      case 'gradient':
      default:
        return {};
    }
  };

  // Get gradient class for preview
  const getGradientClass = () => {
    if (backgroundType === 'gradient') {
      return `bg-gradient-to-br ${backgroundGradient}`;
    }
    return '';
  };

  return (
    <aside className="flex w-80 flex-col border-l border-ui-border bg-ui-bg-secondary h-full overflow-hidden">
      {/* Background Button */}
      <div className="p-3 border-b border-ui-border">
        <button
          onClick={() => setIsBackgroundModalOpen(true)}
          className="w-full flex items-center gap-3 p-2 rounded-xl border border-ui-border hover:border-accent/50 hover:bg-ui-panel/50 transition-all group"
        >
          <div
            className={`w-10 h-10 rounded-lg border border-ui-border overflow-hidden flex-shrink-0 ${getGradientClass()}`}
            style={getBackgroundPreviewStyle()}
          />
          <div className="flex-1 text-left">
            <div className="text-[11px] font-medium text-white">Background</div>
            <div className="text-[9px] text-ui-muted capitalize">{backgroundType}</div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-ui-muted group-hover:text-accent transition-colors" />
        </button>
      </div>

      {/* Tab Switcher */}
      <div className="flex border-b border-ui-border">
        <button
          onClick={() => setActiveTab('layouts')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'layouts'
              ? 'text-white border-b-2 border-accent bg-ui-panel'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Layouts
        </button>
        <button
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors ${
            activeTab === 'style'
              ? 'text-white border-b-2 border-accent bg-ui-panel'
              : 'text-ui-muted hover:text-ui-text'
          }`}
        >
          Style
        </button>
      </div>

      {/* Layout Filter (only show when layouts tab is active) */}
      {activeTab === 'layouts' && (
        <div className="p-2 border-b border-ui-border bg-ui-bg-secondary">
          <div className="relative flex bg-ui-panel/50 rounded-lg p-1">
            {/* Sliding indicator */}
            <div
              className="absolute top-1 bottom-1 bg-accent rounded-md transition-all duration-300 ease-out"
              style={{
                width: `calc(${100 / FILTER_OPTIONS.length}% - 4px)`,
                left: `calc(${FILTER_OPTIONS.findIndex(f => f.id === layoutFilter) * (100 / FILTER_OPTIONS.length)}% + 2px)`,
              }}
            />
            {FILTER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleFilterChange(option.id)}
                className={`relative z-10 flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-md transition-colors duration-200 ${
                  layoutFilter === option.id
                    ? 'text-black'
                    : 'text-ui-muted hover:text-ui-text'
                }`}
              >
                <FilterPreview filter={option.id} isActive={layoutFilter === option.id} />
                <span className="text-[9px]">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'layouts' && <LayoutsPanel filter={layoutFilter} />}
        {activeTab === 'style' && <CameraStylePanel />}
      </div>

      {/* Background Modal */}
      <BackgroundModal
        isOpen={isBackgroundModalOpen}
        onClose={() => setIsBackgroundModalOpen(false)}
      />
    </aside>
  );
};
