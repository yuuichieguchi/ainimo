'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import {
  TimeOfDayType,
  WeatherType,
  SeasonType,
  TIME_OF_DAY_GRADIENTS,
  SEASON_CONFIG,
  ParticleType,
} from '@/types/effects';
import { useParticles } from '@/hooks/effects';
import { ParticleCanvas } from './ParticleCanvas';

interface EnvironmentLayerProps {
  timeOfDay: TimeOfDayType;
  weather: WeatherType;
  season: SeasonType;
  children: React.ReactNode;
  className?: string;
  enabled?: boolean;
}

export const EnvironmentLayer = memo(function EnvironmentLayer({
  timeOfDay,
  weather,
  season,
  children,
  className = '',
  enabled = true,
}: EnvironmentLayerProps) {
  const { particles, emit, clear } = useParticles({ maxParticles: 50, enabled });
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 天気・季節に応じたパーティクル生成
  const emitEnvironmentParticles = useCallback(() => {
    if (!containerRef.current || !enabled) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // 天気パーティクル
    if (weather === 'rainy') {
      for (let i = 0; i < 3; i++) {
        emit({
          type: 'raindrop',
          x: Math.random() * width,
          y: -10,
          count: 1,
          velocity: 8,
          gravity: 0.3,
        });
      }
    } else if (weather === 'snowy') {
      emit({
        type: 'snowflake',
        x: Math.random() * width,
        y: -10,
        count: 1,
        velocity: 0.5,
        gravity: 0.02,
      });
    }

    // 季節パーティクル（晴れまたは曇りの時のみ）
    if (weather === 'sunny' || weather === 'cloudy') {
      const seasonConfig = SEASON_CONFIG[season];
      if (Math.random() < 0.3) { // 30%の確率
        emit({
          type: seasonConfig.particleType,
          x: Math.random() * width,
          y: -10,
          count: 1,
        });
      }
    }
  }, [weather, season, enabled, emit]);

  // パーティクル生成ループ
  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    // 天気に応じた間隔
    const interval = weather === 'rainy' ? 100 : weather === 'snowy' ? 300 : 1000;

    intervalRef.current = setInterval(emitEnvironmentParticles, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, weather, emitEnvironmentParticles, clear]);

  // 時間帯に応じたグラデーション
  const gradient = TIME_OF_DAY_GRADIENTS[timeOfDay];

  // 天気オーバーレイ
  const weatherOverlay = {
    sunny: 'bg-transparent',
    cloudy: 'bg-gray-400/10 dark:bg-gray-600/20',
    rainy: 'bg-blue-900/20 dark:bg-blue-950/30',
    snowy: 'bg-blue-100/10 dark:bg-blue-200/10',
  }[weather];

  // 夜間は暗くする
  const isDark = timeOfDay === 'night' || timeOfDay === 'dusk';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden transition-all duration-1000 ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${gradient.from}, ${gradient.to})`,
      }}
    >
      {/* 天気オーバーレイ */}
      <div
        className={`absolute inset-0 pointer-events-none transition-all duration-500 ${weatherOverlay}`}
      />

      {/* 夜間の暗さオーバーレイ */}
      {isDark && (
        <div className="absolute inset-0 pointer-events-none bg-black/20 transition-opacity duration-1000" />
      )}

      {/* 環境パーティクル */}
      <ParticleCanvas particles={particles} />

      {/* コンテンツ */}
      <div className="relative z-10">{children}</div>
    </div>
  );
});
