import React, { useState } from 'react';
import { Camera, Download, Heart, Image as ImageIcon, Sparkles, X, Filter } from 'lucide-react';
import { FilterType, PhotoRecord } from '../types/wedding';

interface WeddingGalleryProps {
  photos: PhotoRecord[];
  onOpenCam: () => void;
  guestName: string;
}

export const WeddingGallery: React.FC<WeddingGalleryProps> = ({
  photos,
  onOpenCam,
  guestName,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL' | FilterType>('ALL');
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);

  const filteredPhotos = activeTab === 'ALL'
    ? photos
    : photos.filter((p) => p.filter === activeTab);

  const handleDownload = (photo: PhotoRecord) => {
    const link = document.createElement('a');
    link.href = photo.data_url || photo.storage_path;
    link.download = `Faishal-Faza_${photo.guest_name}_${photo.filter}_${photo.id}.jpg`;
    link.click();
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-[#F5EFE3]">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#5B1B31]/30 border border-[#808000]/40 text-xs text-[#C8A96B] font-medium tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
          <span>Faishal &amp; Faza · 10 • 10 • 2026</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-title font-bold tracking-wide text-[#FFF9F0]">
          Our Wedding Album
        </h2>

        <p className="text-sm sm:text-base font-serif-title italic text-[#F5EFE3]/80">
          "Moments captured by the people we love."
        </p>

        {/* Quick CTA to contribute */}
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={onOpenCam}
            className="py-2.5 px-5 rounded-xl bg-[#5B1B31] hover:bg-[#6e223c] text-xs font-semibold uppercase tracking-wider text-[#FFF9F0] border border-[#C8A96B]/30 flex items-center gap-2 shadow-lg shadow-[#5B1B31]/40 cursor-pointer transition-all"
          >
            <Camera className="w-4 h-4 text-[#C8A96B]" />
            <span>Abadikan Momen ({photos.length} Foto)</span>
          </button>
        </div>
      </div>

      {/* Filter Segmented Control Tabs */}
      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex p-1 rounded-2xl bg-[#1D1815] border border-white/10 text-xs">
          {(['ALL', 'GARDEN_FLASH', 'FUNSAVER', 'QUICKSNAP'] as const).map((tab) => {
            const label = tab === 'ALL'
              ? 'Semua Foto'
              : tab === 'GARDEN_FLASH'
              ? 'Garden Film'
              : tab === 'FUNSAVER'
              ? 'Funsaver'
              : 'Quicksnap';

            const count = tab === 'ALL'
              ? photos.length
              : photos.filter((p) => p.filter === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-[#5B1B31] text-[#FFF9F0] shadow-sm font-semibold'
                    : 'text-[#F5EFE3]/70 hover:text-[#FFF9F0]'
                }`}
              >
                <span>{label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-[#C8A96B] tabular-nums">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Masonry / Responsive Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="py-20 text-center max-w-sm mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#5B1B31]/30 border border-[#5B1B31] flex items-center justify-center text-[#C8A96B] mx-auto">
            <ImageIcon className="w-8 h-8" />
          </div>
          <p className="font-serif-title text-xl text-[#FFF9F0]">
            Belum ada foto dalam kategori ini
          </p>
          <p className="text-xs text-[#F5EFE3]/70">
            Jadilah yang pertama mengabadikan kehangatan pesta pernikahan Faishal &amp; Faza!
          </p>
          <button
            onClick={onOpenCam}
            className="py-2.5 px-5 rounded-xl bg-[#5B1B31] text-xs font-semibold text-white uppercase tracking-wider cursor-pointer"
          >
            Buka Kamera
          </button>
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {filteredPhotos.map((photo) => {
            const isGarden = photo.filter === 'GARDEN_FLASH';
            const isFuns = photo.filter === 'FUNSAVER';

            return (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group break-inside-avoid relative rounded-2xl overflow-hidden bg-[#181412] border border-[#5B1B31]/30 hover:border-[#C8A96B] shadow-xl hover:shadow-2xl transition-all cursor-pointer"
              >
                {/* Photo Image */}
                <div className="relative overflow-hidden">
                  <img
                    src={photo.thumbnail_path || photo.data_url || photo.storage_path}
                    alt={`Wedding memory by ${photo.guest_name}`}
                    className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Film Grain Subtle */}
                  <div className="absolute inset-0 film-grain opacity-25 pointer-events-none" />
                </div>

                {/* Photo metadata strip */}
                <div className="p-3 bg-[#181412] flex items-center justify-between border-t border-white/5">
                  <div className="truncate">
                    <p className="text-xs font-serif-title font-bold text-[#FFF9F0] truncate">
                      {photo.guest_name}
                    </p>
                    <p className="text-[10px] text-[#F5EFE3]/60 font-sans">
                      {new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                      isGarden
                        ? 'bg-[#5B1B31]/40 border-[#5B1B31] text-[#F5EFE3]'
                        : isFuns
                        ? 'bg-[#E5A93C]/20 border-[#E5A93C]/40 text-[#FCD34D]'
                        : 'bg-[#5E936C]/20 border-[#5E936C]/40 text-[#86EFAC]'
                    }`}
                  >
                    {isGarden ? 'Garden Film' : photo.filter}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6 animate-fade-in">
          {/* Top Bar */}
          <div className="w-full max-w-xl flex items-center justify-between text-[#F5EFE3] pt-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-[#808000] font-semibold">
                Captured by {selectedPhoto.guest_name}
              </p>
              <h4 className="font-serif-title text-base sm:text-lg font-bold text-[#FFF9F0]">
                {selectedPhoto.filter} · {new Date(selectedPhoto.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </h4>
            </div>
            <button
              onClick={() => setSelectedPhoto(null)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Large Image View */}
          <div className="relative max-w-lg max-h-[78vh] my-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img
              src={selectedPhoto.data_url || selectedPhoto.storage_path}
              alt="High Resolution Wedding Memory"
              className="w-full h-full object-contain max-h-[78vh]"
            />
          </div>

          {/* Action Footer */}
          <div className="w-full max-w-xl flex items-center justify-between gap-3 pb-3">
            <div className="text-xs text-[#F5EFE3]/70 hidden sm:block">
              Faishal &amp; Faza · Romantic Garden Wedding
            </div>
            <button
              onClick={() => handleDownload(selectedPhoto)}
              className="py-3 px-6 rounded-xl bg-[#5B1B31] text-[#FFF9F0] text-xs font-semibold flex items-center gap-2 cursor-pointer hover:bg-[#6e223c] transition-colors ml-auto shadow-lg"
            >
              <Download className="w-4 h-4 text-[#C8A96B]" />
              <span>Download Original HD</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
