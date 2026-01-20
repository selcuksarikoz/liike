import { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useRenderStore } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { CameraStylePanel } from './CameraStylePanel';
import { LAYOUT_PRESETS, type LayoutPreset } from '../constants/styles';
import { DeviceRenderer } from './DeviceRenderer';

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
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const deviceRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const hasAnimation = preset.animations.some(a => a.type !== 'none');
  const isCombo = preset.animations.filter(a => a.type !== 'none').length > 1;

  useEffect(() => {
    if (!cardRef.current || !deviceRef.current) return;

    const card = cardRef.current;
    const device = deviceRef.current;

    const runAnimation = () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }

      const tl = gsap.timeline({ repeat: -1 });

      preset.animations.forEach((anim) => {
        if (anim.type === 'none') return;

        const intensity = anim.intensity || 10;

        switch (anim.type) {
          case 'float':
            tl.to(device, {
              y: -intensity,
              duration: anim.duration / 1000 / 2,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
            }, 0);
            break;
          case 'bounce':
            tl.to(device, {
              y: -intensity,
              duration: anim.duration / 1000 / 4,
              ease: 'power2.out',
              yoyo: true,
              repeat: 3,
            }, 0);
            break;
          case 'rotate':
            tl.to(device, {
              rotationY: `+=${intensity}`,
              duration: anim.duration / 1000,
              ease: anim.easing === 'linear' ? 'none' : anim.easing,
            }, 0);
            break;
          case 'zoom':
            tl.to(device, {
              scale: intensity,
              duration: anim.duration / 1000 / 2,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: 1,
            }, 0);
            break;
          case 'slide':
            tl.fromTo(device,
              { x: intensity },
              { x: 0, duration: anim.duration / 1000, ease: 'power2.out' },
            0);
            break;
          case 'pulse':
            tl.to(device, {
              scale: intensity,
              duration: anim.duration / 1000 / 2,
              ease: 'power2.inOut',
              yoyo: true,
              repeat: 1,
            }, 0);
            break;
          case 'swing':
            tl.to(device, {
              rotation: intensity,
              duration: anim.duration / 1000 / 2,
              ease: 'sine.inOut',
              yoyo: true,
              repeat: 1,
            }, 0);
            break;
        }
      });

      animationRef.current = tl;
    };

    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.02,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        duration: 0.3,
        ease: 'power2.out',
      });

      if (hasAnimation) {
        runAnimation();
      } else {
        gsap.to(device, {
          scale: 0.95,
          duration: 0.5,
          ease: 'back.out(1.7)',
        });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        boxShadow: '0 0 0 rgba(0, 0, 0, 0)',
        duration: 0.3,
        ease: 'power2.out',
      });

      if (animationRef.current) {
        animationRef.current.kill();
      }
      gsap.to(device, {
        x: 0,
        y: 0,
        scale: 0.85,
        rotation: 0,
        rotationY: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) {
        animationRef.current.kill();
      }
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
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${preset.backgroundGradient} opacity-80 transition-opacity group-hover:opacity-100`} />

      {/* Device Preview */}
      <div
        ref={deviceRef}
        className="absolute inset-0 flex items-center justify-center p-4 scale-[0.85] transition-transform duration-500"
        style={{ perspective: '1000px' }}
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

      {/* Animation icon indicator */}
      {hasAnimation && (
        <div
          className="absolute top-2 right-2 w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${preset.color}80` }}
        >
          <span className="material-symbols-outlined text-[14px] text-white">
            {preset.icon}
          </span>
        </div>
      )}

      {/* Preset Name & Duration */}
      <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-white">{preset.name}</span>
          <span className="text-[8px] text-white/60">{preset.durationMs / 1000}s</span>
        </div>
      </div>

      {/* Active indicator */}
      {isActive && !hasAnimation && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
      )}

      {/* Drag hint on hover */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] font-medium text-white flex items-center gap-1 bg-black/50 px-2 py-1 rounded-lg">
          <span className="material-symbols-outlined text-[14px]">drag_indicator</span>
          Drag to Timeline
        </span>
      </div>
    </div>
  );
};

export const SidebarRight = () => {
  const {
    cornerRadius,
    mediaAssets,
    shadowType,
    shadowOpacity,
    stylePreset,
    imageAspectRatio,
    imageLayout,
    applyPreset,
  } = useRenderStore();

  const { addClip, clearTrack } = useTimelineStore();

  const [activeTab, setActiveTab] = useState<'layouts' | 'style'>('layouts');
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const presetsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'layouts' && presetsContainerRef.current) {
      const cards = presetsContainerRef.current.children;
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.7)' }
      );
    }
  }, [activeTab]);

  const handleApplyPreset = (preset: LayoutPreset) => {
    setActivePresetId(preset.id);

    // Apply layout to canvas
    applyPreset({
      rotationX: preset.rotationX,
      rotationY: preset.rotationY,
      rotationZ: preset.rotationZ,
      backgroundGradient: preset.backgroundGradient,
    });

    // Add to timeline if it has animations (replace existing)
    const hasAnimation = preset.animations.some(a => a.type !== 'none');
    if (hasAnimation) {
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
          backgroundGradient: preset.backgroundGradient,
        },
      })
    );
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Separate static and animated presets
  const staticPresets = LAYOUT_PRESETS.filter(p => !p.animations.some(a => a.type !== 'none'));
  const animatedPresets = LAYOUT_PRESETS.filter(p => p.animations.some(a => a.type !== 'none'));

  return (
    <aside className="flex w-80 flex-col border-l border-ui-border bg-ui-bg-secondary h-full overflow-hidden">
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

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {activeTab === 'layouts' && (
          <div className="p-4">
            {/* Animated Layouts Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[16px] text-accent">animation</span>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                  Animated Layouts
                </h3>
              </div>
              <p className="text-[9px] text-ui-muted/70 mb-3">
                Click to apply or drag to timeline
              </p>
              <div ref={presetsContainerRef} className="space-y-3">
                {animatedPresets.map((preset) => (
                  <AnimatedLayoutCard
                    key={preset.id}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={() => handleApplyPreset(preset)}
                    onDragStart={(e) => handlePresetDragStart(e, preset)}
                    cornerRadius={cornerRadius}
                    mediaAssets={mediaAssets}
                    stylePreset={stylePreset}
                    shadowType={shadowType}
                    shadowOpacity={shadowOpacity}
                    aspectRatio={imageAspectRatio}
                    layout={imageLayout}
                  />
                ))}
              </div>
            </div>

            {/* Static Layouts Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-[16px] text-ui-muted">crop_square</span>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted">
                  Static Layouts
                </h3>
              </div>
              <div className="space-y-3">
                {staticPresets.map((preset) => (
                  <AnimatedLayoutCard
                    key={preset.id}
                    preset={preset}
                    isActive={activePresetId === preset.id}
                    onApply={() => handleApplyPreset(preset)}
                    onDragStart={(e) => handlePresetDragStart(e, preset)}
                    cornerRadius={cornerRadius}
                    mediaAssets={mediaAssets}
                    stylePreset={stylePreset}
                    shadowType={shadowType}
                    shadowOpacity={shadowOpacity}
                    aspectRatio={imageAspectRatio}
                    layout={imageLayout}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'style' && <CameraStylePanel />}
      </div>
    </aside>
  );
};
