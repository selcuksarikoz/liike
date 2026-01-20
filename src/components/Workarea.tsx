import { useRef, useState } from 'react';
import { useRenderStore } from '../store/renderStore';

export const Workarea = ({ stageRef }: { stageRef: React.RefObject<HTMLDivElement | null> }) => {
  const { rotationX, rotationY, cornerRadius, backgroundGradient } = useRenderStore();
  const [mediaSrc, setMediaSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScreenClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaSrc(url);
    }
  };

  return (
    <section className="relative flex flex-1 flex-col overflow-hidden bg-[#111618]">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(circle,#2c393f_1px,transparent_1px)] [background-size:32px_32px]" />
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

      <div className="relative flex flex-1 items-center justify-center">
        {/* Background Gradient Element */}
        <div className="absolute inset-0 m-12 overflow-hidden rounded-3xl shadow-2xl">
          <div className={`h-full w-full border border-[#2c393f] bg-gradient-to-br ${backgroundGradient} opacity-80`} />
        </div>

        {/* 3D iPhone Mockup */}
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
          
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*,video/*" 
            onChange={handleFileChange}
          />

          <div
            className="relative flex h-full w-full items-center justify-center bg-cover bg-center text-center overflow-hidden cursor-pointer"
            onClick={handleScreenClick}
            style={{ borderRadius: `${Math.max(0, cornerRadius - 8)}px` }}
          >
            {mediaSrc ? (
               mediaSrc.match(/blob:.*$/) ? ( // Simple check, or assume checking mime type if feasible
                 <video src={mediaSrc} className="w-full h-full object-cover" autoPlay loop muted playsInline />
               ) : (
                 <img src={mediaSrc} className="w-full h-full object-cover" alt="Selected media" />
               )
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center flex items-center justify-center p-4 hover:opacity-80 transition-opacity"
                style={{
                  backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBp92El2vDYc88bEaucGjDKqGkKp71K_e-tyZvlTeKIYpmMIGeObUoRutHPWA4D7uNzLZ64Ty7u7x9q6r-PnmCWex07zfhsXQECR7-H8IL7SvQyOoe_rgS6T6Z4LroP3Cfhvyz53hGrTE2aj1_xdYpS0uYpfy0Jgo6fj_DbsmfUTwcE4RWGe2AJmOIifORZbZekXm6p99mQGwv-XG5lnJ6WV7IEaR0qyn9IEjx9v_QO5mjBQq35NQvDs8Oq-U5lNjnctyZo-TqQdOo')"
                }}
              >
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-sm pointer-events-none">
                    <span className="material-symbols-outlined mb-2 text-4xl text-[#d4ff3f]">play_circle</span>
                    <p className="text-[10px] uppercase tracking-widest text-white/60">Tap to Load Media</p>
                  </div>
              </div>
            )}
          </div>
        </div>

        {/* Transform Handles */}
        <div 
            className="pointer-events-none absolute h-[620px] w-[320px] border border-[#d4ff3f]/20"
            style={{
                transform: `perspective(1000px) rotateX(${rotationX}deg) rotateY(${rotationY}deg) rotateZ(5deg)`,
                borderRadius: `${cornerRadius + 4}px`
            }}
        >
          <div className="pointer-events-auto absolute -top-1 -left-1 w-3 h-3 cursor-nw-resize rounded-sm bg-[#d4ff3f]" />
          <div className="pointer-events-auto absolute -top-1 -right-1 w-3 h-3 cursor-ne-resize rounded-sm bg-[#d4ff3f]" />
          <div className="pointer-events-auto absolute -bottom-1 -left-1 w-3 h-3 cursor-sw-resize rounded-sm bg-[#d4ff3f]" />
          <div className="pointer-events-auto absolute -bottom-1 -right-1 w-3 h-3 cursor-se-resize rounded-sm bg-[#d4ff3f]" />
        </div>
      </div>
    </section>
  );
};
