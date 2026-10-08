import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Camera,
  FlipHorizontal,
  Zap,
  ZapOff,
  Sparkles,
  ChevronLeft,
  AlertCircle,
  RefreshCw,
  Sliders,
  Upload,
} from 'lucide-react';
import {
  CameraRatio,
  FILTERS_CONFIG,
  FilterType,
  FlashMode,
  ZoomLevel,
} from '../types/wedding';
import { playShutterSound } from '../lib/audio';
import { processCameraCapture, CapturedImageResult } from '../lib/imageProcessing';

interface CameraViewProps {
  guestName: string;
  photoLimit: number;
  currentGuestPhotoCount: number;
  onPhotoCaptured: (captureResult: CapturedImageResult, filter: FilterType, ratio: CameraRatio) => void;
  onOpenRoll: () => void;
  onBackToHome: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  guestName,
  photoLimit,
  currentGuestPhotoCount,
  onPhotoCaptured,
  onOpenRoll,
  onBackToHome,
}) => {
  // Camera state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [ratio, setRatio] = useState<CameraRatio>('9:16');
  const [activeFilter, setActiveFilter] = useState<FilterType>('GARDEN_FLASH');
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [flashMode, setFlashMode] = useState<FlashMode>('off');

  // Hardware capability state
  const [hasTorchCapability, setHasTorchCapability] = useState<boolean>(false);
  const [hasZoomCapability, setHasZoomCapability] = useState<boolean>(false);

  // Status & UI state
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

  // Start Camera Stream
  const startCamera = useCallback(async (facing: 'environment' | 'user') => {
    setIsInitializing(true);
    setErrorMessage(null);

    // Stop existing stream tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMessage('Please open this wedding camera using Safari, Chrome, or Samsung Internet.');
      setIsInitializing(false);
      return;
    }

    // High quality constraints targeting 1920x1080 / 1280p ideal
    const constraints: MediaStreamConstraints = {
      audio: false,
      video: {
        facingMode: { ideal: facing },
        width: { ideal: 1920 },
        height: { ideal: 1080 },
      },
    };

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic video constraints if ideal resolution rejected
        console.warn('High resolution constraint failed, trying basic video:', err);
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: facing },
        });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch((e) => console.log('Autoplay play error:', e));
      }

      // Check track capabilities
      const track = stream.getVideoTracks()[0];
      if (track && 'getCapabilities' in track) {
        const capabilities = track.getCapabilities() as {
          torch?: boolean;
          zoom?: { min: number; max: number; step: number };
        };
        setHasTorchCapability(Boolean(capabilities?.torch));
        setHasZoomCapability(Boolean(capabilities?.zoom));
      }

      setIsInitializing(false);
    } catch (err: unknown) {
      console.error('getUserMedia error:', err);
      setIsInitializing(false);
      const e = err as { name?: string; message?: string };
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access is needed to capture your memories.');
      } else if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setErrorMessage("We couldn't find a camera on this device.");
      } else {
        setErrorMessage('Could not initialize camera. Please check your browser permissions.');
      }
    }
  }, []);

  // Initialize camera on mount and cleanup on unmount
  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode, startCamera]);

  // Apply native zoom if supported
  useEffect(() => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && hasZoomCapability) {
      try {
        const capabilities = track.getCapabilities() as {
          zoom?: { min: number; max: number };
        };
        if (capabilities.zoom) {
          const clampedZoom = Math.min(capabilities.zoom.max, Math.max(capabilities.zoom.min, zoom));
          track.applyConstraints({
            advanced: [{ zoom: clampedZoom } as MediaTrackConstraintSet],
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Native zoom constraint failed, fallback to digital zoom:', err);
      }
    }
  }, [zoom, hasZoomCapability]);

  // Apply torch if flashMode === 'on' and supported
  useEffect(() => {
    if (!streamRef.current || !hasTorchCapability) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        track.applyConstraints({
          advanced: [{ torch: flashMode === 'on' } as MediaTrackConstraintSet],
        }).catch(() => {});
      } catch (err) {
        console.warn('Torch constraint failed:', err);
      }
    }
  }, [flashMode, hasTorchCapability]);

  // Toggle Front / Back Camera
  const toggleCamera = () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
  };

  // Cycle Flash Mode
  const toggleFlash = () => {
    if (flashMode === 'off') setFlashMode('on');
    else if (flashMode === 'on') setFlashMode('auto');
    else setFlashMode('off');
  };

  // Cycle Zoom Level
  const cycleZoom = (level: ZoomLevel) => {
    setZoom(level);
  };

  // Trigger Shutter / Capture
  const handleShutter = async () => {
    if (isCapturing || !videoRef.current) return;

    if (currentGuestPhotoCount >= photoLimit && photoLimit < 999) {
      alert(`Kamu sudah mencapai batas ${photoLimit} foto untuk kenangan hari ini. Kamu bisa melihat fotomu di Roll!`);
      onOpenRoll();
      return;
    }

    setIsCapturing(true);

    // 1. Shutter sound
    playShutterSound();

    // 2. Camera shake & screen flash
    setIsShaking(true);
    setIsFlashing(true);

    setTimeout(() => {
      setIsFlashing(false);
      setIsShaking(false);
    }, 180);

    // 3. Process high resolution frame on canvas
    try {
      const result = await processCameraCapture({
        video: videoRef.current,
        ratio,
        filter: activeFilter,
        digitalZoom: zoom,
        isFrontCamera: facingMode === 'user',
      });

      onPhotoCaptured(result, activeFilter, ratio);
    } catch (err) {
      console.error('Photo capture error:', err);
      alert('Gagal mengambil foto. Silakan coba kembali.');
    } finally {
      setIsCapturing(false);
    }
  };

  // Fallback file upload if camera fails
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new Image();
      img.onload = async () => {
        const dummyVideo = document.createElement('video');
        // Synthesize capture result from image
        const canvas = document.createElement('canvas');
        canvas.width = ratio === '9:16' ? 1080 : 1920;
        canvas.height = ratio === '9:16' ? 1920 : 1080;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const fullDataUrl = canvas.toDataURL('image/jpeg', 0.94);
          onPhotoCaptured(
            {
              fullDataUrl,
              thumbnailDataUrl: fullDataUrl,
              width: canvas.width,
              height: canvas.height,
            },
            activeFilter,
            ratio
          );
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const currentFilterConfig = FILTERS_CONFIG[activeFilter];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center p-0 sm:p-4 bg-[#151210] overflow-hidden select-none">
      {/* Hidden file input for emergency fallback */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Screen flash overlay */}
      {isFlashing && (
        <div className="absolute inset-0 z-50 bg-[#FFFDF5] animate-screen-flash pointer-events-none" />
      )}

      {/* Main Disposable Camera Smartphone Shell */}
      <div
        className={`relative w-full max-w-md h-[calc(100vh-3.5rem)] sm:h-[88vh] sm:max-h-[880px] sm:rounded-[36px] overflow-hidden bg-black flex flex-col justify-between border-0 sm:border border-[#5B1B31]/40 shadow-2xl shadow-black ${
          isShaking ? 'animate-shutter-shake' : ''
        }`}
      >
        {/* ============================================================== */}
        {/* TOP CAMERA BAR */}
        {/* ============================================================== */}
        <div className="relative z-30 pt-3 pb-2 px-4 flex items-center justify-between bg-gradient-to-b from-black/85 via-black/45 to-transparent text-[#F5EFE3]">
          {/* Back button */}
          <button
            onClick={onBackToHome}
            className="p-2 -ml-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors text-[#F5EFE3] cursor-pointer"
            title="Kembali"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Center Title: Faishal & Faza 11•10•2026 */}
          <div className="flex flex-col items-center">
            <span className="font-serif-title text-base sm:text-lg font-bold tracking-wider text-[#FFF9F0]">
              FAISHAL &amp; FAZA
            </span>
            <div className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase text-[#C8A96B] font-medium">
              <span>10 • 10 • 2026</span>
              <span>·</span>
              <span className="text-[#808000]">ROMANTIC GARDEN</span>
            </div>
          </div>

          {/* Right Controls: Flash & Switch camera */}
          <div className="flex items-center gap-2">
            {/* Flash toggle */}
            <button
              onClick={toggleFlash}
              className={`p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                flashMode !== 'off'
                  ? 'bg-[#E5A93C] text-black border-[#E5A93C] shadow-lg shadow-[#E5A93C]/30'
                  : 'bg-black/40 text-[#F5EFE3] border-white/10 hover:bg-black/60'
              }`}
              title={`Flash: ${flashMode.toUpperCase()}`}
            >
              {flashMode === 'off' ? (
                <ZapOff className="w-4 h-4" />
              ) : (
                <Zap className="w-4 h-4 fill-current" />
              )}
            </button>

            {/* Camera switch (front/back) */}
            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-all text-[#F5EFE3] cursor-pointer active:rotate-180 duration-300"
              title="Ganti Kamera Depan/Belakang"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECONDARY TOOLBAR: RATIO & ZOOM */}
        {/* ============================================================== */}
        <div className="relative z-30 px-4 py-1.5 flex items-center justify-between text-xs">
          {/* Ratio Selector [9:16] [16:9] */}
          <div className="flex items-center bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setRatio('9:16')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                ratio === '9:16'
                  ? 'bg-[#5B1B31] text-[#FFF9F0] shadow-sm'
                  : 'text-[#F5EFE3]/70 hover:text-[#FFF9F0]'
              }`}
            >
              9:16
            </button>
            <button
              onClick={() => setRatio('16:9')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                ratio === '16:9'
                  ? 'bg-[#5B1B31] text-[#FFF9F0] shadow-sm'
                  : 'text-[#F5EFE3]/70 hover:text-[#FFF9F0]'
              }`}
            >
              16:9
            </button>
          </div>

          {/* Current Film Indicator */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black/55 backdrop-blur-md border border-[#C8A96B]/30 hover:border-[#C8A96B] transition-all cursor-pointer text-[#FFF9F0]"
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: currentFilterConfig.uiColor }}
            />
            <span className="text-[11px] font-semibold tracking-wider">
              {currentFilterConfig.name}
            </span>
            <Sliders className="w-3 h-3 text-[#C8A96B]" />
          </button>

          {/* Zoom Selector 1x - 3x */}
          <div className="flex items-center bg-black/50 backdrop-blur-md p-1 rounded-xl border border-white/10 gap-0.5">
            {([1, 1.5, 2, 2.5, 3] as ZoomLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => cycleZoom(lvl)}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                  zoom === lvl
                    ? 'bg-[#C8A96B] text-black shadow-sm'
                    : 'text-[#F5EFE3]/60 hover:text-[#FFF9F0]'
                }`}
              >
                {lvl}x
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================== */}
        {/* CAMERA PREVIEW VIEWPORT */}
        {/* ============================================================== */}
        <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden bg-[#110e0c]">
          {/* Error state */}
          {errorMessage ? (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-[#151210]/95 text-[#F5EFE3] space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h4 className="text-lg font-serif-title font-bold text-[#FFF9F0]">
                Camera Access Needed
              </h4>
              <p className="text-xs text-[#F5EFE3]/80 max-w-xs leading-relaxed">
                {errorMessage}
              </p>
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2 w-full max-w-xs">
                <button
                  onClick={() => startCamera(facingMode)}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#5B1B31] text-[#FFF9F0] text-xs font-semibold uppercase tracking-wider hover:bg-[#6e223c] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 rounded-xl bg-white/10 text-[#FFF9F0] text-xs font-semibold uppercase tracking-wider hover:bg-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-[#C8A96B]" />
                  <span>Upload Foto</span>
                </button>
              </div>
            </div>
          ) : null}

          {/* Initializing loader */}
          {isInitializing && !errorMessage && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#151210] text-[#F5EFE3] space-y-3">
              <div className="w-10 h-10 border-2 border-[#5B1B31] border-t-[#C8A96B] rounded-full animate-spin" />
              <p className="text-xs tracking-wider text-[#C8A96B] uppercase font-medium">
                Opening Camera...
              </p>
            </div>
          )}

          {/* The live video stream element */}
          <div
            className={`relative w-full h-full flex items-center justify-center overflow-hidden transition-all duration-300 ${
              ratio === '16:9' ? 'aspect-video max-h-[60%]' : 'h-full'
            }`}
          >
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full h-full object-cover transition-transform duration-200 ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
              style={{
                filter: currentFilterConfig.cssFilter,
                transform: `${facingMode === 'user' ? 'scaleX(-1)' : ''} scale(${zoom})`,
              }}
            />

            {/* Authentic Disposable Camera Film Frame Overlays */}
            <div className="absolute inset-2 sm:inset-3 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-3">
              {/* Frame Corner tick marks */}
              <div className="flex justify-between items-start text-[9px] tracking-widest font-mono text-white/50 uppercase">
                <span>ISO 800</span>
                <span>{activeFilter}</span>
              </div>

              {/* Center subtle crosshair / focus indicator */}
              <div className="self-center w-12 h-12 border border-white/20 rounded-full flex items-center justify-center opacity-40">
                <div className="w-1 h-1 bg-white rounded-full" />
              </div>

              {/* Bottom Film Frame Stamp (Section 15: FAISHAL & FAZA • 11•10•2026 • ROMANTIC GARDEN) */}
              <div className="flex flex-col items-center text-center bg-black/45 backdrop-blur-sm py-1.5 px-3 rounded-lg border border-white/10">
                <p className="font-serif-title font-bold text-xs tracking-wider text-[#FFF9F0]">
                  FAISHAL &amp; FAZA
                </p>
                <p className="text-[9px] font-sans tracking-[0.2em] text-[#C8A96B] uppercase font-medium">
                  10 • 10 • 2026   ·   ROMANTIC GARDEN
                </p>
              </div>
            </div>

            {/* Film Grain Texture layer */}
            <div className="absolute inset-0 film-grain pointer-events-none opacity-40" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM SECTION: 3 FILTERS SELECTOR (MATCHING USER REFERENCE) */}
        {/* ============================================================== */}
        <div className="relative z-30 pt-2 pb-5 px-4 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col space-y-3">
          
          {/* THE 3 PRESET FILTERS CAROUSEL / SELECTOR (Inspired by user's reference images) */}
          <div className="flex items-center justify-center gap-2.5 overflow-x-auto py-1 scrollbar-none">
            {(['FUNSAVER', 'QUICKSNAP', 'GARDEN_FLASH'] as FilterType[]).map((filterId) => {
              const f = FILTERS_CONFIG[filterId];
              const isSelected = activeFilter === filterId;

              return (
                <button
                  key={filterId}
                  onClick={() => setActiveFilter(filterId)}
                  className={`group relative flex flex-col items-center p-2 rounded-2xl transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-white/10 border-[#C8A96B] scale-105 shadow-lg shadow-black/80'
                      : 'bg-black/40 border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                  }`}
                  style={{ minWidth: '102px' }}
                >
                  {/* Miniature Vintage Disposable Camera Body Icon */}
                  <div
                    className="w-16 h-10 rounded-lg relative flex items-center justify-center mb-1.5 shadow-md border border-black/40 overflow-hidden"
                    style={{ backgroundColor: f.cameraBodyColor }}
                  >
                    {/* Viewfinder window */}
                    <div className="absolute top-1 left-1.5 w-2.5 h-2 bg-black/80 rounded-xs" />
                    {/* Flash reflector */}
                    <div className="absolute top-1 right-1.5 w-3 h-3 bg-white/90 rounded-full border border-gray-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-yellow-200/90 rounded-full" />
                    </div>
                    {/* Camera Lens */}
                    <div className="w-5 h-5 rounded-full bg-black/90 border border-neutral-700 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#111] border border-blue-900/60" />
                    </div>
                    {/* Bottom grip band */}
                    <div className="absolute bottom-0 inset-x-0 h-1.5 bg-neutral-900/90" />
                  </div>

                  {/* Filter Name */}
                  <span
                    className="text-[11px] font-bold tracking-wider"
                    style={{ color: isSelected ? f.uiColor : '#F5EFE3' }}
                  >
                    {f.name}
                  </span>

                  {/* Subtext */}
                  <span className="text-[9px] text-[#F5EFE3]/70 font-sans tracking-tight">
                    {f.subtext}
                  </span>

                  {/* Official Wedding Filter indicator */}
                  {f.isOfficial && (
                    <span className="text-[8px] uppercase tracking-wider text-[#808000] font-semibold mt-0.5">
                      ★ Official
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Filter Description snippet */}
          <div className="text-center px-2">
            <p className="text-[11px] text-[#C8A96B] font-medium leading-tight">
              {currentFilterConfig.tagline}
            </p>
          </div>

          {/* ============================================================== */}
          {/* SHUTTER BAR: ROLL BUTTON | BIG SHUTTER | CAMERA ROLL BADGE */}
          {/* ============================================================== */}
          <div className="flex items-center justify-between px-2 pt-1">
            
            {/* Left: Guest's Remaining Shots */}
            <div className="flex flex-col items-start min-w-[70px]">
              <span className="text-[9px] uppercase tracking-wider text-[#808000] font-bold">
                Guest Roll
              </span>
              <span className="text-xs font-semibold tabular-nums text-[#FFF9F0]">
                {String(currentGuestPhotoCount).padStart(2, '0')} / {photoLimit >= 999 ? '∞' : String(photoLimit).padStart(2, '0')}
              </span>
            </div>

            {/* Center: BIG DISPOSABLE SHUTTER BUTTON (Section 11) */}
            {/* outer ring: Warm Ivory, inner: Burgundy #5B1B31 */}
            <div className="relative flex items-center justify-center">
              <button
                onClick={handleShutter}
                disabled={isCapturing}
                className="group relative w-20 h-20 rounded-full bg-[#F5EFE3] p-1.5 shadow-2xl shadow-black hover:scale-105 active:scale-95 transition-all cursor-pointer focus:outline-none disabled:opacity-50"
                title="Tekan Shutter untuk mengambil foto"
              >
                {/* Outer ring glow */}
                <div className="absolute inset-0 rounded-full ring-2 ring-[#C8A96B]/50 pointer-events-none" />
                
                {/* Inner Burgundy button */}
                <div className="w-full h-full rounded-full bg-[#5B1B31] group-hover:bg-[#6e223c] flex items-center justify-center transition-colors shadow-inner">
                  <Camera className="w-7 h-7 text-[#FFF9F0] group-hover:scale-110 transition-transform" />
                </div>
              </button>
            </div>

            {/* Right: Camera Roll Drawer Button */}
            <div className="flex flex-col items-end min-w-[70px]">
              <button
                onClick={onOpenRoll}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all border border-white/10 flex items-center gap-1.5 cursor-pointer text-[#F5EFE3]"
                title="Buka Camera Roll"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
                <span className="text-[11px] font-semibold">Roll</span>
              </button>
            </div>

          </div>

        </div>

        {/* Outer phone decorative border ring */}
        <div className="absolute inset-0 sm:rounded-[36px] pointer-events-none ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
};
