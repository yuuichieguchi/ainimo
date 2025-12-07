'use client';

import { Item, RARITY_COLORS, RARITY_NAMES } from '@/types/item';
import { Language } from '@/hooks/useLanguage';

interface ItemCardProps {
  item: Item;
  isEquipped: boolean;
  onEquip: () => void;
  onUnequip: () => void;
  language: Language;
}

export function ItemCard({
  item,
  isEquipped,
  onEquip,
  onUnequip,
  language,
}: ItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity];
  const rarityName = RARITY_NAMES[item.rarity][language];

  return (
    <div
      className={`
        relative rounded-lg p-3 transition-all transform hover:scale-105 cursor-pointer
        ${isEquipped
          ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-800'
          : 'hover:shadow-lg'
        }
      `}
      style={{
        background: `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}10)`,
        borderColor: rarityColor,
        borderWidth: '2px',
      }}
      onClick={isEquipped ? onUnequip : onEquip}
    >
      {/* 装備中バッジ */}
      {isEquipped && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          ✓
        </div>
      )}

      {/* アイコン */}
      <div className="text-3xl text-center mb-2">{item.icon}</div>

      {/* 名前 */}
      <div className="text-sm font-bold text-gray-800 dark:text-white text-center truncate">
        {item.name[language]}
      </div>

      {/* レアリティ */}
      <div
        className="text-xs text-center mt-1 font-medium"
        style={{ color: rarityColor }}
      >
        {rarityName}
      </div>
    </div>
  );
}
