import { useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';

export const Workarea = ({ stageRef }: { stageRef: React.RefObject<HTMLDivElement | null> }) => {
  const { rotationX, rotationY, cornerRadius, backgroundGradient, mockupType, setMediaAssets, mediaAssets, canvasWidth, canvasHeight } = useRenderStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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
  
  // Render content based on mockup type
  const renderFrame = () => {
      // Common media container
      const MediaContainer = ({ index }: { index: number }) => {
          const media = mediaAssets[index] || null;
          return (
            <div
              className="relative flex h-full w-full items-center justify-center bg-cover bg-center text-center overflow-hidden cursor-pointer group"
              onClick={() => handleScreenClick(index)}
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
                    className="w-full h-full bg-cover bg-center flex items-center justify-center p-4 hover:opacity-80 transition-opacity bg-zinc-900 group-hover:bg-zinc-800"
                  >
                    <div className="flex flex-col items-center gap-2 text-[#9fb2bc] group-hover:text-[#d4ff3f] transition-colors">
                      <span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
                      <span className="text-[10px] uppercase tracking-widest font-bold">Import Media {index + 1}</span>
                    </div>
                  </div>
              )}
            </div>
          );
      };

      if (mockupType === 'dual-phone') {
            return (
                <div
                    ref={stageRef}
                    className="relative flex items-center justify-center gap-12"
                    style={{
                        transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                    }}
                >
                    {[0, 1].map((i) => (
                        <div
                            key={i}
                            className="relative flex h-[500px] w-[250px] flex-col items-center justify-center bg-black border-[8px] border-[#2c393f] shadow-2xl"
                            style={{
                                borderRadius: `${cornerRadius}px`,
                                transform: i === 1 ? 'translateY(40px)' : 'translateY(-40px)', // Staggered look
                            }}
                        >
                            <div className="absolute top-0 z-10 flex h-5 w-1/3 items-center justify-center rounded-b-xl bg-black">
                                <div className="h-1 w-8 rounded-full bg-zinc-800" />
                            </div>
                            <div className="w-full h-full pt-3 pb-1 px-1">
                                <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}>
                                    <MediaContainer index={i} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
      }

      if (mockupType === 'browser') {
          return (
             <div 
                ref={stageRef}
                className="relative bg-[#1e1e1e] rounded-lg shadow-2xl flex flex-col overflow-hidden w-[600px] h-[400px]"
                style={{
                    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(0deg)`,
                    boxShadow: '-20px 40px 60px rgba(0, 0, 0, 0.5)'
                }}
             >
                 {/* Browser Header */}
                 <div className="h-8 bg-[#2d2d2d] flex items-center px-4 gap-2 border-b border-[#3e3e3e]">
                     <div className="flex gap-1.5">
                         <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                         <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                         <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                     </div>
                     <div className="flex-1 flex justify-center">
                         <div className="h-5 w-2/3 bg-[#1e1e1e] rounded flex items-center justify-center text-[10px] text-zinc-500 font-mono">
                             liike.app
                         </div>
                     </div>
                 </div>
                 {/* Browser Content */}
                 <div className="flex-1 relative">
                     <MediaContainer index={0} />
                 </div>
             </div>
          );
      }
      
      // --- Render Logic Grouped by Category/Type ---
      
      // Watches (Apple Watch Ultra etc)
      if (mockupType.includes('watch')) {
          return (
             <div 
                ref={stageRef}
                className="relative flex flex-col items-center justify-center"
                style={{
                  transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                }}
             >
                 <div className="relative bg-[#262626] rounded-[48px] border-[6px] border-[#444] w-[320px] h-[390px] shadow-2xl flex items-center justify-center">
                    {/* Watch Side Button */}
                    <div className="absolute -right-[10px] h-16 w-3 bg-[#333] rounded-r-md top-24" />
                    <div className="w-[300px] h-[370px] bg-black rounded-[42px] overflow-hidden">
                        <MediaContainer index={0} />
                    </div>
                 </div>
                 {/* Watch Band Stubs */}
                 <div className="absolute -top-12 w-[220px] h-16 bg-[#333] rounded-t-xl -z-10" />
                 <div className="absolute -bottom-12 w-[220px] h-16 bg-[#333] rounded-b-xl -z-10" />
             </div>
          );
      }
      
      // Tablets (iPads)
      if (mockupType.includes('ipad')) {
          return (
             <div 
                ref={stageRef}
                className="relative flex flex-col items-center justify-center bg-black border-[12px] border-[#1c1c1c] shadow-2xl"
                style={{
                    width: '600px',
                    height: '450px', // Landscape default
                    borderRadius: '24px',
                    transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                    boxShadow: '-20px 40px 60px rgba(0, 0, 0, 0.4)'
                }}
             >
                 <div className="w-full h-full overflow-hidden rounded-[12px]">
                     <MediaContainer index={0} />
                 </div>
             </div>
          );
      }

      // Desktops (iMac, Monitors) - Simplified Stand Logic
      if (mockupType.includes('imac') || mockupType.includes('display')) {
          return (
             <div 
                ref={stageRef}
                className="relative flex flex-col items-center justify-center"
                style={{
                  transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                }}
             >
                 <div className="relative bg-white border-[12px] border-white w-[640px] h-[380px] shadow-2xl rounded-xl overflow-hidden flex flex-col mb-0 z-10">
                    <div className="w-full h-full bg-black">
                        <MediaContainer index={0} />
                    </div>
                    {mockupType.includes('imac') && <div className="h-12 bg-[#e0e0e0] w-full border-t border-gray-300" />}
                 </div>
                 <div className="w-40 h-24 bg-gradient-to-b from-[#ccc] to-[#bbb] -mt-2 z-0" />
                 <div className="w-48 h-2 bg-[#bbb] rounded-full shadow-lg" />
             </div>
          );
      }

      // Laptops (MacBooks)
      if (mockupType.includes('macbook') || mockupType === 'laptop') {
          return (
             <div 
                ref={stageRef}
                className="relative flex flex-col items-center justify-center"
                style={{
                  transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg)`,
                }}
             >
                 <div className="relative bg-[#1a1a1a] rounded-t-xl border-[4px] border-zinc-700 w-[560px] h-[360px] shadow-2xl overflow-hidden flex flex-col">
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-b-md z-20" /> {/* Notch */}
                    <div className="w-full h-full bg-black">
                        <MediaContainer index={0} />
                    </div>
                 </div>
                 <div className="w-[660px] h-3 bg-zinc-600 rounded-b-lg shadow-xl relative">
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-zinc-700 rounded-b-sm" />
                 </div>
             </div>
          );
      }

      // Default iPhone
      return (
        <div
          ref={stageRef}
          className="relative flex h-[600px] w-[300px] flex-col items-center justify-center bg-black border-[8px] border-[#2c393f] transition-all duration-700 ease-out"
          style={{
            transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(5deg)`,
            borderRadius: `${cornerRadius}px`,
            boxShadow: '-20px 40px 60px rgba(0, 0, 0, 0.5)'
          }}
        >
          <div className="absolute top-0 z-10 flex h-6 w-1/3 items-center justify-center rounded-b-2xl bg-black">
            <div className="h-1 w-12 rounded-full bg-zinc-800" />
          </div>
          
          <div className="w-full h-full pt-4 pb-2 px-2">
             <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}>
                <MediaContainer index={0} />
             </div>
          </div>
        </div>
      );
  };

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
          <span>100%</span>
          <span className="material-symbols-outlined text-[14px]">unfold_more</span>
        </button>
        <button className="flex w-8 h-8 items-center justify-center rounded-lg text-[#9fb2bc] transition-all hover:bg-[#1c3b4a]/40 hover:text-white">
          <span className="material-symbols-outlined text-[18px]">center_focus_weak</span>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center p-12 overflow-hidden bg-[#0a0f12]">
        {/* Background Gradient / Canvas Area */}
        <div 
            className="relative shadow-2xl transition-all duration-300 ease-in-out flex items-center justify-center bg-transparent"
            style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                transform: `scale(${Math.min(1, (window.innerHeight - 100) / canvasHeight, (window.innerWidth - 400) / canvasWidth)})`, // Simple responsive scaling
                transformOrigin: 'center center'
            }}
        >
             {/* Canvas Background */}
             <div className={`absolute inset-0 border border-[#2c393f] bg-gradient-to-br ${backgroundGradient} opacity-100 overflow-hidden`} />
             
             {/* Dynamic Mockup Render - Centered in Canvas */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
                {renderFrame()}
            </div>
        </div>

        {/* Transform Handles (Simplified, only showing for iPhone for now or wrapping standard box) */}
        {/* ...Handles logic can be improved later for dynamic sizes... */}
      </div>
    </section>
  );
};
