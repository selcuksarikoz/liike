import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronRight } from 'lucide-react';
import { CameraStylePanel } from './CameraStylePanel';
import { LayoutsPanel } from './LayoutsPanel';
import { BackgroundModal } from './BackgroundModal';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';

export type LayoutFilter = 'single' | 'duo' | 'trio';

const FILTER_OPTIONS: { id: LayoutFilter; label: string; icon: string }[] = [
  { id: 'single', label: 'Single', icon: 'crop_square' },
  { id: 'duo', label: 'Duo', icon: 'view_column_2' },
  { id: 'trio', label: 'Trio', icon: 'view_week' },
];

// Mini preview animation component
const FilterPreview = ({ filter, isActive }: { filter: LayoutFilter; isActive: boolean }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const elements = elementsRef.current.filter(Boolean);
    if (elements.length === 0) return;

    // Kill any existing animations
    gsap.killTweensOf(elements);

    // Reset elements first
    gsap.set(elements, { opacity: 0, scale: 0.3, y: 8, rotationX: -30 });

    // Staggered entrance animation with 3D effect
    gsap.to(elements, {
      opacity: 1,
      scale: 1,
      y: 0,
      rotationX: 0,
      duration: 0.5,
      stagger: 0.12,
      ease: 'back.out(2)',
    });

    // Continuous subtle breathing animation
    const breatheTl = gsap.timeline({ repeat: -1, yoyo: true, delay: 0.6 });
    elements.forEach((el, i) => {
      breatheTl.to(el, {
        y: -1.5,
        scale: 1.05,
        duration: 1 + i * 0.15,
        ease: 'sine.inOut',
      }, 0);
    });

    return () => {
      breatheTl.kill();
      gsap.killTweensOf(elements);
    };
  }, [isActive, filter]);

  const count = filter === 'single' ? 1 : filter === 'duo' ? 2 : 3;

  return (
    <div ref={containerRef} className="flex items-center justify-center gap-1 h-5" style={{ perspective: '100px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { elementsRef.current[i] = el; }}
          className={`rounded transition-all ${
            isActive
              ? 'bg-black/90 shadow-sm'
              : 'bg-current opacity-60'
          }`}
          style={{
            width: filter === 'single' ? 14 : filter === 'duo' ? 10 : 7,
            height: filter === 'single' ? 14 : filter === 'duo' ? 12 : 10,
            transformStyle: 'preserve-3d',
          }}
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
      return 'trio';
    default:
      return 'single';
  }
};

export const SidebarRight = () => {
  const [activeTab, setActiveTab] = useState<'layouts' | 'style'>('layouts');
  const [isBackgroundModalOpen, setIsBackgroundModalOpen] = useState(false);

  const { backgroundType, backgroundGradient, backgroundColor, backgroundImage, setImageLayout, imageLayout } = useRenderStore();
  const { setIsPlaying, setPlayhead, clearTrack } = useTimelineStore();

  // Derive layoutFilter from store's imageLayout
  const layoutFilter = getFilterFromLayout(imageLayout);

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
    }
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
