// Favorites Store using IndexedDB
// Manages user's favorited animation presets

const DB_NAME = 'liike-favorites';
const DB_VERSION = 1;
const STORE_NAME = 'favorites';

let dbPromise: Promise<IDBDatabase> | null = null;

const getDB = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
  
  return dbPromise;
};

export type FavoriteItem = {
  id: string;  // preset ID
  addedAt: number;  // timestamp
};

// Add a preset to favorites
export const addFavorite = async (presetId: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const item: FavoriteItem = { id: presetId, addedAt: Date.now() };
    const request = store.put(item);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Remove a preset from favorites
export const removeFavorite = async (presetId: string): Promise<void> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(presetId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Check if a preset is favorited
export const isFavorite = async (presetId: string): Promise<boolean> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(presetId);
    request.onsuccess = () => resolve(!!request.result);
    request.onerror = () => reject(request.error);
  });
};

// Get all favorite preset IDs
export const getAllFavorites = async (): Promise<string[]> => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const items = request.result as FavoriteItem[];
      // Sort by most recently added
      items.sort((a, b) => b.addedAt - a.addedAt);
      resolve(items.map(item => item.id));
    };
    request.onerror = () => reject(request.error);
  });
};

// Toggle favorite state
export const toggleFavorite = async (presetId: string): Promise<boolean> => {
  const isFav = await isFavorite(presetId);
  if (isFav) {
    await removeFavorite(presetId);
    return false;
  } else {
    await addFavorite(presetId);
    return true;
  }
};

// React hook for favorites (with optimistic updates)
import { useState, useEffect, useCallback } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  
  // Load favorites on mount
  useEffect(() => {
    getAllFavorites()
      .then(ids => {
        setFavorites(new Set(ids));
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load favorites:', err);
        setIsLoading(false);
      });
  }, []);
  
  const toggle = useCallback(async (presetId: string) => {
    // Optimistic update
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(presetId)) {
        next.delete(presetId);
      } else {
        next.add(presetId);
      }
      return next;
    });
    
    // Persist to IndexedDB
    try {
      await toggleFavorite(presetId);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      // Rollback on error
      setFavorites(prev => {
        const next = new Set(prev);
        if (next.has(presetId)) {
          next.delete(presetId);
        } else {
          next.add(presetId);
        }
        return next;
      });
    }
  }, []);
  
  const isFav = useCallback((presetId: string) => favorites.has(presetId), [favorites]);
  
  const getFavoritesList = useCallback(() => Array.from(favorites), [favorites]);
  
  return {
    favorites,
    isLoading,
    toggle,
    isFavorite: isFav,
    getFavoritesList,
  };
};
