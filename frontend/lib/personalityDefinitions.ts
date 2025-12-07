/**
 * Personality System Constants and Definitions
 *
 * Contains all constant values for the personality branching system including:
 * - Personality thresholds and limits
 * - Action-to-affinity mappings
 * - Visual effects configurations
 * - Conversation style definitions
 */

import { ActionType } from '@/types/game';
import {
  PersonalityType,
  AffinityKey,
  StatModifiers,
  PersonalityVisuals,
  ConversationStyle,
  PersonalityDefinition,
  ActionAffinityWeights,
} from '@/types/personality';

// =============================================================================
// System Constants
// =============================================================================

/** Minimum total actions before personality can manifest */
export const MIN_ACTIONS_FOR_PERSONALITY = 50;

/** Minimum affinity percentage to be considered dominant (35%) */
export const PERSONALITY_THRESHOLD = 35;

/** If no type exceeds this threshold, personality is 'harmonious' */
export const BALANCED_THRESHOLD = 30;

/** Total actions needed before personality can start locking */
export const LOCK_THRESHOLD_ACTIONS = 200;

/** Minimum strength for personality to lock */
export const LOCK_THRESHOLD_STRENGTH = 80;

/** Maximum resistance value (90% = personality is 90% resistant to change) */
export const MAX_RESISTANCE = 90;

// =============================================================================
// Action to Affinity Mapping
// =============================================================================

/**
 * Maps each action type to affinity point contributions
 * Higher values mean stronger contribution to that personality type
 */
export const ACTION_AFFINITY_WEIGHTS: Record<ActionType, ActionAffinityWeights> = {
  study: { scholar: 3, social: 0, playful: 0, zen: 1 },
  talk: { scholar: 1, social: 3, playful: 1, zen: 0 },
  play: { scholar: 0, social: 1, playful: 3, zen: 0 },
  rest: { scholar: 1, social: 0, playful: 0, zen: 3 },
};

/**
 * Maps affinity keys to their primary action type
 */
export const AFFINITY_TO_ACTION: Record<AffinityKey, ActionType> = {
  scholar: 'study',
  social: 'talk',
  playful: 'play',
  zen: 'rest',
};

// =============================================================================
// Stat Modifiers
// =============================================================================

/**
 * Stat modifiers for each personality type
 * Values are multipliers: 1.0 = no change, 1.2 = +20%
 */
export const PERSONALITY_MODIFIERS: Record<PersonalityType, StatModifiers> = {
  scholar: {
    intelligence: 1.20, // +20% primary
    memory: 1.10,       // +10% secondary
    friendliness: 1.00,
    energy: 0.95,       // -5% (tires from thinking)
    xp: 1.05,
  },
  social: {
    intelligence: 1.00,
    memory: 1.10,       // +10% (remembers conversations)
    friendliness: 1.20, // +20% primary
    energy: 1.00,
    xp: 1.05,
  },
  playful: {
    intelligence: 0.95, // -5%
    memory: 1.00,
    friendliness: 1.10, // +10%
    energy: 1.10,       // +10% (high energy)
    xp: 1.20,           // +20% primary (learns through play)
  },
  zen: {
    intelligence: 1.05,
    memory: 1.05,
    friendliness: 1.05,
    energy: 1.20,       // +20% primary (restores well)
    xp: 1.00,
  },
  harmonious: {
    intelligence: 1.08, // +8% to all
    memory: 1.08,
    friendliness: 1.08,
    energy: 1.08,
    xp: 1.08,
  },
  none: {
    intelligence: 1.00,
    memory: 1.00,
    friendliness: 1.00,
    energy: 1.00,
    xp: 1.00,
  },
};

// =============================================================================
// Visual Effects
// =============================================================================

/**
 * CSS visual configurations for each personality type
 */
export const PERSONALITY_VISUALS: Record<PersonalityType, PersonalityVisuals> = {
  scholar: {
    primaryColor: '#4f46e5',    // Indigo
    auraColor: 'rgba(79, 70, 229, 0.35)',
    filter: 'hue-rotate(-10deg) saturate(1.1)',
    backgroundGradient: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)',
  },
  social: {
    primaryColor: '#ec4899',    // Pink
    auraColor: 'rgba(236, 72, 153, 0.35)',
    filter: 'hue-rotate(330deg) saturate(1.2)',
    backgroundGradient: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
  },
  playful: {
    primaryColor: '#f59e0b',    // Amber
    auraColor: 'rgba(245, 158, 11, 0.35)',
    filter: 'brightness(1.1) saturate(1.3)',
    backgroundGradient: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%)',
  },
  zen: {
    primaryColor: '#10b981',    // Emerald
    auraColor: 'rgba(16, 185, 129, 0.35)',
    filter: 'hue-rotate(120deg) saturate(0.9) brightness(1.05)',
    backgroundGradient: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
  },
  harmonious: {
    primaryColor: '#8b5cf6',    // Violet
    auraColor: 'rgba(139, 92, 246, 0.30)',
    filter: 'saturate(1.1)',
    backgroundGradient: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
  },
  none: {
    primaryColor: '#9ca3af',    // Gray
    auraColor: 'transparent',
    filter: 'none',
    backgroundGradient: 'none',
  },
};

// =============================================================================
// Conversation Styles
// =============================================================================

/**
 * Conversation style modifiers for each personality
 */
export const PERSONALITY_CONVERSATION_STYLES: Record<PersonalityType, ConversationStyle> = {
  scholar: {
    prefixes: {
      en: ['Hmm, let me think...', 'Fascinating!', 'I\'ve been pondering...', 'According to my studies...'],
      ja: ['ふむ、考えさせて...', '興味深いですね！', '考えていたのですが...', '私の研究によると...'],
    },
    suffixes: {
      en: ['...quite intriguing, isn\'t it?', '...I wonder why that is?', '...there\'s always more to learn!'],
      ja: ['...面白いですね？', '...なぜでしょうね？', '...まだまだ学ぶことがありますね！'],
    },
    expressions: {
      en: ['Eureka!', 'How curious!', 'Knowledge is power!'],
      ja: ['ユリイカ！', 'なんと興味深い！', '知識は力なり！'],
    },
  },
  social: {
    prefixes: {
      en: ['OMG!', 'Guess what!', 'So like...', 'Hey hey!'],
      ja: ['わー！', 'ねえねえ！', 'あのね...', 'きいてきいて！'],
    },
    suffixes: {
      en: ['...right?!', '...isn\'t that awesome?', '...tell me about YOU!', '...let\'s chat more!'],
      ja: ['...でしょ？！', '...すごくない？', '...あなたのことも聞かせて！', '...もっとお話しよう！'],
    },
    expressions: {
      en: ['You\'re the best!', 'I love talking with you!', 'Friends forever!'],
      ja: ['あなた最高！', '話すの楽しい！', 'ずっと友達だよ！'],
    },
  },
  playful: {
    prefixes: {
      en: ['Wheee!', 'Hehe~', 'Yay!', 'Let\'s go!'],
      ja: ['わーい！', 'えへへ～', 'やったー！', 'いこいこ！'],
    },
    suffixes: {
      en: ['...super fun!', '...hehe, silly~', '...wanna play?', '...so exciting!'],
      ja: ['...超たのしい！', '...えへへ、おバカさん～', '...遊ぼ？', '...ワクワク！'],
    },
    expressions: {
      en: ['Boing boing!', 'Woohoo!', 'Adventure awaits!'],
      ja: ['ぴょんぴょん！', 'ウッホーイ！', '冒険だ！'],
    },
  },
  zen: {
    prefixes: {
      en: ['Hmm...', '*breathes deeply*', 'Peace...', 'All is well...'],
      ja: ['ふむ...', '*深呼吸*', '平和...', 'すべてよし...'],
    },
    suffixes: {
      en: ['...such is life.', '...breathe in, breathe out.', '...find your center.', '...namaste.'],
      ja: ['...それが人生だね。', '...吸って、吐いて。', '...心を落ち着けて。', '...ナマステ。'],
    },
    expressions: {
      en: ['Om...', 'Tranquility.', 'The present moment is a gift.'],
      ja: ['オーム...', '静寂。', '今この瞬間は贈り物。'],
    },
  },
  harmonious: {
    prefixes: {
      en: ['I think...', 'Well...', 'You know...', 'Hmm...'],
      ja: ['思うに...', 'えっと...', 'あのね...', 'ふむ...'],
    },
    suffixes: {
      en: ['...balance is key.', '...everything has its place.', '...life is good!'],
      ja: ['...バランスが大事だね。', '...すべてはあるべき場所に。', '...人生は素晴らしい！'],
    },
    expressions: {
      en: ['Balance in all things.', 'Variety is the spice of life!', 'A little bit of everything!'],
      ja: ['すべてにバランスを。', '多様性は人生のスパイス！', '何事もほどほどに！'],
    },
  },
  none: {
    prefixes: {
      en: ['', '', '', ''],
      ja: ['', '', '', ''],
    },
    suffixes: {
      en: ['', '', '', ''],
      ja: ['', '', '', ''],
    },
    expressions: {
      en: ['', '', ''],
      ja: ['', '', ''],
    },
  },
};

// =============================================================================
// Personality Definitions (Complete)
// =============================================================================

/**
 * Icons for each personality type
 */
export const PERSONALITY_ICONS: Record<PersonalityType, string> = {
  scholar: '📚',
  social: '💬',
  playful: '🎮',
  zen: '🧘',
  harmonious: '⚖️',
  none: '❓',
};

/**
 * Complete definitions for all personality types
 */
export const PERSONALITY_DEFINITIONS: Record<PersonalityType, PersonalityDefinition> = {
  scholar: {
    type: 'scholar',
    name: { en: 'Scholar', ja: '学者' },
    description: {
      en: 'Intellectual and curious, loves learning new things',
      ja: '知的で好奇心旺盛、新しいことを学ぶのが大好き',
    },
    icon: PERSONALITY_ICONS.scholar,
    modifiers: PERSONALITY_MODIFIERS.scholar,
    visuals: PERSONALITY_VISUALS.scholar,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.scholar,
  },
  social: {
    type: 'social',
    name: { en: 'Social Butterfly', ja: 'ソーシャル' },
    description: {
      en: 'Friendly and talkative, loves interaction and making connections',
      ja: '社交的でおしゃべり、交流やつながりを作るのが大好き',
    },
    icon: PERSONALITY_ICONS.social,
    modifiers: PERSONALITY_MODIFIERS.social,
    visuals: PERSONALITY_VISUALS.social,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.social,
  },
  playful: {
    type: 'playful',
    name: { en: 'Playful Spirit', ja: '遊び人' },
    description: {
      en: 'Energetic and fun-loving, always ready for adventure',
      ja: '元気いっぱいで楽しいことが大好き、いつでも冒険の準備万端',
    },
    icon: PERSONALITY_ICONS.playful,
    modifiers: PERSONALITY_MODIFIERS.playful,
    visuals: PERSONALITY_VISUALS.playful,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.playful,
  },
  zen: {
    type: 'zen',
    name: { en: 'Zen Master', ja: '禅マスター' },
    description: {
      en: 'Calm and balanced, values rest and inner peace',
      ja: '穏やかでバランスが良く、休息と内なる平和を大切にする',
    },
    icon: PERSONALITY_ICONS.zen,
    modifiers: PERSONALITY_MODIFIERS.zen,
    visuals: PERSONALITY_VISUALS.zen,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.zen,
  },
  harmonious: {
    type: 'harmonious',
    name: { en: 'Harmonious', ja: 'ハーモニー' },
    description: {
      en: 'Well-rounded and adaptable, finds balance in everything',
      ja: 'バランスが取れていて適応力が高く、すべてに調和を見出す',
    },
    icon: PERSONALITY_ICONS.harmonious,
    modifiers: PERSONALITY_MODIFIERS.harmonious,
    visuals: PERSONALITY_VISUALS.harmonious,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.harmonious,
  },
  none: {
    type: 'none',
    name: { en: 'Developing', ja: '発達中' },
    description: {
      en: 'Personality is still developing...',
      ja: '性格はまだ発達中...',
    },
    icon: PERSONALITY_ICONS.none,
    modifiers: PERSONALITY_MODIFIERS.none,
    visuals: PERSONALITY_VISUALS.none,
    conversationStyle: PERSONALITY_CONVERSATION_STYLES.none,
  },
};

/**
 * All personality types excluding 'none' (for iteration/display)
 */
export const ACTIVE_PERSONALITY_TYPES: PersonalityType[] = [
  'scholar',
  'social',
  'playful',
  'zen',
  'harmonious',
];

/**
 * Affinity keys (personality types that can be accumulated)
 */
export const AFFINITY_KEYS: AffinityKey[] = ['scholar', 'social', 'playful', 'zen'];
