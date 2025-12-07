// アイテムカテゴリ
export type ItemCategory = 'hat' | 'accessory' | 'background';

// アイテムレアリティ
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary';

// アイテム定義
export interface Item {
  id: string;
  name: { en: string; ja: string };
  description: { en: string; ja: string };
  category: ItemCategory;
  rarity: ItemRarity;
  icon: string;
  dropWeight: number;
}

// インベントリ内アイテム
export interface InventoryItem {
  itemId: string;
  acquiredAt: number;
}

// 装備中アイテム
export interface EquippedItems {
  hat: string | null;
  accessory: string | null;
  background: string | null;
}

// プレイヤーインベントリ
export interface PlayerInventory {
  coins: number;
  items: InventoryItem[];
  equipped: EquippedItems;
}

// レアリティ別価格
export const RARITY_PRICES: Record<ItemRarity, number> = {
  common: 50,
  rare: 150,
  epic: 400,
  legendary: 1000,
};

// レアリティカラー（UI用）
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
};

// レアリティ名
export const RARITY_NAMES: Record<ItemRarity, { en: string; ja: string }> = {
  common: { en: 'Common', ja: 'コモン' },
  rare: { en: 'Rare', ja: 'レア' },
  epic: { en: 'Epic', ja: 'エピック' },
  legendary: { en: 'Legendary', ja: 'レジェンダリー' },
};

// カテゴリ名
export const CATEGORY_NAMES: Record<ItemCategory, { en: string; ja: string }> = {
  hat: { en: 'Hat', ja: '帽子' },
  accessory: { en: 'Accessory', ja: 'アクセサリー' },
  background: { en: 'Background', ja: '背景' },
};
