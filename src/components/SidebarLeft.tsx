import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { useRenderStore } from '../store/renderStore';
import { CameraStylePanel } from './CameraStylePanel';
import { 
  SidebarContainer, 
  SidebarContent, 
  SidebarSection, 
  SidebarHeader,
  UploadBox,
  MediaSlot 
} from './ui/SidebarPrimitives';

const IMAGE_SLOTS = [0, 1, 2, 3];

export const SidebarLeft = () => {
  const {
    setMediaAssets,
    mediaAssets,
  } = useRenderStore();

  const inputRef0 = useRef<HTMLInputElement>(null);
  const inputRef1 = useRef<HTMLInputElement>(null);
  const inputRef2 = useRef<HTMLInputElement>(null);
  const inputRef3 = useRef<HTMLInputElement>(null);
  
  const fileInputRefs = [inputRef0, inputRef1, inputRef2, inputRef3];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAssets = [...mediaAssets];
    
    // Process max 4 files to prevent overflow loops
    const filesToProcess = files.slice(0, 4);

    filesToProcess.forEach((file, i) => {
      const targetIndex = index + i;
      if (targetIndex >= 4) return;

      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      newAssets[targetIndex] = { url, type: isVideo ? 'video' : 'image' };
    });

    setMediaAssets(newAssets);
    
    // Reset input value to allow selecting the same file again if needed
    e.target.value = '';
  };

  const handleRemoveMedia = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newAssets = [...mediaAssets];
    newAssets[index] = null;
    setMediaAssets(newAssets);
  };

  return (
    <SidebarContainer side="left">
      <SidebarContent>
        {/* Media Selection */}
        <SidebarSection borderBottom>
          <SidebarHeader>
            Images & Videos
          </SidebarHeader>
          
          {/* Main Upload Box */}
          <UploadBox 
            onClick={() => fileInputRefs[0].current?.click()} 
            maxItems={4} 
          />

          <div className="grid grid-cols-4 gap-2">
            {IMAGE_SLOTS.map((index) => (
              <div key={index}>
                <input
                  ref={fileInputRefs[index]}
                  type="file"
                  className="hidden"
                  multiple={true} // Explicitly set multiple
                  accept="image/*,video/mp4,video/quicktime,video/webm"
                  onChange={(e) => handleFileSelect(e, index)}
                />
                
                <MediaSlot
                  index={index}
                  mediaAsset={mediaAssets[index]}
                  onClick={() => fileInputRefs[index].current?.click()}
                  onRemove={(e) => handleRemoveMedia(index, e)}
                />
              </div>
            ))}
          </div>
        </SidebarSection>
        
        {/* Visual Style */}
        <SidebarSection>
          <SidebarHeader icon={<Sparkles className="w-4 h-4" />}>
            Visual Style
          </SidebarHeader>
          <CameraStylePanel />
        </SidebarSection>
      </SidebarContent>
    </SidebarContainer>
  );
};
