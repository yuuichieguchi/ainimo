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

export function Tooltip({
  children,
  content,
  isVisible,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [adjustedStyle, setAdjustedStyle] = useState<{ left?: string; transform?: string }>({});
  const [arrowOffset, setArrowOffset] = useState<string>('50%');
  const [isPositioned, setIsPositioned] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;

    const calculatePosition = () => {
      if (isVisible && tooltipRef.current && buttonRef.current) {
        requestAnimationFrame(() => {
          if (tooltipRef.current && buttonRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const buttonRect = buttonRef.current.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const margin = 16;

            const buttonCenter = buttonRect.left + buttonRect.width / 2;
            const tooltipWidth = tooltipRect.width;
            const idealLeft = buttonCenter - tooltipWidth / 2;
            const idealRight = idealLeft + tooltipWidth;

            if (idealLeft < margin) {
              const offset = margin - idealLeft;
              setAdjustedStyle({ left: '50%', transform: `translateX(calc(-50% + ${offset}px))` });
              const arrowPos = buttonCenter - margin;
              setArrowOffset(`${arrowPos}px`);
            } else if (idealRight > viewportWidth - margin) {
              const offset = idealRight - (viewportWidth - margin);
              setAdjustedStyle({ left: '50%', transform: `translateX(calc(-50% - ${offset}px))` });
              const arrowPos = buttonCenter - (viewportWidth - margin - tooltipWidth);
              setArrowOffset(`${arrowPos}px`);
            } else {
              setAdjustedStyle({ left: '50%', transform: 'translateX(-50%)' });
              setArrowOffset('50%');
            }
            setIsPositioned(true);
          }
        });
      } else {
        setIsPositioned(false);
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
  }, [isVisible, isMobile]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
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

      {isVisible && isMobile && (
        <div
          ref={tooltipRef}
          role="tooltip"
          style={adjustedStyle}
          className={`absolute z-50 bottom-full mb-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg w-max max-w-[calc(100vw-32px)] whitespace-normal break-words transition-all duration-150 ${isPositioned ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          {content}
          <div
            style={{ left: arrowOffset, transform: 'translateX(-50%)' }}
            className="absolute top-full border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"
            aria-hidden="true"
          />
        </div>
      )}

      {isVisible && !isMobile && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg min-w-max max-w-xs whitespace-normal break-words"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
