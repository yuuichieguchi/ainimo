'use client';

import { EquippedItems } from '@/types/item';
import { getItemById } from '@/lib/itemDefinitions';

interface EquippedItemsOverlayProps {
  equipped: EquippedItems;
}

export function EquippedItemsOverlay({ equipped }: EquippedItemsOverlayProps) {
  const hatItem = equipped.hat ? getItemById(equipped.hat) : null;
  const accessoryItem = equipped.accessory ? getItemById(equipped.accessory) : null;
  const backgroundItem = equipped.background ? getItemById(equipped.background) : null;

  return (
    <>
      {/* 背景レイヤー（一番後ろ） */}
      {backgroundItem && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <span
            className="text-[80px] opacity-30 select-none"
            role="img"
            aria-label={backgroundItem.name.en}
          >
            {backgroundItem.icon}
          </span>
        </div>
      )}

      {/* 帽子レイヤー（頭上） */}
      {hatItem && (
        <div
          className="absolute left-1/2 pointer-events-none"
          style={{
            zIndex: 30,
            top: '-8px',
            transform: 'translateX(-50%)',
          }}
        >
          <span
            className="text-2xl select-none drop-shadow-md animate-bounce-hat"
            role="img"
            aria-label={hatItem.name.en}
          >
            {hatItem.icon}
          </span>
        </div>
      )}

      {/* アクセサリーレイヤー（右側） */}
      {accessoryItem && (
        <div
          className="absolute pointer-events-none"
          style={{
            zIndex: 15,
            right: '-12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <span
            className="text-xl select-none drop-shadow-md animate-float-accessory"
            role="img"
            aria-label={accessoryItem.name.en}
          >
            {accessoryItem.icon}
          </span>
        </div>
      )}

      {/* カスタムアニメーション */}
      <style jsx>{`
        @keyframes bounce-hat {
          0%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          50% {
            transform: translateX(-50%) translateY(-3px);
          }
        }

        @keyframes float-accessory {
          0%, 100% {
            transform: translateY(-50%) rotate(-5deg);
          }
          50% {
            transform: translateY(-50%) rotate(5deg);
          }
        }

        .animate-bounce-hat {
          animation: bounce-hat 2s ease-in-out infinite;
        }

        .animate-float-accessory {
          animation: float-accessory 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}
