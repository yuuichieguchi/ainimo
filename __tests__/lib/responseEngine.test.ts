import {
  detectKeywords,
  selectTemplate,
  applyMoodModifier,
  generateResponse,
} from '@/lib/responseEngine';

describe('responseEngine', () => {
  describe('detectKeywords', () => {
    it('should detect greeting keywords', () => {
      const matches = detectKeywords('Hello there!');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0].keyword).toBe('hello');
    });

    it('should detect question keywords', () => {
      const matches = detectKeywords('What is your name?');
      expect(matches.some((m) => m.keyword === 'what')).toBe(true);
    });

    it('should be case-insensitive', () => {
      const matches1 = detectKeywords('HELLO');
      const matches2 = detectKeywords('hello');
      expect(matches1.length).toBe(matches2.length);
    });

    it('should return empty array for no matches', () => {
      const matches = detectKeywords('xyz abc def');
      expect(matches.length).toBe(0);
    });

    it('should prioritize keywords correctly', () => {
      const matches = detectKeywords('hello what');
      expect(matches[0].priority).toBeGreaterThanOrEqual(matches[1].priority);
    });
  });

  describe('selectTemplate', () => {
    it('should select template based on keyword for baby tier', () => {
      const keywords = [{ keyword: 'hello', priority: 3 }];
      const response = selectTemplate('baby', keywords, 50);
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });

    it('should return default template when no keywords match', () => {
      const response = selectTemplate('child', [], 50);
      expect(response).toBeTruthy();
    });

    it('should vary responses based on memory', () => {
      const responses = new Set();
      for (let i = 0; i < 10; i++) {
        const response = selectTemplate('teen', [], 80);
        responses.add(response);
      }
      expect(responses.size).toBeGreaterThan(1);
    });
  });

  describe('applyMoodModifier', () => {
    it('should add enthusiasm for high mood', () => {
      const response = applyMoodModifier('Hello', 90);
      expect(response.includes('!')).toBe(true);
    });

    it('should tone down for low mood', () => {
      const response = applyMoodModifier('Hello!', 20);
      expect(response.includes('.')).toBe(true);
      expect(response.includes('!')).toBe(false);
    });

    it('should not modify normal mood responses', () => {
      const original = 'Hello';
      const response = applyMoodModifier(original, 50);
      expect(response).toBe(original);
    });
  });

  describe('generateResponse', () => {
    it('should generate response for baby tier', () => {
      const response = generateResponse('hello', 'baby', 50, 10);
      expect(response).toBeTruthy();
      expect(typeof response).toBe('string');
    });

    it('should generate response for child tier', () => {
      const response = generateResponse('I want to play', 'child', 60, 20);
      expect(response).toBeTruthy();
    });

    it('should generate response for teen tier', () => {
      const response = generateResponse('What is your name?', 'teen', 70, 50);
      expect(response).toBeTruthy();
    });

    it('should generate response for adult tier', () => {
      const response = generateResponse('Tell me about yourself', 'adult', 80, 80);
      expect(response).toBeTruthy();
    });

    it('should apply mood modifiers', () => {
      const happyResponse = generateResponse('hello', 'teen', 90, 50);
      const sadResponse = generateResponse('hello', 'teen', 10, 50);
      expect(happyResponse).not.toBe(sadResponse);
    });
  });
});
