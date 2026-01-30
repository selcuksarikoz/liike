import { useRenderStore, type MediaAsset } from '../store/renderStore';
import { useTimelineStore } from '../store/timelineStore';
import { getVideoDuration } from '../utils/mediaUtils';

export const useMediaUpload = () => {
  const handleMediaUpload = async (
    files: File[],
    targetSlot: number | null = null, // null means "auto-fill empty slots or sequential"
    maxSlots: number = 3
  ) => {
    if (files.length === 0) return;

    const state = useRenderStore.getState();
    const currentAssets = [...state.mediaAssets];
    
    // If we have a specific target slot, we only process the first file for that slot
    if (targetSlot !== null) {
      if (files[0]) {
        const file = files[0];
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        
        let duration = 0;
        if (isVideo) {
          duration = await getVideoDuration(url);
        }
        
        currentAssets[targetSlot] = isVideo
          ? { url, type: 'video', duration }
          : { url, type: 'image' };
          
        if (duration > 0 && isFinite(duration)) {
             // For single slot update, we might want to ensure total duration covers this video
            const maxVideoDuration = currentAssets.reduce((max, asset) => {
                if (asset?.type === 'video' && asset.duration) return Math.max(max, asset.duration);
                return max;
            }, 0);
            
             // Only increase duration, don't decrease it automatically (user might have set custom duration)
            if (maxVideoDuration > state.durationMs) {
                state.setDurationMs(maxVideoDuration);
            }

            // Sync with Timeline Visuals Track
            const timelineStore = useTimelineStore.getState();
            const visualTrack = timelineStore.tracks.find((t) => t.type === 'visual');
            if (visualTrack) {
              timelineStore.addClip(visualTrack.id, {
                trackId: visualTrack.id,
                type: 'visual',
                name: file.name,
                startMs: 0,
                durationMs: duration,
                color: '#3b82f6', // Blue for video
                icon: 'clapperboard',
                data: { mediaUrl: url, slotIndex: targetSlot ?? 0 },
              });
            }
        }
      }
    } else {
      // Multiple files or auto-fill
      const filesToProcess = files.slice(0, maxSlots);
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        
        let duration = 0;
        if (isVideo) {
          duration = await getVideoDuration(url);
        }

        const asset: MediaAsset = isVideo
          ? { url, type: 'video', duration }
          : { url, type: 'image' };

        // Logic: Try to fill empty slots first, then sequential
        const targetIdx = currentAssets.indexOf(null);
        if (targetIdx !== -1) {
          currentAssets[targetIdx] = asset;
        } else if (i < maxSlots) {
          // If no empty slots, just overwrite form the beginning? 
          // SidebarLeft logic was: `else if (i < 3) updatedAssets[i] = asset;`
          // This implies if we upload 3 files, it overwrites 0, 1, 2.
          currentAssets[i] = asset;
        }

        // Add to timeline if video
        if (isVideo && duration > 0) {
           const timelineStore = useTimelineStore.getState();
           const visualTrack = timelineStore.tracks.find((t) => t.type === 'visual');
           if (visualTrack) {
              timelineStore.addClip(visualTrack.id, {
                trackId: visualTrack.id,
                type: 'visual',
                name: file.name,
                startMs: 0,
                durationMs: duration,
                color: '#3b82f6',
                icon: 'clapperboard',
                data: { mediaUrl: url, slotIndex: targetIdx !== -1 ? targetIdx : i },
              });
           }
        }
      }
      
      // Update max duration
      const maxVideoDuration = currentAssets.reduce((max, asset) => {
        if (asset?.type === 'video' && asset.duration) return Math.max(max, asset.duration);
        return max;
      }, 0);

      if (maxVideoDuration > state.durationMs) {
        state.setDurationMs(maxVideoDuration);
      }
    }

    state.setMediaAssets(currentAssets);
  };

  return { handleMediaUpload };
};
