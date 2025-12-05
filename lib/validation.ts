import { GameState } from '@/types/game';

export function sanitizeUserInput(input: string): string {
  return input
    .trim()
    .slice(0, 500)
    .replace(/\s+/g, ' ')
    .replace(/[<>]/g, '');
}

export function isValidGameState(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;

  const state = data as Partial<GameState>;

  return (
    typeof state.createdAt === 'number' &&
    typeof state.lastActionTime === 'number' &&
    state.parameters !== undefined &&
    typeof state.parameters === 'object' &&
    typeof state.parameters.level === 'number' &&
    typeof state.parameters.xp === 'number' &&
    typeof state.parameters.intelligence === 'number' &&
    typeof state.parameters.memory === 'number' &&
    typeof state.parameters.friendliness === 'number' &&
    typeof state.parameters.energy === 'number' &&
    typeof state.parameters.mood === 'number' &&
    Array.isArray(state.messages)
  );
}
