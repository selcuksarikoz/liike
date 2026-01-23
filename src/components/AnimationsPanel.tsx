import { Columns2, Heart, LayoutGrid, Sparkles, Type, Zap } from 'lucide-react';
import { useState } from 'react';
import type { LayoutPreset } from '../constants/styles';
import { LAYOUT_PRESETS } from '../constants/styles';
import { TEXT_DEVICE_PRESETS, type AnimationSpeed } from '../constants/textAnimations';
import { useFavorites } from '../store/favoritesStore';
import type { ImageLayout } from '../store/renderStore';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { loadGoogleFont } from '../hooks/useFontLoader';
import { AnimatedLayoutCard } from './animations/AnimatedLayoutCard';
import { TextAnimationCard } from './animations/TextAnimationCard';
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
    applyPreset,
    setDurationMs,
    backgroundType,
    backgroundGradient,
    backgroundColor,
    backgroundImage,
    setTextOverlay,
    animationSpeed,
    setAnimationSpeed,
  } = useRenderStore();

  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();
  const { toggle: toggleFavorite, isFavorite } = useFavorites();

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [textMode, setTextMode] = useState<'presets' | 'edit'>('presets');

  const handleApplyPreset = (preset: LayoutPreset, layout: ImageLayout) => {
    setActivePresetId(preset.id);

    applyPreset({
      rotationX: preset.rotationX,
      rotationY: preset.rotationY,
      rotationZ: preset.rotationZ,
      imageLayout: layout,
    });

    const hasAnimation = preset.animations.some((a) => a.type !== 'none');
    if (hasAnimation) {
      setIsPlaying(false);
      setDurationMs(preset.durationMs);
      setPlayhead(0);
      clearTrack('track-animation');
      addClip('track-animation', {
        trackId: 'track-animation',
        type: 'animation',
        name: preset.name,
        startMs: 0,
        durationMs: preset.durationMs,
        color: preset.color,
        icon: preset.icon,
        data: {
          animationPreset: {
            id: preset.id,
            name: preset.name,
            animations: preset.animations.map((a) => a.type).filter((t) => t !== 'none') as any[],
            icon: preset.icon,
            color: preset.color,
            duration: preset.durationMs,
            easing: preset.animations[0]?.easing || 'ease-in-out',
          },
        },
      });
      setTimeout(() => setIsPlaying(true), 100);
    }
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

  // Filter presets
  const singlePresets = LAYOUT_PRESETS.filter(
    (p) => !p.id.startsWith('duo-') && !p.id.startsWith('trio-')
  );
  const dualPresets = LAYOUT_PRESETS.filter((p) => p.id.startsWith('duo-'));
  const trioPresets = LAYOUT_PRESETS.filter((p) => p.id.startsWith('trio-'));
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
                Select a layout style to get started
              </p>
              <div className="space-y-2">
                {TEXT_DEVICE_PRESETS.map((preset) => (
                  <TextAnimationCard
                    key={preset.id}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={() => {
                      setActivePresetId(preset.id);
                      // Preload the font
                      loadGoogleFont('Manrope');
                      // Map layout to devicePosition
                      let devicePosition: 'center' | 'top' | 'bottom' | 'left' | 'right' = 'center';
                      if (preset.layout === 'text-top-device-bottom') devicePosition = 'bottom';
                      else if (preset.layout === 'text-bottom-device-top') devicePosition = 'top';
                      else if (preset.layout === 'text-left-device-right') devicePosition = 'right';
                      else if (preset.layout === 'text-right-device-left') devicePosition = 'left';

                      setTextOverlay({
                        enabled: true,
                        text: `${preset.headline}\n${preset.tagline}`,
                        headline: preset.headline,
                        tagline: preset.tagline,
                        fontFamily: 'Manrope',
                        animation: preset.textAnimation,
                        position: preset.textPosition,
                        layout: preset.layout,
                        fontSize: preset.headlineFontSize,
                        taglineFontSize: preset.taglineFontSize,
                        color: preset.color,
                        deviceOffset: preset.deviceOffset ?? -20,
                        devicePosition,
                        deviceAnimateIn: true,
                      });

                      setIsPlaying(false);
                      setDurationMs(preset.durationMs);
                      setPlayhead(0);
                      clearTrack('track-animation');
                      addClip('track-animation', {
                        trackId: 'track-animation',
                        type: 'animation',
                        name: preset.name,
                        startMs: 0,
                        durationMs: preset.durationMs,
                        color: preset.color,
                        icon: preset.icon,
                        data: {
                          animationPreset: {
                            id: preset.id,
                            name: preset.name,
                            animations: [preset.textAnimation as any],
                            icon: preset.icon,
                            color: preset.color,
                            duration: preset.durationMs,
                            easing: 'ease-out',
                          },
                        },
                      });
                      setTimeout(() => setIsPlaying(true), 100);
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
