'use client';

import { useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function DynamicLangUpdater() {
  const { language, mounted } = useLanguage();

  useEffect(() => {
    if (mounted) {
      document.documentElement.lang = language;
    }
  }, [language, mounted]);

  return null;
}
