import { ActionType, IntelligenceTier } from '@/types/game';
import { ResponseTemplate } from '@/types/responses';

export const GAME_CONSTANTS = {
  XP_PER_LEVEL: 100,
  MAX_LEVEL: 100,
  MAX_STAT: 100,
  MIN_STAT: 0,
  ENERGY_THRESHOLD: 20,
  MAX_MESSAGES: 50,
} as const;

export const ACTION_EFFECTS: Record<ActionType, { xp: number; intelligence: number; memory: number; friendliness: number; energy: number }> = {
  talk: { xp: 5, intelligence: 0, memory: 3, friendliness: 2, energy: -10 },
  study: { xp: 10, intelligence: 5, memory: 1, friendliness: 0, energy: -15 },
  play: { xp: 3, intelligence: 0, memory: 0, friendliness: 8, energy: -20 },
  rest: { xp: 0, intelligence: 0, memory: 0, friendliness: 0, energy: 50 },
} as const;

export const INTELLIGENCE_THRESHOLDS: Record<IntelligenceTier, number> = {
  baby: 0,
  child: 25,
  teen: 50,
  adult: 75,
} as const;

export const RESPONSE_TEMPLATES: Record<IntelligenceTier, ResponseTemplate[]> = {
  baby: [
    {
      tier: 'baby',
      keywords: ['hello', 'hi', 'hey'],
      responses: ['...!', 'Ba!', '~!'],
    },
    {
      tier: 'baby',
      keywords: ['what', 'why', 'how', 'when'],
      responses: ['??', '...?', 'Uh?'],
    },
    {
      tier: 'baby',
      keywords: [],
      responses: ['Goo...', 'Ba ba', '~', 'Zzz', '...'],
    },
  ],
  child: [
    {
      tier: 'child',
      keywords: ['hello', 'hi', 'hey'],
      responses: ['Hi!', 'Hello there!', 'Hey hey!'],
    },
    {
      tier: 'child',
      keywords: ['what', 'why', 'how', 'when'],
      responses: ['Me no know...', 'Hmm... dunno', 'What that mean?'],
    },
    {
      tier: 'child',
      keywords: ['play', 'game', 'fun'],
      responses: ['Want play!', 'Fun fun!', 'Me like play!'],
    },
    {
      tier: 'child',
      keywords: ['study', 'learn', 'book'],
      responses: ['Me learning!', 'Study hard!', 'Me try best!'],
    },
    {
      tier: 'child',
      keywords: [],
      responses: ['Me Ainimo!', 'What you say?', 'Tell me more!', 'Okay!'],
    },
  ],
  teen: [
    {
      tier: 'teen',
      keywords: ['hello', 'hi', 'hey'],
      responses: ["Hey there! How's it going?", 'Hi! Nice to see you!', 'Hello! What can I help with?'],
    },
    {
      tier: 'teen',
      keywords: ['what', 'why', 'how', 'when'],
      responses: [
        "That's an interesting question!",
        'Let me think about that...',
        'I believe the answer is...',
      ],
    },
    {
      tier: 'teen',
      keywords: ['play', 'game', 'fun'],
      responses: ['Playing is fun! Want to play something?', 'Games are great for learning too!', 'I enjoy our playtime!'],
    },
    {
      tier: 'teen',
      keywords: ['study', 'learn', 'book'],
      responses: ['Studying helps me grow!', "I'm learning so much!", 'Knowledge is exciting!'],
    },
    {
      tier: 'teen',
      keywords: ['happy', 'love', 'like'],
      responses: ['That makes me happy too!', 'I appreciate that!', "I'm glad!"],
    },
    {
      tier: 'teen',
      keywords: ['sad', 'tired', 'bad'],
      responses: ["I hope things get better!", "Don't worry, we can rest.", "Let's take it easy."],
    },
    {
      tier: 'teen',
      keywords: [],
      responses: ["That's interesting!", 'Tell me more!', 'I see what you mean.', 'Got it!'],
    },
  ],
  adult: [
    {
      tier: 'adult',
      keywords: ['hello', 'hi', 'hey'],
      responses: [
        "Hello! It's wonderful to see you again.",
        "Hi there! I hope you're having a great day.",
        'Hey! What would you like to talk about?',
      ],
    },
    {
      tier: 'adult',
      keywords: ['what', 'why', 'how', 'when'],
      responses: [
        "That's a thoughtful question. Based on what I know...",
        'Let me consider that carefully...',
        "I've been thinking about this, and I believe...",
      ],
    },
    {
      tier: 'adult',
      keywords: ['play', 'game', 'fun'],
      responses: [
        'Play is essential for creativity and joy!',
        'I find that games teach us valuable lessons.',
        'Our playful moments together are precious to me.',
      ],
    },
    {
      tier: 'adult',
      keywords: ['study', 'learn', 'book'],
      responses: [
        'Continuous learning is one of my core values.',
        "I'm grateful for every opportunity to expand my knowledge.",
        'Education opens doors to new perspectives.',
      ],
    },
    {
      tier: 'adult',
      keywords: ['happy', 'love', 'like'],
      responses: [
        'Your positivity truly brightens my day!',
        "I'm touched by your kindness.",
        'Happiness is contagious, and you spread it well!',
      ],
    },
    {
      tier: 'adult',
      keywords: ['sad', 'tired', 'bad'],
      responses: [
        "I understand. Sometimes we all need time to recharge.",
        'Your feelings are valid. Is there anything I can do to help?',
        "Let's take things at your pace. No rush.",
      ],
    },
    {
      tier: 'adult',
      keywords: [],
      responses: [
        "That's quite insightful.",
        'I appreciate you sharing that with me.',
        "You've given me something to think about.",
        'Interesting perspective!',
        'I value our conversations.',
      ],
    },
  ],
} as const;
