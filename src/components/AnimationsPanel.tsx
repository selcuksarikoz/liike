import { Columns2, Heart, LayoutGrid, Sparkles, Type, Zap } from 'lucide-react';
import { useState } from 'react';
import type { LayoutPreset } from '../constants/styles';
import { LAYOUT_PRESETS } from '../constants/styles';
import type { AnimationSpeed } from '../constants/textAnimations';
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

export type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad' | 'creative' | 'favorites' | 'text';

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

export const AnimationsPanel = ({ filter = 'single' }: { filter?: LayoutFilter }) => {
  const {
    cornerRadius,
    mediaAssets,
    shadowType,
    shadowOpacity,
    stylePreset,
    imageAspectRatio,
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
    aspectRatio: imageAspectRatio,
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
      {...cardProps}
    />
  );

  // Filter presets by category/type
  const layoutPresets = LAYOUT_PRESETS.filter((p) => p.category !== 'text');
  const textPresets = LAYOUT_PRESETS.filter((p) => p.category === 'text');

  const singlePresets = layoutPresets.filter(
    (p) => !p.id.startsWith('duo-') && !p.id.startsWith('trio-')
  );
  const dualPresets = layoutPresets.filter((p) => p.id.startsWith('duo-'));
  const trioPresets = layoutPresets.filter((p) => p.id.startsWith('trio-'));
  const favoritePresets = LAYOUT_PRESETS.filter((p) => isFavorite(p.id));

  return (
    <div className="p-4">
      {/* Animation Speed Selector - Always visible */}
      <div className="mb-4 p-3 bg-ui-panel/30 rounded-lg border border-ui-border/50">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-ui-muted">
            Animation Speed
          </span>
        </div>
        <div className="flex gap-1">
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setAnimationSpeed(option.value)}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-medium transition-all ${
                animationSpeed === option.value
                  ? 'bg-amber-500 text-black'
                  : 'bg-ui-panel/50 text-ui-muted hover:bg-ui-panel hover:text-white'
              }`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filter === 'single' && (
        <Section
          icon={<Sparkles className="w-4 h-4 text-accent" />}
          title="Single Image"
          description="Hero shots, intros & attention grabbers"
        >
          {singlePresets.map((p) => renderCard(p, 'single', [mediaAssets[0] || null]))}
        </Section>
      )}

      {filter === 'duo' && (
        <Section
          icon={<Columns2 className="w-4 h-4 text-purple-400" />}
          title="Dual Images"
          description="Comparisons, reveals & synchronized effects"
        >
          {dualPresets.map((p) =>
            renderCard(p, 'side-by-side', [mediaAssets[0] || null, mediaAssets[1] || null])
          )}
        </Section>
      )}

      {filter === 'trio' && (
        <Section
          icon={<LayoutGrid className="w-4 h-4 text-emerald-400" />}
          title="Trio Sequences"
          description="Staggered reveals, one by one entrances"
        >
          {trioPresets.map((p) =>
            renderCard(p, 'trio-row', [
              mediaAssets[0] || null,
              mediaAssets[1] || null,
              mediaAssets[2] || null,
            ])
          )}
        </Section>
      )}

      {filter === 'quad' && (
        <Section
          icon={<LayoutGrid className="w-4 h-4 text-sky-400" />}
          title="Grid Layout"
          description="2x2 grid with synchronized effects"
        >
          {singlePresets
            .slice(0, 6)
            .map((p) =>
              renderCard(p, 'grid', [
                mediaAssets[0] || null,
                mediaAssets[1] || null,
                mediaAssets[2] || null,
                mediaAssets[3] || null,
              ])
            )}
        </Section>
      )}

      {filter === 'creative' && (
        <div className="mb-6 space-y-8">
          <Section icon={<LayoutGrid className="w-4 h-4 text-pink-400" />} title="Masonry">
            {singlePresets.slice(0, 3).map((p) => renderCard(p, 'masonry', mediaAssets))}
          </Section>
          <Section icon={<LayoutGrid className="w-4 h-4 text-orange-400" />} title="Mosaic">
            {singlePresets.slice(3, 6).map((p) => renderCard(p, 'mosaic', mediaAssets))}
          </Section>
          <Section icon={<LayoutGrid className="w-4 h-4 text-indigo-400" />} title="Film Strip">
            {singlePresets.slice(6, 9).map((p) => renderCard(p, 'film-strip', mediaAssets))}
          </Section>
        </div>
      )}

      {filter === 'favorites' && (
        <Section
          icon={<Heart className="w-4 h-4 text-rose-400" />}
          title="Your Favorites"
          description="Quick access to your saved animations"
        >
          {favoritePresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-8 h-8 text-ui-muted/30 mb-3" />
              <p className="text-sm text-ui-muted/60 mb-1">No favorites yet</p>
              <p className="text-xs text-ui-muted/40">
                Click the ❤️ on any animation to save it here
              </p>
            </div>
          ) : (
            favoritePresets.map((p) => {
              const layout = p.id.startsWith('duo-')
                ? 'side-by-side'
                : p.id.startsWith('trio-')
                  ? 'trio-row'
                  : 'single';
              return renderCard(p, layout, [mediaAssets[0] || null]);
            })
          )}
        </Section>
      )}

      {filter === 'text' && (
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
              <p className="text-[9px] text-ui-muted/70 mb-4">
                Text + device animation presets
              </p>
              <div className="space-y-3">
                {textPresets.map((preset) => renderCard(preset, 'single', [mediaAssets[0] || null]))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
