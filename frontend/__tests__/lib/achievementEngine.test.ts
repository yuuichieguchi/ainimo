import {
  getInitialAchievementState,
  updateAchievementStats,
  checkAchievementCondition,
  detectNewUnlocks,
  unlockAchievements,
  consumeNotification,
  selectTitle,
  isUnlocked,
  calculateProgress,
  updateLoginStreak,
} from '@/lib/achievementEngine';
import { ACHIEVEMENTS } from '@/lib/achievementDefinitions';
import { AchievementState, AchievementStats } from '@/types/achievement';
import { GameParameters } from '@/types/game';
import { getTodayDateString } from '@/lib/gameEngine';

describe('achievementEngine', () => {
  describe('getInitialAchievementState', () => {
    it('should return initial state with empty unlocked array', () => {
      const state = getInitialAchievementState();
      expect(state.unlocked).toEqual([]);
    });

    it('should return initial state with zero stats', () => {
      const state = getInitialAchievementState();
      expect(state.stats.talkCount).toBe(0);
      expect(state.stats.studyCount).toBe(0);
      expect(state.stats.playCount).toBe(0);
      expect(state.stats.restCount).toBe(0);
      expect(state.stats.totalActions).toBe(0);
    });

    it('should return null selectedTitleId', () => {
      const state = getInitialAchievementState();
      expect(state.selectedTitleId).toBeNull();
    });

    it('should return empty pendingNotifications', () => {
      const state = getInitialAchievementState();
      expect(state.pendingNotifications).toEqual([]);
    });
  });

  describe('updateAchievementStats', () => {
    it('should increment talkCount for talk action', () => {
      const stats = getInitialAchievementState().stats;
      const updated = updateAchievementStats(stats, 'talk');
      expect(updated.talkCount).toBe(1);
      expect(updated.totalActions).toBe(1);
    });

    it('should increment studyCount for study action', () => {
      const stats = getInitialAchievementState().stats;
      const updated = updateAchievementStats(stats, 'study');
      expect(updated.studyCount).toBe(1);
    });

    it('should increment playCount for play action', () => {
      const stats = getInitialAchievementState().stats;
      const updated = updateAchievementStats(stats, 'play');
      expect(updated.playCount).toBe(1);
    });

    it('should increment restCount for rest action', () => {
      const stats = getInitialAchievementState().stats;
      const updated = updateAchievementStats(stats, 'rest');
      expect(updated.restCount).toBe(1);
    });

    it('should track todayActions', () => {
      let stats = getInitialAchievementState().stats;
      stats = updateAchievementStats(stats, 'talk');
      stats = updateAchievementStats(stats, 'study');
      expect(stats.todayActions).toContain('talk');
      expect(stats.todayActions).toContain('study');
    });

    it('should not duplicate todayActions', () => {
      let stats = getInitialAchievementState().stats;
      stats = updateAchievementStats(stats, 'talk');
      stats = updateAchievementStats(stats, 'talk');
      expect(stats.todayActions.filter(a => a === 'talk').length).toBe(1);
    });
  });

  describe('checkAchievementCondition', () => {
    const baseParams: GameParameters = {
      level: 10,
      xp: 50,
      intelligence: 30,
      memory: 20,
      friendliness: 60,
      energy: 80,
      mood: 50,
    };

    const baseStats: AchievementStats = {
      talkCount: 10,
      studyCount: 5,
      playCount: 3,
      restCount: 2,
      totalActions: 20,
      messagesSent: 15,
      currentLoginStreak: 3,
      maxLoginStreak: 5,
      totalPlayDays: 7,
      lastPlayDate: getTodayDateString(),
      restLimitHitDays: 1,
      todayActions: ['talk', 'study'],
      todayActionsDate: getTodayDateString(),
    };

    it('should check action_count condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'action_talk_10')!;
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(true);

      const notMet = { ...baseStats, talkCount: 5 };
      expect(checkAchievementCondition(achievement, notMet, baseParams)).toBe(false);
    });

    it('should check total_actions condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'action_total_1000')!;
      const metStats = { ...baseStats, totalActions: 1000 };
      expect(checkAchievementCondition(achievement, metStats, baseParams)).toBe(true);
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(false);
    });

    it('should check stat_reach condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'stat_int_25')!;
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(true);

      const lowInt = { ...baseParams, intelligence: 20 };
      expect(checkAchievementCondition(achievement, baseStats, lowInt)).toBe(false);
    });

    it('should check stat_max condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'stat_int_100')!;
      const maxInt = { ...baseParams, intelligence: 100 };
      expect(checkAchievementCondition(achievement, baseStats, maxInt)).toBe(true);
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(false);
    });

    it('should check level_reach condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'milestone_lv10')!;
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(true);

      const lowLevel = { ...baseParams, level: 5 };
      expect(checkAchievementCondition(achievement, baseStats, lowLevel)).toBe(false);
    });

    it('should check tier_reach condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'milestone_tier_child')!;
      const childParams = { ...baseParams, intelligence: 25 };
      expect(checkAchievementCondition(achievement, baseStats, childParams)).toBe(true);

      const babyParams = { ...baseParams, intelligence: 20 };
      expect(checkAchievementCondition(achievement, baseStats, babyParams)).toBe(false);
    });

    it('should check login_streak condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'streak_login_3')!;
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(true);

      const lowStreak = { ...baseStats, currentLoginStreak: 2 };
      expect(checkAchievementCondition(achievement, lowStreak, baseParams)).toBe(false);
    });

    it('should check play_days condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'days_played_7')!;
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(true);
    });

    it('should check all_stats_reach condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'stat_all_50')!;
      const allHigh = {
        ...baseParams,
        intelligence: 60,
        memory: 55,
        friendliness: 70,
        energy: 80,
      };
      expect(checkAchievementCondition(achievement, baseStats, allHigh)).toBe(true);
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(false);
    });

    it('should check all_actions_in_day condition', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'secret_perfectionist')!;
      const allActions = { ...baseStats, todayActions: ['talk', 'study', 'play', 'rest'] as const };
      expect(checkAchievementCondition(achievement, { ...allActions, todayActions: [...allActions.todayActions] }, baseParams)).toBe(true);
      expect(checkAchievementCondition(achievement, baseStats, baseParams)).toBe(false);
    });
  });

  describe('detectNewUnlocks', () => {
    it('should detect newly unlocked achievements', () => {
      const state = getInitialAchievementState();
      const params: GameParameters = {
        level: 5,
        xp: 0,
        intelligence: 25,
        memory: 10,
        friendliness: 50,
        energy: 100,
        mood: 60,
      };
      const stats: AchievementStats = {
        ...state.stats,
        talkCount: 1,
        studyCount: 1,
        totalActions: 2,
      };

      const newUnlocks = detectNewUnlocks(ACHIEVEMENTS, { ...state, stats }, params);
      expect(newUnlocks).toContain('action_talk_1');
      expect(newUnlocks).toContain('action_study_1');
      expect(newUnlocks).toContain('stat_int_25');
      expect(newUnlocks).toContain('milestone_lv5');
    });

    it('should not include already unlocked achievements', () => {
      const state: AchievementState = {
        ...getInitialAchievementState(),
        unlocked: [{ id: 'action_talk_1', unlockedAt: Date.now() }],
      };
      const params: GameParameters = {
        level: 1,
        xp: 0,
        intelligence: 10,
        memory: 5,
        friendliness: 50,
        energy: 100,
        mood: 60,
      };
      const stats: AchievementStats = {
        ...state.stats,
        talkCount: 1,
      };

      const newUnlocks = detectNewUnlocks(ACHIEVEMENTS, { ...state, stats }, params);
      expect(newUnlocks).not.toContain('action_talk_1');
    });
  });

  describe('unlockAchievements', () => {
    it('should add achievements to unlocked array', () => {
      const state = getInitialAchievementState();
      const updated = unlockAchievements(state, ['action_talk_1', 'action_study_1']);

      expect(updated.unlocked.length).toBe(2);
      expect(updated.unlocked.find(u => u.id === 'action_talk_1')).toBeDefined();
      expect(updated.unlocked.find(u => u.id === 'action_study_1')).toBeDefined();
    });

    it('should add achievements to pendingNotifications', () => {
      const state = getInitialAchievementState();
      const updated = unlockAchievements(state, ['action_talk_1']);

      expect(updated.pendingNotifications).toContain('action_talk_1');
    });

    it('should set unlockedAt timestamp', () => {
      const state = getInitialAchievementState();
      const before = Date.now();
      const updated = unlockAchievements(state, ['action_talk_1']);
      const after = Date.now();

      const unlocked = updated.unlocked.find(u => u.id === 'action_talk_1')!;
      expect(unlocked.unlockedAt).toBeGreaterThanOrEqual(before);
      expect(unlocked.unlockedAt).toBeLessThanOrEqual(after);
    });
  });

  describe('consumeNotification', () => {
    it('should return first notification and remove it from queue', () => {
      const state: AchievementState = {
        ...getInitialAchievementState(),
        pendingNotifications: ['action_talk_1', 'action_study_1'],
      };

      const { state: updated, achievementId } = consumeNotification(state);

      expect(achievementId).toBe('action_talk_1');
      expect(updated.pendingNotifications).toEqual(['action_study_1']);
    });

    it('should return null when queue is empty', () => {
      const state = getInitialAchievementState();
      const { achievementId } = consumeNotification(state);

      expect(achievementId).toBeNull();
    });
  });

  describe('selectTitle', () => {
    it('should set selectedTitleId', () => {
      const state = getInitialAchievementState();
      const updated = selectTitle(state, 'action_talk_1');

      expect(updated.selectedTitleId).toBe('action_talk_1');
    });

    it('should allow setting to null', () => {
      const state: AchievementState = {
        ...getInitialAchievementState(),
        selectedTitleId: 'action_talk_1',
      };
      const updated = selectTitle(state, null);

      expect(updated.selectedTitleId).toBeNull();
    });
  });

  describe('isUnlocked', () => {
    it('should return true for unlocked achievement', () => {
      const unlocked = [{ id: 'action_talk_1', unlockedAt: Date.now() }];
      expect(isUnlocked('action_talk_1', unlocked)).toBe(true);
    });

    it('should return false for locked achievement', () => {
      const unlocked = [{ id: 'action_talk_1', unlockedAt: Date.now() }];
      expect(isUnlocked('action_study_1', unlocked)).toBe(false);
    });
  });

  describe('calculateProgress', () => {
    const baseParams: GameParameters = {
      level: 5,
      xp: 50,
      intelligence: 30,
      memory: 20,
      friendliness: 60,
      energy: 80,
      mood: 50,
    };

    const baseStats: AchievementStats = {
      talkCount: 5,
      studyCount: 3,
      playCount: 2,
      restCount: 1,
      totalActions: 11,
      messagesSent: 10,
      currentLoginStreak: 2,
      maxLoginStreak: 3,
      totalPlayDays: 5,
      lastPlayDate: getTodayDateString(),
      restLimitHitDays: 0,
      todayActions: ['talk'],
      todayActionsDate: getTodayDateString(),
    };

    it('should calculate progress for action_count', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'action_talk_10')!;
      const progress = calculateProgress(achievement, baseStats, baseParams);
      expect(progress).toBe(50); // 5/10 = 50%
    });

    it('should cap progress at 100', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'action_talk_1')!;
      const progress = calculateProgress(achievement, baseStats, baseParams);
      expect(progress).toBe(100);
    });

    it('should calculate progress for stat_reach', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'stat_int_50')!;
      const progress = calculateProgress(achievement, baseStats, baseParams);
      expect(progress).toBe(60); // 30/50 = 60%
    });

    it('should calculate progress for level_reach', () => {
      const achievement = ACHIEVEMENTS.find(a => a.id === 'milestone_lv10')!;
      const progress = calculateProgress(achievement, baseStats, baseParams);
      expect(progress).toBe(50); // 5/10 = 50%
    });
  });

  describe('updateLoginStreak', () => {
    it('should increment streak if consecutive day', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const stats: AchievementStats = {
        ...getInitialAchievementState().stats,
        lastPlayDate: yesterdayStr,
        currentLoginStreak: 3,
        totalPlayDays: 10,
      };

      const updated = updateLoginStreak(stats);
      expect(updated.currentLoginStreak).toBe(4);
      expect(updated.totalPlayDays).toBe(11);
    });

    it('should reset streak if more than 1 day gap', () => {
      const stats: AchievementStats = {
        ...getInitialAchievementState().stats,
        lastPlayDate: '2020-01-01',
        currentLoginStreak: 10,
        totalPlayDays: 20,
      };

      const updated = updateLoginStreak(stats);
      expect(updated.currentLoginStreak).toBe(1);
      expect(updated.totalPlayDays).toBe(21);
    });

    it('should not change if same day', () => {
      const stats: AchievementStats = {
        ...getInitialAchievementState().stats,
        lastPlayDate: getTodayDateString(),
        currentLoginStreak: 5,
        totalPlayDays: 15,
      };

      const updated = updateLoginStreak(stats);
      expect(updated.currentLoginStreak).toBe(5);
      expect(updated.totalPlayDays).toBe(15);
    });

    it('should update maxLoginStreak if current exceeds it', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      const stats: AchievementStats = {
        ...getInitialAchievementState().stats,
        lastPlayDate: yesterdayStr,
        currentLoginStreak: 5,
        maxLoginStreak: 5,
        totalPlayDays: 10,
      };

      const updated = updateLoginStreak(stats);
      expect(updated.maxLoginStreak).toBe(6);
    });
  });
});
