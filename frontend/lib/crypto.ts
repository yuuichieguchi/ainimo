import { EncryptedPayload } from '@/types/crypto';

// 暗号化パラメータ
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // GCM推奨: 96bit = 12bytes
const SALT_LENGTH = 16;
const PBKDF2_ITERATIONS = 100000;
const CURRENT_VERSION = 2;

// フォールバック鍵（開発環境用、本番では必ず環境変数を設定すること）
const FALLBACK_KEY = 'ainimo-dev-fallback-key-do-not-use-in-production';

/**
 * 環境変数から暗号化鍵を取得
 */
function getEncryptionKey(): string {
  return process.env.NEXT_PUBLIC_STORAGE_KEY || FALLBACK_KEY;
}

/**
 * 暗号化が有効かどうかをチェック
 */
export function isEncryptionEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  if (!window.crypto?.subtle) return false;
  return true;
}

/**
 * 文字列をBase64に変換
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64を ArrayBuffer に変換
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * PBKDF2で暗号化鍵を導出
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * HMAC用の鍵を導出
 */
async function deriveHMACKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'HMAC', hash: 'SHA-256', length: KEY_LENGTH },
    false,
    ['sign', 'verify']
  );
}

/**
 * HMAC-SHA256で署名を生成
 */
async function generateHMAC(data: string, key: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return arrayBufferToBase64(signature);
}

/**
 * HMAC-SHA256で署名を検証（タイミング攻撃対策付き）
 */
async function verifyHMAC(data: string, hmac: string, key: CryptoKey): Promise<boolean> {
  const encoder = new TextEncoder();
  const signature = base64ToArrayBuffer(hmac);
  return crypto.subtle.verify('HMAC', key, signature, encoder.encode(data));
}

/**
 * データを暗号化
 */
export async function encrypt(plaintext: string): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const password = getEncryptionKey();

  // ランダムなIVとソルトを生成
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));

  // 鍵を導出
  const encryptionKey = await deriveKey(password, salt);
  const hmacKey = await deriveHMACKey(password + '-hmac', salt);

  // AES-GCMで暗号化
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    encryptionKey,
    encoder.encode(plaintext)
  );

  const ivBase64 = arrayBufferToBase64(iv.buffer);
  const saltBase64 = arrayBufferToBase64(salt.buffer);
  const ciphertextBase64 = arrayBufferToBase64(ciphertext);

  // HMACを生成（iv + salt + ciphertext に対して）
  const dataToSign = ivBase64 + saltBase64 + ciphertextBase64;
  const hmac = await generateHMAC(dataToSign, hmacKey);

  return {
    version: CURRENT_VERSION,
    iv: ivBase64,
    salt: saltBase64,
    ciphertext: ciphertextBase64,
    hmac,
  };
}

/**
 * データを復号
 */
export async function decrypt(payload: EncryptedPayload): Promise<string> {
  const decoder = new TextDecoder();
  const password = getEncryptionKey();

  // ソルトとIVを復元
  const salt = new Uint8Array(base64ToArrayBuffer(payload.salt));
  const iv = new Uint8Array(base64ToArrayBuffer(payload.iv));

  // 鍵を導出
  const hmacKey = await deriveHMACKey(password + '-hmac', salt);

  // HMACを検証
  const dataToVerify = payload.iv + payload.salt + payload.ciphertext;
  const isValid = await verifyHMAC(dataToVerify, payload.hmac, hmacKey);

  if (!isValid) {
    throw new Error('HMAC verification failed: data may have been tampered with');
  }

  // 暗号化鍵を導出
  const encryptionKey = await deriveKey(password, salt);

  // AES-GCMで復号
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);
  const plaintext = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    encryptionKey,
    ciphertext
  );

  return decoder.decode(plaintext);
}

/**
 * 平文データかどうかを判定（マイグレーション用）
 */
export function isPlainTextData(data: string): boolean {
  try {
    const parsed = JSON.parse(data);
    // EncryptedPayloadの場合はversionプロパティが存在する
    if (parsed.version === CURRENT_VERSION && parsed.iv && parsed.ciphertext && parsed.hmac) {
      return false;
    }
    // GameStateの場合はparametersプロパティが存在する
    if (parsed.parameters !== undefined) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * 暗号化ペイロードかどうかを判定
 */
export function isEncryptedPayload(data: unknown): data is EncryptedPayload {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    obj.version === CURRENT_VERSION &&
    typeof obj.iv === 'string' &&
    typeof obj.salt === 'string' &&
    typeof obj.ciphertext === 'string' &&
    typeof obj.hmac === 'string'
  );
}
