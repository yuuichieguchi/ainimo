'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/game';

interface ChatLogProps {
  messages: Message[];
}

export function ChatLog({ messages }: ChatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const displayedMessages = messages.slice(-10);

  if (displayedMessages.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
        <p className="text-gray-400 dark:text-gray-500 text-center">
          No messages yet. Start chatting with Ainimo!
        </p>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="h-80 overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3 scroll-smooth"
    >
      {displayedMessages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2 rounded-2xl ${
              message.speaker === 'user'
                ? 'bg-blue-500 text-white rounded-br-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-sm'
            }`}
          >
            <p className="text-sm break-words">{message.text}</p>
            <p className="text-xs opacity-60 mt-1">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
