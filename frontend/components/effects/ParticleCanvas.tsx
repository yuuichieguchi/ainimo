'use client';

import { memo, useMemo } from 'react';
import { Particle, PARTICLE_EMOJI } from '@/types/effects';

interface ParticleCanvasProps {
  particles: Particle[];
  className?: string;
}

// 個別パーティクルコンポーネント
const ParticleItem = memo(function ParticleItem({ particle }: { particle: Particle }) {
  const style = useMemo(
    () => ({
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      fontSize: particle.size,
      opacity: particle.opacity,
      transform: `rotate(${particle.rotation}deg)`,
      pointerEvents: 'none' as const,
      willChange: 'transform, opacity',
      transition: 'none',
    }),
    [particle.x, particle.y, particle.size, particle.opacity, particle.rotation]
  );

  return (
    <span style={style} aria-hidden="true">
      {PARTICLE_EMOJI[particle.type]}
    </span>
  );
});

export const ParticleCanvas = memo(function ParticleCanvas({
  particles,
  className = '',
}: ParticleCanvasProps) {
  if (particles.length === 0) return null;

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <ParticleItem key={particle.id} particle={particle} />
      ))}
    </div>
  );
});
