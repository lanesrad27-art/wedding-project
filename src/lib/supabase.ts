/**
 * Supabase Client & Hybrid Storage Provider
 * Supports real Supabase backend with graceful persistent IndexedDB fallback.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { EventConfig, GuestRecord, PhotoRecord, WEDDING_EVENT_CONFIG } from '../types/wedding';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// IndexedDB Database name & key
const IDB_NAME = 'FaishalFazaWeddingDB';
const IDB_VERSION = 1;
const PHOTOS_STORE = 'photos';
const GUESTS_STORE = 'guests';
const SETTINGS_STORE = 'settings';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(PHOTOS_STORE)) {
        db.createObjectStore(PHOTOS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(GUESTS_STORE)) {
        db.createObjectStore(GUESTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Convert data URL to Blob
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Save Guest record
 */
export async function saveGuest(guest: GuestRecord): Promise<GuestRecord> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .upsert({
          id: guest.id,
          event_id: guest.event_id,
          name: guest.name,
          created_at: guest.created_at,
        })
        .select()
        .single();
      if (!error && data) return data as GuestRecord;
    } catch (e) {
      console.warn('Supabase guest save error, saving to local store:', e);
    }
  }

  // Local storage / IndexedDB fallback
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GUESTS_STORE, 'readwrite');
    const store = tx.objectStore(GUESTS_STORE);
    store.put(guest);
    tx.oncomplete = () => resolve(guest);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Fetch all guests
 */
export async function fetchGuests(): Promise<GuestRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('event_id', WEDDING_EVENT_CONFIG.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) return data as GuestRecord[];
    } catch (e) {
      console.warn('Supabase fetch guests error:', e);
    }
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GUESTS_STORE, 'readonly');
    const store = tx.objectStore(GUESTS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save captured photo
 */
export async function saveCapturedPhoto(photo: PhotoRecord, fullBlob: Blob, thumbBlob: Blob): Promise<PhotoRecord> {
  let photoToSave = { ...photo };

  if (supabase) {
    try {
      const originalPath = `wedding-photos/faishal-faza/original/${photo.id}.jpg`;
      const thumbnailPath = `wedding-photos/faishal-faza/thumbnails/${photo.id}.jpg`;

      // Upload original
      await supabase.storage.from('wedding-photos').upload(originalPath, fullBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      // Upload thumbnail
      await supabase.storage.from('wedding-photos').upload(thumbnailPath, thumbBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      // Get public URLs
      const { data: originalUrlData } = supabase.storage.from('wedding-photos').getPublicUrl(originalPath);
      const { data: thumbUrlData } = supabase.storage.from('wedding-photos').getPublicUrl(thumbnailPath);

      photoToSave = {
        ...photoToSave,
        storage_path: originalUrlData.publicUrl || originalPath,
        thumbnail_path: thumbUrlData.publicUrl || thumbnailPath,
      };

      // Insert record
      const { error: insertError } = await supabase.from('photos').insert({
        id: photoToSave.id,
        event_id: photoToSave.event_id,
        guest_id: photoToSave.guest_id,
        guest_name: photoToSave.guest_name,
        storage_path: photoToSave.storage_path,
        thumbnail_path: photoToSave.thumbnail_path,
        filter: photoToSave.filter,
        orientation: photoToSave.orientation,
        width: photoToSave.width,
        height: photoToSave.height,
        created_at: photoToSave.created_at,
      });

      if (!insertError) {
        return photoToSave;
      }
    } catch (err) {
      console.warn('Supabase storage save failed, falling back to local storage:', err);
    }
  }

  // Save to IndexedDB
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOS_STORE);
    store.put(photoToSave);
    tx.oncomplete = () => resolve(photoToSave);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Fetch all wedding album photos
 */
export async function fetchWeddingPhotos(): Promise<PhotoRecord[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('event_id', WEDDING_EVENT_CONFIG.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as PhotoRecord[];
      }
    } catch (e) {
      console.warn('Supabase fetch photos error:', e);
    }
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readonly');
    const store = tx.objectStore(PHOTOS_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const photos = (request.result || []) as PhotoRecord[];
      // Sort newest first
      photos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resolve(photos);
    };
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete a photo
 */
export async function deleteWeddingPhoto(photoId: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('photos').delete().eq('id', photoId);
    } catch (e) {
      console.warn('Supabase delete photo error:', e);
    }
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PHOTOS_STORE, 'readwrite');
    const store = tx.objectStore(PHOTOS_STORE);
    store.delete(photoId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Delete a guest
 */
export async function deleteGuest(guestId: string): Promise<boolean> {
  if (supabase) {
    try {
      await supabase.from('guests').delete().eq('id', guestId);
    } catch (e) {
      console.warn('Supabase delete guest error:', e);
    }
  }

  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(GUESTS_STORE, 'readwrite');
    const store = tx.objectStore(GUESTS_STORE);
    store.delete(guestId);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get and update Event Config (photo limits, reveal mode)
 */
export async function getEventConfig(): Promise<EventConfig> {
  const saved = localStorage.getItem('wedding_event_config');
  if (saved) {
    try {
      return { ...WEDDING_EVENT_CONFIG, ...JSON.parse(saved) };
    } catch {
      // fallback
    }
  }
  return WEDDING_EVENT_CONFIG;
}

export async function updateEventConfig(updates: Partial<EventConfig>): Promise<EventConfig> {
  const current = await getEventConfig();
  const next = { ...current, ...updates };
  localStorage.setItem('wedding_event_config', JSON.stringify(next));
  return next;
}

/**
 * Initialize with high-quality sample photos for the live album preview
 */
export async function seedInitialDemoPhotosIfNeeded(): Promise<void> {
  const photos = await fetchWeddingPhotos();
  if (photos.length > 0) return;

  const demoPhotos: PhotoRecord[] = [
    {
      id: 'demo-photo-1',
      event_id: WEDDING_EVENT_CONFIG.id,
      guest_id: 'guest-alucard',
      guest_name: 'Alucard',
      storage_path: '/src/assets/images/disposable_camera_table_1791442845623.jpg',
      thumbnail_path: '/src/assets/images/disposable_camera_table_1791442845623.jpg',
      data_url: '/src/assets/images/disposable_camera_table_1791442845623.jpg',
      filter: 'GARDEN_FLASH',
      orientation: '9:16',
      width: 1080,
      height: 1920,
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo-photo-2',
      event_id: WEDDING_EVENT_CONFIG.id,
      guest_id: 'guest-nadia',
      guest_name: 'Nadia & Reza',
      storage_path: '/src/assets/images/wedding_garden_hero_1791442831131.jpg',
      thumbnail_path: '/src/assets/images/wedding_garden_hero_1791442831131.jpg',
      data_url: '/src/assets/images/wedding_garden_hero_1791442831131.jpg',
      filter: 'FUNSAVER',
      orientation: '9:16',
      width: 1080,
      height: 1920,
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'demo-photo-3',
      event_id: WEDDING_EVENT_CONFIG.id,
      guest_id: 'guest-dimas',
      guest_name: 'Dimas Kurnia',
      storage_path: '/src/assets/images/romantic_botanical_backdrop_1791442857387.jpg',
      thumbnail_path: '/src/assets/images/romantic_botanical_backdrop_1791442857387.jpg',
      data_url: '/src/assets/images/romantic_botanical_backdrop_1791442857387.jpg',
      filter: 'QUICKSNAP',
      orientation: '16:9',
      width: 1920,
      height: 1080,
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    }
  ];

  const db = await openDatabase();
  const tx = db.transaction([PHOTOS_STORE, GUESTS_STORE], 'readwrite');
  const photoStore = tx.objectStore(PHOTOS_STORE);
  const guestStore = tx.objectStore(GUESTS_STORE);

  for (const p of demoPhotos) {
    photoStore.put(p);
  }

  guestStore.put({
    id: 'guest-alucard',
    event_id: WEDDING_EVENT_CONFIG.id,
    name: 'Alucard',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    photo_count: 1,
  });

  guestStore.put({
    id: 'guest-nadia',
    event_id: WEDDING_EVENT_CONFIG.id,
    name: 'Nadia & Reza',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    photo_count: 1,
  });

  guestStore.put({
    id: 'guest-dimas',
    event_id: WEDDING_EVENT_CONFIG.id,
    name: 'Dimas Kurnia',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    photo_count: 1,
  });
}
