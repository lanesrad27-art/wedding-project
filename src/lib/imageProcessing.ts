/**
 * HD Image Processing Engine for Disposable Wedding Camera
 * Handles video frame capture, filter grading (FUNSAVER, QUICKSNAP, GARDEN FLASH),
 * authentic analog film grain, vignette, and editorial wedding stamp.
 */

import { CameraRatio, FilterType } from '../types/wedding';

interface CaptureOptions {
  video: HTMLVideoElement;
  ratio: CameraRatio;
  filter: FilterType;
  digitalZoom: number; // 1 to 3
  isFrontCamera: boolean;
}

export interface CapturedImageResult {
  fullDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
}

export async function processCameraCapture(options: CaptureOptions): Promise<CapturedImageResult> {
  const { video, ratio, filter, digitalZoom, isFrontCamera } = options;

  // Determine native video dimensions
  const videoWidth = video.videoWidth || 1920;
  const videoHeight = video.videoHeight || 1080;

  // Target output dimensions (Minimum 1280p, Ideal 1920x1080 or 1080x1920)
  let targetWidth: number;
  let targetHeight: number;

  if (ratio === '9:16') {
    targetWidth = 1080;
    targetHeight = 1920;
  } else {
    // 16:9
    targetWidth = 1920;
    targetHeight = 1080;
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Canvas context could not be acquired');
  }

  // Calculate cropping box from video to match target aspect ratio and digital zoom
  const targetAspect = targetWidth / targetHeight;
  const videoAspect = videoWidth / videoHeight;

  let sourceWidth = videoWidth;
  let sourceHeight = videoHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (videoAspect > targetAspect) {
    // Video is wider than target; crop horizontally
    sourceWidth = videoHeight * targetAspect;
    sourceX = (videoWidth - sourceWidth) / 2;
  } else {
    // Video is taller than target; crop vertically
    sourceHeight = videoWidth / targetAspect;
    sourceY = (videoHeight - sourceHeight) / 2;
  }

  // Apply digital zoom if > 1
  if (digitalZoom > 1) {
    const zoomedW = sourceWidth / digitalZoom;
    const zoomedH = sourceHeight / digitalZoom;
    sourceX += (sourceWidth - zoomedW) / 2;
    sourceY += (sourceHeight - zoomedH) / 2;
    sourceWidth = zoomedW;
    sourceHeight = zoomedH;
  }

  // Draw video frame to canvas
  ctx.save();
  if (isFrontCamera) {
    // Mirror horizontally for front camera
    ctx.translate(targetWidth, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(
    video,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );
  ctx.restore();

  // Apply Film Grading per Filter Type
  applyFilmGrading(ctx, targetWidth, targetHeight, filter);

  // Apply Vignette (Darkened film corners)
  applyVignette(ctx, targetWidth, targetHeight, filter);

  // Apply Analog Film Grain
  applyAnalogFilmGrain(ctx, targetWidth, targetHeight, filter);

  // Apply Elegant Disposable Wedding Camera Frame & Timestamp Stamp
  applyWeddingFilmStamp(ctx, targetWidth, targetHeight, ratio, filter);

  // Export full HD image
  const fullDataUrl = canvas.toDataURL('image/jpeg', 0.94);

  // Create fast thumbnail for gallery & camera roll
  const thumbCanvas = document.createElement('canvas');
  const thumbWidth = ratio === '9:16' ? 405 : 640;
  const thumbHeight = ratio === '9:16' ? 720 : 360;
  thumbCanvas.width = thumbWidth;
  thumbCanvas.height = thumbHeight;
  const thumbCtx = thumbCanvas.getContext('2d');
  if (thumbCtx) {
    thumbCtx.drawImage(canvas, 0, 0, thumbWidth, thumbHeight);
  }
  const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.82);

  return {
    fullDataUrl,
    thumbnailDataUrl,
    width: targetWidth,
    height: targetHeight,
  };
}

/**
 * Applies custom color curves, channel tints, and contrast balance
 */
function applyFilmGrading(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const len = data.length;

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (filter === 'FUNSAVER') {
      // Kodak Gold 800: Rich golden skin tones, warm yellow highlights, deep warm shadows
      r = Math.min(255, r * 1.08 + 8);
      g = Math.min(255, g * 1.02 + 4);
      b = Math.max(0, b * 0.88 - 5);

      // Contrast boost
      r = (r - 128) * 1.15 + 128;
      g = (g - 128) * 1.12 + 128;
      b = (b - 128) * 1.10 + 128;
    } else if (filter === 'QUICKSNAP') {
      // Fujicolor Superia: Crisp daylight, subtle cyan/olive shadows, clean crisp tones
      r = Math.max(0, r * 0.96);
      g = Math.min(255, g * 1.04 + 6);
      b = Math.min(255, b * 1.03 + 8);

      // Clean soft contrast
      r = (r - 128) * 1.08 + 128;
      g = (g - 128) * 1.08 + 128;
      b = (b - 128) * 1.08 + 128;
    } else if (filter === 'GARDEN_FLASH') {
      // Official Wedding Filter: Romantic garden, warm skin, subtle olive in shadows, creamy burgundy highlights
      // Lift red & green in highlights, inject soft olive (#808000) undertone, deep burgundy shadow compression
      r = Math.min(255, r * 1.05 + 10);
      g = Math.min(255, g * 1.01 + 6);
      b = Math.max(0, b * 0.92 - 2);

      // Characteristic flash highlight rolloff
      if (r > 190) r = 190 + (r - 190) * 0.7;
      if (g > 190) g = 190 + (g - 190) * 0.7;

      // Romantic contrast
      r = (r - 128) * 1.18 + 128;
      g = (g - 128) * 1.14 + 128;
      b = (b - 128) * 1.12 + 128;
    }

    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Realistic disposable camera radial vignette
 */
function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType
) {
  ctx.save();
  const radius = Math.max(width, height) * 0.75;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    radius * 0.35,
    width / 2,
    height / 2,
    radius
  );

  if (filter === 'FUNSAVER') {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(25, 15, 5, 0.18)');
    gradient.addColorStop(1, 'rgba(10, 5, 0, 0.52)');
  } else if (filter === 'QUICKSNAP') {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.75, 'rgba(5, 20, 15, 0.15)');
    gradient.addColorStop(1, 'rgba(5, 15, 10, 0.45)');
  } else {
    // GARDEN FLASH
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.7, 'rgba(30, 8, 15, 0.22)');
    gradient.addColorStop(1, 'rgba(15, 4, 8, 0.55)');
  }

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

/**
 * Authentic film grain synthesis
 */
function applyAnalogFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  filter: FilterType
) {
  ctx.save();
  const grainCanvas = document.createElement('canvas');
  // Downsampled grain canvas for organic clump size
  grainCanvas.width = Math.floor(width / 2);
  grainCanvas.height = Math.floor(height / 2);
  const gCtx = grainCanvas.getContext('2d');
  if (!gCtx) return;

  const gImgData = gCtx.createImageData(grainCanvas.width, grainCanvas.height);
  const gData = gImgData.data;
  const gLen = gData.length;

  const intensity = filter === 'FUNSAVER' ? 24 : filter === 'GARDEN_FLASH' ? 20 : 16;

  for (let i = 0; i < gLen; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    const val = 128 + noise;
    gData[i] = val;
    gData[i + 1] = val;
    gData[i + 2] = val;
    gData[i + 3] = 45; // Subtle opacity
  }

  gCtx.putImageData(gImgData, 0, 0);

  ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCanvas, 0, 0, width, height);
  ctx.restore();
}

/**
 * Editorial wedding stamp & disposable border frame
 */
function applyWeddingFilmStamp(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  ratio: CameraRatio,
  filter: FilterType
) {
  ctx.save();

  // Subtle inner border (disposable film frame)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.lineWidth = 2;
  const margin = Math.round(width * 0.035);
  ctx.strokeRect(margin, margin, width - margin * 2, height - margin * 2);

  // Bottom gradient banner for crystal clear text readability without obscuring photo
  const bannerHeight = Math.round(height * 0.08);
  const textGrad = ctx.createLinearGradient(0, height - bannerHeight - 40, 0, height);
  textGrad.addColorStop(0, 'rgba(0,0,0,0)');
  textGrad.addColorStop(0.5, 'rgba(21, 18, 16, 0.65)');
  textGrad.addColorStop(1, 'rgba(21, 18, 16, 0.88)');
  ctx.fillStyle = textGrad;
  ctx.fillRect(0, height - bannerHeight - 40, width, bannerHeight + 40);

  // Couple names & Date Typography
  const bottomY = height - margin - 12;

  // Primary Line: FAISHAL & FAZA
  ctx.fillStyle = '#FFF9F0';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  const nameFontSize = Math.max(22, Math.round(width * 0.032));
  ctx.font = `600 ${nameFontSize}px 'Playfair Display', 'Cormorant Garamond', Georgia, serif`;
  ctx.letterSpacing = '2px';
  ctx.fillText('FAISHAL & FAZA', width / 2, bottomY - 26);

  // Subtitle Line: 11 • 10 • 2026 • ROMANTIC GARDEN • [FILTER]
  ctx.fillStyle = '#C8A96B'; // Muted Gold
  const dateFontSize = Math.max(12, Math.round(width * 0.016));
  ctx.font = `500 ${dateFontSize}px 'Plus Jakarta Sans', sans-serif`;
  ctx.letterSpacing = '3px';
  const filterLabel = filter === 'GARDEN_FLASH' ? 'GARDEN FILM' : filter;
  ctx.fillText(`11 • 10 • 2026   ·   ROMANTIC GARDEN   ·   ${filterLabel}`, width / 2, bottomY);

  // Top discreet disposable roll marker: e.g. "EXP 24 / ISO 800"
  ctx.fillStyle = 'rgba(245, 239, 227, 0.45)';
  ctx.textAlign = 'left';
  ctx.font = `400 ${Math.max(10, Math.round(width * 0.013))}px monospace`;
  ctx.fillText('F&F • DISPOSABLE FILM', margin + 12, margin + 22);

  ctx.textAlign = 'right';
  ctx.fillText('ROMANTIC GARDEN 2026', width - margin - 12, margin + 22);

  ctx.restore();
}
