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
      expect(result.length).toBeLessThanOrEqual(500);
    });

    it('should normalize multiple spaces to single space', () => {
      expect(sanitizeUserInput('hello    world')).toBe('hello world');
    });

    it('should escape HTML tags', () => {
      expect(sanitizeUserInput('hello <script>alert()</script>')).toBe(
        'hello &lt;script&gt;alert()&lt;&#x2F;script&gt;'
      );
    });

    it('should escape HTML entities', () => {
      expect(sanitizeUserInput('Tom & Jerry')).toBe('Tom &amp; Jerry');
      expect(sanitizeUserInput('5 < 10 > 3')).toBe('5 &lt; 10 &gt; 3');
      expect(sanitizeUserInput('Say "hello"')).toBe('Say &quot;hello&quot;');
      expect(sanitizeUserInput("It's nice")).toBe('It&#x27;s nice');
    });

    it('should prevent XSS via script tags', () => {
      const xssAttempt = '<script>alert("XSS")</script>';
      const result = sanitizeUserInput(xssAttempt);
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should prevent XSS via img onerror', () => {
      const xssAttempt = '<img src=x onerror="alert(1)">';
      const result = sanitizeUserInput(xssAttempt);
      // HTMLタグとして実行できないようエスケープされている
      expect(result).not.toContain('<img');
      expect(result).not.toContain('</img>');
      expect(result).toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
    });

    it('should normalize Unicode to prevent homograph attacks', () => {
      // Cyrillicの'а'(U+0430)を含むjavascript:攻撃
      const homographAttack = 'jаvаscript:alert(1)'; // аはCyrillic
      const result = sanitizeUserInput(homographAttack);
      // NFKC正規化後、javascript:が除去される
      expect(result).not.toContain('javascript');
    });

    it('should prevent XSS via javascript: protocol', () => {
      expect(sanitizeUserInput('javascript:alert(1)')).toBe('alert(1)');
      expect(sanitizeUserInput('JAVASCRIPT:alert(1)')).toBe('alert(1)');
      expect(sanitizeUserInput('JaVaScRiPt:alert(1)')).toBe('alert(1)');
    });

    it('should prevent XSS via data: protocol', () => {
      expect(sanitizeUserInput('data:text/html,<script>alert(1)</script>')).toBe(
        'text&#x2F;html,&lt;script&gt;alert(1)&lt;&#x2F;script&gt;'
      );
    });

    it('should prevent XSS via vbscript: protocol', () => {
      expect(sanitizeUserInput('vbscript:msgbox(1)')).toBe('msgbox(1)');
    });

    it('should remove control characters', () => {
      const input = 'hello\x00\x01\x02world';
      const result = sanitizeUserInput(input);
      expect(result).toBe('helloworld');
    });

    it('should preserve newlines and tabs', () => {
      const input = 'hello\nworld\ttab';
      const result = sanitizeUserInput(input);
      // 空白の正規化によりタブと改行はスペースになる
      expect(result).toBe('hello world tab');
    });

    it('should handle empty string', () => {
      expect(sanitizeUserInput('')).toBe('');
    });

    it('should handle normal text without special characters', () => {
      expect(sanitizeUserInput('Hello, how are you?')).toBe('Hello, how are you?');
    });

    it('should handle Japanese text', () => {
      // NFKC正規化により全角の？が半角?に変換される
      expect(sanitizeUserInput('こんにちは、元気ですか？')).toBe('こんにちは、元気ですか?');
    });

    it('should handle multiple XSS vectors combined', () => {
      const xssAttempt = '<script>alert("XSS")</script><img src=x onerror="alert(1)">javascript:void(0)';
      const result = sanitizeUserInput(xssAttempt);
      // 実行可能なHTMLタグとして残らないことを確認
      expect(result).not.toContain('<script>');
      expect(result).not.toContain('</script>');
      expect(result).not.toContain('<img');
      expect(result).not.toContain('javascript:');
      // エスケープされた安全な文字列になっている
      expect(result).toContain('&lt;script&gt;');
      expect(result).toContain('&lt;img');
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
