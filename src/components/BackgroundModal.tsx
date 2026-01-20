import { useState, useRef } from 'react';
import { Blend, Palette, Image, Upload, Trash2 } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { Modal } from './modals/Modal';

// Import background images
import bg1 from '../assets/bg/1.webp';
import bg2 from '../assets/bg/2.webp';
import bg3 from '../assets/bg/3.webp';
import bg4 from '../assets/bg/4.webp';
import bg5 from '../assets/bg/5.webp';
import bg6 from '../assets/bg/6.webp';
import bg7 from '../assets/bg/7.webp';
import bg8 from '../assets/bg/8.webp';
import bg9 from '../assets/bg/9.webp';

type TabType = 'gradients' | 'colors' | 'images';

// Gradient Presets organized by category
const GRADIENT_PRESETS = {
  dark: [
    { id: 'midnight', name: 'Midnight', gradient: 'from-slate-950 via-slate-900 to-slate-950' },
    { id: 'void', name: 'Void', gradient: 'from-black via-zinc-900 to-black' },
    { id: 'charcoal', name: 'Charcoal', gradient: 'from-neutral-900 via-neutral-800 to-neutral-900' },
    { id: 'obsidian', name: 'Obsidian', gradient: 'from-zinc-950 via-stone-900 to-zinc-950' },
    { id: 'dark-ocean', name: 'Dark Ocean', gradient: 'from-slate-900 via-blue-950 to-slate-900' },
    { id: 'dark-forest', name: 'Dark Forest', gradient: 'from-zinc-900 via-emerald-950 to-zinc-900' },
  ],
  vibrant: [
    { id: 'sunset', name: 'Sunset', gradient: 'from-orange-500 via-pink-500 to-purple-600' },
    { id: 'aurora', name: 'Aurora', gradient: 'from-green-400 via-cyan-500 to-blue-500' },
    { id: 'candy', name: 'Candy', gradient: 'from-pink-400 via-purple-400 to-indigo-400' },
    { id: 'tropical', name: 'Tropical', gradient: 'from-yellow-400 via-orange-500 to-red-500' },
    { id: 'neon', name: 'Neon', gradient: 'from-fuchsia-500 via-purple-600 to-cyan-400' },
    { id: 'rainbow', name: 'Rainbow', gradient: 'from-red-500 via-yellow-500 to-green-500' },
  ],
  ocean: [
    { id: 'ocean', name: 'Ocean', gradient: 'from-blue-600 via-cyan-500 to-teal-400' },
    { id: 'deep-sea', name: 'Deep Sea', gradient: 'from-blue-900 via-blue-700 to-cyan-600' },
    { id: 'aqua', name: 'Aqua', gradient: 'from-cyan-400 via-teal-500 to-emerald-500' },
    { id: 'arctic', name: 'Arctic', gradient: 'from-slate-300 via-cyan-200 to-blue-300' },
    { id: 'lagoon', name: 'Lagoon', gradient: 'from-teal-600 via-cyan-600 to-sky-500' },
    { id: 'coral-reef', name: 'Coral Reef', gradient: 'from-cyan-500 via-blue-500 to-purple-500' },
  ],
  fire: [
    { id: 'fire', name: 'Fire', gradient: 'from-yellow-500 via-orange-500 to-red-600' },
    { id: 'lava', name: 'Lava', gradient: 'from-red-700 via-orange-600 to-yellow-500' },
    { id: 'ember', name: 'Ember', gradient: 'from-amber-600 via-orange-700 to-red-800' },
    { id: 'solar', name: 'Solar', gradient: 'from-yellow-300 via-amber-400 to-orange-500' },
    { id: 'inferno', name: 'Inferno', gradient: 'from-red-600 via-rose-600 to-orange-500' },
    { id: 'golden', name: 'Golden', gradient: 'from-amber-400 via-yellow-500 to-orange-400' },
  ],
  nature: [
    { id: 'forest', name: 'Forest', gradient: 'from-green-700 via-emerald-600 to-teal-500' },
    { id: 'spring', name: 'Spring', gradient: 'from-lime-400 via-green-500 to-emerald-500' },
    { id: 'earth', name: 'Earth', gradient: 'from-amber-800 via-stone-700 to-emerald-800' },
    { id: 'moss', name: 'Moss', gradient: 'from-green-800 via-emerald-700 to-teal-700' },
    { id: 'meadow', name: 'Meadow', gradient: 'from-green-400 via-lime-400 to-yellow-400' },
    { id: 'autumn', name: 'Autumn', gradient: 'from-orange-600 via-amber-600 to-yellow-600' },
  ],
  purple: [
    { id: 'galaxy', name: 'Galaxy', gradient: 'from-purple-900 via-violet-800 to-indigo-900' },
    { id: 'lavender', name: 'Lavender', gradient: 'from-purple-400 via-violet-400 to-indigo-400' },
    { id: 'grape', name: 'Grape', gradient: 'from-purple-600 via-fuchsia-600 to-pink-500' },
    { id: 'cosmic', name: 'Cosmic', gradient: 'from-indigo-900 via-purple-900 to-pink-900' },
    { id: 'violet-dream', name: 'Violet Dream', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500' },
    { id: 'amethyst', name: 'Amethyst', gradient: 'from-purple-700 via-violet-600 to-indigo-600' },
  ],
  pastel: [
    { id: 'cotton-candy', name: 'Cotton Candy', gradient: 'from-pink-200 via-purple-200 to-blue-200' },
    { id: 'peach', name: 'Peach', gradient: 'from-orange-200 via-rose-200 to-pink-200' },
    { id: 'mint', name: 'Mint', gradient: 'from-green-200 via-teal-200 to-cyan-200' },
    { id: 'baby-blue', name: 'Baby Blue', gradient: 'from-blue-200 via-sky-200 to-cyan-200' },
    { id: 'cream', name: 'Cream', gradient: 'from-amber-100 via-yellow-100 to-orange-100' },
    { id: 'blush', name: 'Blush', gradient: 'from-rose-200 via-pink-200 to-fuchsia-200' },
  ],
  metallic: [
    { id: 'silver', name: 'Silver', gradient: 'from-gray-300 via-slate-400 to-gray-500' },
    { id: 'gold', name: 'Gold', gradient: 'from-yellow-600 via-amber-500 to-yellow-700' },
    { id: 'bronze', name: 'Bronze', gradient: 'from-amber-700 via-orange-700 to-amber-800' },
    { id: 'steel', name: 'Steel', gradient: 'from-slate-500 via-gray-600 to-zinc-700' },
    { id: 'copper', name: 'Copper', gradient: 'from-orange-600 via-amber-600 to-orange-700' },
    { id: 'platinum', name: 'Platinum', gradient: 'from-slate-300 via-gray-400 to-slate-500' },
  ],
};

// Solid color presets
const SOLID_COLORS = [
  // Blacks & Grays
  '#000000', '#0a0a0a', '#171717', '#262626', '#404040', '#525252', '#737373', '#a3a3a3',
  // Whites
  '#ffffff', '#fafafa', '#f5f5f5', '#e5e5e5', '#d4d4d4',
  // Blues
  '#0ea5e9', '#3b82f6', '#6366f1', '#1e40af', '#1e3a8a', '#172554',
  // Purples
  '#a855f7', '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95',
  // Pinks
  '#ec4899', '#db2777', '#be185d', '#9d174d', '#831843',
  // Reds
  '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
  // Oranges
  '#f97316', '#ea580c', '#c2410c', '#9a3412', '#7c2d12',
  // Yellows
  '#fbbf24', '#f59e0b', '#d97706', '#b45309', '#92400e',
  // Greens
  '#22c55e', '#16a34a', '#15803d', '#166534', '#14532d', '#10b981', '#059669',
  // Teals
  '#14b8a6', '#0d9488', '#0f766e', '#115e59', '#134e4a',
  // Cyans
  '#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63',
];

// Pre-made background images
const PRESET_IMAGES = [
  { id: 'bg1', src: bg1, name: 'Abstract 1' },
  { id: 'bg2', src: bg2, name: 'Abstract 2' },
  { id: 'bg3', src: bg3, name: 'Abstract 3' },
  { id: 'bg4', src: bg4, name: 'Abstract 4' },
  { id: 'bg5', src: bg5, name: 'Abstract 5' },
  { id: 'bg6', src: bg6, name: 'Abstract 6' },
  { id: 'bg7', src: bg7, name: 'Abstract 7' },
  { id: 'bg8', src: bg8, name: 'Abstract 8' },
  { id: 'bg9', src: bg9, name: 'Abstract 9' },
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const BackgroundModal = ({ isOpen, onClose }: Props) => {
  const [activeTab, setActiveTab] = useState<TabType>('gradients');
  const [customColor, setCustomColor] = useState('#1a1a2e');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    backgroundGradient,
    backgroundType,
    backgroundColor,
    backgroundImage,
    setBackgroundGradient,
    setBackgroundColor,
    setBackgroundImage,
  } = useRenderStore();

  const handleGradientSelect = (gradient: string) => {
    setBackgroundGradient(gradient);
  };

  const handleColorSelect = (color: string) => {
    setBackgroundColor(color);
    setCustomColor(color);
  };

  const handleImageSelect = (imageSrc: string) => {
    setBackgroundImage(imageSrc);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setBackgroundImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'gradients' as TabType, label: 'Gradients', icon: <Blend className="w-4 h-4" /> },
    { id: 'colors' as TabType, label: 'Colors', icon: <Palette className="w-4 h-4" /> },
    { id: 'images' as TabType, label: 'Images', icon: <Image className="w-4 h-4" /> },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Background" position="center">
      <div className="flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-ui-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-medium uppercase tracking-wider transition-colors ${
                activeTab === tab.id
                  ? 'text-white border-b-2 border-accent bg-ui-panel'
                  : 'text-ui-muted hover:text-ui-text'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* Gradients Tab */}
          {activeTab === 'gradients' && (
            <div className="space-y-6">
              {Object.entries(GRADIENT_PRESETS).map(([category, gradients]) => (
                <div key={category}>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3 capitalize">
                    {category}
                  </h3>
                  <div className="grid grid-cols-6 gap-2">
                    {gradients.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handleGradientSelect(preset.gradient)}
                        className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          backgroundType === 'gradient' && backgroundGradient === preset.gradient
                            ? 'border-accent ring-2 ring-accent/30 scale-105'
                            : 'border-transparent hover:border-ui-border hover:scale-105'
                        }`}
                        title={preset.name}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${preset.gradient}`} />
                        <div className="absolute inset-0 flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                          <span className="text-[8px] font-medium text-white truncate px-1">
                            {preset.name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div className="space-y-6">
              {/* Color Picker */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3">
                  Custom Color
                </h3>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => handleColorSelect(e.target.value)}
                      className="w-12 h-12 rounded-xl cursor-pointer border-2 border-ui-border"
                    />
                  </div>
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => handleColorSelect(e.target.value)}
                    className="flex-1 px-3 py-2 bg-ui-panel border border-ui-border rounded-lg text-sm text-white font-mono uppercase"
                    placeholder="#000000"
                  />
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3">
                  Preset Colors
                </h3>
                <div className="grid grid-cols-10 gap-2">
                  {SOLID_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        backgroundType === 'solid' && backgroundColor === color
                          ? 'border-accent ring-2 ring-accent/30 scale-110'
                          : 'border-transparent hover:scale-110'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              {/* Upload */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3">
                  Upload Image
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-ui-border rounded-xl flex flex-col items-center gap-2 hover:border-accent hover:bg-ui-panel/50 transition-colors"
                >
                  <Upload className="w-6 h-6 text-ui-muted" />
                  <span className="text-[11px] text-ui-muted">Click to upload image</span>
                </button>
              </div>

              {/* Preset Images */}
              <div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3">
                  Preset Backgrounds
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {PRESET_IMAGES.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => handleImageSelect(image.src)}
                      className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        backgroundType === 'image' && backgroundImage === image.src
                          ? 'border-accent ring-2 ring-accent/30 scale-[1.02]'
                          : 'border-transparent hover:border-ui-border hover:scale-[1.02]'
                      }`}
                    >
                      <img
                        src={image.src}
                        alt={image.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Current uploaded image preview */}
              {backgroundType === 'image' && backgroundImage && !PRESET_IMAGES.some(p => p.src === backgroundImage) && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-ui-muted mb-3">
                    Current Upload
                  </h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-accent">
                    <img
                      src={backgroundImage}
                      alt="Custom background"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setBackgroundImage(null)}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-lg flex items-center justify-center hover:bg-black/80 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ui-border flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-6 bg-accent text-black text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
