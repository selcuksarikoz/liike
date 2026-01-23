import { useRef } from 'react';
import { useRenderStore } from '../store/renderStore';
import { CameraStylePanel } from './CameraStylePanel';
import {
  SidebarContainer,
  SidebarContent,
  SidebarHeader,
  SidebarSection,
  UploadBox,
} from './ui/SidebarPrimitives';

export const SidebarLeft = () => {
  const { setMediaAssets, mediaAssets } = useRenderStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAssets = [...mediaAssets];
    const filesToProcess = files.slice(0, 4);

    filesToProcess.forEach((file, i) => {
      if (i >= 4) return;
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      newAssets[i] = { url, type: isVideo ? 'video' : 'image' };
    });

    setMediaAssets(newAssets);
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
