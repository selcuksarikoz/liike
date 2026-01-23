# Implementation Plan: Enhanced Animations & Device Fitting

## Overview

This plan addresses multiple feature requests for the Liike animation platform.

---

## PHASE 1: Device Fitting & MacBook Fixes ✅ COMPLETED

### 1.1 Fix MacBook Pro 14 & 16 Screen Positioning ✅

**File:** `src/constants/devices.ts`
**Status:** DONE

- Fixed `PRESETS.macbook.default` screen coordinates
- Added specific presets for `pro14` and `pro16`
- Removed invalid `bottom` property from iMac 27

### 1.2 Auto-Fit Device in Canvas ✅

**File:** `src/components/DeviceRenderer.tsx`
**Status:** DONE (in previous session)

- Implemented heuristic-based `fitScale` calculations
- Devices now auto-scale based on type (phones ~2.5x, watches ~3.0x, etc.)

---

## PHASE 2: Animation System Refactoring (Partial)

### 2.1 Split Animation Constants into Modules

**Status:** Future work - Not yet required for core functionality.

### 2.2 Create Text Animation Definitions ✅

**File:** `src/constants/textAnimations.ts` (NEW)
**Status:** DONE

- `typewriter` - Character by character reveal
- `word-fade-in` - Word by word fade in
- `letter-cascade` - Letters cascade down
- `word-slide-up` - Words slide up sequentially
- `glow-reveal` - Text glows as it appears
- `bounce-letters` - Letters bounce in
- `blur-in` - Text comes into focus from blur
- `scale-pop` - Text pops in with scale effect
- `split-reveal` - Text splits and reveals from center
- Added `TEXT_DEVICE_PRESETS` for combined text+device animations
- Added `generateTextKeyframes` for runtime animation generation

---

## PHASE 3: Favorites System with IndexedDB ✅ COMPLETED

### 3.1 Create IndexedDB Store ✅

**File:** `src/store/favoritesStore.ts` (NEW)
**Status:** DONE

- `addFavorite(presetId: string)` - Add to favorites
- `removeFavorite(presetId: string)` - Remove from favorites
- `isFavorite(presetId: string): boolean` - Check if favorited
- `getAllFavorites(): Promise<string[]>` - Get all favorite IDs
- `toggleFavorite(presetId: string)` - Toggle favorite state
- `useFavorites()` React hook with optimistic updates
- Auto-sync with IndexedDB on change

### 3.2 Add Favorite Button to AnimatedLayoutCard ✅

**File:** `src/components/AnimationsPanel.tsx`
**Status:** DONE

- Heart icon button in top-right corner of each card
- Filled heart (rose color) = favorited
- Empty heart with backdrop blur = not favorited
- Click toggles favorite state with smooth animation
- Prevents click event propagation to card

### 3.3 Add Favorites Tab in AnimationsPanel ✅

**File:** `src/components/SidebarRight.tsx`
**Status:** DONE

- Added 'favorites' filter to LayoutFilter type
- Added ❤️ tab in filter options
- Shows only favorited presets when selected
- Empty state with helpful message when no favorites

---

## PHASE 4: Text Animations Section ✅ COMPLETED

### 4.1 Text Animation Types ✅

**File:** `src/constants/textAnimations.ts` (NEW)
**Status:** DONE

- Defined all text animation configurations
- Created `TextAnimationCard` component for UI

### 4.2 Add Text Animations Type Support ✅

**File:** `src/store/timelineStore.ts`
**Status:** DONE

- Added `textOverlay` optional property to `AnimationPreset` type

### 4.3 Add Text Presets to AnimationsPanel ✅

**File:** `src/components/AnimationsPanel.tsx`
**Status:** DONE

- Added 'text' filter to LayoutFilter type
- Added "Aa" text tab in filter options
- Created `TextAnimationCard` component for text presets
- Added 6 text+device preset cards:
  - Headline + Device
  - Typewriter Showcase
  - Word Reveal
  - Playful Intro
  - Elegant Reveal
  - Feature Slide
- Added "Available Effects" grid showing all 9 text animation types

### 4.4 TextOverlay Renderer (TODO)

**File:** `src/components/TextOverlay.tsx` (To be created)
**Features needed:**

- Render animated text on top of device/content
- Apply selected animation effect
- Sync with timeline playback

---

## PHASE 5: AnimatedLayoutCard Enhancements (Partial)

### 5.1 Sync Preview with Current Canvas Settings

**File:** `src/components/AnimationsPanel.tsx`
**Status:** Already passes current background, shadow, and style settings

- Future: Could pass current `frameMode` and `deviceType` for more accurate previews

---

## Summary of Changes Made

### New Files Created:

- `src/store/favoritesStore.ts` - IndexedDB favorites management
- `src/constants/textAnimations.ts` - Text animation definitions

### Files Modified:

- `src/constants/devices.ts` - Fixed MacBook screen positions, removed invalid properties
- `src/components/AnimationsPanel.tsx` - Added favorites UI, text animations section
- `src/components/SidebarRight.tsx` - Added favorites and text filter tabs
- `src/store/renderStore.ts` - Changed deviceType to string for flexibility
- `src/store/timelineStore.ts` - Added textOverlay to AnimationPreset type

---

## Remaining Work (Future)

1. **TextOverlay Component** - Create renderer for animated text on canvas
2. **TextAnimationEditor Component** - Full text editing UI with font/color/shadow controls
3. **Text Animation in Workarea** - Render text overlay during playback
4. **Animation Constants Modularization** - Split animations.ts into modules
5. **Enhanced Card Previews** - Show actual device mockup in preview cards
