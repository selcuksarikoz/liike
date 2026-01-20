import { useRef, useState, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { useRenderStore } from '../store/renderStore';
import { DeviceRenderer } from './DeviceRenderer';

export const Workarea = ({ stageRef }: { stageRef: React.RefObject<HTMLDivElement | null> }) => {
  const {
    rotationX, rotationY, rotationZ,
    cornerRadius, backgroundGradient,
    mockupType, setMediaAssets, mediaAssets,
    canvasWidth, canvasHeight, canvasCornerRadius,
    shadowType, shadowOpacity, stylePreset,
    deviceScale
  } = useRenderStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const deviceContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleScreenClick = (index: number) => {
    setActiveMediaIndex(index);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAssets = [...mediaAssets];
      newAssets[activeMediaIndex] = url;
      setMediaAssets(newAssets);
    }
  };

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Calculate scale to fit canvas in view
  const fitScale = useMemo(() => {
    if (!canvasWidth || !canvasHeight || !containerSize.width || !containerSize.height) return 0.5;

    const padding = 80;
    const availableWidth = containerSize.width - padding;
    const availableHeight = containerSize.height - padding;

    if (availableWidth <= 0 || availableHeight <= 0) return 0.5;

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;

    return Math.min(1, scaleX, scaleY);
  }, [canvasWidth, canvasHeight, containerSize]);

  const zoomDisplay = isNaN(fitScale) ? '100%' : `${Math.round(fitScale * 100)}%`;

  // GSAP animation on rotation changes
  useEffect(() => {
    if (deviceContainerRef.current) {
      gsap.to(deviceContainerRef.current, {
        duration: 0.6,
        ease: 'power2.out'
      });
    }
  }, [rotationX, rotationY, rotationZ]);

  // GSAP entrance animation
  useEffect(() => {
    if (canvasRef.current) {
      gsap.fromTo(canvasRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'back.out(1.4)' }
      );
    }
  }, []);

  // Animate canvas size changes
  useEffect(() => {
    if (canvasRef.current && canvasWidth && canvasHeight) {
      gsap.to(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        duration: 0.4,
        ease: 'power2.out'
      });
    }
  }, [canvasWidth, canvasHeight]);

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#111618]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#2c393f_1px,transparent_1px)] [background-size:32px_32px]" />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*,video/*"
        onChange={handleFileChange}
      />

      {/* Canvas Toolbar */}
      <div className="absolute top-6 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-xl border border-[#2c393f] bg-[#1c2529]/80 p-1 backdrop-blur-md">
        {['zoom_in', 'pan_tool'].map((icon) => (
          <button
            key={icon}
            className="flex w-8 h-8 items-center justify-center rounded-lg text-[#9fb2bc] transition-all hover:bg-[#1c3b4a]/40 hover:text-white"
          >
            <span className="material-symbols-outlined text-[18px]">{icon}</span>
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-[#2c393f]" />
        <button className="flex h-8 items-center gap-2 rounded-lg px-3 text-[11px] font-medium text-[#9fb2bc] transition-all hover:bg-[#1c3b4a]/40 hover:text-white">
          <span>{zoomDisplay}</span>
          <span className="material-symbols-outlined text-[14px]">unfold_more</span>
        </button>
        <button className="flex w-8 h-8 items-center justify-center rounded-lg text-[#9fb2bc] transition-all hover:bg-[#1c3b4a]/40 hover:text-white">
          <span className="material-symbols-outlined text-[18px]">center_focus_weak</span>
        </button>
      </div>

      <div ref={containerRef} className="relative flex flex-1 items-center justify-center p-12 overflow-hidden bg-[#0a0f12]">
        {/* Background Gradient / Canvas Area */}
        <div
            ref={(el) => {
              canvasRef.current = el;
              if (stageRef && 'current' in stageRef) {
                (stageRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
              }
            }}
            className="relative shadow-2xl transition-all duration-300 ease-in-out flex items-center justify-center bg-transparent"
            style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${isNaN(fitScale) ? 1 : fitScale})`,
                transformOrigin: 'center center'
            }}
        >
             {/* Canvas Background */}
             <div
                className="absolute inset-0 border border-[#2c393f] bg-gradient-to-br opacity-100 overflow-hidden"
                style={{
                  backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`,
                  borderRadius: `${canvasCornerRadius}px`
                }}
             >
               <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient}`} />
             </div>

             {/* Dynamic Mockup Render - Centered in Canvas */}
            <div
              ref={deviceContainerRef}
              className="relative z-10 w-full h-full flex items-center justify-center p-[5%]"
            >
                <DeviceRenderer
                  rotationX={rotationX}
                  rotationY={rotationY}
                  rotationZ={rotationZ}
                  cornerRadius={cornerRadius}
                  mockupType={mockupType}
                  mediaAssets={mediaAssets}
                  onScreenClick={handleScreenClick}
                  shadowType={shadowType}
                  shadowOpacity={shadowOpacity}
                  stylePreset={stylePreset}
                  scale={deviceScale}
                />
            </div>
        </div>
      </div>
    </section>
  );
};
