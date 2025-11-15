import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MetaThemeSettings } from '@/types/meta';

const defaultTheme: MetaThemeSettings = {
  id: 'theme_default',
  name: 'Default',
  primePreset: 'aura',
  tailwindPresets: ['rounded'],
  tokens: {
    primary: '#3b82f6',
    surface: '#ffffff',
    text: '#0f172a',
  },
};

/**
 * Store for global application settings such as theme preferences.
 */
export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<MetaThemeSettings>({ ...defaultTheme });
  const locale = ref<'en' | 'ru'>('en');

  function updateTheme(patch: Partial<MetaThemeSettings>): void {
    theme.value = { ...theme.value, ...patch };
  }

  function setLocale(value: 'en' | 'ru'): void {
    locale.value = value;
  }

  return { theme, locale, updateTheme, setLocale };
});
