import { DeviceMockupProps } from './IphoneMockup';

// Apple Watch Ultra style frame
export const AppleWatchMockup = ({ children, scale = 1 }: DeviceMockupProps) => {
  // Base width ~ 400px for scaling logic
  const width = 410;
  const height = 502; // Ultra aspect ratio
  
  return (
    <div className="relative" style={{ width: width * scale, height: height * scale }}>
       {/* Strap Top */}
       <div 
         className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[20%] bg-orange-500 rounded-t-[40px] z-0"
         style={{ width: width * 0.7 * scale, height: 200 * scale }}
       />
       {/* Strap Bottom */}
        <div 
         className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[20%] bg-orange-500 rounded-b-[40px] z-0"
         style={{ width: width * 0.7 * scale, height: 200 * scale }}
       />

       {/* Titanium Case */}
       <div 
          className="absolute inset-0 z-10 bg-[#e3e3e3] rounded-[80px] shadow-xl"
          style={{ 
              borderRadius: `${80 * scale}px`,
              background: 'linear-gradient(135deg, #f5f5f5 0%, #d4d4d4 100%)',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.1)'
          }}
       >
          {/* Screen Bezel */}
          <div 
             className="absolute inset-[12px] bg-black rounded-[68px]"
             style={{ borderRadius: `${68 * scale}px` }}
          />

          {/* Screen Content */}
           <div 
             className="absolute bg-black overflow-hidden z-20"
             style={{
                 inset: `${24 * scale}px`,
                 borderRadius: `${56 * scale}px`
             }}
           >
               {children}
           </div>
           
           {/* Crown Guard - Right side */}
           <div 
              className="absolute bg-[#d4d4d4] rounded-r-lg"
              style={{
                  right: `-${18 * scale}px`,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${24 * scale}px`,
                  height: `${120 * scale}px`,
                  zIndex: 5
              }}
           />
           {/* Digital Crown */}
           <div 
              className="absolute bg-[#e3e3e3] rounded-sm border-2 border-[#bdbdbd]"
              style={{
                  right: `-${24 * scale}px`, // protrudes more
                  top: '38%', // slightly above center
                  width: `${20 * scale}px`,
                  height: `${50 * scale}px`,
                  zIndex: 6,
                  background: 'repeating-linear-gradient(0deg, #ccc 0px, #ccc 2px, #fff 3px, #fff 5px)'
              }}
           />
       </div>
    </div>
  );
};
