import { useState, useRef, useEffect } from 'react';
import { Sparkles, Columns2, LayoutGrid, Heart, Type } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import type { MediaAsset, ImageLayout, AspectRatio, BackgroundType } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { LAYOUT_PRESETS } from '../constants/styles';
import type { LayoutPreset } from '../constants/styles';
import { DeviceRenderer } from './DeviceRenderer';
import {
  ANIMATION_PRESETS,
  createLayoutAnimation,
  DURATIONS,
  EASINGS,
  STAGGER_DEFAULTS,
} from '../constants/animations';
import { useFavorites } from '../store/favoritesStore';
import { TEXT_DEVICE_PRESETS, TEXT_ANIMATIONS } from '../constants/textAnimations';
import type { TextDevicePreset, TextAnimationType } from '../constants/textAnimations';
import { TextEditor } from './TextEditor';

const AnimatedLayoutCard = ({
  preset,
  isActive,
  onApply,
  onDragStart,
  cornerRadius,
  mediaAssets,
  stylePreset,
  shadowType,
  shadowOpacity,
  aspectRatio,
  layout,
  backgroundType,
  backgroundGradient,
  backgroundColor,
  backgroundImage,
  isFavorite = false,
  onToggleFavorite,
}: {
  preset: LayoutPreset;
  isActive: boolean;
  onApply: () => void;
  onDragStart: (e: React.DragEvent) => void;
  cornerRadius: number;
  mediaAssets: (MediaAsset | null)[];
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
  aspectRatio?: AspectRatio;
  layout?: ImageLayout;
  backgroundType: BackgroundType;
  backgroundGradient: string;
  backgroundColor: string;
  backgroundImage: string | null;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  const hasAnimation = preset.animations.some((a) => a.type !== 'none');
  const isCombo = preset.animations.filter((a) => a.type !== 'none').length > 1;

  useEffect(() => {
    if (!cardRef.current || !deviceRef.current) return;

    const card = cardRef.current;
    const device = deviceRef.current;

    const runAnimation = () => {
      // Cancel previous animations
      animationsRef.current.forEach((anim) => anim.cancel());
      animationsRef.current = [];

      preset.animations.forEach((anim) => {
        if (anim.type === 'none') return;

        const intensity = anim.intensity || 10;
        const config = createLayoutAnimation(anim.type, intensity, anim.duration, anim.easing);

        const animation = device.animate(config.keyframes, config.options);
        animationsRef.current.push(animation);
      });
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
      // Card hover effect
      card.animate(
        [...ANIMATION_PRESETS.cardHoverIn.keyframes],
        ANIMATION_PRESETS.cardHoverIn.options
      );

      if (hasAnimation) {
        runAnimation();
      } else {
        device.animate([{ transform: 'scale(0.9)' }], {
          duration: DURATIONS.medium,
          easing: EASINGS.easeOut,
          fill: 'forwards',
        });
      }
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      // Card hover out
      card.animate(
        [...ANIMATION_PRESETS.cardHoverOut.keyframes],
        ANIMATION_PRESETS.cardHoverOut.options
      );

      // Cancel running animations
      animationsRef.current.forEach((anim) => anim.cancel());
      animationsRef.current = [];

      // Reset device
      device.animate(
        [...ANIMATION_PRESETS.deviceReset.keyframes],
        ANIMATION_PRESETS.deviceReset.options
      );
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      animationsRef.current.forEach((anim) => anim.cancel());
    };
  }, [preset, hasAnimation]);

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={onDragStart}
      onClick={onApply}
      className={`group relative w-full aspect-[16/10] cursor-pointer rounded-xl border overflow-hidden transition-colors ${
        isActive ? 'border-accent ring-2 ring-accent/30' : 'border-ui-border hover:border-accent/50'
      }`}
    >
      {/* Background */}
      {backgroundType === 'gradient' && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`}
        />
      )}
      {backgroundType === 'solid' && (
        <div
          className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100"
          style={{ backgroundColor }}
        />
      )}
      {backgroundType === 'image' && backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}

      {/* Device Preview */}
      <div
        ref={deviceRef}
        className="absolute inset-0 flex items-center justify-center p-4 scale-[0.85]"
        style={{ perspective: '1000px', willChange: 'transform, opacity' }}
      >
        <DeviceRenderer
          rotationX={preset.rotationX}
          rotationY={preset.rotationY}
          rotationZ={preset.rotationZ}
          cornerRadius={cornerRadius || 20}
          mediaAssets={mediaAssets}
          stylePreset={stylePreset}
          shadowType={shadowType}
          shadowOpacity={shadowOpacity}
          aspectRatio={aspectRatio}
          layout={layout}
          isPreview={true}
          scale={0.9}
          playing={isHovered}
        />
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex gap-1">
        {hasAnimation && (
          <span
            className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase"
            style={{ backgroundColor: preset.color }}
          >
            {isCombo ? 'Combo' : preset.animations[0].type}
          </span>
        )}
      </div>

      {/* Favorite Button */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(preset.id);
          }}
          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm ${
            isFavorite
              ? 'bg-rose-500/90 text-white scale-110'
              : 'bg-black/30 text-white/60 hover:bg-black/50 hover:text-white hover:scale-110'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-3 h-3 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Preset Name & Duration */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white">{preset.name}</span>
          <span className="text-[8px] text-white/60">{preset.durationMs / 1000}s</span>
        </div>
      </div>
    </div>
  );
};

// Text Animation Preview Card Component
const TextAnimationCard = ({
  preset,
  isActive,
  onApply,
}: {
  preset: TextDevicePreset;
  isActive: boolean;
  onApply: () => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Layout visual preview based on layout type
  const getLayoutPreview = () => {
    switch (preset.layout) {
      case 'text-top-device-bottom':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="text-[8px] font-bold text-white/80">Aa</div>
            <div className="w-3 h-4 rounded-sm bg-white/60" />
          </div>
        );
      case 'text-bottom-device-top':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-3 h-4 rounded-sm bg-white/60" />
            <div className="text-[8px] font-bold text-white/80">Aa</div>
          </div>
        );
      case 'text-left-device-right':
        return (
          <div className="flex items-center gap-1">
            <div className="text-[8px] font-bold text-white/80">Aa</div>
            <div className="w-3 h-4 rounded-sm bg-white/60" />
          </div>
        );
      case 'text-right-device-left':
        return (
          <div className="flex items-center gap-1">
            <div className="w-3 h-4 rounded-sm bg-white/60" />
            <div className="text-[8px] font-bold text-white/80">Aa</div>
          </div>
        );
      case 'text-overlay':
      case 'text-center-device-behind':
        return (
          <div className="relative w-5 h-6">
            <div className="absolute inset-0 rounded-sm bg-white/40" />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
              Aa
            </div>
          </div>
        );
      case 'text-split-device-center':
        return (
          <div className="flex flex-col items-center gap-0.5">
            <div className="text-[6px] font-bold text-white/80">Aa</div>
            <div className="w-2.5 h-3 rounded-sm bg-white/60" />
            <div className="text-[6px] font-bold text-white/80">Aa</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onApply}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full aspect-[16/10] cursor-pointer rounded-xl border overflow-hidden transition-all duration-300 ${
        isActive ? 'border-accent ring-2 ring-accent/30' : 'border-ui-border hover:border-accent/50'
      }`}
    >
      {/* Gradient Background */}
      <div
        className="absolute inset-0 opacity-80 group-hover:opacity-100"
        style={{ background: `linear-gradient(135deg, ${preset.color}20, ${preset.color}40)` }}
      />

      {/* Layout Preview - Small box showing positioning */}
      <div className="absolute top-2 right-2 w-8 h-8 rounded-md bg-black/30 flex items-center justify-center backdrop-blur-sm">
        {getLayoutPreview()}
      </div>

      {/* Text Animation Preview */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <span className="text-2xl mb-1">{preset.icon}</span>
        <span
          className={`text-sm font-bold text-center leading-tight transition-all duration-500 ${
            isHovered ? 'opacity-100 transform-none' : 'opacity-60'
          }`}
          style={{
            color: preset.color,
            textShadow: isHovered ? `0 0 20px ${preset.color}80` : 'none',
            whiteSpace: 'pre-line',
          }}
        >
          {preset.defaultText.split('\\n').join('\n')}
        </span>
      </div>

      {/* Type Badge */}
      <div className="absolute top-2 left-2">
        <span
          className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white uppercase"
          style={{ backgroundColor: preset.color }}
        >
          {preset.textAnimation.replace('-', ' ')}
        </span>
      </div>

      {/* Info Footer */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white">{preset.name}</span>
          <span className="text-[8px] text-white/60">{preset.durationMs / 1000}s</span>
        </div>
      </div>
    </div>
  );
};

type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad' | 'creative' | 'favorites' | 'text';

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
  } = useRenderStore();

  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();

  // Favorites hook
  const { favorites, toggle: toggleFavorite, isFavorite } = useFavorites();

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [textMode, setTextMode] = useState<'presets' | 'edit'>('presets');
  const presetsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (presetsContainerRef.current) {
      const cards = Array.from(presetsContainerRef.current.children);
      const { keyframes, options } = ANIMATION_PRESETS.fadeInUp;

      cards.forEach((card, i) => {
        card.animate([...keyframes], {
          ...options,
          delay: i * STAGGER_DEFAULTS.cards,
        });
      });
    }
  }, []);

  const handleApplyPreset = (
    preset: LayoutPreset,
    layout: import('../store/renderStore').ImageLayout
  ) => {
    setActivePresetId(preset.id);

    // Apply layout to canvas (keep current background, only apply rotation)
    applyPreset({
      rotationX: preset.rotationX,
      rotationY: preset.rotationY,
      rotationZ: preset.rotationZ,
      imageLayout: layout,
    });

    // Add to timeline if it has animations (replace existing)
    const hasAnimation = preset.animations.some((a) => a.type !== 'none');
    if (hasAnimation) {
      // IMPORTANT: Stop playback first to ensure clean restart
      setIsPlaying(false);

      // Update timeline duration to match animation
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

      // Auto-play the animation after state updates settle
      setTimeout(() => setIsPlaying(true), 100);
    }
  };

  const handlePresetDragStart = (e: React.DragEvent, preset: LayoutPreset) => {
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

  // Categorize presets (all have animations now)
  const singleAnimations = LAYOUT_PRESETS.filter(
    (p) => !p.id.startsWith('duo-') && !p.id.startsWith('trio-')
  );
  const dualAnimations = LAYOUT_PRESETS.filter((p) => p.id.startsWith('duo-'));
  const trioAnimations = LAYOUT_PRESETS.filter((p) => p.id.startsWith('trio-'));

  // Favorites - get all presets that are in favorites set
  const favoritePresets = LAYOUT_PRESETS.filter((p) => isFavorite(p.id));

  const showSingle = filter === 'single';
  const showDuo = filter === 'duo';
  const showTrio = filter === 'trio';
  const showQuad = filter === 'quad';
  const showCreative = filter === 'creative';
  const showFavorites = filter === 'favorites';
  const showText = filter === 'text';

  return (
    <div className="p-4">
      {/* Single Image Animations */}
      {showSingle && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
              Single Image
            </h3>
          </div>
          <p className="text-[9px] text-ui-muted/70 mb-3">
            Hero shots, intros & attention grabbers
          </p>
          <div ref={presetsContainerRef} className="space-y-3">
            {singleAnimations.map((preset) => (
              <AnimatedLayoutCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPreset(preset, 'single')}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={mediaAssets.length > 0 ? [mediaAssets[0]] : [null]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="single"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                isFavorite={isFavorite(preset.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dual Image Animations */}
      {showDuo && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Columns2 className="w-4 h-4 text-purple-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
              Dual Images
            </h3>
          </div>
          <p className="text-[9px] text-ui-muted/70 mb-3">
            Comparisons, reveals & synchronized effects
          </p>
          <div className="space-y-3">
            {dualAnimations.map((preset) => (
              <AnimatedLayoutCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPreset(preset, 'side-by-side')}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={[mediaAssets[0] || null, mediaAssets[1] || null]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="side-by-side"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                isFavorite={isFavorite(preset.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Trio Image Animations */}
      {showTrio && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-emerald-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
              Trio Sequences
            </h3>
          </div>
          <p className="text-[9px] text-ui-muted/70 mb-3">
            Staggered reveals, one by one entrances
          </p>
          <div className="space-y-3">
            {trioAnimations.map((preset) => (
              <AnimatedLayoutCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPreset(preset, 'trio-row')}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={[
                  mediaAssets[0] || null,
                  mediaAssets[1] || null,
                  mediaAssets[2] || null,
                ]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="trio-row"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                isFavorite={isFavorite(preset.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quad Image Animations */}
      {showQuad && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <LayoutGrid className="w-4 h-4 text-sky-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
              Grid Layout
            </h3>
          </div>
          <p className="text-[9px] text-ui-muted/70 mb-3">2x2 grid with synchronized effects</p>
          <div className="space-y-3">
            {singleAnimations.slice(0, 6).map((preset) => (
              <AnimatedLayoutCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPreset(preset, 'grid')}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={[
                  mediaAssets[0] || null,
                  mediaAssets[1] || null,
                  mediaAssets[2] || null,
                  mediaAssets[3] || null,
                ]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="grid"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
                isFavorite={isFavorite(preset.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Creative Layout Animations */}
      {showCreative && (
        <div className="mb-6 space-y-8">
          {/* Masonry */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-pink-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                Masonry
              </h3>
            </div>
            <div className="space-y-3">
              {singleAnimations.slice(0, 3).map((preset) => (
                <AnimatedLayoutCard
                  key={`masonry-${preset.id}`}
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  onApply={() => handleApplyPreset(preset, 'masonry')}
                  onDragStart={(e) => handlePresetDragStart(e, preset)}
                  cornerRadius={cornerRadius}
                  mediaAssets={mediaAssets}
                  stylePreset={stylePreset}
                  shadowType={shadowType}
                  shadowOpacity={shadowOpacity}
                  aspectRatio={imageAspectRatio}
                  layout="masonry"
                  backgroundType={backgroundType}
                  backgroundGradient={backgroundGradient}
                  backgroundColor={backgroundColor}
                  backgroundImage={backgroundImage}
                  isFavorite={isFavorite(preset.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>

          {/* Mosaic */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-orange-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                Mosaic
              </h3>
            </div>
            <div className="space-y-3">
              {singleAnimations.slice(3, 6).map((preset) => (
                <AnimatedLayoutCard
                  key={`mosaic-${preset.id}`}
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  onApply={() => handleApplyPreset(preset, 'mosaic')}
                  onDragStart={(e) => handlePresetDragStart(e, preset)}
                  cornerRadius={cornerRadius}
                  mediaAssets={mediaAssets}
                  stylePreset={stylePreset}
                  shadowType={shadowType}
                  shadowOpacity={shadowOpacity}
                  aspectRatio={imageAspectRatio}
                  layout="mosaic"
                  backgroundType={backgroundType}
                  backgroundGradient={backgroundGradient}
                  backgroundColor={backgroundColor}
                  backgroundImage={backgroundImage}
                  isFavorite={isFavorite(preset.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>

          {/* Film Strip */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid className="w-4 h-4 text-indigo-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                Film Strip
              </h3>
            </div>
            <div className="space-y-3">
              {singleAnimations.slice(6, 9).map((preset) => (
                <AnimatedLayoutCard
                  key={`film-${preset.id}`}
                  preset={preset}
                  isActive={activePresetId === preset.id}
                  onApply={() => handleApplyPreset(preset, 'film-strip')}
                  onDragStart={(e) => handlePresetDragStart(e, preset)}
                  cornerRadius={cornerRadius}
                  mediaAssets={mediaAssets}
                  stylePreset={stylePreset}
                  shadowType={shadowType}
                  shadowOpacity={shadowOpacity}
                  aspectRatio={imageAspectRatio}
                  layout="film-strip"
                  backgroundType={backgroundType}
                  backgroundGradient={backgroundGradient}
                  backgroundColor={backgroundColor}
                  backgroundImage={backgroundImage}
                  isFavorite={isFavorite(preset.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {showFavorites && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Heart className="w-4 h-4 text-rose-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
              Your Favorites
            </h3>
          </div>
          <p className="text-[9px] text-ui-muted/70 mb-3">Quick access to your saved animations</p>
          {favoritePresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Heart className="w-8 h-8 text-ui-muted/30 mb-3" />
              <p className="text-sm text-ui-muted/60 mb-1">No favorites yet</p>
              <p className="text-xs text-ui-muted/40">
                Click the ❤️ on any animation to save it here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoritePresets.map((preset) => {
                // Determine layout based on preset id
                const layout = preset.id.startsWith('duo-')
                  ? 'side-by-side'
                  : preset.id.startsWith('trio-')
                    ? 'trio-row'
                    : 'single';
                return (
                  <AnimatedLayoutCard
                    key={`fav-${preset.id}`}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={() => handleApplyPreset(preset, layout)}
                    onDragStart={(e) => handlePresetDragStart(e, preset)}
                    cornerRadius={cornerRadius}
                    mediaAssets={mediaAssets.length > 0 ? [mediaAssets[0]] : [null]}
                    stylePreset={stylePreset}
                    shadowType={shadowType}
                    shadowOpacity={shadowOpacity}
                    aspectRatio={imageAspectRatio}
                    layout={layout}
                    backgroundType={backgroundType}
                    backgroundGradient={backgroundGradient}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    isFavorite={isFavorite(preset.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Text Animations Section */}
      {showText && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-violet-400" />
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                Text Animations
              </h3>
            </div>
          </div>

          {/* Sub-Tabs: Presets vs Edit */}
          <div className="flex bg-ui-panel/40 p-1 rounded-lg mb-4 border border-ui-border/50">
            <button
              onClick={() => setTextMode('presets')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                textMode === 'presets'
                  ? 'bg-accent text-black shadow-lg shadow-accent/20'
                  : 'text-ui-muted hover:text-white'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              Presets
            </button>
            <button
              onClick={() => setTextMode('edit')}
              className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${
                textMode === 'edit'
                  ? 'bg-accent text-black shadow-lg shadow-accent/20'
                  : 'text-ui-muted hover:text-white'
              }`}
            >
              <Type className="w-3 h-3" />
              Edit Text
            </button>
          </div>

          {textMode === 'edit' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <TextEditor />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-[9px] text-ui-muted/70 mb-4 px-1">
                Select a layout style to get started
              </p>

              {/* Text + Device Presets */}
              <div className="space-y-3">
                {TEXT_DEVICE_PRESETS.map((preset) => (
                  <TextAnimationCard
                    key={preset.id}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={() => {
                      setActivePresetId(preset.id);

                      // Enable text overlay with preset values
                      setTextOverlay({
                        enabled: true,
                        text: preset.defaultText.replace(/\\n/g, '\n'),
                        animation: preset.textAnimation,
                        position: preset.textPosition,
                        layout: preset.layout,
                        fontSize:
                          preset.fontSize === 'xlarge'
                            ? 64
                            : preset.fontSize === 'large'
                              ? 48
                              : preset.fontSize === 'medium'
                                ? 36
                                : 32,
                        color: preset.color,
                      });

                      // Setup timeline
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
                            textOverlay: {
                              text: preset.defaultText,
                              animation: preset.textAnimation,
                              position: preset.textPosition,
                            },
                          },
                        },
                      });
                      setTimeout(() => setIsPlaying(true), 100);
                    }}
                  />
                ))}
              </div>

              {/* Available Text Effects */}
              <div className="mt-8 pt-6 border-t border-ui-border/30">
                <h4 className="text-[9px] font-bold uppercase tracking-widest text-ui-muted/60 mb-4 px-1 flex items-center gap-2">
                  <Sparkles className="w-3 h-3" />
                  Text Effects
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {TEXT_ANIMATIONS.map((anim) => (
                    <div
                      key={anim.id}
                      onClick={() => {
                        setTextOverlay({ animation: anim.id, enabled: true });
                        setTextMode('edit');
                      }}
                      className="flex flex-col items-center p-3 rounded-xl bg-ui-panel/20 border border-ui-border/40 hover:border-accent/40 hover:bg-ui-panel/40 transition-all cursor-pointer group"
                      title={anim.description}
                    >
                      <span className="text-xl mb-2 group-hover:scale-110 transition-transform">
                        {anim.icon}
                      </span>
                      <span className="text-[8px] font-bold text-ui-muted group-hover:text-white text-center uppercase tracking-tighter">
                        {anim.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
