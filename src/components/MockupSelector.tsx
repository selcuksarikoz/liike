import { useRef, useState, useEffect } from 'react';
import { useRenderStore } from '../store/renderStore';

// Assets
import iphoneMockup from '../assets/mockups/iphone.png';
import browserMockup from '../assets/mockups/browser.png';
import laptopMockup from '../assets/mockups/laptop.png';
import macbookAirMockup from '../assets/mockups/macbook-air.png';
import ipadMockup from '../assets/mockups/ipad.png';
import ipadMiniMockup from '../assets/mockups/ipad-mini.png';
import imacMockup from '../assets/mockups/imac.png';
import imacProMockup from '../assets/mockups/imac-pro.png';
import watchMockup from '../assets/mockups/watch.png';
import watchSeriesMockup from '../assets/mockups/watch-series.png';
import monitorMockup from '../assets/mockups/monitor.png';

type Tab = 'all' | 'phone' | 'desktop' | 'tablet' | 'watch' | 'browser' | 'misc';

const MOCKUP_DATA = [
    // Phones
    { id: 'iphone-17-pro-max', label: 'iPhone 17 Pro Max', category: 'phone', image: iphoneMockup },
    { id: 'iphone-17-pro', label: 'iPhone 17 Pro', category: 'phone', image: iphoneMockup },
    { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max', category: 'phone', image: iphoneMockup },
    { id: 'iphone-16-pro', label: 'iPhone 16 Pro', category: 'phone', image: iphoneMockup },
    { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max', category: 'phone', image: iphoneMockup },
    { id: 'dual-phone', label: 'Dual iPhone', category: 'phone', image: null },

    // Desktops
    { id: 'imac-24', label: 'iMac 24"', category: 'desktop', image: imacMockup },
    { id: 'imac-pro', label: 'iMac Pro', category: 'desktop', image: imacProMockup },
    { id: 'macbook-pro-16', label: 'MacBook Pro 16"', category: 'desktop', image: laptopMockup },
    { id: 'macbook-pro-14', label: 'MacBook Pro 14"', category: 'desktop', image: laptopMockup },
    { id: 'macbook-air-m3', label: 'MacBook Air M3', category: 'desktop', image: macbookAirMockup },
    { id: 'macbook-air-m2', label: 'MacBook Air M2', category: 'desktop', image: macbookAirMockup },
    { id: 'pro-display-xdr', label: 'Pro Display XDR', category: 'desktop', image: monitorMockup },

    // Tablets
    { id: 'ipad-pro-13', label: 'iPad Pro 13"', category: 'tablet', image: ipadMockup },
    { id: 'ipad-pro-11', label: 'iPad Pro 11"', category: 'tablet', image: ipadMockup },
    { id: 'ipad-air', label: 'iPad Air', category: 'tablet', image: ipadMockup },
    { id: 'ipad-mini', label: 'iPad Mini', category: 'tablet', image: ipadMiniMockup },

    // Watches
    { id: 'apple-watch-ultra', label: 'Apple Watch Ultra', category: 'watch', image: watchMockup },
    { id: 'apple-watch-10', label: 'Apple Watch 10', category: 'watch', image: watchSeriesMockup },

    // Browser
    { id: 'browser-light', label: 'Safari Light', category: 'browser', image: browserMockup },
    { id: 'browser-dark', label: 'Safari Dark', category: 'browser', image: browserMockup },
    
    // Misc
    { id: 'no-phone', label: 'No Frame', category: 'misc', image: null }, // Just screen
];

const FRAMES_DATA = [
    {
        category: 'Social Media',
        frames: [
            { label: 'Instagram Post', width: 1080, height: 1080, ratio: '1:1' },
            { label: 'Instagram Portrait', width: 1080, height: 1350, ratio: '4:5' },
            { label: 'Instagram Story', width: 1080, height: 1920, ratio: '9:16' },
            { label: 'Twitter Tweet', width: 1200, height: 675, ratio: '16:9' },
            { label: 'Twitter Header', width: 1500, height: 500, ratio: '3:1' },
            { label: 'YouTube Video', width: 1920, height: 1080, ratio: '16:9' },
            { label: 'Facebook Post', width: 1200, height: 630, ratio: '1.9:1' },
            { label: 'LinkedIn Post', width: 1200, height: 627, ratio: '1.9:1' },
            { label: 'Pinterest Standard', width: 1000, height: 1500, ratio: '2:3' },
        ]
    },
    {
        category: 'App Store (iOS)',
        frames: [
            { label: 'iPhone 6.5"', width: 1284, height: 2778, ratio: '19.5:9' },
            { label: 'iPhone 5.5"', width: 1242, height: 2208, ratio: '16:9' },
            { label: 'iPad Pro 12.9"', width: 2048, height: 2732, ratio: '4:3' },
            { label: 'Mac App Preview', width: 2880, height: 1800, ratio: '16:10' },
        ]
    },
    {
        category: 'Standard Ratios',
        frames: [
            { label: '16:9', width: 1920, height: 1080, ratio: '16:9' },
            { label: '4:3', width: 1600, height: 1200, ratio: '4:3' },
            { label: '1:1', width: 1080, height: 1080, ratio: '1:1' },
            { label: '9:16', width: 1080, height: 1920, ratio: '9:16' },
        ]
    }
];

export const MockupSelector = ({ onClose }: { onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<Tab>('all');
    const { setMockupType, mockupType } = useRenderStore();
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const filteredMockups = MOCKUP_DATA.filter(m => activeTab === 'all' || m.category === activeTab);
    
    return (
        <div className="absolute top-14 left-4 z-50 w-full max-w-[420px] max-h-[50vh] flex flex-col bg-ui-bg/95 backdrop-blur-xl border border-ui-border rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200" ref={modalRef}>
             <div className="flex items-center justify-between mb-4 flex-shrink-0">
                 <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-linear-fade">
                     {(['all', 'phone', 'desktop', 'tablet', 'watch', 'browser', 'misc'] as Tab[]).map(tab => (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors whitespace-nowrap ${
                                activeTab === tab ? 'bg-white text-black' : 'text-ui-muted hover:bg-ui-border'
                            }`}
                         >
                             {tab}
                         </button>
                     ))}
                 </div>
                 <button onClick={onClose} className="text-ui-muted hover:text-white ml-2 flex-shrink-0">
                     <span className="material-symbols-outlined text-[20px]">close</span>
                 </button>
             </div>

             <div className="flex-1 overflow-y-auto min-h-0 pr-1 -mr-1">
                 <div className="flex flex-col gap-4">
                     <div className="text-xs font-bold text-ui-muted uppercase tracking-widest sticky top-0 bg-ui-bg/95 backdrop-blur-xl py-2 z-10 w-full">
                        {activeTab === 'all' ? 'All Devices' : activeTab}
                     </div>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-2">
                         {filteredMockups.map(mockup => (
                             <button
                                key={mockup.id}
                                onClick={() => {
                                    setMockupType(mockup.id as any);
                                    onClose();
                                }}
                                className={`group relative aspect-[4/3] rounded-xl border p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                                    mockupType === mockup.id ? 'bg-ui-highlight border-accent shadow-[0_0_15px_rgba(212,255,63,0.1)]' : 'bg-ui-panel border-ui-border hover:border-accent/50'
                                }`}
                             >
                                 {/* Mockup Visuals */}
                                 {mockup.id === 'dual-phone' ? (
                                     <div className="flex gap-1 items-center justify-center h-full max-h-[100px]">
                                         <img src={iphoneMockup} className="h-full w-auto object-contain opacity-80 group-hover:scale-105 transition-transform" />
                                         <img src={iphoneMockup} className="h-full w-auto object-contain opacity-80 group-hover:scale-105 transition-transform" />
                                     </div>
                                 ) : (
                                     <div className="h-full max-h-[100px] w-full flex items-center justify-center">
                                        <img 
                                            src={mockup.image!} 
                                            className="h-full w-auto object-contain opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all" 
                                            alt={mockup.label} 
                                        />
                                     </div>
                                 )}
                                 
                                 <span className={`text-xs font-medium text-center ${mockupType === mockup.id ? 'text-accent' : 'text-ui-muted group-hover:text-white'}`}>
                                     {mockup.label}
                                 </span>
                             </button>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};
