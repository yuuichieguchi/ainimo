/**
 * Personality Engine
 *
 * Pure functions for calculating and managing pet personality.
 * Personality develops based on accumulated actions and affects
 * stats, appearance, and conversation style.
 */

import {
  PersonalityType,
  AffinityKey,
  AffinityPoints,
  AffinityScores,
  PersonalityData,
  PersonalityState,
  StatModifiers,
} from '@/types/personality';
import { ActionType } from '@/types/game';
import {
  ACTION_AFFINITY_WEIGHTS,
  PERSONALITY_MODIFIERS,
  MIN_ACTIONS_FOR_PERSONALITY,
  PERSONALITY_THRESHOLD,
  BALANCED_THRESHOLD,
  LOCK_THRESHOLD_ACTIONS,
  LOCK_THRESHOLD_STRENGTH,
  MAX_RESISTANCE,
  AFFINITY_KEYS,
} from './personalityDefinitions';

/**
 * Get initial personality data for a new pet
 */
export function getInitialPersonalityData(): PersonalityData {
  return {
    affinityPoints: {
      scholar: 0,
      social: 0,
      playful: 0,
      zen: 0,
    },
    totalActions: 0,
    lockedType: null,
    lockedAt: null,
  };
}

/**
 * Update affinity points based on an action
 * Each action contributes different amounts to each personality type
 */
export function updateAffinityPoints(
  current: AffinityPoints,
  action: ActionType
): AffinityPoints {
  const weights = ACTION_AFFINITY_WEIGHTS[action];

  return {
    scholar: current.scholar + weights.scholar,
    social: current.social + weights.social,
    playful: current.playful + weights.playful,
    zen: current.zen + weights.zen,
  };
}

/**
 * Calculate percentage scores from raw affinity points
 * Returns normalized percentages that sum to 100
 */
export function calculateAffinityScores(affinityPoints: AffinityPoints): AffinityScores {
  const total = affinityPoints.scholar + affinityPoints.social + affinityPoints.playful + affinityPoints.zen;

  if (total === 0) {
    return {
      scholar: 25,
      social: 25,
      playful: 25,
      zen: 25,
    };
  }

  return {
    scholar: (affinityPoints.scholar / total) * 100,
    social: (affinityPoints.social / total) * 100,
    playful: (affinityPoints.playful / total) * 100,
    zen: (affinityPoints.zen / total) * 100,
  };
}

/**
 * Determine the dominant personality type based on affinity scores
 * Returns 'none' if not enough actions, 'harmonious' if balanced
 */
export function determineDominantPersonality(
  scores: AffinityScores,
  totalActions: number
): PersonalityType {
  // Before minimum actions, personality is undetermined
  if (totalActions < MIN_ACTIONS_FOR_PERSONALITY) {
    return 'none';
  }

  // Find the highest scoring personality
  const entries: [AffinityKey, number][] = [
    ['scholar', scores.scholar],
    ['social', scores.social],
    ['playful', scores.playful],
    ['zen', scores.zen],
  ];

  entries.sort((a, b) => b[1] - a[1]);
  const [topType, topScore] = entries[0];

  // If top score exceeds threshold, that's the dominant personality
  if (topScore >= PERSONALITY_THRESHOLD) {
    return topType;
  }

  // If no type is clearly dominant, personality is harmonious/balanced
  return 'harmonious';
}

/**
 * Calculate the strength of the dominant personality (0-100)
 * Higher strength means more pronounced personality effects
 */
export function calculatePersonalityStrength(
  type: PersonalityType,
  scores: AffinityScores,
  totalActions: number
): number {
  if (type === 'none') {
    return 0;
  }

  if (type === 'harmonious') {
    // Harmonious strength based on how even the distribution is
    const values = [scores.scholar, scores.social, scores.playful, scores.zen];
    const mean = 25; // Perfect balance is 25% each
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    // Lower standard deviation = more balanced = higher harmonious strength
    // Max strength when stdDev is 0 (perfectly balanced)
    // Strength decreases as stdDev increases
    const baseStrength = Math.max(0, 100 - stdDev * 5);

    // Action bonus: more actions = more established
    const actionBonus = Math.min(20, (totalActions - MIN_ACTIONS_FOR_PERSONALITY) / 10);

    return Math.min(100, Math.max(0, baseStrength + actionBonus));
  }

  // For specific personality types
  const dominantScore = scores[type as AffinityKey] || 0;

  // Base strength from score: threshold (35%) = 50 strength, 50% = 75, 65%+ = 100
  const scoreAboveThreshold = dominantScore - PERSONALITY_THRESHOLD;
  const baseStrength = 50 + (scoreAboveThreshold / 30) * 50;

  // Action bonus: more actions = more established personality
  const actionBonus = Math.min(20, (totalActions - MIN_ACTIONS_FOR_PERSONALITY) / 10);

  return Math.min(100, Math.max(0, baseStrength + actionBonus));
}

/**
 * Calculate resistance to personality change (0-90)
 * High resistance means personality is harder to shift
 */
export function calculatePersonalityResistance(
  totalActions: number,
  strength: number
): number {
  // Must meet both thresholds to have any resistance
  if (totalActions < LOCK_THRESHOLD_ACTIONS) {
    return 0;
  }

  if (strength < LOCK_THRESHOLD_STRENGTH) {
    return 0;
  }

  // Calculate resistance based on how far above thresholds
  const actionFactor = Math.min(1, (totalActions - LOCK_THRESHOLD_ACTIONS) / 300);
  const strengthFactor = (strength - LOCK_THRESHOLD_STRENGTH) / 20;

  const resistance = actionFactor * strengthFactor * MAX_RESISTANCE;

  return Math.min(MAX_RESISTANCE, Math.max(0, resistance));
}

/**
 * Check if personality should be locked (cannot change)
 * Locks when both thresholds are well exceeded
 */
export function shouldLockPersonality(
  totalActions: number,
  strength: number
): boolean {
  // Lock when actions are well above threshold and strength is very high
  if (totalActions < LOCK_THRESHOLD_ACTIONS) {
    return false;
  }
  if (strength < LOCK_THRESHOLD_STRENGTH) {
    return false;
  }

  // Calculate how far above thresholds we are
  const actionExcess = totalActions - LOCK_THRESHOLD_ACTIONS;
  const strengthExcess = strength - LOCK_THRESHOLD_STRENGTH;

  // Lock when significantly above both thresholds
  // 300+ extra actions AND 10+ extra strength points
  return actionExcess >= 200 && strengthExcess >= 10;
}

/**
 * Get stat modifiers for a personality type
 */
export function getStatModifiers(personalityType: PersonalityType): StatModifiers {
  return PERSONALITY_MODIFIERS[personalityType];
}

/**
 * Apply a personality modifier to a base stat value
 * Modifier effect scales with personality strength
 */
export function applyPersonalityModifier(
  baseValue: number,
  modifier: number,
  strength: number
): number {
  if (strength === 0) {
    return baseValue;
  }

  // Calculate the bonus/penalty from the modifier
  const modifierEffect = modifier - 1; // e.g., 1.20 becomes 0.20

  // Scale the effect by strength (0-100 becomes 0-1)
  const scaledEffect = modifierEffect * (strength / 100);

  // Apply scaled modifier
  const effectiveModifier = 1 + scaledEffect;

  return baseValue * effectiveModifier;
}

/**
 * Compute the full personality state from stored data
 */
export function computePersonalityState(data: PersonalityData): PersonalityState {
  // If personality is locked, use the locked type
  if (data.lockedType && data.lockedType !== 'none') {
    const scores = calculateAffinityScores(data.affinityPoints);
    const modifiers = getStatModifiers(data.lockedType);

    // Locked personalities have max strength and resistance
    return {
      type: data.lockedType,
      strength: 100,
      resistance: MAX_RESISTANCE,
      isLocked: true,
      modifiers,
      affinityScores: scores,
    };
  }

  // Calculate current state
  const scores = calculateAffinityScores(data.affinityPoints);
  const type = determineDominantPersonality(scores, data.totalActions);
  const strength = calculatePersonalityStrength(type, scores, data.totalActions);
  const resistance = calculatePersonalityResistance(data.totalActions, strength);
  const modifiers = getStatModifiers(type);
  const isLocked = shouldLockPersonality(data.totalActions, strength);

  return {
    type,
    strength,
    resistance,
    isLocked,
    modifiers,
    affinityScores: scores,
  };
}

/**
 * Process an action and update personality data
 * This is the main function called when a pet performs an action
 */
export function processPersonalityAction(
  data: PersonalityData,
  action: ActionType
): PersonalityData {
  // Update affinity points
  const newAffinityPoints = updateAffinityPoints(data.affinityPoints, action);
  const newTotalActions = data.totalActions + 1;

  // Create new data object
  let newData: PersonalityData = {
    ...data,
    affinityPoints: newAffinityPoints,
    totalActions: newTotalActions,
  };

  // Check if personality should be locked
  if (!data.lockedType) {
    const state = computePersonalityState(newData);

    if (state.isLocked && state.type !== 'none') {
      newData = {
        ...newData,
        lockedType: state.type,
        lockedAt: Date.now(),
      };
    }
  }

  return newData;
}

/**
 * Get the affinity key that corresponds to an action type
 */
export function getAffinityKeyForAction(action: ActionType): AffinityKey | null {
  const mapping: Record<ActionType, AffinityKey> = {
    study: 'scholar',
    talk: 'social',
    play: 'playful',
    rest: 'zen',
  };
  return mapping[action] || null;
}

/**
 * Calculate how many more actions needed for personality to manifest
 */
export function getActionsUntilPersonality(totalActions: number): number {
  return Math.max(0, MIN_ACTIONS_FOR_PERSONALITY - totalActions);
}

/**
 * Get display percentage for a personality type
 */
export function getPersonalityPercentage(
  type: PersonalityType,
  scores: AffinityScores
): number {
  if (type === 'none' || type === 'harmonious') {
    return 0;
  }
  return scores[type as AffinityKey] || 0;
}
