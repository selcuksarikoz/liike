import { useRef } from 'react';
import { useRenderStore, type MediaAsset } from '../store/renderStore';
import { CameraStylePanel } from './CameraStylePanel';
import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  UploadBox,
} from './ui/SidebarPrimitives';

// Helper to get video duration (does NOT revoke URL - caller owns it)
const getVideoDuration = (url: string): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const durationMs = Math.round(video.duration * 1000);
      resolve(durationMs);
    };
    video.onerror = () => resolve(0);
    video.src = url;
  });
};

export const SidebarLeft = () => {
  const { setMediaAssets, setDurationMs, mediaAssets, durationMs } = useRenderStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAssets: (MediaAsset | null)[] = [...mediaAssets];
    const filesToProcess = files.slice(0, 4);

    // Process files and get video durations
    const processPromises = filesToProcess.map(async (file, i) => {
      if (i >= 4) return;
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');

      if (isVideo) {
        const duration = await getVideoDuration(url);
        newAssets[i] = { url, type: 'video', duration };
      } else {
        newAssets[i] = { url, type: 'image' };
      }
    });

    await Promise.all(processPromises);
    setMediaAssets(newAssets);

    // Calculate max video duration and update render duration
    const maxVideoDuration = newAssets.reduce((max, asset) => {
      if (asset?.type === 'video' && asset.duration) {
        return Math.max(max, asset.duration);
      }
      return max;
    }, 0);

    // Update duration if video is longer than current duration
    if (maxVideoDuration > durationMs) {
      setDurationMs(maxVideoDuration);
    }

    e.target.value = '';
  };

  return (
    <SidebarContainer side="left">
      <SidebarContent>
        {/* Media Selection */}
        <SidebarSection borderBottom>
          <SidebarHeader>Images & Videos</SidebarHeader>

          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            multiple
            onChange={handleFileSelect}
          />
          <UploadBox onClick={() => inputRef.current?.click()} maxItems={4} />
        </SidebarSection>

        {/* Visual Style */}
        <SidebarSection>
          <CameraStylePanel />
        </SidebarSection>
      </SidebarContent>
    </SidebarContainer>
  );
};
