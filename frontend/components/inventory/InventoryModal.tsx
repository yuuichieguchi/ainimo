'use client';

import { useState, useCallback } from 'react';
import { ItemCategory, CATEGORY_NAMES, Item } from '@/types/item';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { ItemCard } from './ItemCard';
import { useInventory } from '@/hooks/useInventory';
import { getItemById } from '@/lib/itemDefinitions';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const CATEGORIES: ItemCategory[] = ['hat', 'accessory', 'background'];

export function InventoryModal({
  isOpen,
  onClose,
  language,
}: InventoryModalProps) {
  const [activeCategory, setActiveCategory] = useState<ItemCategory>('hat');

  const {
    inventory,
    coins,
    equip,
    unequip,
    getItemsInCategory,
    getEquipped,
    getProgress,
  } = useInventory();

  const itemsInCategory = getItemsInCategory(activeCategory);
  const equippedItem = getEquipped(activeCategory);
  const progress = getProgress();

  const handleEquip = useCallback(
    (itemId: string) => {
      equip(itemId);
    },
    [equip]
  );

  const handleUnequip = useCallback(() => {
    unequip(activeCategory);
  }, [unequip, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* モーダル */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {t('inventory', language)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* コイン表示 */}
          <div className="flex justify-between items-center mt-2 text-sm">
            <span className="text-yellow-500 font-bold">
              🪙 {coins} {t('inventoryCoins', language)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {t('inventoryCollection', language)}: {progress.collected}/{progress.total}
            </span>
          </div>
        </div>

        {/* カテゴリタブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                flex-1 py-3 px-4 text-sm font-medium transition-colors
                ${activeCategory === category
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              {CATEGORY_NAMES[category][language]}
            </button>
          ))}
        </div>

        {/* 現在装備中 */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {t('inventoryEquipped', language)}
          </div>
          {equippedItem ? (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{equippedItem.icon}</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {equippedItem.name[language]}
              </span>
              <button
                onClick={handleUnequip}
                className="ml-auto text-sm text-red-500 hover:text-red-600"
              >
                {t('inventoryUnequip', language)}
              </button>
            </div>
          ) : (
            <div className="text-gray-400 dark:text-gray-500 italic">
              -
            </div>
          )}
        </div>

        {/* アイテムグリッド */}
        <div className="p-4 overflow-y-auto max-h-[40vh]">
          {itemsInCategory.length > 0 ? (
            <div className="grid grid-cols-3 gap-3">
              {itemsInCategory.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  isEquipped={equippedItem?.id === item.id}
                  onEquip={() => handleEquip(item.id)}
                  onUnequip={handleUnequip}
                  language={language}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('inventoryEmpty', language)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
