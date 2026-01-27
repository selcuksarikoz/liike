import { DeviceConfig, isDeviceImagePreloaded } from '../../constants/devices';
import { useState, useEffect } from 'react';

export type DeviceMockupProps = {
  children: React.ReactNode;
  scale?: number;
  config?: DeviceConfig;
  layoutMode?: 'single' | 'duo' | 'trio';
};

export const GenericDeviceMockup = ({
  children,
  scale = 1,
  config,
  layoutMode = 'single',
}: DeviceMockupProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  // Check if already preloaded on mount
  useEffect(() => {
    if (config && isDeviceImagePreloaded(config.id)) {
      setImageLoaded(true);
    }
  }, [config]);

  if (!config) return <>{children}</>;

  const screenConfig = config.screen[layoutMode] || config.screen.single;

  return (
    <div
      className="relative select-none flex items-center justify-center transition-all duration-300"
      style={{
        width: '100%',
        height: '100%',
        padding: '2%', // Subtle breathing room
      }}
    >
      <div
        className="relative flex items-center justify-center"
        style={{
          height: '100%',
          maxHeight: `${100 * scale}%`,
          maxWidth: `${100 * scale}%`,
          width: 'auto',
          aspectRatio: `${config.aspectRatio}`,
          flexShrink: 0,
        }}
      >
        {/* Device Frame - Sitting on top */}
        <img
          src={config.image}
          alt={config.name}
          loading="eager"
          decoding="sync"
          onLoad={() => setImageLoaded(true)}
          className={`relative z-20 w-full h-full object-contain pointer-events-none transition-opacity duration-150 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Screen Area - Precisely positioned inside the frame using padding/inset */}
        <div
          data-screen-container
          className="absolute z-10 overflow-hidden bg-black"
          style={{
            inset: screenConfig.padding,
            borderRadius: screenConfig.radius,
          }}
        >
          <div className="w-full h-full flex items-center justify-center">{children}</div>
        </div>
      </div>
    </div>
  );
};
