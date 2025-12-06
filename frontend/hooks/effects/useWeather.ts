'use client';

import { useState, useCallback, useMemo } from 'react';
import { WeatherType, ParticleType } from '@/types/effects';

// 天気に応じたパーティクル設定
const WEATHER_PARTICLES: Record<WeatherType, { type: ParticleType; count: number; interval: number } | null> = {
  sunny: null,
  cloudy: null,
  rainy: { type: 'raindrop', count: 3, interval: 100 },
  snowy: { type: 'snowflake', count: 2, interval: 200 },
};

// 天気に応じた背景オーバーレイ
const WEATHER_OVERLAY: Record<WeatherType, string> = {
  sunny: 'bg-transparent',
  cloudy: 'bg-gray-400/20',
  rainy: 'bg-blue-900/30',
  snowy: 'bg-blue-100/20',
};

interface UseWeatherOptions {
  initialWeather?: WeatherType;
  randomizeOnMount?: boolean;
}

// 重み付きランダム天気を取得
function getRandomWeather(): WeatherType {
  const weathers: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy'];
  const weights = [0.5, 0.25, 0.15, 0.1]; // 晴れが多め

  const random = Math.random();
  let cumulative = 0;

  for (let i = 0; i < weathers.length; i++) {
    cumulative += weights[i];
    if (random < cumulative) {
      return weathers[i];
    }
  }

  return 'sunny';
}

export function useWeather(options: UseWeatherOptions = {}) {
  const { initialWeather, randomizeOnMount = true } = options;

  // 初期値：randomizeOnMountがtrueの場合はランダム、そうでなければinitialWeatherまたはsunny
  const [weather, setWeather] = useState<WeatherType>(() => {
    if (initialWeather) return initialWeather;
    if (randomizeOnMount) return getRandomWeather();
    return 'sunny';
  });

  // 天気をランダムに変更
  const randomizeWeather = useCallback(() => {
    setWeather(getRandomWeather());
  }, []);

  // パーティクル設定
  const particleConfig = useMemo(() => WEATHER_PARTICLES[weather], [weather]);

  // オーバーレイクラス
  const overlayClass = useMemo(() => WEATHER_OVERLAY[weather], [weather]);

  // 天気アイコン
  const weatherIcon = useMemo(() => {
    switch (weather) {
      case 'sunny':
        return '☀️';
      case 'cloudy':
        return '☁️';
      case 'rainy':
        return '🌧️';
      case 'snowy':
        return '❄️';
    }
  }, [weather]);

  // 天気による明るさ係数
  const brightness = useMemo(() => {
    switch (weather) {
      case 'sunny':
        return 1;
      case 'cloudy':
        return 0.85;
      case 'rainy':
        return 0.7;
      case 'snowy':
        return 0.9;
    }
  }, [weather]);

  return {
    weather,
    setWeather,
    randomizeWeather,
    particleConfig,
    overlayClass,
    weatherIcon,
    brightness,
    isRaining: weather === 'rainy',
    isSnowing: weather === 'snowy',
  };
}
