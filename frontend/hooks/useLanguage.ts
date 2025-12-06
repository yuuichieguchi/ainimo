'use client';

import { useState, useEffect } from 'react';

export type Language = 'en' | 'ja';

export function useLanguage() {
  const [language, setLanguage] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('ainimo_language') as Language | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    } else {
      const browserLanguage = navigator.language.toLowerCase();
      const detectedLanguage = browserLanguage.startsWith('ja') ? 'ja' : 'en';
      setLanguage(detectedLanguage);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem('ainimo_language', language);
  }, [language, mounted]);

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'en' ? 'ja' : 'en'));
  };

  return { language, setLanguage, toggleLanguage, mounted };
}
