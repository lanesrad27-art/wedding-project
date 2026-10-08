import React, { useState } from 'react';
import { Camera, Download, Heart, Image, Sparkles, Trash2, X } from 'lucide-react';
import { PhotoRecord } from '../types/wedding';

interface CameraRollModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestPhotos: PhotoRecord[];
  guestName: string;
  photoLimit: number;
  onTakeAnotherPhoto: () => void;
  onDeletePhoto?: (photoId: string) => void;
}

export const CameraRollModal: React.FC<CameraRollModalProps> = ({
  isOpen,
  onClose,
  guestPhotos,
  guestName,
  photoLimit,
  onTakeAnotherPhoto,
  onDeletePhoto,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoRecord | null>(null);

  if (!isOpen) return null;

  const handleDownload = (photo: PhotoRecord) => {
    const link = document.createElement('a');
    link.href = photo.data_url || photo.storage_path;
    link.download = `Faishal-Faza_${photo.guest_name}_${photo.filter}_${photo.id}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[90vh] rounded-[32px] bg-[#151210] border border-[#5B1B31]/60 p-5 sm:p-6 shadow-2xl text-[#F5EFE3] flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#808000]" />
              <p className="text-[10px] uppercase tracking-widest text-[#808000] font-semibold">
                Guest Camera Roll
              </p>
            </div>
            <h3 className="font-serif-title text-xl sm:text-2xl font-bold text-[#FFF9F0]">
              Your Captured Moments
            </h3>
            <p className="text-xs text-[#C8A96B] font-medium mt-0.5">
              {guestName} &nbsp;·&nbsp;
              <span className="tabular-nums font-semibold">
                {String(guestPhotos.length).padStart(2, '0')} / {photoLimit >= 999 ? '∞' : String(photoLimit).padStart(2, '0')} PHOTOS
              </span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-[#F5EFE3]/70 hover:text-[#FFF9F0] transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Photos Grid Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {guestPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#F5EFE3]/60 space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#5B1B31]/30 border border-[#5B1B31] flex items-center justify-center text-[#C8A96B]">
                <Camera className="w-8 h-8" />
              </div>
              <p className="font-serif-title text-lg text-[#FFF9F0]">
                Belum Ada Foto
              </p>
              <p className="text-xs text-[#F5EFE3]/70 max-w-xs">
                Kamera disposable kamu masih memiliki {photoLimit} sisa bidikan film. Yuk ambil foto pertamamu!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {guestPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => setSelectedPhoto(photo)}
                  className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-black/60 border border-white/15 cursor-pointer shadow-md hover:border-[#C8A96B] transition-all"
                >
                  <img
                    src={photo.thumbnail_path || photo.data_url || photo.storage_path}
                    alt="Wedding memory thumbnail"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 text-[10px]">
                    <span className="font-semibold text-[#FFF9F0] uppercase tracking-wider">{photo.filter}</span>
                    <span className="text-[#C8A96B]">{new Date(photo.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {/* Subtle corner badge */}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[8px] font-mono text-white/80">
                    {photo.filter === 'GARDEN_FLASH' ? 'GARDEN' : photo.filter}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => {
              onClose();
              onTakeAnotherPhoto();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#5B1B31] hover:bg-[#6e223c] text-xs font-semibold uppercase tracking-wider text-[#FFF9F0] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-[#5B1B31]/40"
          >
            <Camera className="w-4 h-4 text-[#C8A96B]" />
            <span>Take Another Photo</span>
          </button>
        </div>

        {/* Full Image Lightbox Modal */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-between p-4 animate-fade-in">
            <div className="w-full max-w-md flex items-center justify-between text-[#F5EFE3] pt-2">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#808000] font-semibold">
                  {selectedPhoto.filter} Film
                </p>
                <p className="text-sm font-serif-title font-bold text-[#FFF9F0]">
                  By {selectedPhoto.guest_name}
                </p>
              </div>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative max-w-sm max-h-[75vh] my-auto rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
              <img
                src={selectedPhoto.data_url || selectedPhoto.storage_path}
                alt="Selected Wedding Memory"
                className="w-full h-full object-contain max-h-[75vh]"
              />
            </div>

            <div className="w-full max-w-md flex items-center justify-between gap-3 pb-3">
              <button
                onClick={() => handleDownload(selectedPhoto)}
                className="flex-1 py-3 rounded-xl bg-[#5B1B31] text-[#FFF9F0] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-[#6e223c]"
              >
                <Download className="w-4 h-4 text-[#C8A96B]" />
                <span>Download HD Foto</span>
              </button>
              {onDeletePhoto && (
                <button
                  onClick={() => {
                    if (confirm('Hapus foto ini dari album?')) {
                      onDeletePhoto(selectedPhoto.id);
                      setSelectedPhoto(null);
                    }
                  }}
                  className="p-3 rounded-xl bg-white/10 text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
