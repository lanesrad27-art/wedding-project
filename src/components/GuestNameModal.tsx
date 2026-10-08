import React, { useState } from 'react';
import { Camera, Heart, User, X } from 'lucide-react';

interface GuestNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  initialName?: string;
}

export const GuestNameModal: React.FC<GuestNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
}) => {
  const [name, setName] = useState(initialName || 'Alucard');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Mohon masukkan nama kamu agar fotomu tersimpan di wedding album ♡');
      return;
    }
    onSubmit(cleanName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#151210] border border-[#5B1B31]/60 p-6 sm:p-7 shadow-2xl shadow-black text-center text-[#F5EFE3] overflow-hidden">
        {/* Decorative corner florals/glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5B1B31]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#808000]/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F5EFE3]/60 hover:text-[#FFF9F0] transition-colors rounded-full hover:bg-white/5 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#5B1B31]/40 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] mb-4 shadow-inner">
          <Heart className="w-7 h-7 fill-[#5B1B31] stroke-[#C8A96B]" />
        </div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-[#808000] font-semibold mb-1">
          Faishal &amp; Faza's Wedding
        </p>

        <h3 className="text-2xl font-serif-title font-bold text-[#FFF9F0] mb-2">
          Welcome, Dear Guest
        </h3>

        <p className="text-xs text-[#F5EFE3]/80 mb-6 leading-relaxed">
          "Help us capture the moments we might miss."
          <span className="block text-[11px] text-[#C8A96B] mt-1 italic">
            Setiap foto yang kamu ambil akan masuk ke album kenangan kami.
          </span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#F5EFE3]/70 font-medium mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#808000]" />
              <span>Your Name</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Masukkan nama kamu"
              maxLength={40}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-[#201B18] border border-[#5B1B31]/60 focus:border-[#C8A96B] focus:ring-1 focus:ring-[#C8A96B] text-[#FFF9F0] text-sm placeholder:text-[#F5EFE3]/40 outline-none transition-all"
            />
            {error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>}
          </div>

          {/* Quick guest suggestions */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-[#F5EFE3]/50">Pilih cepat:</span>
            {['Alucard', 'Tamu Undangan', 'Sahabat'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setName(sample)}
                className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-[#C8A96B] transition-colors border border-white/5 cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-xl bg-[#5B1B31] text-[#FFF9F0] font-semibold text-sm tracking-wider uppercase border border-[#C8A96B]/30 hover:bg-[#6e223c] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5B1B31]/30 cursor-pointer mt-2"
          >
            <Camera className="w-4 h-4 text-[#C8A96B]" />
            <span>Open Camera</span>
          </button>
        </form>

        <p className="text-[10px] text-[#F5EFE3]/50 mt-4 tracking-wide">
          No app required • Just your camera
        </p>
      </div>
    </div>
  );
};
