'use client';

import { ReactNode } from 'react';

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
  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={onClick}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
        className="cursor-help inline-flex items-center bg-transparent border-0 p-0 ml-1.5"
        aria-label="詳細情報"
      >
        {children}
      </button>

      {isVisible && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg min-w-max max-w-xs whitespace-normal break-words"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
