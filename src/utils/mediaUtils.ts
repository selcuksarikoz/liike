export const getVideoDuration = (url: string): Promise<number> => {
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
