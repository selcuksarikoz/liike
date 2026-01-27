// Frame processing worker - handles heavy canvas operations off main thread
// Uses OffscreenCanvas when available for true parallel processing

type FrameMessage = {
  type: 'init' | 'processFrame' | 'cleanup';
  width?: number;
  height?: number;
  imageData?: ImageData;
  frameIndex?: number;
};

type FrameResponse = {
  type: 'ready' | 'frameProcessed' | 'error';
  rgbaData?: Uint8Array;
  frameIndex?: number;
  error?: string;
};

let offscreenCanvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;

self.onmessage = (e: MessageEvent<FrameMessage>) => {
  const { type, width, height, imageData, frameIndex } = e.data;

  try {
    switch (type) {
      case 'init':
        if (width && height) {
          offscreenCanvas = new OffscreenCanvas(width, height);
          ctx = offscreenCanvas.getContext('2d', {
            willReadFrequently: true,
            alpha: false,
          }) as OffscreenCanvasRenderingContext2D;

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
          }

          self.postMessage({ type: 'ready' } as FrameResponse);
        }
        break;

      case 'processFrame':
        if (!ctx || !offscreenCanvas || !imageData) {
          throw new Error('Worker not initialized or missing data');
        }

        // Put the image data onto the offscreen canvas
        ctx.putImageData(imageData, 0, 0);

        // Get raw RGBA data
        const outputData = ctx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);

        // Transfer the buffer for zero-copy performance
        const rgbaBuffer = new Uint8Array(outputData.data.buffer.slice(0));

        self.postMessage(
          { type: 'frameProcessed', rgbaData: rgbaBuffer, frameIndex } as FrameResponse,
          [rgbaBuffer.buffer] // Transfer ownership
        );
        break;

      case 'cleanup':
        offscreenCanvas = null;
        ctx = null;
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: (error as Error).message,
      frameIndex,
    } as FrameResponse);
  }
};

export {};
