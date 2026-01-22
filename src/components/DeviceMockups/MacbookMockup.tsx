export type DeviceMockupProps = {
  children: React.ReactNode;
  scale?: number;
};

export const MacbookMockup = ({ children, scale = 1 }: DeviceMockupProps) => {
  // Macbook Pro 16" aspect roughly ~1.54 
  // Base dimensions based on ~1000px width
  const baseWidth = 1000;
  const baseHeight = 640;
  
  return (
    <div className="relative flex flex-col items-center" style={{ width: baseWidth * scale }}>
      {/* Lid / Screen Housing */}
      <div 
         className="relative bg-[#0d0d0d] rounded-t-2xl shadow-2xl border-[1px] border-[#333]"
         style={{
             width: baseWidth * scale,
             height: baseHeight * scale,
             borderRadius: `${18 * scale}px ${18 * scale}px 0 0`,
             background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)'
         }}
      >
          {/* Inner Screen Bezel */}
          <div 
             className="absolute inset-[1px] bg-black"
             style={{ 
                 borderRadius: `${16 * scale}px ${16 * scale}px 0 0` 
             }}
          />

          {/* Camera Notch */}
          <div 
             className="absolute top-0 left-1/2 -translate-x-1/2 bg-black z-30"
             style={{
                 width: `${120 * scale}px`,
                 height: `${24 * scale}px`,
                 borderBottomLeftRadius: `${12 * scale}px`,
                 borderBottomRightRadius: `${12 * scale}px`,
             }}
          >
             {/* Camera Lens */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full bg-[#1a1a2e] shadow-[inset_0_0_2px_rgba(255,255,255,0.3)]" />
          </div>

          {/* Screen Content */}
          <div
             className="absolute z-10 overflow-hidden bg-black"
             style={{
                 top: `${16 * scale}px`,
                 left: `${16 * scale}px`,
                 right: `${16 * scale}px`,
                 bottom: `${16 * scale}px`,
                 // Often square corners at bottom if screen goes fully to hinge, but mac has small bezel.
                 // Actually modern macbooks have rounded top corners on screen display area
                 borderTopLeftRadius: `${10 * scale}px`,
                 borderTopRightRadius: `${10 * scale}px`,
             }}
          >
            {children}
          </div>
      </div>
      
      {/* Bottom Deck (Hinge & Keyboard Base visible part) */}
      <div className="relative z-20 flex flex-col items-center justify-start">
         {/* Hinge */}
         <div 
           className="w-full bg-[#1a1a1a] rounded-b-lg"
            style={{
                width: baseWidth * scale * 0.98,
                height: `${14 * scale}px`,
                background: 'linear-gradient(to bottom, #0a0a0a, #1a1a1a)'
            }}
         />
         {/* Base with Groove */}
         <div 
            className="w-full bg-[#c0c0c0] shadow-xl relative"
             style={{
                 width: baseWidth * scale,
                 height: `${18 * scale}px`,
                 borderBottomLeftRadius: `${20 * scale}px`,
                 borderBottomRightRadius: `${20 * scale}px`,
                 background: 'linear-gradient(to bottom, #d8d8d8, #b0b0b0)'
             }}
         >
             {/* Opening Groove */}
             <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#a0a0a0] rounded-b-md"
                style={{
                    width: `${140 * scale}px`,
                    height: `${6 * scale}px`
                }}
             />
         </div>
      </div>
    </div>
  );
};
