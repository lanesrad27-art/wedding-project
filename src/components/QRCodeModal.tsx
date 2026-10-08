import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Camera, Copy, Download, Heart, Printer, Sparkles, X } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const eventUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/event/faishal-faza`
    : 'https://wedding.camera/event/faishal-faza';

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(eventUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: '#5B1B31', // Burgundy dots
          light: '#FFF9F0', // Cream background
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation failed:', err));
    }
  }, [isOpen, eventUrl]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(eventUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-[32px] bg-[#151210] border border-[#5B1B31]/60 p-6 shadow-2xl text-center text-[#F5EFE3] overflow-hidden my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F5EFE3]/60 hover:text-[#FFF9F0] transition-colors rounded-full hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-[#808000] font-semibold tracking-widest uppercase mb-1">
          <Heart className="w-3.5 h-3.5 fill-[#5B1B31] stroke-[#808000]" />
          <span>Wedding Table QR Card</span>
        </div>

        <h3 className="font-serif-title text-2xl font-bold text-[#FFF9F0] mb-0.5">
          Scan to Capture
        </h3>
        <p className="text-xs font-serif-title italic text-[#C8A96B] mb-5">
          "Capture the moments we might miss."
        </p>

        {/* Printable Card Preview */}
        <div className="relative mx-auto rounded-2xl p-5 bg-[#FFF9F0] text-[#151210] shadow-xl border-4 border-[#5B1B31] flex flex-col items-center max-w-[280px]">
          <p className="text-[10px] tracking-[0.25em] uppercase text-[#808000] font-bold">
            The Wedding Of
          </p>
          <h4 className="font-serif-title text-2xl font-bold tracking-wider text-[#5B1B31] my-0.5">
            FAISHAL &amp; FAZA
          </h4>
          <p className="text-[9px] tracking-widest uppercase text-stone-500 font-semibold mb-3">
            10 • 10 • 2026   ·   ROMANTIC GARDEN
          </p>

          {/* QR Code */}
          <div className="w-48 h-48 rounded-xl overflow-hidden border border-[#5B1B31]/20 p-1 bg-white shadow-inner flex items-center justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Wedding QR Code" className="w-full h-full object-contain" />
            ) : (
              <div className="w-8 h-8 border-2 border-[#5B1B31] border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="mt-3 flex items-center gap-1 text-[11px] font-bold tracking-wider uppercase text-[#5B1B31]">
            <Camera className="w-3.5 h-3.5 text-[#808000]" />
            <span>Scan With Phone Camera</span>
          </div>

          <p className="text-[9px] text-stone-500 tracking-wider uppercase mt-0.5 font-medium">
            No App Required • Just Your Browser
          </p>
        </div>

        {/* Action Controls */}
        <div className="mt-6 space-y-2.5">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10 text-xs">
            <span className="truncate text-left text-[11px] text-[#F5EFE3]/70 font-mono">
              /event/faishal-faza
            </span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg bg-[#5B1B31] text-[#FFF9F0] text-[11px] font-semibold hover:bg-[#6e223c] transition-colors flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? 'Tersalin!' : 'Salin Link'}</span>
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#FFF9F0] flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Printer className="w-4 h-4 text-[#C8A96B]" />
            <span>Cetak Kartu Meja Tamu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
