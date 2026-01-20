import { useState, useRef, useEffect } from 'react';
import { Sparkles, Columns2, LayoutGrid } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { LAYOUT_PRESETS, type LayoutPreset } from '../constants/styles';
import { DeviceRenderer } from './DeviceRenderer';
import { ANIMATION_PRESETS, createLayoutAnimation, DURATIONS, EASINGS, STAGGER_DEFAULTS } from '../constants/animations';

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
}: {
  preset: LayoutPreset;
  isActive: boolean;
  onApply: () => void;
  onDragStart: (e: React.DragEvent) => void;
  cornerRadius: number;
  mediaAssets: (import('../store/renderStore').MediaAsset | null)[];
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
  aspectRatio?: import('../store/renderStore').AspectRatio;
  layout?: import('../store/renderStore').ImageLayout;
  backgroundType: import('../store/renderStore').BackgroundType;
  backgroundGradient: string;
  backgroundColor: string;
  backgroundImage: string | null;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<Animation[]>([]);

  const hasAnimation = preset.animations.some(a => a.type !== 'none');
  const isCombo = preset.animations.filter(a => a.type !== 'none').length > 1;

  useEffect(() => {
    if (!cardRef.current || !deviceRef.current) return;

    const card = cardRef.current;
    const device = deviceRef.current;

    const runAnimation = () => {
      // Cancel previous animations
      animationsRef.current.forEach(anim => anim.cancel());
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
      // Card hover effect
      card.animate(
        [...ANIMATION_PRESETS.cardHoverIn.keyframes],
        ANIMATION_PRESETS.cardHoverIn.options
      );

      if (hasAnimation) {
        runAnimation();
      } else {
        device.animate(
          [{ transform: 'scale(0.9)' }],
          { duration: DURATIONS.medium, easing: EASINGS.easeOut, fill: 'forwards' }
        );
      }
    };

    const handleMouseLeave = () => {
      // Card hover out
      card.animate(
        [...ANIMATION_PRESETS.cardHoverOut.keyframes],
        ANIMATION_PRESETS.cardHoverOut.options
      );

      // Cancel running animations
      animationsRef.current.forEach(anim => anim.cancel());
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
      animationsRef.current.forEach(anim => anim.cancel());
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
        <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`} />
      )}
      {backgroundType === 'solid' && (
        <div className="absolute inset-0 opacity-80 transition-opacity group-hover:opacity-100" style={{ backgroundColor }} />
      )}
      {backgroundType === 'image' && backgroundImage && (
        <div className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100" style={{ backgroundImage: `url(${backgroundImage})` }} />
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

type LayoutFilter = 'single' | 'duo' | 'trio' | 'quad';

export const LayoutsPanel = ({ filter = 'single' }: { filter?: LayoutFilter }) => {
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
  } = useRenderStore();

  const { addClip, clearTrack, setPlayhead, setIsPlaying } = useTimelineStore();

  const [activePresetId, setActivePresetId] = useState<string | null>(null);
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

  const handleApplyPreset = (preset: LayoutPreset) => {
    setActivePresetId(preset.id);

    // Apply layout to canvas (keep current background, only apply rotation)
    applyPreset({
      rotationX: preset.rotationX,
      rotationY: preset.rotationY,
      rotationZ: preset.rotationZ,
    });

    // Add to timeline if it has animations (replace existing)
    const hasAnimation = preset.animations.some(a => a.type !== 'none');
    if (hasAnimation) {
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
            animations: preset.animations.map(a => a.type).filter(t => t !== 'none') as any[],
            icon: preset.icon,
            color: preset.color,
            duration: preset.durationMs,
            easing: preset.animations[0]?.easing || 'ease-in-out',
          },
        },
      });

      // Auto-play the animation after selecting
      setTimeout(() => setIsPlaying(true), 50);
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
  const singleAnimations = LAYOUT_PRESETS.filter(p =>
    !p.id.startsWith('duo-') && !p.id.startsWith('trio-')
  );
  const dualAnimations = LAYOUT_PRESETS.filter(p => p.id.startsWith('duo-'));
  const trioAnimations = LAYOUT_PRESETS.filter(p => p.id.startsWith('trio-'));

  const showSingle = filter === 'single';
  const showDuo = filter === 'duo';
  const showTrio = filter === 'trio';
  const showQuad = filter === 'quad';

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
                onApply={() => handleApplyPreset(preset)}
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
                onApply={() => handleApplyPreset(preset)}
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
                onApply={() => handleApplyPreset(preset)}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={[mediaAssets[0] || null, mediaAssets[1] || null, mediaAssets[2] || null]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="trio-row"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
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
          <p className="text-[9px] text-ui-muted/70 mb-3">
            2x2 grid with synchronized effects
          </p>
          <div className="space-y-3">
            {singleAnimations.slice(0, 6).map((preset) => (
              <AnimatedLayoutCard
                key={preset.id}
                preset={preset}
                isActive={activePresetId === preset.id}
                onApply={() => handleApplyPreset(preset)}
                onDragStart={(e) => handlePresetDragStart(e, preset)}
                cornerRadius={cornerRadius}
                mediaAssets={[mediaAssets[0] || null, mediaAssets[1] || null, mediaAssets[2] || null, mediaAssets[3] || null]}
                stylePreset={stylePreset}
                shadowType={shadowType}
                shadowOpacity={shadowOpacity}
                aspectRatio={imageAspectRatio}
                layout="grid"
                backgroundType={backgroundType}
                backgroundGradient={backgroundGradient}
                backgroundColor={backgroundColor}
                backgroundImage={backgroundImage}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
