'use client';

import { EquippedItems, ItemCategory, CATEGORY_NAMES } from '@/types/item';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { getItemById } from '@/lib/itemDefinitions';

interface EquipmentPanelProps {
  equipped: EquippedItems;
  onOpenInventory: () => void;
  language: Language;
}

const SLOTS: ItemCategory[] = ['hat', 'accessory', 'background'];

export function EquipmentPanel({
  equipped,
  onOpenInventory,
  language,
}: EquipmentPanelProps) {
  return (
    <button
      onClick={onOpenInventory}
      className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow"
    >
      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
        <span>{t('inventory', language)}</span>
        <span className="text-gray-400">→</span>
      </h4>

      <div className="flex justify-around gap-2">
        {SLOTS.map((slot) => {
          const itemId = equipped[slot];
          const item = itemId ? getItemById(itemId) : null;

          return (
            <div
              key={slot}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center text-xl
                  ${item
                    ? 'bg-blue-100 dark:bg-blue-900/30'
                    : 'bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600'
                  }
                `}
              >
                {item ? item.icon : '?'}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {CATEGORY_NAMES[slot][language]}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}
