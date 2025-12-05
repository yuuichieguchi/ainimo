import { sanitizeUserInput, isValidGameState } from '@/lib/validation';
import { GameState } from '@/types/game';

describe('validation', () => {
  describe('sanitizeUserInput', () => {
    it('should trim whitespace', () => {
      expect(sanitizeUserInput('  hello  ')).toBe('hello');
    });

    it('should limit to 500 characters', () => {
      const longString = 'a'.repeat(600);
      const result = sanitizeUserInput(longString);
      expect(result.length).toBe(500);
    });

    it('should normalize multiple spaces to single space', () => {
      expect(sanitizeUserInput('hello    world')).toBe('hello world');
    });

    it('should remove angle brackets', () => {
      expect(sanitizeUserInput('hello <script>alert()</script>')).toBe(
        'hello scriptalert()/script'
      );
    });

    it('should handle empty string', () => {
      expect(sanitizeUserInput('')).toBe('');
    });

    it('should handle normal text without modification', () => {
      expect(sanitizeUserInput('Hello, how are you?')).toBe('Hello, how are you?');
    });
  });

  describe('isValidGameState', () => {
    const validState: GameState = {
      parameters: {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 100,
        mood: 60,
      },
      messages: [],
      createdAt: Date.now(),
      lastActionTime: Date.now(),
    };

    it('should return true for valid game state', () => {
      expect(isValidGameState(validState)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isValidGameState(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isValidGameState(undefined)).toBe(false);
    });

    it('should return false for non-object', () => {
      expect(isValidGameState('string')).toBe(false);
      expect(isValidGameState(123)).toBe(false);
    });

    it('should return false for missing createdAt', () => {
      const invalid = { ...validState, createdAt: undefined };
      expect(isValidGameState(invalid)).toBe(false);
    });

    it('should return false for missing parameters', () => {
      const invalid = { ...validState, parameters: undefined };
      expect(isValidGameState(invalid)).toBe(false);
    });

    it('should return false for invalid parameter types', () => {
      const invalid = {
        ...validState,
        parameters: { ...validState.parameters, level: 'one' },
      };
      expect(isValidGameState(invalid)).toBe(false);
    });

    it('should return false for missing messages array', () => {
      const invalid = { ...validState, messages: undefined };
      expect(isValidGameState(invalid)).toBe(false);
    });

    it('should return false for non-array messages', () => {
      const invalid = { ...validState, messages: 'not an array' };
      expect(isValidGameState(invalid)).toBe(false);
    });
  });
});
