export type DeviceConfig = {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'laptop' | 'desktop' | 'watch';
  image: string;
  width: number; // Base width in px for scaling
  aspectRatio: number | string; // Container aspect ratio (width/height)
  screen: {
    top: string;    // %
    left: string;   // %
    width: string;  // %
    height: string; // %
    radius: string; // px (at scale 1) or %
  };
};

/**
 * Helper to generate standard screen config based on device type and orientation
 * "Detailed" presets are estimated for typical Apple marketing mockups (clay/transparent styles)
 */
const PRESETS = {
  iphone: {
    portrait: { top: '2.3%', left: '5.2%', width: '89.6%', height: '95.4%', radius: '45px' },
    landscape: { top: '5.2%', left: '2.3%', width: '95.4%', height: '89.6%', radius: '45px' },
  },
  ipad: {
    portrait: { top: '5.5%', left: '5.5%', width: '89%', height: '89%', radius: '16px' },
    landscape: { top: '5.5%', left: '5.5%', width: '89%', height: '89%', radius: '16px' },
  },
  macbook: {
    default: { top: '5.5%', left: '11.8%', width: '76.4%', height: '84%', radius: '10px' }
  },
  imac: {
    default: { top: '4%', left: '4%', width: '92%', height: '62%', radius: '14px' } // 24" often has chin
  },
  watch: {
    default: { top: '22%', left: '22%', width: '56%', height: '56%', radius: '50%' }
  }
};

// ==========================================
// IMPORT ALL ASSETS
// ==========================================

// iPhones
import iphone17pro from '../assets/devices/iphone-17-pro.webp';
import iphone17pro1 from '../assets/devices/iphone-17-pro-1.webp';
import iphone17pro2 from '../assets/devices/iphone-17-pro-2.webp';
import iphone16pro from '../assets/devices/iphone-16-pro.webp';
import iphone16pro1 from '../assets/devices/iphone-16-pro-1.webp';
import iphone16pro2 from '../assets/devices/iphone-16-pro-2.webp';
import iphone14midnight from '../assets/devices/iphone-14-midnight.webp';
import iphone14midnight1 from '../assets/devices/iphone-14-midnight-1.webp';
import iphone14midnight2 from '../assets/devices/iphone-14-midnight-2.webp';
import iphone13proPortrait from '../assets/devices/iphone-13-pro-portrait.webp';
import iphone13proLandscape from '../assets/devices/iphone-13-pro-landscape.webp';
import iphone13miniPortrait from '../assets/devices/iphone-13-mini-portrait.webp';
import iphone13miniLandscape from '../assets/devices/iphone-13-mini-landscape.webp';

// iPads
import ipadPro12Portrait from '../assets/devices/ipad-pro-12-portrait.webp';
import ipadPro12Landscape from '../assets/devices/ipad-pro-12-landscape.webp';
import ipadPro11Portrait from '../assets/devices/ipad-pro-11-portrait.webp';
import ipadPro11Landscape from '../assets/devices/ipad-pro-11-landscape.webp';
import ipadAirPortrait from '../assets/devices/ipad-air-portrait.webp';
import ipadAirLandscape from '../assets/devices/ipad-air-landscape.webp';
import ipadMiniPortrait from '../assets/devices/ipad-mini-portrait.webp';
import ipadMiniLandscape from '../assets/devices/ipad-mini-landscape.webp';
import ipadBasePortrait from '../assets/devices/ipad-base-portrait.webp';
import ipadBaseLandscape from '../assets/devices/ipad-base-landscape.webp';

// Macs
import macbookPro16 from '../assets/devices/macbook-pro-16.webp';
import macbookPro14 from '../assets/devices/macbook-pro-14.webp';
import macbookAir13 from '../assets/devices/macbook-air-13.webp';
import imac24 from '../assets/devices/imac-24.webp';
import imac27 from '../assets/devices/imac-27.webp';

// Watches
import watchUltra from '../assets/devices/apple-watch-ultra.webp';
import watchS8 from '../assets/devices/apple-watch-s8-midnight.webp';
import watchS8_1 from '../assets/devices/apple-watch-s8-midnight-1.webp';


export const DEVICES: DeviceConfig[] = [
  // --- iPhone 17 Pro ---
  {
    id: 'iphone-17-pro',
    name: 'iPhone 17 Pro',
    type: 'phone',
    image: iphone17pro,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
   {
    id: 'iphone-17-pro-1',
    name: 'iPhone 17 Pro (Var 1)',
    type: 'phone',
    image: iphone17pro1,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
   {
    id: 'iphone-17-pro-2',
    name: 'iPhone 17 Pro (Var 2)',
    type: 'phone',
    image: iphone17pro2,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },

  // --- iPhone 16 Pro ---
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    type: 'phone',
    image: iphone16pro,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
  {
    id: 'iphone-16-pro-1',
    name: 'iPhone 16 Pro (Var 1)',
    type: 'phone',
    image: iphone16pro1,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
  {
    id: 'iphone-16-pro-2',
    name: 'iPhone 16 Pro (Var 2)',
    type: 'phone',
    image: iphone16pro2,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },

  // --- iPhone 14 ---
  {
    id: 'iphone-14-midnight',
    name: 'iPhone 14 Midnight',
    type: 'phone',
    image: iphone14midnight,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
   {
    id: 'iphone-14-midnight-1',
    name: 'iPhone 14 Midnight (Var 1)',
    type: 'phone',
    image: iphone14midnight1,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
   {
    id: 'iphone-14-midnight-2',
    name: 'iPhone 14 Midnight (Var 2)',
    type: 'phone',
    image: iphone14midnight2,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },

  // --- iPhone 13 Pro ---
  {
    id: 'iphone-13-pro-p',
    name: 'iPhone 13 Pro (Portrait)',
    type: 'phone',
    image: iphone13proPortrait,
    width: 390,
    aspectRatio: 390/800,
    screen: PRESETS.iphone.portrait
  },
  {
    id: 'iphone-13-pro-l',
    name: 'iPhone 13 Pro (Landscape)',
    type: 'phone',
    image: iphone13proLandscape,
    width: 800,
    aspectRatio: 800/390,
    screen: PRESETS.iphone.landscape
  },

  // --- iPhone 13 Mini ---
  {
    id: 'iphone-13-mini-p',
    name: 'iPhone 13 Mini (Portrait)',
    type: 'phone',
    image: iphone13miniPortrait,
    width: 360,
    aspectRatio: 360/780,
    screen: { ...PRESETS.iphone.portrait, radius: '40px' }
  },
  {
    id: 'iphone-13-mini-l',
    name: 'iPhone 13 Mini (Landscape)',
    type: 'phone',
    image: iphone13miniLandscape,
    width: 780,
    aspectRatio: 780/360,
    screen: { ...PRESETS.iphone.landscape, radius: '40px' }
  },

  // --- iPads ---
  {
    id: 'ipad-pro-12-p',
    name: 'iPad Pro 12.9" (Portrait)',
    type: 'tablet',
    image: ipadPro12Portrait,
    width: 600,
    aspectRatio: 3/4,
    screen: PRESETS.ipad.portrait
  },
  {
    id: 'ipad-pro-12-l',
    name: 'iPad Pro 12.9" (Landscape)',
    type: 'tablet',
    image: ipadPro12Landscape,
    width: 700,
    aspectRatio: 4/3,
    screen: PRESETS.ipad.landscape
  },
  {
    id: 'ipad-pro-11-p',
    name: 'iPad Pro 11" (Portrait)',
    type: 'tablet',
    image: ipadPro11Portrait,
    width: 550,
    aspectRatio: 3/4.2, 
    screen: PRESETS.ipad.portrait
  },
  {
    id: 'ipad-pro-11-l',
    name: 'iPad Pro 11" (Landscape)',
    type: 'tablet',
    image: ipadPro11Landscape,
    width: 650,
    aspectRatio: 4.2/3,
    screen: PRESETS.ipad.landscape
  },
  {
    id: 'ipad-air-p',
    name: 'iPad Air (Portrait)',
    type: 'tablet',
    image: ipadAirPortrait,
    width: 550,
    aspectRatio: 3/4.2, 
    screen: PRESETS.ipad.portrait
  },
   {
    id: 'ipad-air-l',
    name: 'iPad Air (Landscape)',
    type: 'tablet',
    image: ipadAirLandscape,
    width: 650,
    aspectRatio: 4.2/3, 
    screen: PRESETS.ipad.landscape
  },
  {
    id: 'ipad-mini-p',
    name: 'iPad mini (Portrait)',
    type: 'tablet',
    image: ipadMiniPortrait,
    width: 420,
    aspectRatio: 3/4.5,
    screen: PRESETS.ipad.portrait
  },
  {
    id: 'ipad-mini-l',
    name: 'iPad mini (Landscape)',
    type: 'tablet',
    image: ipadMiniLandscape,
    width: 500,
    aspectRatio: 4.5/3,
    screen: PRESETS.ipad.landscape
  },
  {
    id: 'ipad-base-p',
    name: 'iPad (Portrait)',
    type: 'tablet',
    image: ipadBasePortrait,
    width: 540,
    aspectRatio: 3/4,
    screen: { ...PRESETS.ipad.portrait, top: '7%', left: '7%', width: '86%', height: '86%' } // Thicker bezels
  },
  {
    id: 'ipad-base-l',
    name: 'iPad (Landscape)',
    type: 'tablet',
    image: ipadBaseLandscape,
    width: 640,
    aspectRatio: 4/3,
    screen: { ...PRESETS.ipad.landscape, top: '7%', left: '7%', width: '86%', height: '86%' }
  },

  // --- Macs ---
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    type: 'laptop',
    image: macbookPro16,
    width: 800,
    aspectRatio: 1.6,
    screen: PRESETS.macbook.default
  },
   {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    type: 'laptop',
    image: macbookPro14,
    width: 750,
    aspectRatio: 1.6,
    screen: PRESETS.macbook.default
  },
  {
    id: 'macbook-air-13',
    name: 'MacBook Air 13"',
    type: 'laptop',
    image: macbookAir13,
    width: 700,
    aspectRatio: 1.6,
    screen: { ...PRESETS.macbook.default, top: '6.5%', height: '82%' } 
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    type: 'desktop',
    image: imac24,
    width: 750,
    aspectRatio: 1.25,
    screen: PRESETS.imac.default
  },
  {
    id: 'imac-27',
    name: 'iMac 27"',
    type: 'desktop',
    image: imac27,
    width: 800,
    aspectRatio: 1.3,
    screen: { ...PRESETS.imac.default, radius: '0px', height: '65%', bottom: '25%' } 
  },

  // --- Watches ---
  {
    id: 'watch-ultra',
    name: 'Apple Watch Ultra',
    type: 'watch',
    image: watchUltra,
    width: 320,
    aspectRatio: 1,
    screen: { top: '23%', left: '23%', width: '54%', height: '54%', radius: '15%' }
  },
  {
    id: 'watch-s8',
    name: 'Apple Watch S8',
    type: 'watch',
    image: watchS8,
    width: 300,
    aspectRatio: 1,
    screen: {  top: '22%', left: '22%', width: '56%', height: '56%', radius: '20%' }
  },
  {
    id: 'watch-s8-1',
    name: 'Apple Watch S8 (Var)',
    type: 'watch',
    image: watchS8_1,
    width: 300,
    aspectRatio: 1,
    screen: {  top: '22%', left: '22%', width: '56%', height: '56%', radius: '20%' }
  }
];
