<template>
  <div class="editor-shell">
    <header class="editor-shell__header">
      <div class="flex items-center gap-3">
        <span class="pi pi-sitemap text-primary-500 text-xl"></span>
        <h1 class="text-xl font-semibold">{{ t('common.welcome') }}</h1>
        <Tag severity="info">{{ schema.appName }}</Tag>
      </div>
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <i class="pi pi-search-minus text-slate-400"></i>
          <Slider v-model="zoomPercentage" :min="30" :max="200" :step="10" class="w-32" />
          <i class="pi pi-search-plus text-slate-400"></i>
          <span class="w-12 text-right text-sm text-slate-500">{{ zoomPercentage }}%</span>
        </div>
        <Button icon="pi pi-download" label="Export" size="small" @click="handleExport" />
        <Button
          icon="pi pi-upload"
          label="Import"
          size="small"
          severity="secondary"
          @click="importDialogVisible = true"
        />
        <RouterLink to="/preview">
          <Button icon="pi pi-eye" label="Preview" size="small" />
        </RouterLink>
      </div>
    </header>

    <main class="editor-shell__body">
      <aside class="editor-shell__sidebar">
        <TabView>
          <TabPanel header="Components">
            <ComponentPalette />
          </TabPanel>
          <TabPanel header="Tree">
            <ComponentTreePanel />
          </TabPanel>
          <TabPanel header="Data">
            <DataSourcesPanel />
          </TabPanel>
          <TabPanel header="Navigation">
            <NavigationPanel />
          </TabPanel>
          <TabPanel header="Templates">
            <TemplatesPanel />
          </TabPanel>
        </TabView>
      </aside>

      <section class="editor-shell__canvas">
        <Canvas />
      </section>

      <aside class="editor-shell__inspector">
        <TabView>
          <TabPanel header="Properties">
            <PropertiesPanel />
          </TabPanel>
          <TabPanel header="Events">
            <EventsActionsPanel />
          </TabPanel>
          <TabPanel header="Theme">
            <ThemeSettingsPanel />
          </TabPanel>
        </TabView>
      </aside>
    </main>

    <Dialog v-model:visible="importDialogVisible" header="Import Schema" modal>
      <Textarea v-model="importBuffer" rows="10" class="w-full" />
      <div class="mt-4 flex justify-end gap-2">
        <Button label="Cancel" severity="secondary" @click="importDialogVisible = false" />
        <Button label="Load" @click="handleImport" />
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Tag from 'primevue/tag';
import Textarea from 'primevue/textarea';
import Slider from 'primevue/slider';
import { useI18n } from 'vue-i18n';
import Canvas from './modules/Canvas.vue';
import ComponentPalette from './modules/ComponentPalette.vue';
import PropertiesPanel from './modules/PropertiesPanel.vue';
import ComponentTreePanel from './modules/ComponentTreePanel.vue';
import DataSourcesPanel from './modules/DataSourcesPanel.vue';
import EventsActionsPanel from './modules/EventsActionsPanel.vue';
import ThemeSettingsPanel from './modules/ThemeSettingsPanel.vue';
import NavigationPanel from './modules/NavigationPanel.vue';
import TemplatesPanel from './modules/TemplatesPanel.vue';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';

/**
 * EditorShell orchestrates the entire editor layout and wiring of all panels.
 */
const { t } = useI18n();
const editorStore = useEditorStore();
const uiStore = useUIStore();
const { schema } = storeToRefs(editorStore);
const { zoomLevel } = storeToRefs(uiStore);

const importDialogVisible = ref(false);
const importBuffer = ref('');
const zoomPercentage = computed({
  get: () => Math.round(zoomLevel.value * 100),
  set: (value: number) => uiStore.setZoom(value / 100),
});

onMounted(() => {
  editorStore.initialize();
});

function handleExport(): void {
  const blob = new Blob([editorStore.exportSchema()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${schema.value.appName}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleImport(): void {
  try {
    editorStore.importSchema(importBuffer.value);
    importDialogVisible.value = false;
  } catch (error) {
    console.error('Failed to import schema', error);
  }
}
</script>

<style scoped>
.editor-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.editor-shell__header {
  @apply flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 shadow-sm;
}

.editor-shell__body {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr) 360px;
  flex: 1;
  overflow: hidden;
}

.editor-shell__sidebar,
.editor-shell__inspector {
  @apply overflow-y-auto border-slate-200 bg-slate-50;
  border-right: 1px solid theme('colors.slate.200');
}

.editor-shell__inspector {
  border-right: none;
  border-left: 1px solid theme('colors.slate.200');
}

.editor-shell__canvas {
  @apply bg-slate-100 overflow-hidden;
}
</style>
