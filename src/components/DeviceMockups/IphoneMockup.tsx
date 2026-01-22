import { useRef, useState, useEffect } from 'react';
import { useRenderStore } from '../../store/renderStore';

export type DeviceMockupProps = {
  children: React.ReactNode;
  scale?: number;
};

// SVG-based iPhone 15 Pro Mockup
export const IphoneMockup = ({ children, scale = 1 }: DeviceMockupProps) => {
  return (
    <div className="relative" style={{ width: 393 * scale, height: 852 * scale }}>
      {/* Device Frame */}
      <div className="absolute inset-0 pointer-events-none z-20">
        <svg viewBox="0 0 393 852" className="w-full h-full drop-shadow-2xl">
          <defs>
             {/* Simple gradients for metallic look */}
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#444" />
              <stop offset="5%" stopColor="#888" />
              <stop offset="10%" stopColor="#444" />
              <stop offset="90%" stopColor="#444" />
              <stop offset="95%" stopColor="#888" />
              <stop offset="100%" stopColor="#444" />
            </linearGradient>
            <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
               <stop offset="50%" stopColor="rgba(255,255,255,0)" />
               <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          
          {/* Main Body with Border */}
          <rect 
            x="0" 
            y="0" 
            width="393" 
            height="852" 
            rx="55" 
            fill="#1a1a1a"
            stroke="url(#frameGradient)"
            strokeWidth="6" 
          />
          
          {/* Inner Bezel Black */}
          <rect x="8" y="8" width="377" height="836" rx="47" fill="black" />
          
           {/* Screen cutout mask (transparent area for children) currently handled by absolute positioning */}
           
           {/* Dynamic Island */}
           <rect x="136" y="20" width="121" height="36" rx="18" fill="black" />
           
           {/* Reflection */}
           <rect x="0" y="0" width="393" height="852" rx="55" fill="url(#shineGradient)" fillOpacity="0.5" style={{ mixBlendMode: 'overlay' }} />
        </svg>
      </div>

       {/* Side Buttons */}
       <div className="absolute -left-[3px] top-[180px] w-[3px] h-[50px] bg-zinc-600 rounded-l-sm" />
       <div className="absolute -left-[3px] top-[250px] w-[3px] h-[50px] bg-zinc-600 rounded-l-sm" />
       <div className="absolute -right-[3px] top-[220px] w-[3px] h-[80px] bg-zinc-600 rounded-r-sm" />


      {/* Screen Content Area */}
      <div 
        className="absolute z-10 overflow-hidden bg-black"
        style={{
            top: `${14 * scale}px`,
            left: `${14 * scale}px`,
            width: `${(393 - 28) * scale}px`,
            height: `${(852 - 28) * scale}px`,
            borderRadius: `${42 * scale}px`
        }}
      >
        {children}
      </div>
    
       {/* Dynamic Island Overlay (z-30 to be on top of content) */}
       <div 
          className="absolute z-30 bg-black pointer-events-none"
          style={{
             top: `${20 * scale}px`,
             left: '50%',
             transform: 'translateX(-50%)',
             width: `${121 * scale}px`,
             height: `${36 * scale}px`,
             borderRadius: `${18 * scale}px`
          }}
       />
    </div>
  );
};
