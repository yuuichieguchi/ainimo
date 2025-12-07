import { Item, ItemCategory, ItemRarity, PlayerInventory, EquippedItems } from '@/types/item';

// レアリティごとのドロップ重み
export const RARITY_DROP_WEIGHTS: Record<ItemRarity, number> = {
  common: 60,
  rare: 25,
  epic: 12,
  legendary: 3,
};

// 全アイテム定義（18アイテム）
export const ALL_ITEMS: Item[] = [
  // 帽子（6種）
  {
    id: 'hat_ribbon',
    name: { en: 'Red Ribbon', ja: '赤リボン' },
    description: { en: 'A cute red ribbon', ja: 'かわいい赤いリボン' },
    category: 'hat',
    rarity: 'common',
    icon: '🎀',
    dropWeight: 60,
  },
  {
    id: 'hat_cap',
    name: { en: 'Baseball Cap', ja: 'ベースボールキャップ' },
    description: { en: 'A sporty cap', ja: 'スポーティなキャップ' },
    category: 'hat',
    rarity: 'common',
    icon: '🧢',
    dropWeight: 60,
  },
  {
    id: 'hat_flower',
    name: { en: 'Flower Crown', ja: '花冠' },
    description: { en: 'A beautiful flower crown', ja: '美しい花の冠' },
    category: 'hat',
    rarity: 'rare',
    icon: '💐',
    dropWeight: 25,
  },
  {
    id: 'hat_wizard',
    name: { en: 'Wizard Hat', ja: '魔法使いの帽子' },
    description: { en: 'A mystical wizard hat', ja: '神秘的な魔法使いの帽子' },
    category: 'hat',
    rarity: 'rare',
    icon: '🎩',
    dropWeight: 25,
  },
  {
    id: 'hat_tiara',
    name: { en: 'Crystal Tiara', ja: 'クリスタルティアラ' },
    description: { en: 'A sparkling tiara', ja: 'キラキラ輝くティアラ' },
    category: 'hat',
    rarity: 'epic',
    icon: '👑',
    dropWeight: 12,
  },
  {
    id: 'hat_halo',
    name: { en: 'Golden Halo', ja: '黄金の輪' },
    description: { en: 'A divine golden halo', ja: '神聖な黄金の輪' },
    category: 'hat',
    rarity: 'legendary',
    icon: '😇',
    dropWeight: 3,
  },

  // アクセサリー（6種）
  {
    id: 'acc_bowtie',
    name: { en: 'Bow Tie', ja: '蝶ネクタイ' },
    description: { en: 'A fancy bow tie', ja: 'おしゃれな蝶ネクタイ' },
    category: 'accessory',
    rarity: 'common',
    icon: '🎗️',
    dropWeight: 60,
  },
  {
    id: 'acc_glasses',
    name: { en: 'Round Glasses', ja: '丸メガネ' },
    description: { en: 'Scholarly round glasses', ja: '知的な丸メガネ' },
    category: 'accessory',
    rarity: 'common',
    icon: '👓',
    dropWeight: 60,
  },
  {
    id: 'acc_scarf',
    name: { en: 'Cozy Scarf', ja: 'あったかマフラー' },
    description: { en: 'A warm and cozy scarf', ja: '暖かくて心地よいマフラー' },
    category: 'accessory',
    rarity: 'rare',
    icon: '🧣',
    dropWeight: 25,
  },
  {
    id: 'acc_necklace',
    name: { en: 'Pearl Necklace', ja: 'パールネックレス' },
    description: { en: 'An elegant pearl necklace', ja: 'エレガントなパールネックレス' },
    category: 'accessory',
    rarity: 'rare',
    icon: '📿',
    dropWeight: 25,
  },
  {
    id: 'acc_wings',
    name: { en: 'Fairy Wings', ja: '妖精の羽' },
    description: { en: 'Magical fairy wings', ja: '魔法の妖精の羽' },
    category: 'accessory',
    rarity: 'epic',
    icon: '🧚',
    dropWeight: 12,
  },
  {
    id: 'acc_aura',
    name: { en: 'Rainbow Aura', ja: 'レインボーオーラ' },
    description: { en: 'A mystical rainbow aura', ja: '神秘的な虹色のオーラ' },
    category: 'accessory',
    rarity: 'legendary',
    icon: '🌈',
    dropWeight: 3,
  },

  // 背景（6種）
  {
    id: 'bg_meadow',
    name: { en: 'Green Meadow', ja: '緑の草原' },
    description: { en: 'A peaceful green meadow', ja: '穏やかな緑の草原' },
    category: 'background',
    rarity: 'common',
    icon: '🌿',
    dropWeight: 60,
  },
  {
    id: 'bg_beach',
    name: { en: 'Sunny Beach', ja: '晴れたビーチ' },
    description: { en: 'A sunny beach with waves', ja: '波打つ晴れたビーチ' },
    category: 'background',
    rarity: 'common',
    icon: '🏖️',
    dropWeight: 60,
  },
  {
    id: 'bg_forest',
    name: { en: 'Enchanted Forest', ja: '魔法の森' },
    description: { en: 'A mystical forest', ja: '神秘的な森' },
    category: 'background',
    rarity: 'rare',
    icon: '🌲',
    dropWeight: 25,
  },
  {
    id: 'bg_mountain',
    name: { en: 'Mountain Peak', ja: '山頂' },
    description: { en: 'A majestic mountain peak', ja: '雄大な山頂' },
    category: 'background',
    rarity: 'rare',
    icon: '🏔️',
    dropWeight: 25,
  },
  {
    id: 'bg_aurora',
    name: { en: 'Aurora Sky', ja: 'オーロラの空' },
    description: { en: 'A beautiful aurora sky', ja: '美しいオーロラの空' },
    category: 'background',
    rarity: 'epic',
    icon: '🌌',
    dropWeight: 12,
  },
  {
    id: 'bg_galaxy',
    name: { en: 'Cosmic Galaxy', ja: '宇宙銀河' },
    description: { en: 'The vast cosmic galaxy', ja: '広大な宇宙銀河' },
    category: 'background',
    rarity: 'legendary',
    icon: '✨',
    dropWeight: 3,
  },
];

// アイテムをIDで取得
export function getItemById(id: string): Item | undefined {
  return ALL_ITEMS.find((item) => item.id === id);
}

// カテゴリでアイテムをフィルタ
export function getItemsByCategory(category: ItemCategory): Item[] {
  return ALL_ITEMS.filter((item) => item.category === category);
}

// レアリティでアイテムをフィルタ
export function getItemsByRarity(rarity: ItemRarity): Item[] {
  return ALL_ITEMS.filter((item) => item.rarity === rarity);
}

// 初期装備状態
export function getInitialEquippedItems(): EquippedItems {
  return {
    hat: null,
    accessory: null,
    background: null,
  };
}

// 初期インベントリ
export function getInitialInventory(): PlayerInventory {
  return {
    coins: 0,
    items: [],
    equipped: getInitialEquippedItems(),
  };
}

// ドロップ可能なアイテム一覧（重み付き）
export function getDroppableItems(): Item[] {
  return ALL_ITEMS.filter((item) => item.dropWeight > 0);
}
