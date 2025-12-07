/**
 * Personality System Type Definitions
 *
 * Defines types for the personality branching system that develops
 * based on player actions and affects pet behavior/appearance.
 */

/**
 * Available personality types that a pet can develop
 * - scholar: 学者 - intellectual, loves learning
 * - social: ソーシャル - friendly, loves interaction
 * - playful: 遊び人 - energetic, fun-loving
 * - zen: 禅マスター - calm, values rest and peace
 * - harmonious: ハーモニー - well-rounded, balanced
 * - none: まだ発現していない (before minimum actions)
 */
export type PersonalityType = 'scholar' | 'social' | 'playful' | 'zen' | 'harmonious' | 'none';

/**
 * Keys for affinity tracking (excludes 'harmonious' and 'none' as they are derived)
 */
export type AffinityKey = 'scholar' | 'social' | 'playful' | 'zen';

/**
 * Raw affinity points accumulated from actions
 * Each action type contributes to specific affinity types
 */
export interface AffinityPoints {
  scholar: number;   // Increased by study actions
  social: number;    // Increased by talk actions
  playful: number;   // Increased by play actions
  zen: number;       // Increased by rest actions
}

/**
 * Normalized affinity scores as percentages (0-100)
 * Used for determining dominant personality
 */
export interface AffinityScores {
  scholar: number;
  social: number;
  playful: number;
  zen: number;
}

/**
 * Persistent personality data stored in GameState
 */
export interface PersonalityData {
  /** Raw accumulated affinity points from actions */
  affinityPoints: AffinityPoints;

  /** Total number of actions performed (study + talk + play + rest) */
  totalActions: number;

  /** Locked personality type (null if not yet locked) */
  lockedType: PersonalityType | null;

  /** Timestamp when personality was locked (null if not locked) */
  lockedAt: number | null;
}

/**
 * Stat growth modifiers applied based on personality
 * Values are multipliers (1.0 = no change, 1.2 = +20%)
 */
export interface StatModifiers {
  intelligence: number;  // Applied to intelligence gains
  memory: number;        // Applied to memory gains
  friendliness: number;  // Applied to friendliness gains
  energy: number;        // Applied to energy recovery
  xp: number;           // Applied to XP gains
}

/**
 * Computed personality state (derived from PersonalityData)
 * This is calculated each time and not stored
 */
export interface PersonalityState {
  /** Current dominant personality type */
  type: PersonalityType;

  /** Strength of personality manifestation (0-100) */
  strength: number;

  /** Resistance to personality change (0-90) */
  resistance: number;

  /** Whether personality is locked and cannot change */
  isLocked: boolean;

  /** Current stat modifiers based on personality */
  modifiers: StatModifiers;

  /** Normalized affinity scores for display */
  affinityScores: AffinityScores;
}

/**
 * Visual configuration for personality effects
 */
export interface PersonalityVisuals {
  /** Primary accent color (hex) */
  primaryColor: string;

  /** Glow/aura color with alpha (rgba) */
  auraColor: string;

  /** CSS filter to apply to pet image */
  filter: string;

  /** Background gradient for aura effect */
  backgroundGradient: string;
}

/**
 * Conversation style modifiers for each personality
 */
export interface ConversationStyle {
  /** Prefixes to add to responses */
  prefixes: { en: string[]; ja: string[] };

  /** Suffixes to add to responses */
  suffixes: { en: string[]; ja: string[] };

  /** Characteristic expressions */
  expressions: { en: string[]; ja: string[] };
}

/**
 * Bilingual text helper type
 */
export interface BilingualPersonalityText {
  en: string;
  ja: string;
}

/**
 * Complete personality definition
 */
export interface PersonalityDefinition {
  type: PersonalityType;
  name: BilingualPersonalityText;
  description: BilingualPersonalityText;
  icon: string;
  modifiers: StatModifiers;
  visuals: PersonalityVisuals;
  conversationStyle: ConversationStyle;
}

/**
 * Action to personality affinity weight mapping
 */
export interface ActionAffinityWeights {
  scholar: number;
  social: number;
  playful: number;
  zen: number;
}
