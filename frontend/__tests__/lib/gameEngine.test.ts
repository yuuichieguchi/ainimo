import {
  clampStat,
  calculateXpGain,
  checkLevelUp,
  getIntelligenceTier,
  calculateMood,
  getMoodType,
  updateParameters,
  canPerformAction,
  getInitialState,
} from '@/lib/gameEngine';
import { GameParameters } from '@/types/game';

describe('gameEngine', () => {
  describe('clampStat', () => {
    it('should clamp values below 0 to 0', () => {
      expect(clampStat(-10)).toBe(0);
      expect(clampStat(-1)).toBe(0);
    });

    it('should clamp values above 100 to 100', () => {
      expect(clampStat(150)).toBe(100);
      expect(clampStat(101)).toBe(100);
    });

    it('should return value unchanged if between 0 and 100', () => {
      expect(clampStat(0)).toBe(0);
      expect(clampStat(50)).toBe(50);
      expect(clampStat(100)).toBe(100);
    });
  });

  describe('calculateXpGain', () => {
    it('should return base XP for talk action', () => {
      expect(calculateXpGain('talk', 0)).toBe(5);
    });

    it('should return base XP for study action', () => {
      expect(calculateXpGain('study', 0)).toBe(10);
    });

    it('should add intelligence bonus', () => {
      expect(calculateXpGain('talk', 20)).toBe(6); // 5 + floor(20/20)
      expect(calculateXpGain('study', 40)).toBe(12); // 10 + floor(40/20)
    });

    it('should return 0 for rest action', () => {
      expect(calculateXpGain('rest', 50)).toBe(2); // 0 + floor(50/20)
    });
  });

  describe('checkLevelUp', () => {
    it('should level up when XP reaches 100', () => {
      const result = checkLevelUp(100, 1);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(0);
    });

    it('should handle XP overflow', () => {
      const result = checkLevelUp(150, 1);
      expect(result.level).toBe(2);
      expect(result.xp).toBe(50);
    });

    it('should not level up if XP < 100', () => {
      const result = checkLevelUp(99, 1);
      expect(result.level).toBe(1);
      expect(result.xp).toBe(99);
    });

    it('should not level up if already at max level', () => {
      const result = checkLevelUp(100, 100);
      expect(result.level).toBe(100);
      expect(result.xp).toBe(100);
    });
  });

  describe('getIntelligenceTier', () => {
    it('should return baby for intelligence 0-24', () => {
      expect(getIntelligenceTier(0)).toBe('baby');
      expect(getIntelligenceTier(10)).toBe('baby');
      expect(getIntelligenceTier(24)).toBe('baby');
    });

    it('should return child for intelligence 25-49', () => {
      expect(getIntelligenceTier(25)).toBe('child');
      expect(getIntelligenceTier(35)).toBe('child');
      expect(getIntelligenceTier(49)).toBe('child');
    });

    it('should return teen for intelligence 50-74', () => {
      expect(getIntelligenceTier(50)).toBe('teen');
      expect(getIntelligenceTier(60)).toBe('teen');
      expect(getIntelligenceTier(74)).toBe('teen');
    });

    it('should return adult for intelligence 75-100', () => {
      expect(getIntelligenceTier(75)).toBe('adult');
      expect(getIntelligenceTier(85)).toBe('adult');
      expect(getIntelligenceTier(100)).toBe('adult');
    });
  });

  describe('calculateMood', () => {
    it('should calculate mood correctly', () => {
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 50,
        memory: 50,
        friendliness: 50,
        energy: 50,
        mood: 0,
      };
      const mood = calculateMood(params);
      expect(mood).toBe(50); // 50*0.4 + 50*0.3 + 50*0.3 = 50
    });

    it('should clamp mood to 0-100 range', () => {
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 100,
        memory: 100,
        friendliness: 100,
        energy: 100,
        mood: 0,
      };
      const mood = calculateMood(params);
      expect(mood).toBe(100);
    });
  });

  describe('getMoodType', () => {
    it('should return happy for mood >= 70', () => {
      expect(getMoodType(70)).toBe('happy');
      expect(getMoodType(100)).toBe('happy');
    });

    it('should return normal for mood 40-69', () => {
      expect(getMoodType(40)).toBe('normal');
      expect(getMoodType(69)).toBe('normal');
    });

    it('should return tired for mood 20-39', () => {
      expect(getMoodType(20)).toBe('tired');
      expect(getMoodType(39)).toBe('tired');
    });

    it('should return sad for mood < 20', () => {
      expect(getMoodType(0)).toBe('sad');
      expect(getMoodType(19)).toBe('sad');
    });
  });

  describe('updateParameters', () => {
    it('should update parameters for talk action', () => {
      const current: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 100,
        mood: 60,
      };

      const updated = updateParameters(current, 'talk');

      expect(updated.xp).toBeGreaterThan(0);
      expect(updated.friendliness).toBeGreaterThan(50);
      expect(updated.memory).toBeGreaterThan(5);
      expect(updated.energy).toBe(90);
    });

    it('should level up when XP reaches 100', () => {
      const current: GameParameters = {
        level: 1,
        xp: 95,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 100,
        mood: 60,
      };

      const updated = updateParameters(current, 'study');

      expect(updated.level).toBe(2);
      expect(updated.xp).toBeLessThan(100);
    });
  });

  describe('canPerformAction', () => {
    it('should allow rest regardless of energy', () => {
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 0,
        mood: 60,
      };

      expect(canPerformAction(params, 'rest')).toBe(true);
    });

    it('should block actions when energy < 20', () => {
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 15,
        mood: 60,
      };

      expect(canPerformAction(params, 'talk')).toBe(false);
      expect(canPerformAction(params, 'study')).toBe(false);
      expect(canPerformAction(params, 'play')).toBe(false);
    });

    it('should allow actions when energy >= 20', () => {
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 20,
        mood: 60,
      };

      expect(canPerformAction(params, 'talk')).toBe(true);
      expect(canPerformAction(params, 'study')).toBe(true);
      expect(canPerformAction(params, 'play')).toBe(true);
    });
  });

  describe('getInitialState', () => {
    it('should return valid initial state', () => {
      const state = getInitialState();

      expect(state.parameters.level).toBe(1);
      expect(state.parameters.xp).toBe(0);
      expect(state.parameters.intelligence).toBe(10);
      expect(state.parameters.energy).toBe(100);
      expect(state.messages).toEqual([]);
      expect(state.createdAt).toBeGreaterThan(0);
      expect(state.lastActionTime).toBeGreaterThan(0);
    });
  });
});
