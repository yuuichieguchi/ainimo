'use client';

import { useState, useEffect, useMemo } from 'react';
import { SeasonType, SEASON_CONFIG, ParticleType } from '@/types/effects';

// 月から季節を判定（日本基準）
function getSeasonFromMonth(month: number): SeasonType {
  // month: 0-11
  if (month >= 2 && month <= 4) return 'spring';   // 3-5月
  if (month >= 5 && month <= 7) return 'summer';   // 6-8月
  if (month >= 8 && month <= 10) return 'autumn';  // 9-11月
  return 'winter';                                  // 12-2月
}

interface UseSeasonOptions {
  enabled?: boolean;
}

export function useSeason(options: UseSeasonOptions = {}) {
  const { enabled = true } = options;

  const [season, setSeason] = useState<SeasonType>(() => {
    if (typeof window === 'undefined') return 'spring';
    return getSeasonFromMonth(new Date().getMonth());
  });

  useEffect(() => {
    if (!enabled) return;

    const update = () => {
      setSeason(getSeasonFromMonth(new Date().getMonth()));
    };

    update();
    // 1日ごとにチェック
    const interval = setInterval(update, 86400000);

    return () => clearInterval(interval);
  }, [enabled]);

  // 季節の設定
  const config = useMemo(() => SEASON_CONFIG[season], [season]);

  // 季節のパーティクルタイプ
  const particleType: ParticleType = config.particleType;

  // 季節の色
  const seasonColor = config.color;

  // 季節アイコン
  const seasonIcon = useMemo(() => {
    switch (season) {
      case 'spring':
        return '🌸';
      case 'summer':
        return '🌻';
      case 'autumn':
        return '🍂';
      case 'winter':
        return '❄️';
    }
  }, [season]);

  // 季節の日本語名
  const seasonName = useMemo(() => {
    switch (season) {
      case 'spring':
        return '春';
      case 'summer':
        return '夏';
      case 'autumn':
        return '秋';
      case 'winter':
        return '冬';
    }
  }, [season]);

  return {
    season,
    setSeason, // テスト用に手動設定も可能
    particleType,
    seasonColor,
    seasonIcon,
    seasonName,
  };
}
