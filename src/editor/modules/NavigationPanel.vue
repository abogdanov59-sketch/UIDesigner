<template>
  <div class="navigation-panel">
    <div class="navigation-panel__header">
      <Button icon="pi pi-plus" label="Add page" size="small" @click="addPage" />
    </div>
    <Listbox
      v-model="activePageId"
      :options="pages"
      option-label="label"
      option-value="value"
      @change="setActive"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Listbox from 'primevue/listbox';
import { useEditorStore } from '@/store/editorStore';
import { nanoid } from '@/utils/nanoid';

/**
 * NavigationPanel controls page selection and creation.
 */
const editorStore = useEditorStore();
const { schema, activePageId } = storeToRefs(editorStore);

const pages = computed(() =>
  schema.value.pages.map((page) => ({ label: page.name, value: page.id })),
);

function setActive(): void {
  if (activePageId.value) {
    editorStore.setActivePage(activePageId.value);
  }
}

function addPage(): void {
  const id = nanoid();
  schema.value.pages.push({
    id,
    name: `Page ${schema.value.pages.length + 1}`,
    route: `/page-${schema.value.pages.length + 1}`,
    components: [],
    layout: {},
    settings: {},
    dataSources: [],
    events: [],
  });
  editorStore.setActivePage(id);
  editorStore.pushHistory('Add page');
}
</script>

<style scoped>
.navigation-panel {
  @apply space-y-4 p-4;
}

.navigation-panel__header {
  @apply flex justify-end;
}
</style>
