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

export const AnimationsPanel = () => {
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
  } = useRenderStore();

  const { applyAnimation } = useAnimationManager();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'single' | 'duo' | 'trio' | 'text' | 'favorites'>(
    'all'
  );
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

  // Filter Logic - Consolidated
  // We can show ALL layout animations for Single/Duo/Triple mode by default
  // But we filter based  // Filter presets by category/type
  const layoutPresets = LAYOUT_PRESETS.filter((p) => p.category !== 'text');

  // Existing text presets from layout config
  const existingTextPresets = LAYOUT_PRESETS.filter((p) => p.category === 'text');

  // Convert raw TEXT_ANIMATIONS to usable presets for the UI
  // This ensures all 50+ text animations are visible and selectable
  const generatedTextPresets: LayoutPreset[] = TEXT_ANIMATIONS.map((anim) => ({
    id: `generated-text-${anim.id}`,
    name: anim.name,
    icon: anim.icon,
    color: '#ffffff', // Default white for text presets
    durationMs: 3000,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    backgroundGradient: 'bg-black', // Simple background to highlight text
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

  // Combine them (Unique by text animation ID preference? Or just concat)
  const textPresets = [...existingTextPresets, ...generatedTextPresets];
  const favoritePresets = LAYOUT_PRESETS.filter((p) => isFavorite(p.id));

  return (
    <div className="flex flex-col h-full bg-ui-bg">
      {/* Header & Speed Controls */}
      <div className="p-4 border-b border-ui-border bg-ui-panel/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-white">Animations</h2>
          <div className="flex gap-1">
            {/* Speed Controls Mini */}
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setAnimationSpeed(option.value)}
                title={`Speed: ${option.label}`}
                className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                  animationSpeed === option.value
                    ? 'bg-amber-500 text-black'
                    : 'bg-ui-panel text-ui-muted hover:text-white'
                }`}
              >
                <div className="scale-75">{option.icon}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 p-1 bg-ui-panel rounded-lg overflow-x-auto no-scrollbar">
          {(['all', 'single', 'duo', 'trio', 'text', 'favorites'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase whitespace-nowrap transition-all ${
                filter === f
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'text-ui-muted hover:text-white hover:bg-white/5'
              }`}
            >
              {f}
            </button>
          ))}
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
                {textPresets.map((p) => renderCard(p, 'single', [mediaAssets[0] || null]))}
              </div>
            )}
          </div>
        ) : filter === 'favorites' ? (
          // Favorites Grid
          favoritePresets.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {favoritePresets.map((p) => {
                // Try to guess best layout for favorite, default to single
                return renderCard(p, 'single', [mediaAssets[0] || null]);
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
          // We map the SAME presets to different layouts based on filter
          <div className="grid grid-cols-1 gap-3">
            {layoutPresets.map((p) => {
              // Determine layout based on current filter or section
              let targetLayout: ImageLayout = 'single';
              let assetsToUse = [mediaAssets[0] || null];

              if (filter === 'duo') {
                targetLayout = 'side-by-side';
                assetsToUse = [mediaAssets[0] || null, mediaAssets[1] || null];
              } else if (filter === 'trio') {
                targetLayout = 'trio-row';
                assetsToUse = [
                  mediaAssets[0] || null,
                  mediaAssets[1] || null,
                  mediaAssets[2] || null,
                ];
              }

              // If 'all', we render based on what makes sense or just single?
              // Let's render as Single for 'all' to show the animation style clearly,
              // or maybe alternate? Single is safest for preview.

              return renderCard(p, targetLayout, assetsToUse);
            })}
          </div>
        )}
      </div>
    </div>
  );
};
