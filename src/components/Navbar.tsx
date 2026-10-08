import React from 'react';
import { Camera, Image, QrCode, Shield, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'camera' | 'gallery' | 'admin';
  onNavigate: (view: 'landing' | 'camera' | 'gallery' | 'admin') => void;
  guestName?: string;
  onOpenQR: () => void;
  onOpenRoll: () => void;
  photoCount?: number;
  showAdmin?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  guestName,
  onOpenQR,
  onOpenRoll,
  photoCount = 0,
  showAdmin = false,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#151210]/85 backdrop-blur-md border-b border-[#5B1B31]/30 text-[#F5EFE3] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Zone 1: Brand single text element wordmark */}
        <button
          onClick={() => onNavigate('landing')}
          className="text-left group flex items-baseline gap-2 cursor-pointer focus:outline-none"
        >
          <span className="font-serif-title text-xl sm:text-2xl font-semibold tracking-wider text-[#FFF9F0] group-hover:text-[#C8A96B] transition-colors">
            FAISHAL & FAZA
          </span>
          <span className="hidden sm:inline text-[10px] tracking-widest uppercase text-[#808000] font-medium">
            10•10•2026
          </span>
        </button>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium">
          <button
            onClick={() => onNavigate('camera')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'camera'
                ? 'text-[#FFF9F0] bg-[#5B1B31]/50 font-semibold shadow-inner'
                : 'text-[#F5EFE3]/70 hover:text-[#FFF9F0]'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span>Camera</span>
          </button>

          <button
            onClick={() => onNavigate('gallery')}
            className={`px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              currentView === 'gallery'
                ? 'text-[#FFF9F0] bg-[#5B1B31]/50 font-semibold shadow-inner'
                : 'text-[#F5EFE3]/70 hover:text-[#FFF9F0]'
            }`}
          >
            <Image className="w-3.5 h-3.5 text-[#808000]" />
            <span>Album</span>
          </button>

          {guestName && (
            <button
              onClick={onOpenRoll}
              className="px-2.5 py-1.5 text-[#F5EFE3]/70 hover:text-[#FFF9F0] transition-colors flex items-center gap-1.5 cursor-pointer relative"
              title="Camera Roll"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span className="hidden xs:inline">Roll</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#5B1B31] text-[#FFF9F0] rounded-full tabular-nums">
                {photoCount}
              </span>
            </button>
          )}

          <button
            onClick={onOpenQR}
            className="px-2 py-1.5 text-[#F5EFE3]/70 hover:text-[#FFF9F0] transition-colors flex items-center gap-1 cursor-pointer"
            title="Scan Table QR"
          >
            <QrCode className="w-3.5 h-3.5 text-[#C8A96B]" />
            <span className="hidden sm:inline">QR</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2">
          {showAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-[#5B1B31] text-[#FFF9F0]'
                  : 'text-[#F5EFE3]/60 hover:text-[#FFF9F0] hover:bg-[#5B1B31]/20'
              }`}
              title="Admin Console"
            >
              <Shield className="w-4 h-4 text-[#808000]" />
              <span className="hidden md:inline">Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
