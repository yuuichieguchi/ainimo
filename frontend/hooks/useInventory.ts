'use client';

import { useState, useCallback, useMemo } from 'react';
import { Item, ItemCategory, PlayerInventory, EquippedItems } from '@/types/item';
import {
  addItemToInventory,
  addCoins,
  spendCoins,
  equipItem,
  unequipItem,
  hasItem,
  getEquippedItem,
  getInventoryItemsByCategory,
  countItemsByRarity,
  countUniqueItems,
  countTotalItems,
  calculateCollectionProgress,
  isFullyEquipped,
  purchaseItem as purchaseItemEngine,
  canPurchaseItem,
  getItemPrice,
} from '@/lib/itemEngine';
import { getInitialInventory, getItemById } from '@/lib/itemDefinitions';

interface UseInventoryReturn {
  // 状態
  inventory: PlayerInventory;
  coins: number;

  // アイテム管理
  addItem: (itemId: string) => boolean;
  addManyCoins: (amount: number) => void;
  spendManyCoins: (amount: number) => boolean;
  equip: (itemId: string) => boolean;
  unequip: (category: ItemCategory) => void;

  // ショップ
  purchaseItem: (itemId: string) => boolean;
  canPurchase: (itemId: string) => boolean;
  getPrice: (itemId: string) => number | null;

  // クエリ
  owns: (itemId: string) => boolean;
  getEquipped: (category: ItemCategory) => Item | null;
  getItemsInCategory: (category: ItemCategory) => Item[];
  getEquippedItems: () => EquippedItems;
  getRarityCounts: () => Record<string, number>;
  getUniqueCount: () => number;
  getTotalCount: () => number;
  getProgress: () => { collected: number; total: number; percentage: number };
  isAllEquipped: () => boolean;

  // 永続化
  loadInventory: (inventory: PlayerInventory) => void;
  resetInventory: () => void;
}

export function useInventory(): UseInventoryReturn {
  const [inventory, setInventory] = useState<PlayerInventory>(getInitialInventory);

  const coins = useMemo(() => inventory.coins, [inventory.coins]);

  // アイテム追加
  const addItem = useCallback((itemId: string): boolean => {
    const item = getItemById(itemId);
    if (!item) return false;

    setInventory((prev) => addItemToInventory(prev, itemId));
    return true;
  }, []);

  // コイン追加
  const addManyCoins = useCallback((amount: number): void => {
    if (amount <= 0) return;
    setInventory((prev) => addCoins(prev, amount));
  }, []);

  // コイン消費
  const spendManyCoins = useCallback((amount: number): boolean => {
    let success = false;
    setInventory((prev) => {
      const result = spendCoins(prev, amount);
      success = result !== null;
      return result ?? prev;
    });
    return success;
  }, []);

  // 装備
  const equip = useCallback((itemId: string): boolean => {
    let success = false;
    setInventory((prev) => {
      const result = equipItem(prev, itemId);
      success = result !== null;
      return result ?? prev;
    });
    return success;
  }, []);

  // 装備解除
  const unequip = useCallback((category: ItemCategory): void => {
    setInventory((prev) => unequipItem(prev, category));
  }, []);

  // アイテム購入
  const purchaseItem = useCallback((itemId: string): boolean => {
    let success = false;
    setInventory((prev) => {
      const result = purchaseItemEngine(prev, itemId);
      success = result !== null;
      return result ?? prev;
    });
    return success;
  }, []);

  // 購入可能チェック
  const canPurchase = useCallback(
    (itemId: string): boolean => {
      return canPurchaseItem(inventory, itemId);
    },
    [inventory]
  );

  // アイテム価格取得
  const getPrice = useCallback((itemId: string): number | null => {
    const item = getItemById(itemId);
    if (!item) return null;
    return getItemPrice(item);
  }, []);

  // アイテム所持チェック
  const owns = useCallback(
    (itemId: string): boolean => {
      return hasItem(inventory, itemId);
    },
    [inventory]
  );

  // 装備中アイテム取得
  const getEquipped = useCallback(
    (category: ItemCategory): Item | null => {
      return getEquippedItem(inventory, category);
    },
    [inventory]
  );

  // カテゴリ別アイテム取得
  const getItemsInCategory = useCallback(
    (category: ItemCategory): Item[] => {
      return getInventoryItemsByCategory(inventory, category);
    },
    [inventory]
  );

  // 装備状態取得
  const getEquippedItems = useCallback((): EquippedItems => {
    return inventory.equipped;
  }, [inventory.equipped]);

  // レアリティ別カウント
  const getRarityCounts = useCallback((): Record<string, number> => {
    return countItemsByRarity(inventory);
  }, [inventory]);

  // ユニークアイテム数
  const getUniqueCount = useCallback((): number => {
    return countUniqueItems(inventory);
  }, [inventory]);

  // 総アイテム数
  const getTotalCount = useCallback((): number => {
    return countTotalItems(inventory);
  }, [inventory]);

  // コレクション進捗
  const getProgress = useCallback((): { collected: number; total: number; percentage: number } => {
    return calculateCollectionProgress(inventory);
  }, [inventory]);

  // 全装備チェック
  const isAllEquipped = useCallback((): boolean => {
    return isFullyEquipped(inventory);
  }, [inventory]);

  // 状態ロード
  const loadInventory = useCallback((newInventory: PlayerInventory): void => {
    setInventory(newInventory);
  }, []);

  // リセット
  const resetInventory = useCallback((): void => {
    setInventory(getInitialInventory());
  }, []);

  return {
    inventory,
    coins,
    addItem,
    addManyCoins,
    spendManyCoins,
    equip,
    unequip,
    purchaseItem,
    canPurchase,
    getPrice,
    owns,
    getEquipped,
    getItemsInCategory,
    getEquippedItems,
    getRarityCounts,
    getUniqueCount,
    getTotalCount,
    getProgress,
    isAllEquipped,
    loadInventory,
    resetInventory,
  };
}
