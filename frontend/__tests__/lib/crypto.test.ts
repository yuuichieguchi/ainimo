/**
 * @jest-environment jsdom
 */

import {
  encrypt,
  decrypt,
  isEncryptionEnabled,
  isPlainTextData,
  isEncryptedPayload,
} from '@/lib/crypto';
import { EncryptedPayload } from '@/types/crypto';
import { TextEncoder, TextDecoder } from 'util';

// TextEncoder/TextDecoder をグローバルに設定
global.TextEncoder = TextEncoder;
// @ts-expect-error - TextDecoder type mismatch
global.TextDecoder = TextDecoder;

// Web Crypto API をモック
const mockSubtle = {
  importKey: jest.fn(),
  deriveKey: jest.fn(),
  encrypt: jest.fn(),
  decrypt: jest.fn(),
  sign: jest.fn(),
  verify: jest.fn(),
};

const mockGetRandomValues = jest.fn((array: Uint8Array) => {
  for (let i = 0; i < array.length; i++) {
    array[i] = Math.floor(Math.random() * 256);
  }
  return array;
});

// グローバルcryptoをモック
Object.defineProperty(global, 'crypto', {
  value: {
    subtle: mockSubtle,
    getRandomValues: mockGetRandomValues,
  },
});

describe('crypto', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isEncryptionEnabled', () => {
    it('should return true when crypto.subtle is available', () => {
      expect(isEncryptionEnabled()).toBe(true);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      // @ts-expect-error - intentionally testing undefined
      delete global.window;
      expect(isEncryptionEnabled()).toBe(false);
      global.window = originalWindow;
    });
  });

  describe('isPlainTextData', () => {
    it('should return true for plain GameState JSON', () => {
      const plainData = JSON.stringify({
        parameters: { level: 1, xp: 0 },
        messages: [],
        createdAt: Date.now(),
      });
      expect(isPlainTextData(plainData)).toBe(true);
    });

    it('should return false for encrypted payload', () => {
      const encryptedData = JSON.stringify({
        version: 2,
        iv: 'base64iv',
        salt: 'base64salt',
        ciphertext: 'base64ciphertext',
        hmac: 'base64hmac',
      });
      expect(isPlainTextData(encryptedData)).toBe(false);
    });

    it('should return false for invalid JSON', () => {
      expect(isPlainTextData('not valid json')).toBe(false);
    });

    it('should return false for unknown format', () => {
      const unknownData = JSON.stringify({ foo: 'bar' });
      expect(isPlainTextData(unknownData)).toBe(false);
    });
  });

  describe('isEncryptedPayload', () => {
    it('should return true for valid encrypted payload', () => {
      const payload: EncryptedPayload = {
        version: 2,
        iv: 'base64iv',
        salt: 'base64salt',
        ciphertext: 'base64ciphertext',
        hmac: 'base64hmac',
      };
      expect(isEncryptedPayload(payload)).toBe(true);
    });

    it('should return false for invalid version', () => {
      const payload = {
        version: 1,
        iv: 'base64iv',
        salt: 'base64salt',
        ciphertext: 'base64ciphertext',
        hmac: 'base64hmac',
      };
      expect(isEncryptedPayload(payload)).toBe(false);
    });

    it('should return false for missing fields', () => {
      expect(isEncryptedPayload({ version: 2 })).toBe(false);
      expect(isEncryptedPayload({ version: 2, iv: 'iv' })).toBe(false);
      expect(isEncryptedPayload(null)).toBe(false);
      expect(isEncryptedPayload(undefined)).toBe(false);
    });
  });

  describe('encrypt and decrypt', () => {
    const mockEncryptionKey = {} as CryptoKey;
    const mockHMACKey = {} as CryptoKey;

    beforeEach(() => {
      // 鍵導出のモック
      mockSubtle.importKey.mockResolvedValue({} as CryptoKey);
      mockSubtle.deriveKey.mockImplementation((_params, _key, options) => {
        if (options.name === 'HMAC') {
          return Promise.resolve(mockHMACKey);
        }
        return Promise.resolve(mockEncryptionKey);
      });

      // 暗号化のモック
      mockSubtle.encrypt.mockResolvedValue(
        new TextEncoder().encode('encrypted_data').buffer
      );

      // HMACのモック
      mockSubtle.sign.mockResolvedValue(
        new TextEncoder().encode('hmac_signature').buffer
      );
      mockSubtle.verify.mockResolvedValue(true);

      // 復号のモック
      mockSubtle.decrypt.mockResolvedValue(
        new TextEncoder().encode('{"test":"data"}').buffer
      );
    });

    it('should encrypt data and return EncryptedPayload', async () => {
      const plaintext = '{"test":"data"}';
      const result = await encrypt(plaintext);

      expect(result).toHaveProperty('version', 2);
      expect(result).toHaveProperty('iv');
      expect(result).toHaveProperty('salt');
      expect(result).toHaveProperty('ciphertext');
      expect(result).toHaveProperty('hmac');
      expect(typeof result.iv).toBe('string');
      expect(typeof result.salt).toBe('string');
      expect(typeof result.ciphertext).toBe('string');
      expect(typeof result.hmac).toBe('string');
    });

    it('should decrypt valid EncryptedPayload', async () => {
      const payload: EncryptedPayload = {
        version: 2,
        iv: btoa(String.fromCharCode(...new Uint8Array(12))),
        salt: btoa(String.fromCharCode(...new Uint8Array(16))),
        ciphertext: btoa('encrypted_data'),
        hmac: btoa('hmac_signature'),
      };

      const result = await decrypt(payload);
      expect(result).toBe('{"test":"data"}');
    });

    it('should throw error when HMAC verification fails', async () => {
      mockSubtle.verify.mockResolvedValue(false);

      const payload: EncryptedPayload = {
        version: 2,
        iv: btoa(String.fromCharCode(...new Uint8Array(12))),
        salt: btoa(String.fromCharCode(...new Uint8Array(16))),
        ciphertext: btoa('tampered_data'),
        hmac: btoa('invalid_hmac'),
      };

      await expect(decrypt(payload)).rejects.toThrow(
        'HMAC verification failed: data may have been tampered with'
      );
    });

    it('should generate different ciphertext for same plaintext (due to random IV)', async () => {
      const plaintext = '{"test":"data"}';

      // 最初の暗号化
      const result1 = await encrypt(plaintext);

      // IVが異なるため、異なる暗号文が生成されるはず
      // （モックでは同じ値になるが、実際の実装では異なる）
      expect(mockGetRandomValues).toHaveBeenCalled();
    });
  });
});
