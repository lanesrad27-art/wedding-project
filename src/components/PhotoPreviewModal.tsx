import React, { useEffect, useState } from 'react';
import { Camera, Check, Download, Heart, RefreshCw, Share2, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CapturedImageResult } from '../lib/imageProcessing';
import { FilterType } from '../types/wedding';

interface PhotoPreviewModalProps {
  isOpen: boolean;
  captureResult: CapturedImageResult | null;
  filter: FilterType;
  guestName: string;
  onRetake: () => void;
  onSavePhoto: () => Promise<void>;
  onViewAlbum: () => void;
}

export const PhotoPreviewModal: React.FC<PhotoPreviewModalProps> = ({
  isOpen,
  captureResult,
  filter,
  guestName,
  onRetake,
  onSavePhoto,
  onViewAlbum,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Setiap foto baru (atau modal dibuka lagi) harus mulai dari keadaan "belum disimpan".
  // Tanpa ini, status "Saved" dari foto sebelumnya terbawa dan foto berikutnya tidak pernah disimpan.
  useEffect(() => {
    setIsSaved(false);
    setIsSaving(false);
  }, [isOpen, captureResult]);

  if (!isOpen || !captureResult) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSavePhoto();
      setIsSaved(true);

      // Trigger celebratory confetti in wedding colors: Burgundy, Gold, Olive, Ivory
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#5B1B31', '#C8A96B', '#808000', '#F5EFE3'],
        });
      } catch {
        // Confetti fallback
      }
    } catch (e) {
      console.error('Failed to save photo:', e);
      alert('Gagal menyimpan foto. Silakan coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = captureResult.fullDataUrl;
    link.download = `Faishal-Faza-Wedding_${guestName.replace(/\s+/g, '-')}_${Date.now()}.jpg`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#151210] border border-[#5B1B31]/60 p-4 sm:p-5 shadow-2xl text-center text-[#F5EFE3] flex flex-col justify-between my-auto max-h-[95vh] overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5 text-left">
            <span className="w-2 h-2 rounded-full bg-[#808000]" />
            <div>
              <p className="text-[10px] uppercase tracking-widest text-[#808000] font-semibold">
                Faishal &amp; Faza
              </p>
              <h3 className="font-serif-title text-base sm:text-lg font-bold text-[#FFF9F0]">
                {isSaved ? 'Memory Preserved ♡' : 'Captured.'}
              </h3>
            </div>
          </div>

          <button
            onClick={onRetake}
            className="p-1.5 rounded-full hover:bg-white/10 text-[#F5EFE3]/70 hover:text-[#FFF9F0] transition-colors cursor-pointer"
            title="Tutup / Ambil Ulang"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Captured Photo Container */}
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/15 bg-black shadow-lg my-1">
          <img
            src={captureResult.fullDataUrl}
            alt="Captured Wedding Memory"
            className="w-full max-h-[58vh] object-contain mx-auto"
          />
        </div>

        {/* Save confirmation banner */}
        {isSaved ? (
          <div className="pt-3 pb-2 space-y-3 animate-fade-in">
            <div className="p-3 rounded-2xl bg-[#5B1B31]/30 border border-[#C8A96B]/40 text-[#FFF9F0] flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 fill-[#5B1B31] stroke-[#C8A96B]" />
              <p className="text-xs font-serif-title font-semibold text-[#FFF9F0]">
                Saved to Faishal &amp; Faza's Wedding Album ♡
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleDownload}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#FFF9F0] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-[#C8A96B]" />
                <span>Simpan ke HP</span>
              </button>

              <button
                onClick={onViewAlbum}
                className="flex-1 py-3 px-4 rounded-xl bg-[#5B1B31] hover:bg-[#6e223c] text-xs font-semibold text-[#FFF9F0] flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Sparkles className="w-4 h-4 text-[#C8A96B]" />
                <span>Lihat di Album</span>
              </button>
            </div>

            <button
              onClick={onRetake}
              className="w-full py-2.5 text-xs text-[#C8A96B] hover:text-[#FFF9F0] cursor-pointer underline underline-offset-4 font-medium"
            >
              Take Another Photo
            </button>
          </div>
        ) : (
          /* Action buttons before saving */
          <div className="pt-3 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-xs text-[#F5EFE3]/70 px-1">
              <span>Fotografer: <strong className="text-[#FFF9F0]">{guestName}</strong></span>
              <span className="uppercase text-[#808000] font-semibold text-[10px]">{filter}</span>
            </div>

            <div className="flex gap-2.5">
              {/* Retake */}
              <button
                onClick={onRetake}
                disabled={isSaving}
                className="flex-1 py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#F5EFE3] flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              {/* Save photo */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-2 py-3.5 px-4 rounded-xl bg-[#5B1B31] hover:bg-[#6e223c] border border-[#C8A96B]/40 text-xs font-bold uppercase tracking-wider text-[#FFF9F0] flex items-center justify-center gap-2 shadow-lg shadow-[#5B1B31]/40 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Heart className="w-4 h-4 fill-current text-[#C8A96B]" />
                )}
                <span>{isSaving ? 'Menyimpan...' : 'Save Photo'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
