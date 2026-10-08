import React, { useState } from 'react';
import {
  Camera,
  Database,
  Download,
  Eye,
  Filter,
  HardDrive,
  Heart,
  QrCode,
  Settings,
  Shield,
  Trash2,
  Users,
  X,
  Sparkles,
} from 'lucide-react';
import { EventConfig, GuestRecord, PhotoRecord } from '../types/wedding';
import { isSupabaseConfigured } from '../lib/supabase';

interface AdminDashboardProps {
  eventConfig: EventConfig;
  photos: PhotoRecord[];
  guests: GuestRecord[];
  onUpdateConfig: (updates: Partial<EventConfig>) => void;
  onDeletePhoto: (photoId: string) => void;
  onDeleteGuest: (guestId: string) => void;
  onOpenQR: () => void;
  onBackToApp: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  eventConfig,
  photos,
  guests,
  onUpdateConfig,
  onDeletePhoto,
  onDeleteGuest,
  onOpenQR,
  onBackToApp,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PHOTOS' | 'GUESTS' | 'SETTINGS'>('OVERVIEW');
  const [inspectPhoto, setInspectPhoto] = useState<PhotoRecord | null>(null);

  // Stats calculation
  const totalPhotos = photos.length;
  const totalGuests = guests.length;

  const countByFilter = {
    GARDEN_FLASH: photos.filter((p) => p.filter === 'GARDEN_FLASH').length,
    FUNSAVER: photos.filter((p) => p.filter === 'FUNSAVER').length,
    QUICKSNAP: photos.filter((p) => p.filter === 'QUICKSNAP').length,
  };

  // Estimated storage (assuming ~1.4MB average high quality image)
  const estimatedStorageMb = (totalPhotos * 1.4).toFixed(1);

  // Batch download all photos sequentially
  const handleBatchDownloadAll = () => {
    if (photos.length === 0) {
      alert('Belum ada foto untuk diunduh.');
      return;
    }
    const confirmed = confirm(`Download seluruh ${photos.length} foto pernikahan Faishal & Faza?`);
    if (!confirmed) return;

    photos.forEach((photo, index) => {
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = photo.data_url || photo.storage_path;
        link.download = `Faishal-Faza_${photo.guest_name}_${photo.filter}_${photo.id}.jpg`;
        link.click();
      }, index * 350);
    });
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#F5EFE3]">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#5B1B31]/40 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#808000]" />
            <p className="text-xs uppercase tracking-widest text-[#808000] font-semibold">
              Host &amp; Organizer Console
            </p>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#FFF9F0]">
            Faishal &amp; Faza's Wedding Dashboard
          </h2>
          <p className="text-xs text-[#C8A96B] font-medium mt-0.5">
            11 Oktober 2026   ·   Romantic Garden Wedding
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenQR}
            className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#FFF9F0] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <QrCode className="w-4 h-4 text-[#C8A96B]" />
            <span>Table QR Card</span>
          </button>

          <button
            onClick={handleBatchDownloadAll}
            className="py-2.5 px-4 rounded-xl bg-[#5B1B31] hover:bg-[#6e223c] text-xs font-semibold text-[#FFF9F0] flex items-center gap-1.5 cursor-pointer shadow-lg transition-colors"
          >
            <Download className="w-4 h-4 text-[#C8A96B]" />
            <span>Download All ({photos.length})</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 pt-6 pb-6 overflow-x-auto">
        {(['OVERVIEW', 'PHOTOS', 'GUESTS', 'SETTINGS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[#5B1B31] text-[#FFF9F0] shadow-sm'
                : 'bg-[#181412] text-[#F5EFE3]/70 hover:text-[#FFF9F0] border border-white/5'
            }`}
          >
            {tab === 'OVERVIEW' && 'Ringkasan & Metrik'}
            {tab === 'PHOTOS' && `Galeri Foto (${photos.length})`}
            {tab === 'GUESTS' && `Daftar Tamu (${guests.length})`}
            {tab === 'SETTINGS' && 'Pengaturan Kamera'}
          </button>
        ))}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW */}
      {/* ============================================================== */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#808000]">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total Foto</span>
                <Camera className="w-4 h-4" />
              </div>
              <p className="text-3xl font-serif-title font-bold text-[#FFF9F0] my-2 tabular-nums">
                {totalPhotos}
              </p>
              <span className="text-[11px] text-[#F5EFE3]/60">Momen terabadikan</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#C8A96B]">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Tamu Aktif</span>
                <Users className="w-4 h-4" />
              </div>
              <p className="text-3xl font-serif-title font-bold text-[#FFF9F0] my-2 tabular-nums">
                {totalGuests}
              </p>
              <span className="text-[11px] text-[#F5EFE3]/60">Kontributor foto</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#808000]">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Storage Usage</span>
                <HardDrive className="w-4 h-4" />
              </div>
              <p className="text-3xl font-serif-title font-bold text-[#FFF9F0] my-2 tabular-nums">
                {estimatedStorageMb} <span className="text-sm font-normal text-[#F5EFE3]/70">MB</span>
              </p>
              <span className="text-[11px] text-[#F5EFE3]/60">High Quality JPEG</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#C8A96B]">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Database Sync</span>
                <Database className="w-4 h-4" />
              </div>
              <div className="my-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isSupabaseConfigured
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                    : 'bg-[#5B1B31]/40 border border-[#C8A96B]/30 text-[#C8A96B]'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-400' : 'bg-[#C8A96B]'}`} />
                  {isSupabaseConfigured ? 'Supabase Active' : 'Local Storage Mode'}
                </span>
              </div>
              <span className="text-[10px] text-[#F5EFE3]/60 truncate">
                {isSupabaseConfigured ? 'Cloud storage syncing' : 'IndexedDB offline persistent'}
              </span>
            </div>
          </div>

          {/* Breakdown by Film Preset */}
          <div className="p-6 rounded-2xl bg-[#181412] border border-[#5B1B31]/40">
            <h3 className="text-base font-serif-title font-bold text-[#FFF9F0] mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#808000]" />
              <span>Penggunaan 3 Filter Disposable</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-black/40 border border-[#5B1B31]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FFF9F0]">GARDEN FLASH</span>
                  <span className="text-[9px] uppercase tracking-wider text-[#808000] font-bold">Official</span>
                </div>
                <p className="text-xs text-[#F5EFE3]/70 mt-1">Romantic Garden Film</p>
                <p className="text-2xl font-serif-title font-bold text-[#C8A96B] mt-2 tabular-nums">
                  {countByFilter.GARDEN_FLASH} <span className="text-xs font-sans text-[#F5EFE3]/50">foto</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-amber-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#FCD34D]">FUNSAVER</span>
                  <span className="text-[9px] text-[#FCD34D]/70 font-mono">Gold 800</span>
                </div>
                <p className="text-xs text-[#F5EFE3]/70 mt-1">Warm golden tones &amp; flash</p>
                <p className="text-2xl font-serif-title font-bold text-[#FCD34D] mt-2 tabular-nums">
                  {countByFilter.FUNSAVER} <span className="text-xs font-sans text-[#F5EFE3]/50">foto</span>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-emerald-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#86EFAC]">QUICKSNAP</span>
                  <span className="text-[9px] text-[#86EFAC]/70 font-mono">Superia</span>
                </div>
                <p className="text-xs text-[#F5EFE3]/70 mt-1">Cool daylight &amp; subtle olive</p>
                <p className="text-2xl font-serif-title font-bold text-[#86EFAC] mt-2 tabular-nums">
                  {countByFilter.QUICKSNAP} <span className="text-xs font-sans text-[#F5EFE3]/50">foto</span>
                </p>
              </div>
            </div>
          </div>

          {/* Couple & Event Identity Overview */}
          <div className="p-6 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-serif-title italic text-[#C8A96B]">Identitas Acara</p>
              <h4 className="font-serif-title text-xl font-bold text-[#FFF9F0]">
                {eventConfig.couple_name} · {eventConfig.wedding_date}
              </h4>
              <p className="text-xs text-[#F5EFE3]/70 mt-0.5">
                Tema: <strong className="text-[#808000]">{eventConfig.theme}</strong> &nbsp;·&nbsp;
                Warna Utama: <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#5B1B31] align-middle mr-1" />Burgundy /
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#808000] align-middle mx-1" />Olive
              </p>
            </div>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#FFF9F0] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Settings className="w-4 h-4 text-[#C8A96B]" />
              <span>Ubah Pengaturan</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: PHOTOS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'PHOTOS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#F5EFE3]/70">
              Total {photos.length} foto telah diabadikan oleh para tamu.
            </p>
          </div>

          {photos.length === 0 ? (
            <div className="py-20 text-center text-[#F5EFE3]/50">Belum ada foto yang masuk.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black/60 border border-white/10 hover:border-[#C8A96B] transition-all shadow-md"
                >
                  <img
                    src={photo.thumbnail_path || photo.data_url || photo.storage_path}
                    alt={photo.guest_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="self-end p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:bg-rose-900 transition-colors cursor-pointer"
                      title="Hapus Foto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <p className="text-[11px] font-bold text-white truncate">{photo.guest_name}</p>
                      <p className="text-[9px] text-[#C8A96B] uppercase">{photo.filter}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: GUESTS MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'GUESTS' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 overflow-hidden">
            <h3 className="font-serif-title text-lg font-bold text-[#FFF9F0] mb-4">
              Daftar Tamu yang Membuka Kamera
            </h3>

            {guests.length === 0 ? (
              <p className="text-xs text-[#F5EFE3]/50">Belum ada data tamu.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {guests.map((guest) => {
                  const guestPhotoCount = photos.filter((p) => p.guest_id === guest.id || p.guest_name === guest.name).length;
                  return (
                    <div key={guest.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-[#FFF9F0] text-sm">{guest.name}</p>
                        <p className="text-[11px] text-[#F5EFE3]/60">
                          Bergabung: {new Date(guest.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-full bg-[#5B1B31]/40 text-[#FFF9F0] text-[11px] font-semibold tabular-nums">
                          {guestPhotoCount} foto diambil
                        </span>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus tamu ${guest.name}?`)) {
                              onDeleteGuest(guest.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer"
                          title="Hapus Tamu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SETTINGS */}
      {/* ============================================================== */}
      {activeTab === 'SETTINGS' && (
        <div className="max-w-xl space-y-6">
          <div className="p-6 rounded-2xl bg-[#181412] border border-[#5B1B31]/40 space-y-5">
            <h3 className="font-serif-title text-lg font-bold text-[#FFF9F0]">
              Pengaturan Kamera &amp; Album
            </h3>

            {/* Photo limit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C8A96B] mb-2">
                Batas Foto Per Tamu (Photo Limit)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {[5, 10, 15, 20, 30, 999].map((limit) => (
                  <button
                    key={limit}
                    onClick={() => onUpdateConfig({ photo_limit: limit })}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      eventConfig.photo_limit === limit
                        ? 'bg-[#5B1B31] text-[#FFF9F0] border border-[#C8A96B]'
                        : 'bg-black/40 text-[#F5EFE3]/70 hover:text-white border border-white/5'
                    }`}
                  >
                    {limit === 999 ? 'Unlimited' : `${limit} Foto`}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#F5EFE3]/60 mt-1.5">
                Default: 5 foto per tamu untuk menciptakan sensasi disposable camera roll asli.
              </p>
            </div>

            {/* Reveal mode */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#C8A96B] mb-2">
                Reveal Mode (Tampilan Galeri Tamu)
              </label>
              <div className="flex gap-2.5">
                <button
                  onClick={() => onUpdateConfig({ reveal_mode: 'instant' })}
                  className={`flex-1 p-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer border ${
                    eventConfig.reveal_mode === 'instant'
                      ? 'bg-[#5B1B31] text-white border-[#C8A96B]'
                      : 'bg-black/40 text-[#F5EFE3]/70 border-white/5'
                  }`}
                >
                  <p className="font-bold">Instant Reveal</p>
                  <p className="text-[10px] text-[#F5EFE3]/70 font-normal mt-0.5">
                    Foto langsung muncul di album setelah tamu menyimpannya.
                  </p>
                </button>

                <button
                  onClick={() => onUpdateConfig({ reveal_mode: 'reception_ended' })}
                  className={`flex-1 p-3 rounded-xl text-xs font-semibold transition-all text-left cursor-pointer border ${
                    eventConfig.reveal_mode === 'reception_ended'
                      ? 'bg-[#5B1B31] text-white border-[#C8A96B]'
                      : 'bg-black/40 text-[#F5EFE3]/70 border-white/5'
                  }`}
                >
                  <p className="font-bold">Cuci Film (After Reception)</p>
                  <p className="text-[10px] text-[#F5EFE3]/70 font-normal mt-0.5">
                    Album dibuka serentak setelah acara resepsi selesai.
                  </p>
                </button>
              </div>
            </div>

            {/* Supabase Configuration guide */}
            <div className="pt-3 border-t border-white/10">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#808000] mb-1">
                Koneksi Database &amp; Cloud Storage Supabase
              </label>
              <p className="text-xs text-[#F5EFE3]/70 leading-relaxed mb-3">
                {isSupabaseConfigured
                  ? '✓ Supabase aktif! Foto otomatis terunggah ke bucket wedding-photos/faishal-faza/ dan tersimpan di database.'
                  : 'Aplikasi saat ini berjalan mulus dengan IndexedDB persistent offline storage. Untuk menghubungkan ke Cloud Supabase, tambahkan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di environment secrets.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
