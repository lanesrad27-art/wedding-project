/**
 * Faishal & Faza Digital Disposable Wedding Camera
 * 10 Oktober 2026 • Romantic Garden Wedding
 */

import React, { useEffect, useState, useMemo } from 'react';
import { PetalsAnimation } from './components/PetalsAnimation';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { GuestNameModal } from './components/GuestNameModal';
import { CameraView } from './components/CameraView';
import { PhotoPreviewModal } from './components/PhotoPreviewModal';
import { CameraRollModal } from './components/CameraRollModal';
import { WeddingGallery } from './components/WeddingGallery';
import { QRCodeModal } from './components/QRCodeModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminPinModal } from './components/AdminPinModal';

import {
  CameraRatio,
  EventConfig,
  FilterType,
  GuestRecord,
  PhotoRecord,
  WEDDING_EVENT_CONFIG,
} from './types/wedding';
import {
  dataUrlToBlob,
  deleteGuest,
  deleteWeddingPhoto,
  fetchGuests,
  fetchWeddingPhotos,
  getEventConfig,
  saveCapturedPhoto,
  saveGuest,
  updateEventConfig,
} from './lib/supabase';
import { CapturedImageResult } from './lib/imageProcessing';

export default function App() {
  // Navigation View
  const [currentView, setCurrentView] = useState<'landing' | 'camera' | 'gallery' | 'admin'>('landing');

  // Event Config
  const [eventConfig, setEventConfig] = useState<EventConfig>(WEDDING_EVENT_CONFIG);

  // Guest State
  const [guestName, setGuestName] = useState<string>(() => {
    return localStorage.getItem('wedding_guest_name') || 'Alucard';
  });
  const [guestId, setGuestId] = useState<string>(() => {
    let id = localStorage.getItem('wedding_guest_id');
    if (!id) {
      id = `guest-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
      localStorage.setItem('wedding_guest_id', id);
    }
    return id;
  });

  // Data State
  const [photos, setPhotos] = useState<PhotoRecord[]>([]);
  const [guests, setGuests] = useState<GuestRecord[]>([]);

  // Admin access (PIN)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('wedding_admin_unlocked') === '1';
    } catch {
      return false;
    }
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState<boolean>(false);
  // Tombol Admin hanya muncul jika link dibuka dengan #admin (atau admin sudah login)
  const [adminLinkOpened] = useState<boolean>(() => window.location.hash === '#admin');

  const handleNavigate = (view: 'landing' | 'camera' | 'gallery' | 'admin') => {
    if (view === 'admin' && !isAdminUnlocked) {
      setIsPinModalOpen(true);
      return;
    }
    setCurrentView(view);
  };

  const handleAdminUnlocked = () => {
    try {
      sessionStorage.setItem('wedding_admin_unlocked', '1');
    } catch {
      // abaikan jika penyimpanan sesi tidak tersedia
    }
    setIsAdminUnlocked(true);
    setIsPinModalOpen(false);
    setCurrentView('admin');
  };

  // Modals
  const [isGuestModalOpen, setIsGuestModalOpen] = useState<boolean>(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isRollModalOpen, setIsRollModalOpen] = useState<boolean>(false);

  // Photo Capture Preview State
  const [captureResult, setCaptureResult] = useState<CapturedImageResult | null>(null);
  const [capturedFilter, setCapturedFilter] = useState<FilterType>('GARDEN_FLASH');
  const [capturedRatio, setCapturedRatio] = useState<CameraRatio>('9:16');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);

  // Load Initial Data
  useEffect(() => {
    const initializeData = async () => {
      // 1. Load event configuration
      const cfg = await getEventConfig();
      setEventConfig(cfg);

      // 2. Load photos and guests
      const fetchedPhotos = await fetchWeddingPhotos();
      setPhotos(fetchedPhotos);

      const fetchedGuests = await fetchGuests();
      setGuests(fetchedGuests);

      // Register default guest if exists
      if (guestName) {
        saveGuest({
          id: guestId,
          event_id: cfg.id,
          name: guestName,
          created_at: new Date().toISOString(),
          photo_count: 0,
        }).catch(console.error);
      }
    };

    initializeData();
  }, [guestId, guestName]);

  // Photos captured by currently active guest
  const currentGuestPhotos = useMemo(() => {
    return photos.filter((p) => p.guest_id === guestId || p.guest_name === guestName);
  }, [photos, guestId, guestName]);

  // Enter Camera flow
  const handleEnterCamera = () => {
    const storedName = localStorage.getItem('wedding_guest_name');
    if (!storedName) {
      setIsGuestModalOpen(true);
    } else {
      setCurrentView('camera');
    }
  };

  // Submit Guest Name
  const handleGuestNameSubmit = async (name: string) => {
    setGuestName(name);
    localStorage.setItem('wedding_guest_name', name);
    setIsGuestModalOpen(false);

    // Save to guest table
    const guestRecord: GuestRecord = {
      id: guestId,
      event_id: eventConfig.id,
      name,
      created_at: new Date().toISOString(),
      photo_count: currentGuestPhotos.length,
    };
    await saveGuest(guestRecord);
    setGuests((prev) => [guestRecord, ...prev.filter((g) => g.id !== guestId)]);

    setCurrentView('camera');
  };

  // On Shutter Capture Finished
  const handlePhotoCaptured = (
    result: CapturedImageResult,
    filter: FilterType,
    ratio: CameraRatio
  ) => {
    setCaptureResult(result);
    setCapturedFilter(filter);
    setCapturedRatio(ratio);
    setIsPreviewModalOpen(true);
  };

  // Save captured photo to storage & state
  const handleSavePhoto = async () => {
    if (!captureResult) return;

    const photoId = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const fullBlob = dataUrlToBlob(captureResult.fullDataUrl);
    const thumbBlob = dataUrlToBlob(captureResult.thumbnailDataUrl);

    const newPhoto: PhotoRecord = {
      id: photoId,
      event_id: eventConfig.id,
      guest_id: guestId,
      guest_name: guestName,
      storage_path: captureResult.fullDataUrl,
      thumbnail_path: captureResult.thumbnailDataUrl,
      data_url: captureResult.fullDataUrl,
      filter: capturedFilter,
      orientation: capturedRatio,
      width: captureResult.width,
      height: captureResult.height,
      created_at: new Date().toISOString(),
    };

    const saved = await saveCapturedPhoto(newPhoto, fullBlob, thumbBlob);
    setPhotos((prev) => [saved, ...prev]);

    // Update guest count in state
    setGuests((prev) =>
      prev.map((g) =>
        g.id === guestId ? { ...g, photo_count: g.photo_count + 1 } : g
      )
    );
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    await deleteWeddingPhoto(photoId);
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Delete guest
  const handleDeleteGuest = async (gId: string) => {
    await deleteGuest(gId);
    setGuests((prev) => prev.filter((g) => g.id !== gId));
  };

  // Update Config
  const handleUpdateConfig = async (updates: Partial<EventConfig>) => {
    const updated = await updateEventConfig(updates);
    setEventConfig(updated);
  };

  return (
    <div className="min-h-screen bg-[#151210] text-[#F5EFE3] flex flex-col relative selection:bg-[#5B1B31] selection:text-[#FFF9F0]">
      {/* Romantic floating petals & golden bokeh overlay */}
      <PetalsAnimation />

      {/* Main Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        showAdmin={adminLinkOpened || isAdminUnlocked}
        guestName={guestName}
        onOpenQR={() => setIsQRModalOpen(true)}
        onOpenRoll={() => setIsRollModalOpen(true)}
        photoCount={currentGuestPhotos.length}
      />

      {/* Main View Router */}
      <main className="flex-1 flex flex-col">
        {currentView === 'landing' && (
          <LandingPage
            onEnterCamera={handleEnterCamera}
            onViewAlbum={() => setCurrentView('gallery')}
            onOpenQR={() => setIsQRModalOpen(true)}
            totalPhotosCount={photos.length}
          />
        )}

        {currentView === 'camera' && (
          <CameraView
            guestName={guestName}
            photoLimit={eventConfig.photo_limit}
            currentGuestPhotoCount={currentGuestPhotos.length}
            onPhotoCaptured={handlePhotoCaptured}
            onOpenRoll={() => setIsRollModalOpen(true)}
            onBackToHome={() => setCurrentView('landing')}
          />
        )}

        {currentView === 'gallery' && (
          <WeddingGallery
            photos={photos}
            onOpenCam={handleEnterCamera}
            guestName={guestName}
          />
        )}

        {currentView === 'admin' && isAdminUnlocked && (
          <AdminDashboard
            eventConfig={eventConfig}
            photos={photos}
            guests={guests}
            onUpdateConfig={handleUpdateConfig}
            onDeletePhoto={handleDeletePhoto}
            onDeleteGuest={handleDeleteGuest}
            onOpenQR={() => setIsQRModalOpen(true)}
            onBackToApp={() => setCurrentView('landing')}
          />
        )}
      </main>

      {/* Admin PIN Modal */}
      <AdminPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleAdminUnlocked}
      />

      {/* Guest Name Modal */}
      <GuestNameModal
        isOpen={isGuestModalOpen}
        onClose={() => setIsGuestModalOpen(false)}
        onSubmit={handleGuestNameSubmit}
        initialName={guestName}
      />

      {/* Photo Preview & Retake Modal */}
      <PhotoPreviewModal
        isOpen={isPreviewModalOpen}
        captureResult={captureResult}
        filter={capturedFilter}
        guestName={guestName}
        onRetake={() => setIsPreviewModalOpen(false)}
        onSavePhoto={handleSavePhoto}
        onViewAlbum={() => {
          setIsPreviewModalOpen(false);
          setCurrentView('gallery');
        }}
      />

      {/* Guest's Private Camera Roll Modal */}
      <CameraRollModal
        isOpen={isRollModalOpen}
        onClose={() => setIsRollModalOpen(false)}
        guestPhotos={currentGuestPhotos}
        guestName={guestName}
        photoLimit={eventConfig.photo_limit}
        onTakeAnotherPhoto={() => setCurrentView('camera')}
        onDeletePhoto={handleDeletePhoto}
      />

      {/* Table Card QR Code Modal */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
      />
    </div>
  );
}
