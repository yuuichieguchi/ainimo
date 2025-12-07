import { GameState } from '@/types/game';
import { migrateGameState } from './validation';
import {
  encrypt,
  decrypt,
  isEncryptionEnabled,
  isPlainTextData,
  isEncryptedPayload,
} from './crypto';

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

      if (isEncryptionEnabled()) {
        const encrypted = await encrypt(serialized);
        localStorage.setItem(key, JSON.stringify(encrypted));
      } else {
        localStorage.setItem(key, serialized);
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      throw new Error('Storage save failed');
    }
  }

  async load(key: string): Promise<GameState | null> {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      let gameStateData: unknown;

      // 平文データかどうかを判定
      if (isPlainTextData(stored)) {
        // 平文データの場合はそのままパース
        gameStateData = JSON.parse(stored);

        // マイグレーション: 暗号化が有効なら暗号化して再保存
        if (isEncryptionEnabled()) {
          const migrated = migrateGameState(gameStateData);
          if (migrated) {
            await this.save(key, migrated);
          }
        }
      } else {
        // 暗号化データの場合
        const parsed = JSON.parse(stored);

        if (isEncryptedPayload(parsed)) {
          try {
            const decrypted = await decrypt(parsed);
            gameStateData = JSON.parse(decrypted);
          } catch (error) {
            // 復号失敗（改ざんの可能性）→ データを削除
            console.error('Decryption failed, data may have been tampered with:', error);
            localStorage.removeItem(key);
            return null;
          }
        } else {
          // 不明な形式 → データを削除
          console.error('Unknown data format in storage');
          localStorage.removeItem(key);
          return null;
        }
      }

      // マイグレーションを適用して既存データに対応
      return migrateGameState(gameStateData);
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
      const serialized = JSON.stringify(data);

      let dataToStore: string | object;
      if (isEncryptionEnabled()) {
        dataToStore = await encrypt(serialized);
      } else {
        dataToStore = data;
      }

      const db = await this.getDB();
      const transaction = db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      store.put(dataToStore, key);

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
        request.onsuccess = async () => {
          const result = request.result;
          if (!result) {
            resolve(null);
            return;
          }

          let gameStateData: unknown;

          // 暗号化データかどうかを判定
          if (isEncryptedPayload(result)) {
            try {
              const decrypted = await decrypt(result);
              gameStateData = JSON.parse(decrypted);
            } catch (error) {
              // 復号失敗（改ざんの可能性）→ データを削除
              console.error('Decryption failed, data may have been tampered with:', error);
              await this.clear(key);
              resolve(null);
              return;
            }
          } else if (result.parameters !== undefined) {
            // 平文データの場合
            gameStateData = result;

            // マイグレーション: 暗号化が有効なら暗号化して再保存
            if (isEncryptionEnabled()) {
              const migrated = migrateGameState(gameStateData);
              if (migrated) {
                await this.save(key, migrated);
              }
            }
          } else {
            // 不明な形式 → データを削除
            console.error('Unknown data format in IndexedDB');
            await this.clear(key);
            resolve(null);
            return;
          }

          // マイグレーションを適用して既存データに対応
          resolve(migrateGameState(gameStateData));
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
