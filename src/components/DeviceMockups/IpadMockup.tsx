import { DeviceMockupProps } from './MacbookMockup'; // Reusing type

// iPad Pro 12.9" aspect ~ 4:3
export const IpadMockup = ({ children, scale = 1 }: DeviceMockupProps) => {
  const width = 640;
  const height = 480; // Only initial aspect, CSS will control relative to children often
  
  // Real iPad Pro stats roughly: ~215mm x 280mm
  // Let's assume portrait for now, or allow orientation prop later?
  // Let's make it a 4:3 box
  
  return (
    <div 
       className="relative rounded-[32px] bg-black shadow-xl border-[4px] border-zinc-800"
       style={{ 
           width: `${540 * scale}px`, 
           height: `${720 * scale}px`,
           borderRadius: `${32 * scale}px`
       }}
    >
        {/* Outer Frame / Metallic Edge */}
        <div className="absolute inset-0 rounded-[28px] pointer-events-none z-20 border-[2px] border-[#444]" />
        
        {/* Bezel */}
        <div 
           className="absolute inset-[14px] bg-black"
           style={{ borderRadius: `${20 * scale}px` }}
        />

        {/* Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-full h-[20px] flex justify-center py-1">
             <div className="w-1.5 h-1.5 rounded-full bg-[#222]" />
        </div>

        {/* Screen Content */}
        <div 
           className="absolute z-10 overflow-hidden bg-black"
           style={{
               top: `${20 * scale}px`,
               left: `${20 * scale}px`,
               right: `${20 * scale}px`,
               bottom: `${20 * scale}px`,
               borderRadius: `${12 * scale}px`
           }}
        >
          {children}
        </div>
        
    </div>
  );
};
