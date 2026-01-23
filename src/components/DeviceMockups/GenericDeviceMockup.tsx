import { DeviceConfig, isDeviceImagePreloaded } from '../../constants/devices';
import { useState, useEffect } from 'react';

export type DeviceMockupProps = {
  children: React.ReactNode;
  scale?: number;
  config?: DeviceConfig;
};

export const GenericDeviceMockup = ({ children, scale = 1, config }: DeviceMockupProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if already preloaded on mount
  useEffect(() => {
    if (config && isDeviceImagePreloaded(config.id)) {
      setImageLoaded(true);
    }
  }, [config]);

  if (!config) return <>{children}</>;

  return (
    <div
      className="relative select-none"
      style={{
        width: `${config.width * scale}px`,
        aspectRatio: `${config.aspectRatio}`
      }}
    >
      {/* Device Frame - Z-Index 20 to sit ON TOP of content */}
      <img
        src={config.image}
        alt={config.name}
        loading="eager"
        decoding="sync"
        onLoad={() => setImageLoaded(true)}
        className={`relative z-20 w-full h-full object-contain pointer-events-none drop-shadow-2xl transition-opacity duration-150 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      
      {/* Screen Content Area - Z-Index 10 to sit BEHIND frame transparent hole (if hole exists)
          OR Z-Index 30 if frame has no hole (but user says they have holes/transparency).
          User said: "transparan alanlari algila ve ... konur".
          Usually transparent device frames (like 'clay' mockups) have a hole.
          If I put content *behind* (z-10), the frame (z-20) covers the edges. This is cleaner.
          So, Z-index 10.
      */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
          top: config.screen.top,
          left: config.screen.left,
          width: config.screen.width,
          height: config.screen.height,
          borderRadius: config.screen.radius.includes('%') ? config.screen.radius : `calc(${config.screen.radius} * ${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
