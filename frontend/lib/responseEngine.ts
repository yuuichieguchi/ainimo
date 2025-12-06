import { IntelligenceTier, Message } from '@/types/game';
import { KeywordMatch } from '@/types/responses';
import { Language } from '@/hooks/useLanguage';
import { getResponseTemplates } from './responseTemplates';

export function detectKeywords(input: string, language: Language = 'en'): KeywordMatch[] {
  const lowercaseInput = input.toLowerCase();
  const matches: KeywordMatch[] = [];

  const keywordCategories = language === 'ja'
    ? [
        { keywords: ['こんにちは', 'やあ', 'おはよう', 'こんばんは'], priority: 3 },
        { keywords: ['なに', 'なぜ', 'どう', 'いつ'], priority: 2 },
        { keywords: ['遊', 'ゲーム', '楽しい'], priority: 2 },
        { keywords: ['勉強', '学', '本'], priority: 2 },
        { keywords: ['嬉しい', '好き', '楽しい'], priority: 1 },
        { keywords: ['悲しい', '疲れた', 'つらい'], priority: 1 },
      ]
    : [
        { keywords: ['hello', 'hi', 'hey'], priority: 3 },
        { keywords: ['what', 'why', 'how', 'when', 'where'], priority: 2 },
        { keywords: ['play', 'game', 'fun'], priority: 2 },
        { keywords: ['study', 'learn', 'book'], priority: 2 },
        { keywords: ['happy', 'love', 'like', 'good'], priority: 1 },
        { keywords: ['sad', 'tired', 'bad', 'angry'], priority: 1 },
      ];

  for (const category of keywordCategories) {
    for (const keyword of category.keywords) {
      if (lowercaseInput.includes(keyword)) {
        matches.push({ keyword, priority: category.priority });
      }
    }
  }

  matches.sort((a, b) => b.priority - a.priority);

  return matches;
}

export function selectTemplate(
  tier: IntelligenceTier,
  keywords: KeywordMatch[],
  memory: number,
  language: Language = 'en'
): string {
  const templates = getResponseTemplates(language)[tier];

  if (keywords.length > 0) {
    const topKeyword = keywords[0].keyword;
    for (const template of templates) {
      if (template.keywords.includes(topKeyword)) {
        const randomIndex = Math.floor(Math.random() * template.responses.length);
        return template.responses[randomIndex];
      }
    }
  }

  const defaultTemplates = templates.filter((t) => t.keywords.length === 0);
  if (defaultTemplates.length > 0) {
    const template = defaultTemplates[0];
    const memoryVariety = Math.min(template.responses.length, Math.floor(memory / 20) + 1);
    const randomIndex = Math.floor(Math.random() * memoryVariety);
    return template.responses[randomIndex];
  }

  return 'Hmm...';
}

export function applyMoodModifier(response: string, mood: number): string {
  if (mood >= 80) {
    const enthusiasticEndings = ['!', '!!'];
    const randomEnding =
      enthusiasticEndings[Math.floor(Math.random() * enthusiasticEndings.length)];
    if (!response.endsWith('!') && !response.endsWith('?')) {
      return response + randomEnding;
    }
  }

  if (mood < 30) {
    return response.replace(/!/g, '.').replace(/!!/g, '...');
  }

  return response;
}

export function generateResponse(
  userInput: string,
  tier: IntelligenceTier,
  mood: number,
  memory: number,
  recentMessages?: Message[],
  language: Language = 'en'
): string {
  const keywords = detectKeywords(userInput, language);
  let response = selectTemplate(tier, keywords, memory, language);

  response = applyMoodModifier(response, mood);

  if (tier === 'adult' && recentMessages && recentMessages.length > 0) {
    const userMessages = recentMessages.filter((m) => m.speaker === 'user');
    if (userMessages.length >= 2) {
      const lastUserKeywords = detectKeywords(userMessages[userMessages.length - 1].text, language);
      const currentKeywords = detectKeywords(userInput, language);

      if (lastUserKeywords.length > 0 && currentKeywords.length > 0) {
        const commonKeyword = lastUserKeywords.find((lk) =>
          currentKeywords.some((ck) => ck.keyword === lk.keyword)
        );
        if (commonKeyword && Math.random() > 0.5) {
          const prefix = language === 'ja'
            ? `さっき「${commonKeyword.keyword}」って言ってましたよね！`
            : `You mentioned ${commonKeyword.keyword} before!`;
          response = `${prefix} ${response}`;
        }
      }
    }
  }

  return response;
}
