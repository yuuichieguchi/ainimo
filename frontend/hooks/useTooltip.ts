'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTooltipContext } from '@/contexts/TooltipContext';

interface UseTooltipOptions {
  id: string;
  isMobile: boolean;
}

export function useTooltip({ id, isMobile }: UseTooltipOptions) {
  const { activeTooltipId, setActiveTooltipId } = useTooltipContext();
  const [isHovered, setIsHovered] = useState(false);

  const isVisible = isMobile
    ? activeTooltipId === id
    : isHovered;

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsHovered(true);
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsHovered(false);
    }
  }, [isMobile]);

  const handleClick = useCallback(() => {
    if (isMobile) {
      setActiveTooltipId(activeTooltipId === id ? null : id);
    }
  }, [isMobile, id, activeTooltipId, setActiveTooltipId]);

  return {
    isVisible,
    handleMouseEnter,
    handleMouseLeave,
    handleClick,
  };
}
