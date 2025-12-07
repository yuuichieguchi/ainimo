'use client';

import { Item, RARITY_COLORS, RARITY_NAMES, RARITY_PRICES } from '@/types/item';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';

interface ShopItemCardProps {
  item: Item;
  isOwned: boolean;
  canAfford: boolean;
  onPurchase: () => void;
  language: Language;
}

export function ShopItemCard({
  item,
  isOwned,
  canAfford,
  onPurchase,
  language,
}: ShopItemCardProps) {
  const rarityColor = RARITY_COLORS[item.rarity];
  const rarityName = RARITY_NAMES[item.rarity][language];
  const price = RARITY_PRICES[item.rarity];

  return (
    <div
      className={`
        relative rounded-lg p-3 transition-all
        ${isOwned ? 'opacity-60' : 'hover:scale-105 transform'}
      `}
      style={{
        background: `linear-gradient(135deg, ${rarityColor}20, ${rarityColor}10)`,
        borderColor: rarityColor,
        borderWidth: '2px',
      }}
    >
      {/* 所持済みバッジ */}
      {isOwned && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
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

      {/* 価格・購入ボタン */}
      <div className="mt-2">
        {isOwned ? (
          <div className="text-center text-xs text-green-600 dark:text-green-400 font-medium py-1.5">
            {t('shopOwned', language)}
          </div>
        ) : (
          <button
            onClick={onPurchase}
            disabled={!canAfford}
            className={`
              w-full py-1.5 rounded-md text-xs font-bold transition-colors
              ${canAfford
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }
            `}
          >
            🪙 {price}
          </button>
        )}
      </div>
    </div>
  );
}
