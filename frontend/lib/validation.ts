import { GameState, RestLimitState } from '@/types/game';
import { getTodayDateString } from './gameEngine';

/**
 * ユーザー入力をサニタイズしてXSS攻撃を防ぐ
 *
 * 対策内容:
 * 1. Unicode正規化（ホモグラフ攻撃対策）
 * 2. HTMLエンティティエスケープ（< > " ' & / をエスケープ）
 * 3. 制御文字の除去
 * 4. 危険なプロトコルの除去（javascript:, data:, vbscript:）
 * 5. 長さ制限（500文字）
 *
 * 注意: エスケープの順序が重要
 * - &は最初にエスケープ（後続のエスケープで生成される&を二重エスケープしないため）
 * - 空白正規化により改行・タブは1つのスペースになります
 */
export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    // Unicode正規化でホモグラフ攻撃を防ぐ
    .normalize('NFKC')
    // 長さ制限
    .slice(0, 500)
    // 連続する空白を1つにまとめる（チャットは1行想定）
    .replace(/\s+/g, ' ')
    // HTMLエンティティをエスケープ（&は最初！）
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    // 制御文字を除去（改行・タブ以外）
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // 危険なプロトコルを除去
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
}

// 有効なRestLimitStateかどうかをチェック
function isValidRestLimit(restLimit: unknown): restLimit is RestLimitState {
  if (!restLimit || typeof restLimit !== 'object') return false;
  const rl = restLimit as Partial<RestLimitState>;
  return typeof rl.count === 'number' && typeof rl.lastResetDate === 'string';
}

// 既存データのマイグレーション（restLimitがない場合に追加）
export function migrateGameState(data: unknown): GameState | null {
  if (!data || typeof data !== 'object') return null;

  const state = data as Partial<GameState>;

  // 基本的なバリデーション
  if (
    typeof state.createdAt !== 'number' ||
    typeof state.lastActionTime !== 'number' ||
    !state.parameters ||
    typeof state.parameters !== 'object' ||
    typeof state.parameters.level !== 'number' ||
    typeof state.parameters.xp !== 'number' ||
    typeof state.parameters.intelligence !== 'number' ||
    typeof state.parameters.memory !== 'number' ||
    typeof state.parameters.friendliness !== 'number' ||
    typeof state.parameters.energy !== 'number' ||
    typeof state.parameters.mood !== 'number' ||
    !Array.isArray(state.messages)
  ) {
    return null;
  }

  // restLimitがない場合はデフォルト値で補完
  const restLimit: RestLimitState = isValidRestLimit(state.restLimit)
    ? state.restLimit
    : { count: 0, lastResetDate: getTodayDateString() };

  return {
    parameters: state.parameters,
    messages: state.messages,
    createdAt: state.createdAt,
    lastActionTime: state.lastActionTime,
    currentActivity: state.currentActivity,
    restLimit,
  };
}

export function isValidGameState(data: unknown): data is GameState {
  return migrateGameState(data) !== null;
}
