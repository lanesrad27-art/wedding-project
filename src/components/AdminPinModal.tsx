import React, { useEffect, useState } from 'react';
import { Lock, Shield, X } from 'lucide-react';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ADMIN_PIN = (import.meta.env.VITE_ADMIN_PIN as string | undefined)?.trim() || '';
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export const AdminPinModal: React.FC<AdminPinModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Reset input setiap kali modal dibuka
  useEffect(() => {
    if (isOpen) {
      setPin('');
      setError('');
    }
  }, [isOpen]);

  // Hitung mundur saat terkunci
  useEffect(() => {
    if (lockedUntil <= Date.now()) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  if (!isOpen) return null;

  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));
  const isLocked = secondsLeft > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    if (!ADMIN_PIN) {
      setError('PIN admin belum diatur. Isi VITE_ADMIN_PIN di pengaturan hosting lalu deploy ulang.');
      return;
    }

    if (pin.trim() === ADMIN_PIN) {
      setAttempts(0);
      setPin('');
      setError('');
      onSuccess();
      return;
    }

    const nextAttempts = attempts + 1;
    setPin('');
    if (nextAttempts >= MAX_ATTEMPTS) {
      setAttempts(0);
      const until = Date.now() + LOCK_SECONDS * 1000;
      setLockedUntil(until);
      setNow(Date.now());
      setError(`Terlalu banyak percobaan. Coba lagi dalam ${LOCK_SECONDS} detik.`);
    } else {
      setAttempts(nextAttempts);
      setError(`PIN salah. Sisa percobaan: ${MAX_ATTEMPTS - nextAttempts}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#151210] border border-[#5B1B31]/60 p-6 sm:p-7 shadow-2xl shadow-black text-center text-[#F5EFE3] overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#5B1B31]/30 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-[#808000]/20 rounded-full blur-2xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#F5EFE3]/60 hover:text-[#FFF9F0] transition-colors rounded-full hover:bg-white/5 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#5B1B31]/40 border border-[#C8A96B]/40 flex items-center justify-center text-[#C8A96B] mb-4">
          <Shield className="w-7 h-7" />
        </div>

        <p className="text-[11px] uppercase tracking-[0.2em] text-[#808000] font-semibold mb-1">
          Admin Console
        </p>
        <h3 className="text-2xl font-serif-title font-bold text-[#FFF9F0] mb-5">Masukkan PIN</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-[#F5EFE3]/70 font-medium mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#808000]" />
              <span>PIN Admin</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                if (error && !isLocked) setError('');
              }}
              maxLength={12}
              autoFocus
              disabled={isLocked}
              placeholder="••••••"
              className="w-full px-4 py-3 rounded-xl bg-[#201B18] border border-[#5B1B31]/60 focus:border-[#C8A96B] focus:ring-1 focus:ring-[#C8A96B] text-[#FFF9F0] text-center text-lg tracking-[0.5em] placeholder:text-[#F5EFE3]/30 outline-none transition-all disabled:opacity-50"
            />
            {isLocked ? (
              <p className="text-xs text-rose-400 mt-1.5">
                Terkunci sementara. Coba lagi dalam {secondsLeft} detik.
              </p>
            ) : (
              error && <p className="text-xs text-rose-400 mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLocked || pin.trim().length === 0}
            className="w-full py-3.5 px-5 rounded-xl bg-[#5B1B31] text-[#FFF9F0] font-semibold text-sm tracking-wider uppercase border border-[#C8A96B]/30 hover:bg-[#6e223c] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5B1B31]/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Shield className="w-4 h-4 text-[#C8A96B]" />
            <span>Buka Admin</span>
          </button>
        </form>
      </div>
    </div>
  );
};
