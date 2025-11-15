import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import EditorPage from '@/pages/EditorPage.vue';
import PreviewPage from '@/pages/PreviewPage.vue';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'editor', component: EditorPage },
  { path: '/preview', name: 'preview', component: PreviewPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
