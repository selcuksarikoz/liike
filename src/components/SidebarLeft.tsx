import { useRenderStore } from '../store/renderStore';

export const SidebarLeft = () => {
  const { 
    deviceModel, setDeviceModel,
    rotationX, setRotationX,
    rotationY, setRotationY,
    cornerRadius, setCornerRadius
  } = useRenderStore();

  const handleRangeChange = (setter: (v: number) => void, min: number, max: number, e: React.ChangeEvent<HTMLInputElement>) => {
    setter(Number(e.target.value));
  };

  return (
    <aside className="z-20 flex w-72 flex-col border-r border-[#2c393f] bg-[#141b1e]">
      <div className="flex flex-col gap-6 p-4">
        <div>
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Device Config</h2>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-medium text-[#9fb2bc]">Model Frame</span>
              <div className="relative">
                <select 
                  className="h-10 w-full appearance-none rounded-lg border border-[#2c393f] bg-[#1c2529] px-3 text-xs text-white focus:ring-1 focus:ring-[#d4ff3f]"
                  value={deviceModel}
                  onChange={(e) => setDeviceModel(e.target.value)}
                >
                  <option>iPhone 15 Pro Max</option>
                  <option>MacBook Air M2</option>
                  <option>Browser Window</option>
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute right-3 top-2 text-[#9fb2bc]">
                  expand_more
                </span>
              </div>
            </label>

            <div className="mt-2 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">3D Rotation X</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{rotationX}°</span>
                </div>
                {/* Custom Slider using Input Range with opacity 0 over custom UI? Or just styled Input */}
                <input 
                  type="range" min="0" max="360" value={rotationX}
                  onChange={(e) => setRotationX(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Rotation X"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${(rotationX / 360) * 100}%, #2c393f ${(rotationX / 360) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">3D Rotation Y</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{rotationY}°</span>
                </div>
                <input 
                  type="range" min="-180" max="180" value={rotationY}
                  onChange={(e) => setRotationY(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Rotation Y"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${((rotationY + 180) / 360) * 100}%, #2c393f ${((rotationY + 180) / 360) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-[#9fb2bc]">Corner Radius</span>
                  <span className="text-[10px] font-mono text-[#d4ff3f]">{cornerRadius}px</span>
                </div>
                <input 
                  type="range" min="0" max="100" value={cornerRadius}
                  onChange={(e) => setCornerRadius(Number(e.target.value))}
                  className="w-full h-1 bg-[#2c393f] rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg"
                  title="Corner Radius"
                  style={{
                    backgroundImage: `linear-gradient(to right, #d4ff3f 0%, #d4ff3f ${(cornerRadius / 100) * 100}%, #2c393f ${(cornerRadius / 100) * 100}%, #2c393f 100%)`
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2c393f] pt-6">
          <h2 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-[#9fb2bc]">Appearance</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: 'palette', label: 'Background', active: true },
              { icon: 'animation', label: 'Animation' },
              { icon: 'shadow', label: 'Shadows' },
              { icon: 'blur_on', label: 'Effects' },
            ].map((item) => (
              <button
                key={item.label}
                className={`group flex flex-col items-center gap-2 rounded-lg border p-3 ${
                  item.active
                    ? 'border-[#d4ff3f]/40 bg-[#1c2529]'
                    : 'border-[#2c393f] bg-[#1c2529] hover:border-[#d4ff3f]/60'
                } transition-all`}
              >
                <span
                  className={`material-symbols-outlined ${item.active ? 'text-[#d4ff3f]' : 'text-[#9fb2bc] group-hover:text-[#d4ff3f]'}`}
                >
                  {item.icon}
                </span>
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-auto bg-[#1c3b4a]/10 p-4">
        <div className="mb-2 flex items-center justify-between text-[10px] text-[#9fb2bc]">
          <span>RAM USAGE</span>
          <span>1.2GB / 4GB</span>
        </div>
        <div className="h-1 overflow-hidden rounded-full bg-[#2c393f]">
          <div className="h-full w-1/3 bg-[#d4ff3f]" />
        </div>
      </div>
    </aside>
  );
};
