import { getShadowStyle, STYLE_PRESETS } from '../constants/styles';

type DeviceRendererProps = {
  rotationX: number;
  rotationY: number;
  rotationZ: number;
  cornerRadius: number;
  mockupType: string;
  mediaAssets: string[];
  scale?: number;
  isPreview?: boolean;
  onScreenClick?: (index: number) => void;
  stylePreset?: string;
  shadowType?: string;
  shadowOpacity?: number;
};

export const DeviceRenderer = ({
  rotationX,
  rotationY,
  rotationZ,
  cornerRadius,
  mockupType,
  mediaAssets,
  isPreview = false,
  onScreenClick,
  scale = 1,
  stylePreset = 'default',
  shadowType = 'spread',
  shadowOpacity = 40,
}: DeviceRendererProps) => {

  const MediaContainer = ({ index }: { index: number }) => {
    // ... same as before
    const media = mediaAssets[index] || null;
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center bg-cover bg-center text-center overflow-hidden ${isPreview ? '' : 'cursor-pointer group'}`}
        onClick={() => !isPreview && onScreenClick?.(index)}
        style={{ borderRadius: (mockupType === 'iphone' || mockupType === 'dual-phone') ? `${Math.max(0, cornerRadius - 4)}px` : '0px' }}
      >
        {media ? (
           media.match(/blob:.*$/) ? (
             <video src={media} className="w-full h-full object-cover" autoPlay loop muted playsInline />
           ) : (
             <img src={media} className="w-full h-full object-cover" alt="Selected media" />
           )
        ) : (
            <div 
              className={`w-full h-full bg-cover bg-center flex items-center justify-center ${isPreview ? 'p-1' : 'p-4'} hover:opacity-80 transition-opacity bg-zinc-900 ${!isPreview && 'group-hover:bg-zinc-800'}`}
            >
              <div className={`flex flex-col items-center gap-2 text-[#9fb2bc] ${!isPreview && 'group-hover:text-[#d4ff3f]'} transition-colors`}>
                <span className={`material-symbols-outlined ${isPreview ? 'text-xl' : 'text-4xl'}`}>add_photo_alternate</span>
                {!isPreview && <span className="text-[10px] uppercase tracking-widest font-bold">Drop or Paste</span>}
              </div>
            </div>
        )}
      </div>
    );
  };

  // Get computed shadow based on type and rotation
  const computedShadow = () => {
    if (isPreview) return 'none';
    return getShadowStyle(shadowType, shadowOpacity, rotationX, rotationY);
  };

  // Get style preset CSS
  const getStyleCSS = () => {
    const preset = STYLE_PRESETS.find(p => p.id === stylePreset);
    if (!preset || stylePreset === 'default') return {};
    return preset.css;
  };

  const styleCSS = getStyleCSS();

  // Common 3D Transform
  // We apply the scale to the parent wrapper, but the rotation to the inner element
  // to avoid transform-origin issues.
  const containerStyle = {
      transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(${rotationZ || 0}deg) scale(${scale})`,
      transformStyle: 'preserve-3d' as const,
  };

  if (mockupType === 'dual-phone') {
        return (
            <div className="flex h-full w-full items-center justify-center">
                 <div
                    className="relative flex items-center justify-center h-full w-full"
                    style={containerStyle}
                >
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            // Use percentage-based width relative to container for responsiveness
                            className="absolute flex flex-col items-center justify-center bg-black border-[clamp(2px,1vw,8px)] border-[#2c393f] aspect-[9/19.5] h-[80%]"
                            style={{
                                borderRadius: `${cornerRadius}px`,
                                transform: i === 1 ? 'translate(25%, 10%)' : 'translate(-25%, -10%)',
                                boxShadow: computedShadow(),
                                ...styleCSS,
                                backfaceVisibility: 'hidden'
                            }}
                        >
                            <div className="absolute top-0 z-10 flex h-[4%] w-1/3 items-center justify-center rounded-b-xl bg-black">
                                <div className="h-[20%] w-[40%] rounded-full bg-zinc-800" />
                            </div>
                            <div className="w-full h-full pt-[4%] pb-[2%] px-[2%]">
                                <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}>
                                    <MediaContainer index={i} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
  }

  if (mockupType === 'browser') {
      return (
         <div className="flex h-full w-full items-center justify-center">
             <div 
                className="relative bg-[#1e1e1e] rounded-lg flex flex-col overflow-hidden aspect-[3/2] w-[80%]"
                style={{
                    ...containerStyle,
                    boxShadow: computedShadow(),
                    backfaceVisibility: 'hidden',
                    ...styleCSS
                }}
             >
                 <div className="h-[8%] bg-[#2d2d2d] flex items-center px-[2%] gap-[1%] border-b border-[#3e3e3e]">
                     <div className="flex gap-[4px] px-2">
                         <div className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                         <div className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                         <div className="w-2 h-2 rounded-full bg-[#27c93f]" />
                     </div>
                     <div className="flex-1 flex justify-center">
                         <div className="h-[60%] w-2/3 bg-[#1e1e1e] rounded flex items-center justify-center text-[min(8px,1vw)] text-zinc-500 font-mono">
                             liike.app
                         </div>
                     </div>
                 </div>
                 <div className="flex-1 relative">
                     <MediaContainer index={0} />
                 </div>
             </div>
         </div>
      );
  }
  
  // Default iPhone / Portrait
  return (
    <div className="flex h-full w-full items-center justify-center">
        <div
          className="relative flex flex-col items-center justify-center bg-black border-[clamp(4px,1.5cqw,12px)] border-[#2c393f] transition-all duration-700 ease-out"
          style={{
            aspectRatio: '9/19.5',
            height: '90%',
            ...containerStyle,
            borderRadius: `${cornerRadius}px`,
            boxShadow: computedShadow(),
            backfaceVisibility: 'hidden',
            ...styleCSS
          }}
        >
          <div className="absolute top-0 z-10 flex h-[3%] w-1/3 items-center justify-center rounded-b-xl bg-black">
            <div className="h-[30%] w-[50%] rounded-full bg-zinc-800" />
          </div>
          
          <div className="w-full h-full pt-[4%] pb-[2%] px-[2%]">
             <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}>
                <MediaContainer index={0} />
             </div>
          </div>
        </div>
    </div>
  );
};
