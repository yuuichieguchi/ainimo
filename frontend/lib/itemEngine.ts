import {
  Item,
  ItemCategory,
  ItemRarity,
  InventoryItem,
  PlayerInventory,
  EquippedItems,
} from '@/types/item';
import { getItemById, getInitialInventory, ALL_ITEMS } from './itemDefinitions';

// アイテムをインベントリに追加
export function addItemToInventory(
  inventory: PlayerInventory,
  itemId: string
): PlayerInventory {
  const item = getItemById(itemId);
  if (!item) return inventory;

  const newItem: InventoryItem = {
    itemId,
    acquiredAt: Date.now(),
  };

  return {
    ...inventory,
    items: [...inventory.items, newItem],
  };
}

// コインを追加
export function addCoins(inventory: PlayerInventory, amount: number): PlayerInventory {
  if (amount <= 0) return inventory;

  return {
    ...inventory,
    coins: inventory.coins + amount,
  };
}

// コインを使用
export function spendCoins(
  inventory: PlayerInventory,
  amount: number
): PlayerInventory | null {
  if (amount <= 0) return inventory;
  if (inventory.coins < amount) return null;

  return {
    ...inventory,
    coins: inventory.coins - amount,
  };
}

// アイテムを装備
export function equipItem(
  inventory: PlayerInventory,
  itemId: string
): PlayerInventory | null {
  // アイテムを持っているかチェック
  const hasItem = inventory.items.some((item) => item.itemId === itemId);
  if (!hasItem) return null;

  // アイテム情報を取得
  const item = getItemById(itemId);
  if (!item) return null;

  // 装備スロットを更新
  return {
    ...inventory,
    equipped: {
      ...inventory.equipped,
      [item.category]: itemId,
    },
  };
}

// アイテムを外す
export function unequipItem(
  inventory: PlayerInventory,
  category: ItemCategory
): PlayerInventory {
  return {
    ...inventory,
    equipped: {
      ...inventory.equipped,
      [category]: null,
    },
  };
}

// アイテムを持っているかチェック
export function hasItem(inventory: PlayerInventory, itemId: string): boolean {
  return inventory.items.some((item) => item.itemId === itemId);
}

// 装備中アイテムを取得
export function getEquippedItem(
  inventory: PlayerInventory,
  category: ItemCategory
): Item | null {
  const itemId = inventory.equipped[category];
  if (!itemId) return null;
  return getItemById(itemId) || null;
}

// カテゴリでアイテムをフィルタ
export function getInventoryItemsByCategory(
  inventory: PlayerInventory,
  category: ItemCategory
): Item[] {
  return inventory.items
    .map((invItem) => getItemById(invItem.itemId))
    .filter((item): item is Item => item !== undefined && item.category === category);
}

// 所持アイテムをレアリティ別にカウント
export function countItemsByRarity(
  inventory: PlayerInventory
): Record<ItemRarity, number> {
  const counts: Record<ItemRarity, number> = {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const invItem of inventory.items) {
    const item = getItemById(invItem.itemId);
    if (item) {
      counts[item.rarity]++;
    }
  }

  return counts;
}

// ユニークアイテム数をカウント
export function countUniqueItems(inventory: PlayerInventory): number {
  const uniqueIds = new Set(inventory.items.map((item) => item.itemId));
  return uniqueIds.size;
}

// 全アイテム数をカウント
export function countTotalItems(inventory: PlayerInventory): number {
  return inventory.items.length;
}

// コレクション進捗を計算（全アイテムのうち何種類持っているか）
export function calculateCollectionProgress(inventory: PlayerInventory): {
  collected: number;
  total: number;
  percentage: number;
} {
  const uniqueIds = new Set(inventory.items.map((item) => item.itemId));
  const collected = uniqueIds.size;
  const total = ALL_ITEMS.length;
  const percentage = Math.round((collected / total) * 100);

  return { collected, total, percentage };
}

// 装備スロットが全て埋まっているかチェック
export function isFullyEquipped(inventory: PlayerInventory): boolean {
  return (
    inventory.equipped.hat !== null &&
    inventory.equipped.accessory !== null &&
    inventory.equipped.background !== null
  );
}

// インベントリバリデーション
export function isValidInventory(data: unknown): data is PlayerInventory {
  if (!data || typeof data !== 'object') return false;

  const inv = data as Partial<PlayerInventory>;

  if (typeof inv.coins !== 'number' || inv.coins < 0) return false;
  if (!Array.isArray(inv.items)) return false;
  if (!inv.equipped || typeof inv.equipped !== 'object') return false;

  const equipped = inv.equipped as Partial<EquippedItems>;
  if (
    equipped.hat !== null && typeof equipped.hat !== 'string' ||
    equipped.accessory !== null && typeof equipped.accessory !== 'string' ||
    equipped.background !== null && typeof equipped.background !== 'string'
  ) {
    return false;
  }

  return true;
}

// インベントリマイグレーション
export function migrateInventory(data: unknown): PlayerInventory {
  if (isValidInventory(data)) {
    return data;
  }
  return getInitialInventory();
}
