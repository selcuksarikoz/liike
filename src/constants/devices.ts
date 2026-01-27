export type ScreenConfig = {
  padding: string; // css shorthand like "3%" or "3% 4% 5% 4%" (top right bottom left)
  radius: string; // px or %
};

export type DeviceConfig = {
  id: string;
  name: string;
  type: 'phone' | 'tablet' | 'laptop' | 'desktop' | 'watch';
  image: string;
  width: number; // Base width in px for scaling
  aspectRatio: number | string; // Container aspect ratio (width/height)
  screen: {
    single: ScreenConfig;
    duo: ScreenConfig;
    trio: ScreenConfig;
  };
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
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-17-pro-1',
    name: 'iPhone 17 Pro (Var 1)',
    type: 'phone',
    image: iphone17pro1,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-17-pro-2',
    name: 'iPhone 17 Pro (Var 2)',
    type: 'phone',
    image: iphone17pro2,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },

  // --- iPhone 16 Pro ---
  {
    id: 'iphone-16-pro',
    name: 'iPhone 16 Pro',
    type: 'phone',
    image: iphone16pro,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-16-pro-1',
    name: 'iPhone 16 Pro (Var 1)',
    type: 'phone',
    image: iphone16pro1,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-16-pro-2',
    name: 'iPhone 16 Pro (Var 2)',
    type: 'phone',
    image: iphone16pro2,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },

  // --- iPhone 14 ---
  {
    id: 'iphone-14-midnight',
    name: 'iPhone 14 Midnight',
    type: 'phone',
    image: iphone14midnight,
    width: 390,
    aspectRatio: 390/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-14-midnight-1',
    name: 'iPhone 14 Midnight (Var 1)',
    type: 'phone',
    image: iphone14midnight1,
    width: 390,
    aspectRatio: 390/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },
  {
    id: 'iphone-14-midnight-2',
    name: 'iPhone 14 Midnight (Var 2)',
    type: 'phone',
    image: iphone14midnight2,
    width: 390,
    aspectRatio: 390/800,
    screen: {
      single: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      duo: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
      trio: { padding: '3% 4.5% 4.5% 4.5%', radius: '35px' },
    }
  },

  // --- iPhone 13 Pro ---
  {
    id: 'iphone-13-pro-p',
    name: 'iPhone 13 Pro (Portrait)',
    type: 'phone',
    image: iphone13proPortrait,
    width: 390,
    aspectRatio: 370/800,
    screen: {
      single: { padding: '7% 4% 7% 4%', radius: '40px' },
      duo: { padding: '7% 4% 7% 4%', radius: '40px' },
      trio: { padding: '7% 4% 7% 4%', radius: '40px' },
    }
  },
  {
    id: 'iphone-13-pro-l',
    name: 'iPhone 13 Pro (Landscape)',
    type: 'phone',
    image: iphone13proLandscape,
    width: 800,
    aspectRatio: 800/370,
    screen: {
      single: { padding: '8% 3% 8% 3%', radius: '60px' },
      duo: { padding: '30% 2% 30% 2%', radius: '20px' },
      trio: { padding: '37% 3% 37% 3%', radius: '20px' },
    }
  },

  // --- iPhone 13 Mini ---
  {
    id: 'iphone-13-mini-p',
    name: 'iPhone 13 Mini (Portrait)',
    type: 'phone',
    image: iphone13miniPortrait,
    width: 360,
    aspectRatio: 345/780,
    screen: {
      single: { padding: '9% 3.5% 9% 3.5%', radius: '40px' },
      duo: { padding: '9% 3.5% 9% 3.5%', radius: '40px' },
      trio: { padding: '9% 3.5% 9% 3.5%', radius: '40px' },
    }
  },
  {
    id: 'iphone-13-mini-l',
    name: 'iPhone 13 Mini (Landscape)',
    type: 'phone',
    image: iphone13miniLandscape,
    width: 780,
    aspectRatio: 780/345,
    screen: {
      single: { padding: '8% 3% 8% 3%', radius: '60px' },
      duo: { padding: '30% 2% 30% 2%', radius: '20px' },
      trio: { padding: '37% 3% 37% 3%', radius: '20px' },
    }
  },

  // --- iPads ---
  {
    id: 'ipad-pro-12-p',
    name: 'iPad Pro 12.9" (Portrait)',
    type: 'tablet',
    image: ipadPro12Portrait,
    width: 600,
    aspectRatio: 575/800,
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '5%', radius: '16px' },
      trio: { padding: '14% 5% 14% 5%', radius: '16px' },
    }
  },
  {
    id: 'ipad-pro-12-l',
    name: 'iPad Pro 12.9" (Landscape)',
    type: 'tablet',
    image: ipadPro12Landscape,
    width: 700,
    aspectRatio: 800/575,
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '19% 2% 19% 2%', radius: '16px' },
      trio: { padding: '29% 2% 29% 2%', radius: '16px' },
    }
  },
  {
    id: 'ipad-pro-11-p',
    name: 'iPad Pro 11" (Portrait)',
    type: 'tablet',
    image: ipadPro11Portrait,
    width: 550,
    aspectRatio: 560/800, 
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '5%', radius: '16px' },
      trio: { padding: '14% 5% 14% 5%', radius: '8px' },
    }
  },
  {
    id: 'ipad-pro-11-l',
    name: 'iPad Pro 11" (Landscape)',
    type: 'tablet',
    image: ipadPro11Landscape,
    width: 650,
    aspectRatio: 800/560,
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '19% 2% 19% 2%', radius: '20px' },
      trio: { padding: '29% 2% 29% 2%', radius: '16px' },
    }
  },
  {
    id: 'ipad-air-p',
    name: 'iPad Air (Portrait)',
    type: 'tablet',
    image: ipadAirPortrait,
    width: 550,
    aspectRatio: 560/800, 
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '5%', radius: '16px' },
      trio: { padding: '14% 5% 14% 5%', radius: '16px' },
    }
  },
   {
    id: 'ipad-air-l',
    name: 'iPad Air (Landscape)',
    type: 'tablet',
    image: ipadAirLandscape,
    width: 650,
    aspectRatio: 800/560, 
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '20% 2% 20% 2%', radius: '20px' },
      trio: { padding: '29% 2% 29% 2%', radius: '16px' },
    }
  },
  {
    id: 'ipad-mini-p',
    name: 'iPad mini (Portrait)',
    type: 'tablet',
    image: ipadMiniPortrait,
    width: 420,
    aspectRatio: 540/800,
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '5%', radius: '16px' },
      trio: { padding: '14% 5% 14% 5%', radius: '16px' },
    }
  },
  {
    id: 'ipad-mini-l',
    name: 'iPad mini (Landscape)',
    type: 'tablet',
    image: ipadMiniLandscape,
    width: 500,
    aspectRatio: 800/540,
    screen: {
      single: { padding: '5%', radius: '16px' },
      duo: { padding: '21% 2% 21% 2%', radius: '20px' },
      trio: { padding: '29% 2% 29% 2%', radius: '16px' },
    }
  },
  {
    id: 'ipad-base-p',
    name: 'iPad (Portrait)',
    type: 'tablet',
    image: ipadBasePortrait,
    width: 540,
    aspectRatio: 3/4,
    screen: {
      single: { padding: '5%', radius: '12px' },
      duo: { padding: '5%', radius: '12px' },
      trio: { padding: '5%', radius: '12px' },
    }
  },
  {
    id: 'ipad-base-l',
    name: 'iPad (Landscape)',
    type: 'tablet',
    image: ipadBaseLandscape,
    width: 640,
    aspectRatio: 4/3,
    screen: {
      single: { padding: '5%', radius: '12px' },
      duo: { padding: '21% 2% 21% 2%', radius: '20px' },
      trio: { padding: '5%', radius: '12px' },
    }
  },

  // --- Macs ---
  {
    id: 'macbook-pro-16',
    name: 'MacBook Pro 16"',
    type: 'laptop',
    image: macbookPro16,
    width: 1200,
    aspectRatio: 1.5,
    screen: {
      single: { padding: '10% 10% 10% 10%', radius: '8px' },
      duo: { padding: '27% 9.5% 23% 9.5%', radius: '8px' },
      trio: { padding: '35% 9.5% 34% 9.5%', radius: '8px' },
    }
  },
   {
    id: 'macbook-pro-14',
    name: 'MacBook Pro 14"',
    type: 'laptop',
    image: macbookPro14,
    width: 1200,
    aspectRatio: 1.5,
    screen: {
      single: { padding: '11%', radius: '20px' },
      duo: { padding: '28% 11% 23% 11%', radius: '8px' },
      trio: { padding: '35.5% 11% 35% 11%', radius: '8px' },
    }
  },
  {
    id: 'macbook-air-13',
    name: 'MacBook Air 13"',
    type: 'laptop',
    image: macbookAir13,
    width: 700,
    aspectRatio: 1.5,
    screen: {
      single: { padding: '12%', radius: '8px' },
      duo: { padding: '26% 12% 27% 12%', radius: '8px' },
      trio: { padding: '35.5% 11% 35% 11%', radius: '8px' },
    }
  },
  {
    id: 'imac-24',
    name: 'iMac 24"',
    type: 'desktop',
    image: imac24,
    width: 900,
    aspectRatio: 1.15,
    screen: {
      single: { padding: '4% 1% 20% 1%', radius: '20px' },
      duo: { padding: '14% 1% 30% 1%', radius: '20px' },
      trio: { padding: '27% 0.5% 38% 0.5%', radius: '10px' },
    }
  },
  {
    id: 'imac-27',
    name: 'iMac 27"',
    type: 'desktop',
    image: imac27,
    width: 800,
    aspectRatio: 1.15,
    screen: {
      single: { padding: '4% 1% 20% 1%', radius: '20px' },
      duo: { padding: '16% 1% 30% 1%', radius: '20px' },
      trio: { padding: '29% 0.5% 38% 0.5%', radius: '10px' },
    }
  },

  // --- Watches ---
  {
    id: 'watch-ultra',
    name: 'Apple Watch Ultra',
    type: 'watch',
    image: watchUltra,
    width: 320,
    aspectRatio: 0.52,
    screen: {
      single: { padding: '18% 15% 18% 15%', radius: '22%' },
      duo: { padding: '18% 15% 18% 15%', radius: '22%' },
      trio: { padding: '18% 15% 18% 15%', radius: '22%' },
    }
  },
  {
    id: 'watch-s8',
    name: 'Apple Watch S8',
    type: 'watch',
    image: watchS8,
    width: 300,
    aspectRatio: 0.54,
    screen: {
      single: { padding: '20% 13% 20% 13%', radius: '22%' },
      duo: { padding: '20% 13% 20% 13%', radius: '22%' },
      trio: { padding: '20% 13% 20% 13%', radius: '22%' },
    }
  },
  {
    id: 'watch-s8-1',
    name: 'Apple Watch S8 (Var)',
    type: 'watch',
    image: watchS8_1,
    width: 300,
    aspectRatio: 0.54,
    screen: {
      single: { padding: '20% 13% 20% 13%', radius: '22%' },
      duo: { padding: '20% 13% 20% 13%', radius: '22%' },
      trio: { padding: '20% 13% 20% 13%', radius: '22%' },
    }
  }
];

// Global cache for preloaded device images
const deviceImageCache = new Map<string, HTMLImageElement>();

// Preload all device images for instant switching
export const preloadDeviceImages = async (): Promise<void> => {
  console.log('[Devices] Preloading device images...');

  const promises = DEVICES.map((device) => {
    return new Promise<void>((resolve) => {
      // Skip if already cached
      if (deviceImageCache.has(device.id)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = async () => {
        try {
          await img.decode();
          deviceImageCache.set(device.id, img);
        } catch {
          // Still cache even if decode fails
          deviceImageCache.set(device.id, img);
        }
        resolve();
      };
      img.onerror = () => resolve();
      img.src = device.image;
    });
  });

  await Promise.all(promises);
  console.log(`[Devices] Preloaded ${deviceImageCache.size}/${DEVICES.length} device images`);
};

// Get preloaded image for a device
export const getPreloadedDeviceImage = (deviceId: string): HTMLImageElement | null => {
  return deviceImageCache.get(deviceId) || null;
};

// Check if device image is preloaded
export const isDeviceImagePreloaded = (deviceId: string): boolean => {
  return deviceImageCache.has(deviceId);
};

// Auto-start preloading when module is imported (runs immediately)
// This ensures images start loading before React even mounts
if (typeof window !== 'undefined') {
  preloadDeviceImages();
}
