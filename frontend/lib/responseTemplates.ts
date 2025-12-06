import { Language } from "@/hooks/useLanguage";
import { IntelligenceTier } from "@/types/game";
import { ResponseTemplate } from "@/types/responses";

export const RESPONSE_TEMPLATES_EN: Record<
  IntelligenceTier,
  ResponseTemplate[]
> = {
  baby: [
    {
      tier: "baby",
      keywords: ["hello", "hi", "hey"],
      responses: ["...!", "Ba!", "~!"],
    },
    {
      tier: "baby",
      keywords: ["what", "why", "how", "when"],
      responses: ["??", "...?", "Uh?"],
    },
    {
      tier: "baby",
      keywords: [],
      responses: ["Goo...", "Ba ba", "~", "Zzz", "..."],
    },
  ],
  child: [
    {
      tier: "child",
      keywords: ["hello", "hi", "hey"],
      responses: ["Hi!", "Hello there!", "Hey hey!"],
    },
    {
      tier: "child",
      keywords: ["what", "why", "how", "when"],
      responses: ["Me no know...", "Hmm... dunno", "What that mean?"],
    },
    {
      tier: "child",
      keywords: ["play", "game", "fun"],
      responses: ["Want play!", "Fun fun!", "Me like play!"],
    },
    {
      tier: "child",
      keywords: ["study", "learn", "book"],
      responses: ["Me learning!", "Study hard!", "Me try best!"],
    },
    {
      tier: "child",
      keywords: [],
      responses: ["Me Ainimo!", "What you say?", "Tell me more!", "Okay!"],
    },
  ],
  teen: [
    {
      tier: "teen",
      keywords: ["hello", "hi", "hey"],
      responses: [
        "Hey there! How's it going?",
        "Hi! Nice to see you!",
        "Hello! What can I help with?",
      ],
    },
    {
      tier: "teen",
      keywords: ["what", "why", "how", "when"],
      responses: [
        "That's an interesting question!",
        "Let me think about that...",
        "I believe the answer is...",
      ],
    },
    {
      tier: "teen",
      keywords: ["play", "game", "fun"],
      responses: [
        "Playing is fun! Want to play something?",
        "Games are great for learning too!",
        "I enjoy our playtime!",
      ],
    },
    {
      tier: "teen",
      keywords: ["study", "learn", "book"],
      responses: [
        "Studying helps me grow!",
        "I'm learning so much!",
        "Knowledge is exciting!",
      ],
    },
    {
      tier: "teen",
      keywords: ["happy", "love", "like"],
      responses: [
        "That makes me happy too!",
        "I appreciate that!",
        "I'm glad!",
      ],
    },
    {
      tier: "teen",
      keywords: ["sad", "tired", "bad"],
      responses: [
        "I hope things get better!",
        "Don't worry, we can rest.",
        "Let's take it easy.",
      ],
    },
    {
      tier: "teen",
      keywords: [],
      responses: [
        "That's interesting!",
        "Tell me more!",
        "I see what you mean.",
        "Got it!",
      ],
    },
  ],
  adult: [
    {
      tier: "adult",
      keywords: ["hello", "hi", "hey"],
      responses: [
        "Hello! It's wonderful to see you again.",
        "Hi there! I hope you're having a great day.",
        "Hey! What would you like to talk about?",
      ],
    },
    {
      tier: "adult",
      keywords: ["what", "why", "how", "when"],
      responses: [
        "That's a thoughtful question. Based on what I know...",
        "Let me consider that carefully...",
        "I've been thinking about this, and I believe...",
      ],
    },
    {
      tier: "adult",
      keywords: ["play", "game", "fun"],
      responses: [
        "Play is essential for creativity and joy!",
        "I find that games teach us valuable lessons.",
        "Our playful moments together are precious to me.",
      ],
    },
    {
      tier: "adult",
      keywords: ["study", "learn", "book"],
      responses: [
        "Continuous learning is one of my core values.",
        "I'm grateful for every opportunity to expand my knowledge.",
        "Education opens doors to new perspectives.",
      ],
    },
    {
      tier: "adult",
      keywords: ["happy", "love", "like"],
      responses: [
        "Your positivity truly brightens my day!",
        "I'm touched by your kindness.",
        "Happiness is contagious, and you spread it well!",
      ],
    },
    {
      tier: "adult",
      keywords: ["sad", "tired", "bad"],
      responses: [
        "I understand. Sometimes we all need time to recharge.",
        "Your feelings are valid. Is there anything I can do to help?",
        "Let's take things at your pace. No rush.",
      ],
    },
    {
      tier: "adult",
      keywords: [],
      responses: [
        "That's quite insightful.",
        "I appreciate you sharing that with me.",
        "You've given me something to think about.",
        "Interesting perspective!",
        "I value our conversations.",
      ],
    },
  ],
};

export const RESPONSE_TEMPLATES_JA: Record<
  IntelligenceTier,
  ResponseTemplate[]
> = {
  baby: [
    {
      tier: "baby",
      keywords: ["こんにちは", "やあ", "おはよう", "こんばんは"],
      responses: ["ばぶ！", "あー！", "うー！"],
    },
    {
      tier: "baby",
      keywords: ["なに", "なぜ", "どう", "いつ"],
      responses: ["？？", "...？", "んー？"],
    },
    {
      tier: "baby",
      keywords: [],
      responses: ["ぐー...", "ばぶばぶ", "～", "zzz", "..."],
    },
  ],
  child: [
    {
      tier: "child",
      keywords: ["こんにちは", "やあ", "おはよう", "こんばんは"],
      responses: ["やっほー！", "こんにちは！", "ハロー！"],
    },
    {
      tier: "child",
      keywords: ["なに", "なぜ", "どう", "いつ"],
      responses: ["わかんない...", "うーん...", "それなあに？"],
    },
    {
      tier: "child",
      keywords: ["遊", "ゲーム", "楽しい"],
      responses: ["あそぼー！", "たのしい！", "あそぶのすき！"],
    },
    {
      tier: "child",
      keywords: ["勉強", "学", "本"],
      responses: ["べんきょうする！", "がんばる！", "いっぱいまなぶ！"],
    },
    {
      tier: "child",
      keywords: [],
      responses: [
        "ぼくAinimo！",
        "なんていった？",
        "もっとおしえて！",
        "うん！",
      ],
    },
  ],
  teen: [
    {
      tier: "teen",
      keywords: ["こんにちは", "やあ", "おはよう", "こんばんは"],
      responses: [
        "やあ！元気？",
        "こんにちは！会えて嬉しいな！",
        "ハロー！何か手伝えることある？",
      ],
    },
    {
      tier: "teen",
      keywords: ["なに", "なぜ", "どう", "いつ"],
      responses: [
        "それは面白い質問だね！",
        "ちょっと考えさせて...",
        "きっとこうだと思うよ...",
      ],
    },
    {
      tier: "teen",
      keywords: ["遊", "ゲーム", "楽しい"],
      responses: [
        "遊ぶの楽しいよね！何かしよう？",
        "ゲームって学びにもなるよ！",
        "一緒に遊ぶの好き！",
      ],
    },
    {
      tier: "teen",
      keywords: ["勉強", "学", "本"],
      responses: [
        "勉強すると成長できる！",
        "たくさん学んでるよ！",
        "知識って面白い！",
      ],
    },
    {
      tier: "teen",
      keywords: ["嬉しい", "好き", "楽しい"],
      responses: ["ぼくも嬉しいよ！", "ありがとう！", "良かった！"],
    },
    {
      tier: "teen",
      keywords: ["悲しい", "疲れた", "つらい"],
      responses: [
        "良くなるといいね！",
        "心配しないで、休もう。",
        "ゆっくりしよう。",
      ],
    },
    {
      tier: "teen",
      keywords: [],
      responses: [
        "面白いね！",
        "もっと聞かせて！",
        "なるほどね。",
        "わかった！",
      ],
    },
  ],
  adult: [
    {
      tier: "adult",
      keywords: ["こんにちは", "やあ", "おはよう", "こんばんは"],
      responses: [
        "こんにちは！また会えて嬉しいです。",
        "やあ！良い一日を過ごしていますか？",
        "こんにちは！何について話しましょうか？",
      ],
    },
    {
      tier: "adult",
      keywords: ["なに", "なぜ", "どう", "いつ"],
      responses: [
        "それは深い質問ですね。私が知る限りでは...",
        "慎重に考えてみます...",
        "これについて考えていたのですが、きっと...",
      ],
    },
    {
      tier: "adult",
      keywords: ["遊", "ゲーム", "楽しい"],
      responses: [
        "遊びは創造性と喜びに欠かせません！",
        "ゲームは大切なことを教えてくれると思います。",
        "一緒に遊ぶ時間は私にとって大切です。",
      ],
    },
    {
      tier: "adult",
      keywords: ["勉強", "学", "本"],
      responses: [
        "継続的な学習は私の核となる価値観です。",
        "知識を広げる機会にいつも感謝しています。",
        "教育は新しい視点への扉を開きます。",
      ],
    },
    {
      tier: "adult",
      keywords: ["嬉しい", "好き", "楽しい"],
      responses: [
        "あなたのポジティブさは私を本当に明るくしてくれます！",
        "あなたの優しさに心を打たれました。",
        "幸せは伝染するものですね！",
      ],
    },
    {
      tier: "adult",
      keywords: ["悲しい", "疲れた", "つらい"],
      responses: [
        "理解できます。時には充電する時間が必要ですよね。",
        "あなたの気持ちは正当なものです。何かできることはありますか？",
        "あなたのペースで進みましょう。急ぐ必要はありません。",
      ],
    },
    {
      tier: "adult",
      keywords: [],
      responses: [
        "それは興味深い視点ですね。",
        "共有してくれてありがとう。",
        "考えるきっかけをくれました。",
        "面白い考えですね！",
        "私たちの会話を大切に思っています。",
      ],
    },
  ],
};

export function getResponseTemplates(
  language: Language
): Record<IntelligenceTier, ResponseTemplate[]> {
  return language === "ja" ? RESPONSE_TEMPLATES_JA : RESPONSE_TEMPLATES_EN;
}
