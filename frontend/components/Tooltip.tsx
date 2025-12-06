'use client';

import { ReactNode, useRef, useEffect, useState } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  isVisible: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

type TooltipPosition = 'center' | 'left' | 'right';

export function Tooltip({
  children,
  content,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<TooltipPosition>('center');
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    const calculatePosition = () => {
      if (isVisible && tooltipRef.current) {
        requestAnimationFrame(() => {
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;

            const spaceOnLeft = tooltipRect.left;
            const spaceOnRight = viewportWidth - tooltipRect.right;

            if (spaceOnLeft < 16) {
              setPosition('left');
            } else if (spaceOnRight < 16) {
              setPosition('right');
            } else {
              setPosition('center');
            }
            setIsPositioned(true);
          }
        });
      } else {
        setIsPositioned(false);
        setPosition('center');
      }
    };

    calculatePosition();

    if (isVisible) {
      let timeoutId: NodeJS.Timeout;
      const debouncedCalculate = () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(calculatePosition, 100);
      };

      window.addEventListener('resize', debouncedCalculate);
      return () => {
        window.removeEventListener('resize', debouncedCalculate);
        clearTimeout(timeoutId);
      };
    }
  }, [isVisible]);

  const getPositionClasses = () => {
    switch (position) {
      case 'left':
        return 'left-0 translate-x-0';
      case 'right':
        return 'right-0 translate-x-0';
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  const getArrowClasses = () => {
    switch (position) {
      case 'left':
        return 'left-4';
      case 'right':
        return 'right-4';
      default:
        return 'left-1/2 -translate-x-1/2';
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
        className="cursor-help inline-flex items-center bg-transparent border-0 p-0 ml-2.5"
        aria-label="詳細情報"
      >
        {children}
      </button>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`absolute z-50 bottom-full ${getPositionClasses()} mb-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg min-w-max max-w-xs whitespace-normal break-words transition-all duration-150 ${isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {content}
          <div className={`absolute top-full ${getArrowClasses()} border-4 border-transparent border-t-gray-900 dark:border-t-gray-700`} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
