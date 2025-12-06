'use client';

import { memo, useCallback, useRef } from 'react';
import { useInteraction, useParticles, useEmote } from '@/hooks/effects';
import { ParticleCanvas } from './ParticleCanvas';
import { EmoteBubble } from './EmoteBubble';

interface InteractionZoneProps {
  children: React.ReactNode;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onPet?: () => void;
  enabled?: boolean;
  className?: string;
}

export const InteractionZone = memo(function InteractionZone({
  children,
  onTap,
  onDoubleTap,
  onPet,
  enabled = true,
  className = '',
}: InteractionZoneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { particles, emitForAction } = useParticles({ enabled });
  const { activeEmote, isVisible, showEmote } = useEmote({ enabled });

  // コンテナ内の相対位置を取得
  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  // タップハンドラー
  const handleTap = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getRelativePosition(clientX, clientY);
      emitForAction('tap', pos.x, pos.y);
      showEmote('heart', 1000);
      onTap?.();
    },
    [getRelativePosition, emitForAction, showEmote, onTap]
  );

  // ダブルタップハンドラー
  const handleDoubleTap = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getRelativePosition(clientX, clientY);
      emitForAction('pet', pos.x, pos.y);
      showEmote('sparkle', 1500);
      onDoubleTap?.();
    },
    [getRelativePosition, emitForAction, showEmote, onDoubleTap]
  );

  // 長押し（撫でる）ハンドラー
  const handleLongPress = useCallback(
    (clientX: number, clientY: number) => {
      const pos = getRelativePosition(clientX, clientY);
      emitForAction('pet', pos.x, pos.y);
      showEmote('heart', 1500);
      onPet?.();
    },
    [getRelativePosition, emitForAction, showEmote, onPet]
  );

  const { handlers, isPetting } = useInteraction({
    onTap: handleTap,
    onDoubleTap: handleDoubleTap,
    onLongPress: handleLongPress,
    enabled,
  });

  return (
    <div
      ref={containerRef}
      className={`relative select-none touch-none ${className}`}
      {...handlers}
    >
      {/* メインコンテンツ */}
      <div
        className={`transition-transform duration-150 ${
          isPetting ? 'scale-105' : ''
        }`}
      >
        {children}
      </div>

      {/* パーティクル */}
      <ParticleCanvas particles={particles} />

      {/* エモート */}
      <EmoteBubble emote={activeEmote} isVisible={isVisible} />
    </div>
  );
});
