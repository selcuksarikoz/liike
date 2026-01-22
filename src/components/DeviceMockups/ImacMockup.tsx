import { DeviceMockupProps } from './IphoneMockup';

// iMac 24" (approx) 4.5k retina
export const ImacMockup = ({ children, scale = 1 }: DeviceMockupProps) => {
  const baseWidth = 1200;
  // Aspect ~ 16:9 for screen
  
  return (
    <div className="relative flex flex-col items-center" style={{ width: baseWidth * scale }}>
      {/* Screen Unit */}
      <div 
         className="relative bg-white shadow-2xl"
         style={{
             width: baseWidth * scale,
             height: `${(baseWidth * 0.75)}px`, // Including chin
             borderRadius: `${24 * scale}px`,
             background: 'linear-gradient(to bottom, #dbe4eb, #c5d3df)'
         }}
      >
          {/* Metallic Border / Housing */}
          <div className="absolute inset-0 rounded-[inherit] border-[4px] border-[#e0e0e0] pointer-events-none z-20" />
          
          {/* While Bezel */}
          <div 
             className="absolute inset-[16px] bg-[#f2f2f2] z-0"
             style={{ borderRadius: `${16 * scale}px` }}
          />

          {/* Screen Content Area (Black Bezel) */}
          <div 
            className="absolute bg-black overflow-hidden"
             style={{
                 top: `${24 * scale}px`,
                 left: `${24 * scale}px`,
                 right: `${24 * scale}px`,
                 height: `${baseWidth * 0.5625 * scale}px`, // 16:9
                 borderRadius: `${12 * scale}px`
             }}
          >
              {children}
          </div>

          {/* Chin */}
          <div 
            className="absolute bottom-0 w-full flex items-center justify-center"
            style={{ height: `${(baseWidth * 0.75 - (24 * scale) - (baseWidth * 0.5625 * scale)) }px` }}
          >
              {/* Apple Logo placeholder or similar */}
              <div className="w-[10%] h-[20%] bg-black/10 rounded-full" />
          </div>
      </div>
      
      {/* Stand */}
      <div 
         className="relative z-[-1] bg-[#bec9d3]"
         style={{
             width: `${baseWidth * 0.25 * scale}px`,
             height: `${140 * scale}px`,
             marginTop: `-${20 * scale}px`,
             background: 'linear-gradient(to right, #b0bec5, #cfd8dc)'
         }}
      />
      {/* Base */}
      <div 
         className="relative z-[-1] bg-[#bec9d3] rounded-lg shadow-lg"
         style={{
             width: `${baseWidth * 0.35 * scale}px`,
             height: `${12 * scale}px`,
             background: 'linear-gradient(to right, #b0bec5, #cfd8dc)'
         }}
      />
    </div>
  );
};
