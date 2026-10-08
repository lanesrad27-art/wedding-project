import React from 'react';
import { Camera, Image, Sparkles } from 'lucide-react';
import heroImage from '../assets/images/disposable_camera_table_1791442845623.jpg';

interface LandingPageProps {
  onEnterCamera: () => void;
  onViewAlbum: () => void;
  onOpenQR: () => void;
  totalPhotosCount: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterCamera,
  onViewAlbum,
  onOpenQR,
  totalPhotosCount,
}) => {
  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-radial from-[#5B1B31]/25 via-[#151210]/95 to-[#151210] pointer-events-none" />

      {/* Mobile-first 9:16 phone mockup container on desktop, full height on mobile */}
      <div className="relative w-full max-w-md h-[88vh] max-h-[860px] rounded-[36px] overflow-hidden border border-[#5B1B31]/40 shadow-2xl shadow-black/80 flex flex-col justify-between text-center bg-[#151210]">
        
        {/* Background photo with subtle zoom and vintage grade */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroImage}
            alt="Faishal & Faza Romantic Garden Wedding"
            className="w-full h-full object-cover scale-105 transition-transform duration-10000 ease-out hover:scale-110"
            referrerPolicy="no-referrer"
          />
          {/* Gradients to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151210] via-[#151210]/60 to-[#151210]/30" />
          <div className="absolute inset-0 film-grain pointer-events-none" />
        </div>

        {/* Top Header Badge */}
        <div className="relative z-10 pt-8 px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#151210]/75 backdrop-blur-md border border-[#808000]/40 text-[#F5EFE3] text-xs font-medium tracking-wider shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#808000] animate-pulse" />
            <span>Digital Disposable Camera</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.25em] text-[#C8A96B] mt-3 font-medium">
            The Wedding Of
          </p>
        </div>

        {/* Middle Typography: Faishal & Faza */}
        <div className="relative z-10 px-6 py-4 flex flex-col items-center justify-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-serif-title font-bold tracking-wider text-[#FFF9F0] drop-shadow-md leading-tight">
            FAISHAL
            <span className="block font-normal text-3xl sm:text-4xl text-[#C8A96B] my-0.5 italic">
              &amp;
            </span>
            FAZA
          </h1>

          <div className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-[#F5EFE3]/90 font-medium">
            <span>11</span>
            <span className="text-[#808000]">●</span>
            <span>10</span>
            <span className="text-[#808000]">●</span>
            <span>2026</span>
          </div>

          <p className="text-xs tracking-[0.3em] uppercase text-[#808000] font-semibold">
            Romantic Garden
          </p>

          <p className="text-sm sm:text-base font-serif-title italic text-[#F5EFE3]/90 max-w-xs pt-2">
            "Capture the moments we might miss."
          </p>

          {totalPhotosCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#C8A96B]/90 pt-1">
              <Camera className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span className="tabular-nums font-medium">{totalPhotosCount} memories captured so far</span>
            </div>
          )}
        </div>

        {/* Bottom Action Section */}
        <div className="relative z-10 pb-8 px-6 flex flex-col items-center space-y-3">
          {/* Main Shutter Button */}
          <button
            onClick={onEnterCamera}
            className="w-full py-4 px-6 rounded-2xl bg-[#5B1B31] text-[#FFF9F0] font-semibold tracking-wider uppercase text-sm shadow-xl shadow-[#5B1B31]/40 border border-[#C8A96B]/40 hover:bg-[#6e223c] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <Camera className="w-5 h-5 text-[#C8A96B] group-hover:rotate-12 transition-transform" />
            <span>Enter The Wedding Camera</span>
          </button>

          <div className="flex items-center justify-between w-full text-xs text-[#F5EFE3]/70 pt-1 px-1">
            <span className="text-[11px] tracking-widest uppercase text-[#808000] font-semibold">
              ● No App Required
            </span>
            <button
              onClick={onViewAlbum}
              className="flex items-center gap-1 hover:text-[#FFF9F0] transition-colors cursor-pointer underline underline-offset-4 decoration-[#5B1B31]"
            >
              <Image className="w-3.5 h-3.5 text-[#C8A96B]" />
              <span>View Album</span>
            </button>
          </div>
        </div>

        {/* Outer subtle edge shine */}
        <div className="absolute inset-0 rounded-[36px] pointer-events-none ring-1 ring-inset ring-white/10" />
      </div>
    </div>
  );
};
