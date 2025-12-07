'use client';

import { useState, useCallback, useMemo } from 'react';
import { ItemCategory, Item, PlayerInventory, RARITY_PRICES } from '@/types/item';
import { Language } from '@/hooks/useLanguage';
import { t } from '@/lib/i18n';
import { ShopItemCard } from './ShopItemCard';
import { ALL_ITEMS, getItemById } from '@/lib/itemDefinitions';
import { hasItem } from '@/lib/itemEngine';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  inventory: PlayerInventory;
  onPurchase: (itemId: string) => boolean;
}

type CategoryFilter = 'all' | ItemCategory;

const CATEGORIES: { key: CategoryFilter; labelKey: 'shopAll' | 'itemCategoryHat' | 'itemCategoryAccessory' | 'itemCategoryBackground' }[] = [
  { key: 'all', labelKey: 'shopAll' },
  { key: 'hat', labelKey: 'itemCategoryHat' },
  { key: 'accessory', labelKey: 'itemCategoryAccessory' },
  { key: 'background', labelKey: 'itemCategoryBackground' },
];

interface PurchaseConfirmState {
  isOpen: boolean;
  item: Item | null;
}

interface PurchaseSuccessState {
  isOpen: boolean;
  item: Item | null;
}

export function ShopModal({
  isOpen,
  onClose,
  language,
  inventory,
  onPurchase,
}: ShopModalProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [confirmState, setConfirmState] = useState<PurchaseConfirmState>({ isOpen: false, item: null });
  const [successState, setSuccessState] = useState<PurchaseSuccessState>({ isOpen: false, item: null });

  // カテゴリでフィルタしたアイテム一覧（メモ化）
  const filteredItems = useMemo(() =>
    activeCategory === 'all'
      ? ALL_ITEMS
      : ALL_ITEMS.filter((item) => item.category === activeCategory),
    [activeCategory]
  );

  // 購入確認ダイアログを表示
  const handlePurchaseClick = useCallback((item: Item) => {
    setConfirmState({ isOpen: true, item });
  }, []);

  // 購入確認
  const handleConfirmPurchase = useCallback(() => {
    if (!confirmState.item) return;

    const success = onPurchase(confirmState.item.id);
    if (success) {
      setSuccessState({ isOpen: true, item: confirmState.item });
    }
    setConfirmState({ isOpen: false, item: null });
  }, [confirmState.item, onPurchase]);

  // 購入キャンセル
  const handleCancelPurchase = useCallback(() => {
    setConfirmState({ isOpen: false, item: null });
  }, []);

  // 成功モーダルを閉じる
  const handleCloseSuccess = useCallback(() => {
    setSuccessState({ isOpen: false, item: null });
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* メインモーダル */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* ヘッダー */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              🛒 {t('shop', language)}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>

          {/* コイン表示 */}
          <div className="flex items-center mt-2 text-sm">
            <span className="text-yellow-500 font-bold text-lg">
              🪙 {inventory.coins}
            </span>
          </div>
        </div>

        {/* カテゴリタブ */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`
                flex-1 py-3 px-3 text-sm font-medium transition-colors whitespace-nowrap
                ${activeCategory === category.key
                  ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }
              `}
            >
              {t(category.labelKey, language)}
            </button>
          ))}
        </div>

        {/* アイテムグリッド */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="grid grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const isOwned = hasItem(inventory, item.id);
              const price = RARITY_PRICES[item.rarity];
              const canAfford = !isOwned && inventory.coins >= price;

              return (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  isOwned={isOwned}
                  canAfford={canAfford}
                  onPurchase={() => handlePurchaseClick(item)}
                  language={language}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 購入確認ダイアログ */}
      {confirmState.isOpen && confirmState.item && (
        <PurchaseConfirmDialog
          item={confirmState.item}
          coins={inventory.coins}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
          language={language}
        />
      )}

      {/* 購入成功モーダル */}
      {successState.isOpen && successState.item && (
        <PurchaseSuccessModal
          item={successState.item}
          onClose={handleCloseSuccess}
          language={language}
        />
      )}
    </div>
  );
}

// 購入確認ダイアログ
interface PurchaseConfirmDialogProps {
  item: Item;
  coins: number;
  onConfirm: () => void;
  onCancel: () => void;
  language: Language;
}

function PurchaseConfirmDialog({
  item,
  coins,
  onConfirm,
  onCancel,
  language,
}: PurchaseConfirmDialogProps) {
  const price = RARITY_PRICES[item.rarity];
  const canAfford = coins >= price;

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-xs w-full text-center">
        <div className="text-4xl mb-3">{item.icon}</div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
          {item.name[language]}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {t('shopPurchaseConfirm', language)}
        </p>

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-yellow-500 font-bold text-xl">🪙 {price}</span>
          {!canAfford && (
            <span className="text-red-500 text-xs">
              ({t('shopNotEnoughCoins', language)})
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('close', language)}
          </button>
          <button
            onClick={onConfirm}
            disabled={!canAfford}
            className={`
              flex-1 py-2 px-4 rounded-lg font-bold transition-colors
              ${canAfford
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {t('shopBuy', language)}
          </button>
        </div>
      </div>
    </div>
  );
}

// 購入成功モーダル（可愛い演出付き）
interface PurchaseSuccessModalProps {
  item: Item;
  onClose: () => void;
  language: Language;
}

function PurchaseSuccessModal({
  item,
  onClose,
  language,
}: PurchaseSuccessModalProps) {
  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-gradient-to-b from-yellow-50 to-white dark:from-yellow-900/30 dark:to-gray-800 rounded-2xl shadow-2xl p-8 max-w-xs w-full text-center animate-bounce-in">
        {/* 紙吹雪エフェクト */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div className="confetti-container">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  backgroundColor: ['#FFD700', '#FF69B4', '#00CED1', '#98FB98', '#DDA0DD'][i % 5],
                }}
              />
            ))}
          </div>
        </div>

        {/* 星アニメーション */}
        <div className="text-4xl mb-2 animate-pulse">✨</div>

        {/* アイテムアイコン */}
        <div className="text-6xl mb-3 animate-bounce-slow">{item.icon}</div>

        {/* タイトル */}
        <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
          {t('shopPurchaseSuccess', language)}
        </h3>

        {/* アイテム名 */}
        <p className="text-lg font-medium text-gray-800 dark:text-white mb-1">
          {item.name[language]}
        </p>

        {/* おめでとうメッセージ */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {t('shopPurchaseCongrats', language)}
        </p>

        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
        >
          🎉 OK!
        </button>
      </div>

      {/* アニメーション用スタイル */}
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(-100%) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }

        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 2px;
          animation: confetti-fall 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
