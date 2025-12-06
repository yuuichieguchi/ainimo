'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Particle, ParticleType, ParticleEmitOptions } from '@/types/effects';

// パーティクルタイプ別のデフォルト設定
const PARTICLE_DEFAULTS: Record<ParticleType, Partial<ParticleEmitOptions>> = {
  sparkle: { velocity: 2, gravity: -0.02, lifespan: 60, size: 16 },
  star: { velocity: 3, gravity: -0.05, lifespan: 50, size: 18 },
  note: { velocity: 2, gravity: -0.03, lifespan: 70, size: 20 },
  heart: { velocity: 4, gravity: -0.08, lifespan: 40, size: 20 },
  petal: { velocity: 1, gravity: 0.02, lifespan: 120, size: 14 },
  leaf: { velocity: 1, gravity: 0.03, lifespan: 100, size: 16 },
  snowflake: { velocity: 0.5, gravity: 0.01, lifespan: 150, size: 12 },
  raindrop: { velocity: 8, gravity: 0.2, lifespan: 30, size: 10 },
};

// パーティクルを生成
function createParticle(options: ParticleEmitOptions, idCounter: React.MutableRefObject<number>): Particle {
  const defaults = PARTICLE_DEFAULTS[options.type];
  const spread = options.spread ?? 50;
  const velocity = options.velocity ?? defaults.velocity ?? 2;
  const lifespan = options.lifespan ?? defaults.lifespan ?? 60;
  const size = options.size ?? defaults.size ?? 16;

  // ランダムな方向に発射
  const angle = Math.random() * Math.PI * 2;
  const speed = velocity * (0.5 + Math.random() * 0.5);

  return {
    id: `particle-${idCounter.current++}`,
    type: options.type,
    x: options.x + (Math.random() - 0.5) * spread,
    y: options.y + (Math.random() - 0.5) * spread,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: lifespan,
    maxLife: lifespan,
    size: size * (0.8 + Math.random() * 0.4),
    rotation: Math.random() * 360,
    opacity: 1,
  };
}

// パーティクルを更新
function updateParticle(particle: Particle): Particle {
  const defaults = PARTICLE_DEFAULTS[particle.type];
  const gravity = defaults.gravity ?? 0;

  return {
    ...particle,
    x: particle.x + particle.vx,
    y: particle.y + particle.vy,
    vy: particle.vy + gravity,
    vx: particle.vx * 0.99, // 摩擦
    life: particle.life - 1,
    rotation: particle.rotation + particle.vx * 2,
    opacity: particle.life / particle.maxLife,
  };
}

interface UseParticlesOptions {
  maxParticles?: number;
  enabled?: boolean;
}

export function useParticles(options: UseParticlesOptions = {}) {
  const { maxParticles = 100, enabled = true } = options;
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const idCounterRef = useRef(0);

  // パーティクルを発射
  const emit = useCallback(
    (emitOptions: ParticleEmitOptions) => {
      if (!enabled) return;

      const newParticles: Particle[] = [];
      for (let i = 0; i < emitOptions.count; i++) {
        newParticles.push(createParticle(emitOptions, idCounterRef));
      }

      setParticles((prev) => {
        const combined = [...prev, ...newParticles];
        if (combined.length > maxParticles) {
          return combined.slice(-maxParticles);
        }
        return combined;
      });
    },
    [enabled, maxParticles]
  );

  // 特定タイプのパーティクルをクリア
  const clear = useCallback((type?: ParticleType) => {
    if (type) {
      setParticles((prev) => prev.filter((p) => p.type !== type));
    } else {
      setParticles([]);
    }
  }, []);

  // アニメーションループ
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      setParticles((prev) => {
        if (prev.length === 0) return prev;
        return prev.map(updateParticle).filter((p) => p.life > 0);
      });
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled]);

  // アクションに応じたパーティクル発射（便利メソッド）
  const emitForAction = useCallback(
    (action: string, x: number, y: number) => {
      switch (action) {
        case 'study':
          emit({ type: 'sparkle', x, y, count: 8, spread: 60 });
          break;
        case 'play':
          emit({ type: 'star', x, y, count: 5, spread: 40 });
          emit({ type: 'note', x, y, count: 3, spread: 30 });
          break;
        case 'rest':
          // 休憩は静かなエフェクト
          break;
        case 'tap':
          emit({ type: 'heart', x, y, count: 3, spread: 20 });
          break;
        case 'pet':
          emit({ type: 'heart', x, y, count: 5, spread: 30 });
          emit({ type: 'sparkle', x, y, count: 3, spread: 20 });
          break;
      }
    },
    [emit]
  );

  return {
    particles,
    emit,
    emitForAction,
    clear,
  };
}
