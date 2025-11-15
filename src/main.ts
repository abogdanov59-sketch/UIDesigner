import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import './styles/index.css';
import 'primeicons/primeicons.css';
import Aura from 'primevue/themes/aura';

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: {
      common: {
        welcome: 'UI Designer',
      },
    },
    ru: {
      common: {
        welcome: 'Конструктор интерфейсов',
      },
    },
  },
});

createApp(App)
  .use(router)
  .use(pinia)
  .use(i18n)
  .use(PrimeVue, { theme: { preset: Aura } })
  .mount('#app');
