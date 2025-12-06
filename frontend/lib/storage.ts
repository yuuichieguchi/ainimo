import { GameState } from '@/types/game';
import { isValidGameState } from './validation';

const STORAGE_KEY = 'ainimo_save';

export interface StorageAdapter {
  save(key: string, data: GameState): Promise<void>;
  load(key: string): Promise<GameState | null>;
  clear(key: string): Promise<void>;
}

class LocalStorageAdapter implements StorageAdapter {
  async save(key: string, data: GameState): Promise<void> {
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Storage save failed');
    }
  }

  async load(key: string): Promise<GameState | null> {
    try {
      const serialized = localStorage.getItem(key);
      if (!serialized) return null;
      const parsed = JSON.parse(serialized);
      return isValidGameState(parsed) ? parsed : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  }

  async clear(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }
}

class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'ainimo_db';
  private storeName = 'game_state';
  private version = 1;

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async save(key: string, data: GameState): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put(data, key);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to save to IndexedDB:', error);
      throw new Error('IndexedDB save failed');
    }
  }

  async load(key: string): Promise<GameState | null> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          const result = request.result;
          resolve(result && isValidGameState(result) ? result : null);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Failed to load from IndexedDB:', error);
      return null;
    }
  }

  async clear(key: string): Promise<void> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.delete(key);

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } catch (error) {
      console.error('Failed to clear IndexedDB:', error);
    }
  }
}

let storageAdapter: StorageAdapter | null = null;

function getStorageAdapter(): StorageAdapter {
  if (storageAdapter === null) {
    if (typeof window === 'undefined') {
      throw new Error('Storage is only available in browser environment');
    }

    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      storageAdapter = new LocalStorageAdapter();
    } catch {
      console.warn('localStorage not available, falling back to IndexedDB');
      storageAdapter = new IndexedDBAdapter();
    }
  }
  return storageAdapter;
}

export async function saveGameState(state: GameState): Promise<void> {
  const adapter = getStorageAdapter();
  await adapter.save(STORAGE_KEY, state);
}

export async function loadGameState(): Promise<GameState | null> {
  const adapter = getStorageAdapter();
  return await adapter.load(STORAGE_KEY);
}

export async function clearGameState(): Promise<void> {
  const adapter = getStorageAdapter();
  await adapter.clear(STORAGE_KEY);
}
