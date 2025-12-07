/**
 * 暗号化されたペイロードの構造
 * localStorageに保存される際の形式
 */
export interface EncryptedPayload {
  /** フォーマットバージョン（将来の拡張用） */
  version: number;
  /** Base64エンコードされた初期化ベクトル（12バイト） */
  iv: string;
  /** Base64エンコードされたソルト（16バイト） */
  salt: string;
  /** Base64エンコードされた暗号文 */
  ciphertext: string;
  /** Base64エンコードされたHMAC-SHA256署名 */
  hmac: string;
}

/**
 * 暗号化設定
 */
export interface CryptoConfig {
  /** 暗号化が有効かどうか */
  enabled: boolean;
  /** PBKDF2の反復回数 */
  keyDerivationIterations: number;
}
