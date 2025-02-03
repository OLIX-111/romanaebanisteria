// src/hooks/useTranslation.ts
import { useRouter } from 'next/router';
import { getDictionary } from '@/locales/getDictionary';
import { Locale } from '@/locales/locale';

export const useTranslation = () => {
  const { locale } = useRouter();
  return getDictionary(locale as Locale);
};
