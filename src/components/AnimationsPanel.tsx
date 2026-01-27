import { Columns2, Heart, LayoutGrid, Sparkles, Type, Zap } from 'lucide-react';
import { useState } from 'react';
import type { LayoutPreset } from '../constants/styles';
import { LAYOUT_PRESETS } from '../constants/styles';
import { type AnimationSpeed, TEXT_ANIMATIONS } from '../constants/layoutAnimationPresets';
import { useAnimationManager } from '../hooks/useAnimationManager';
import { useFavorites } from '../store/favoritesStore';
import type { ImageLayout } from '../store/renderStore';
import { useRenderStore } from '../store/renderStore';
import { AnimatedLayoutCard } from './animations/AnimatedLayoutCard';
import { TextEditor } from './TextEditor';

const SPEED_OPTIONS: { value: AnimationSpeed; label: string; icon: string }[] = [
  { value: 'slow', label: 'Slow', icon: '🐢' },
  { value: 'normal', label: 'Normal', icon: '▶️' },
  { value: 'fast', label: 'Fast', icon: '⚡' },
];

export type LayoutFilter = 'single' | 'duo' | 'trio' | 'favorites' | 'text';

type SectionProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
};

const Section = ({ icon, title, description, children }: SectionProps) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">{title}</h3>
    </div>
    {description && <p className="text-[9px] text-ui-muted/70 mb-3">{description}</p>}
    <div className="space-y-3">{children}</div>
  </div>
);

// Text Animations Section
type TextAnimationsSectionProps = {
  textPresets: LayoutPreset[];
  renderCard: (preset: LayoutPreset, layout: ImageLayout, assets: any[]) => React.ReactNode;
  mediaAssets: any[];
  textMode: 'presets' | 'edit';
  setTextMode: (mode: 'presets' | 'edit') => void;
};

const TextAnimationsSection = ({
  textPresets,
  renderCard,
  mediaAssets,
  textMode,
  setTextMode,
}: TextAnimationsSectionProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Type className="w-4 h-4 text-violet-400" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
          Text Animations
        </h3>
      </div>

      {/* Sub-Tabs */}
      <div className="flex bg-ui-panel/40 p-1 rounded-lg mb-4 border border-ui-border/50">
        <button
          onClick={() => setTextMode('presets')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
            textMode === 'presets' ? 'bg-accent text-black' : 'text-ui-muted hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3" />
          Presets
        </button>
        <button
          onClick={() => setTextMode('edit')}
          className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
            textMode === 'edit' ? 'bg-accent text-black' : 'text-ui-muted hover:text-white'
          }`}
        >
          <Type className="w-3 h-3" />
          Edit Text
        </button>
      </div>

      {textMode === 'edit' ? (
        <TextEditor />
      ) : (
        <>
          <p className="text-[9px] text-ui-muted/70 mb-4">Text + device animation presets</p>
          <div className="space-y-3">
            {textPresets.map((preset) => renderCard(preset, 'single', [mediaAssets[0] || null]))}
          </div>
        </>
      )}
    </div>
  );
};

type AnimationsPanelProps = {
  filter: LayoutFilter;
};

export const AnimationsPanel = ({ filter }: AnimationsPanelProps) => {
  const {
    cornerRadius,
    mediaAssets,
    shadowType,
    shadowOpacity,
    stylePreset,
    backgroundType,
    backgroundGradient,
    backgroundColor,
    backgroundImage,
    animationSpeed,
    setAnimationSpeed,
    imageLayout, // Get current layout
  } = useRenderStore();

  const { applyAnimation } = useAnimationManager();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [textMode, setTextMode] = useState<'presets' | 'edit'>('presets');

  const handleApplyPreset = (preset: LayoutPreset, layout: ImageLayout) => {
    setActivePresetId(preset.id);
    applyAnimation(preset, layout);
  };

  const handleDragStart = (e: React.DragEvent, preset: LayoutPreset) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        type: 'layout-preset',
        preset: {
          id: preset.id,
          name: preset.name,
          animations: preset.animations,
          icon: preset.icon,
          color: preset.color,
          durationMs: preset.durationMs,
          rotationX: preset.rotationX,
          rotationY: preset.rotationY,
          rotationZ: preset.rotationZ,
        },
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  const cardProps = {
    cornerRadius,
    stylePreset,
    shadowType,
    shadowOpacity,
    backgroundType,
    backgroundGradient,
    backgroundColor,
    backgroundImage,
    onToggleFavorite: toggleFavorite,
  };

  const renderCard = (
    preset: LayoutPreset,
    layout: ImageLayout,
    assets: ((typeof mediaAssets)[0] | null)[]
  ) => (
    <AnimatedLayoutCard
      key={preset.id}
      preset={preset}
      isActive={activePresetId === preset.id}
      onApply={() => handleApplyPreset(preset, layout)}
      onDragStart={(e) => handleDragStart(e, preset)}
      mediaAssets={assets}
      layout={layout}
      isFavorite={isFavorite(preset.id)}
      animationSpeed={animationSpeed}
      {...cardProps}
    />
  );

  // Helper to slice assets based on layout
  const getAssetsForLayout = (layout: ImageLayout) => {
    // 3+ items
    if (
      [
        'trio-row',
        'trio-column',
        'fan',
        'masonry',
        'mosaic',
        'film-strip',
        'spotlight',
        'asymmetric',
      ].includes(layout)
    ) {
      return [mediaAssets[0] || null, mediaAssets[1] || null, mediaAssets[2] || null];
    }
    // 2 items
    if (
      [
        'side-by-side',
        'stacked',
        'diagonal',
        'polaroid',
        'split-left-modern',
        'split-right-modern',
      ].includes(layout)
    ) {
      return [mediaAssets[0] || null, mediaAssets[1] || null];
    }
    // 1 item (default)
    return [mediaAssets[0] || null];
  };

  // Filter presets by category/type
  const layoutPresets = LAYOUT_PRESETS.filter((p) => p.category !== 'text');

  // Existing text presets from layout config
  const existingTextPresets = LAYOUT_PRESETS.filter((p) => p.category === 'text');

  // Convert raw TEXT_ANIMATIONS to usable presets for the UI
  const generatedTextPresets: LayoutPreset[] = TEXT_ANIMATIONS.map((anim) => ({
    id: `generated-text-${anim.id}`,
    name: anim.name,
    icon: anim.icon,
    color: '#ffffff',
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-black',
    animations: [
      { type: 'zoom-in', duration: 3000, easing: 'ease-out', intensity: 1.1, stagger: 0 },
    ],
    device: { animation: 'fade', animateIn: true, scale: 0.85 },
    text: {
      enabled: true,
      headline: 'Headline',
      tagline: 'Text Animation',
      animation: anim.id,
      position: 'center',
      headlineFontSize: 64,
      taglineFontSize: 24,
      fontFamily: 'Manrope',
      color: '#ffffff',
    },
    category: 'text',
  }));

  const textPresets = [...existingTextPresets, ...generatedTextPresets];
  const favoritePresets = LAYOUT_PRESETS.filter((p) => isFavorite(p.id));

  return (
    <div className="flex flex-col h-full bg-ui-bg">
      {/* Header & Speed Controls */}
      <div className="p-4 pt-1 border-b border-ui-border bg-ui-panel/10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">Speed</h2>
          {/* Segmented Control for Speed */}
          <div className="flex flex-1 p-0.5 bg-ui-panel/80 rounded-lg border border-ui-border/50">
            {SPEED_OPTIONS.map((option) => {
              const isActive = animationSpeed === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setAnimationSpeed(option.value)}
                  title={`Speed: ${option.label}`}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                    isActive
                      ? 'bg-accent text-black shadow-sm'
                      : 'text-ui-muted hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {/* Render Logic based on Filter */}

        {filter === 'text' ? (
          // Text Mode Special Render
          <div className="space-y-4">
            {/* Text Edit Toggle */}
            <div className="flex bg-ui-panel p-1 rounded-lg border border-ui-border/30">
              <button
                onClick={() => setTextMode('presets')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                  textMode === 'presets' ? 'bg-ui-bg text-indigo-400 shadow-sm' : 'text-ui-muted'
                }`}
              >
                Presets
              </button>
              <button
                onClick={() => setTextMode('edit')}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase rounded transition-all ${
                  textMode === 'edit' ? 'bg-ui-bg text-indigo-400 shadow-sm' : 'text-ui-muted'
                }`}
              >
                Edit Text
              </button>
            </div>

            {textMode === 'edit' ? (
              <TextEditor />
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {textPresets.map((p) =>
                  // Use current layout for text animations so it doesn't reset layout
                  renderCard(p, imageLayout, getAssetsForLayout(imageLayout))
                )}
              </div>
            )}
          </div>
        ) : filter === 'favorites' ? (
          // Favorites Grid
          favoritePresets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {favoritePresets.map((p) => {
                // Determine layout: Use current layout if possible
                const targetLayout: ImageLayout = imageLayout;
                return renderCard(p, targetLayout, getAssetsForLayout(targetLayout));
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
              <Heart className="w-8 h-8 mb-2" />
              <p className="text-xs">No favorites saved</p>
            </div>
          )
        ) : (
          // Standard Lists (All, Single, Duo, Trio)
          <div className="grid grid-cols-1 gap-3">
            {layoutPresets.map((p) => {
              // Determine layout based on filter OR current layout
              let targetLayout: ImageLayout = imageLayout; // Default to preserving current layout

              if (filter === 'single') {
                targetLayout = 'single';
              } else if (filter === 'duo') {
                targetLayout = 'side-by-side';
              } else if (filter === 'trio') {
                targetLayout = 'trio-row';
              }
              // If filter is 'all', targetLayout remains imageLayout (current)

              const assetsToUse = getAssetsForLayout(targetLayout);

              return renderCard(p, targetLayout, assetsToUse);
            })}
          </div>
        )}
      </div>
    </div>
  );
};
