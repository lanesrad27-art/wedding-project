/**
 * Types & Data models for Faishal & Faza Wedding Camera
 */

export type FilterType = 'FUNSAVER' | 'QUICKSNAP' | 'GARDEN_FLASH';

export type CameraRatio = '9:16' | '16:9';

export type FlashMode = 'off' | 'on' | 'auto';

export type ZoomLevel = 1 | 1.5 | 2 | 2.5 | 3;

export interface FilterDefinition {
  id: FilterType;
  name: string;
  subtext: string;
  tagline: string;
  uiColor: string;
  badgeBg: string;
  badgeText: string;
  cameraBodyColor: string;
  cameraAccentColor: string;
  isOfficial?: boolean;
  characteristics: string[];
  cssFilter: string;
}

export interface PhotoRecord {
  id: string;
  event_id: string;
  guest_id: string;
  guest_name: string;
  storage_path: string;
  thumbnail_path: string;
  data_url: string; // Base64 or signed URL
  filter: FilterType;
  orientation: CameraRatio;
  width: number;
  height: number;
  created_at: string;
  likes_count?: number;
}

export interface GuestRecord {
  id: string;
  event_id: string;
  name: string;
  created_at: string;
  photo_count: number;
}

export interface EventConfig {
  id: string;
  couple_name: string;
  wedding_date: string;
  theme: string;
  primary_color: string;
  secondary_color: string;
  photo_limit: number;
  reveal_mode: 'instant' | 'reception_ended';
  created_at: string;
}

export const WEDDING_EVENT_CONFIG: EventConfig = {
  id: 'faishal-faza-2026',
  couple_name: 'Faishal & Faza',
  wedding_date: '11 • 10 • 2026',
  theme: 'Romantic Garden Wedding',
  primary_color: '#5B1B31',
  secondary_color: '#808000',
  photo_limit: 10,
  reveal_mode: 'instant',
  created_at: '2026-10-11T00:00:00Z',
};

export const FILTERS_CONFIG: Record<FilterType, FilterDefinition> = {
  FUNSAVER: {
    id: 'FUNSAVER',
    name: 'FUNSAVER',
    subtext: 'Kodak Gold 800',
    tagline: 'Flash keemasan, grain tebal, dan kilau disposable camera retro',
    uiColor: '#E5A93C', // Warm Gold
    badgeBg: 'bg-[#E5A93C]/20',
    badgeText: 'text-[#FCD34D]',
    cameraBodyColor: '#EAB308', // Yellow disposable body
    cameraAccentColor: '#1F2937',
    characteristics: [
      'Warm golden highlights',
      'Rich golden skin tones',
      'Dark warm shadows',
      'Moderate contrast',
      'Analog film grain'
    ],
    cssFilter: 'sepia(0.35) saturate(1.3) contrast(1.15) brightness(1.04) hue-rotate(-8deg)'
  },
  QUICKSNAP: {
    id: 'QUICKSNAP',
    name: 'QUICKSNAP',
    subtext: 'Fujicolor Superia',
    tagline: 'Hijau Fuji yang tajam dengan tone siang hari bersih dan dingin',
    uiColor: '#5E936C', // Mint Olive Green
    badgeBg: 'bg-[#5E936C]/20',
    badgeText: 'text-[#86EFAC]',
    cameraBodyColor: '#86EFAC', // Mint/green disposable body
    cameraAccentColor: '#1F2937',
    characteristics: [
      'Cooler daylight tone',
      'Subtle cyan/green shadows',
      'Natural crisp skin',
      'Soft contrast',
      'Subtle film grain'
    ],
    cssFilter: 'saturate(0.95) contrast(1.08) brightness(1.05) hue-rotate(6deg)'
  },
  GARDEN_FLASH: {
    id: 'GARDEN_FLASH',
    name: 'GARDEN FLASH',
    subtext: 'Romantic Garden Film',
    tagline: 'Tone romantis Faishal & Faza: bayangan olive, highlight burgundy creamy',
    uiColor: '#5B1B31', // Burgundy primary
    badgeBg: 'bg-[#5B1B31]/40',
    badgeText: 'text-[#F5EFE3]',
    cameraBodyColor: '#5B1B31', // Burgundy disposable body
    cameraAccentColor: '#808000', // Olive green trim
    isOfficial: true,
    characteristics: [
      'Official Wedding Filter',
      'Warm skin & creamy highlights',
      'Subtle olive green shadow tint',
      'Subtle burgundy accent tones',
      'Direct flash disposable vibe'
    ],
    cssFilter: 'sepia(0.18) saturate(1.18) contrast(1.18) brightness(1.06) hue-rotate(-3deg)'
  }
};
