<template>
  <div class="runtime-renderer space-y-4" :style="themeStyles">
    <RuntimeNode
      v-for="component in boundComponents"
      :key="component.id"
      :component="component"
      :page="schema"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { MetaPage } from '@/types/meta';
import { applyBindings } from './binding';
import RuntimeNode from './RuntimeNode.vue';
import { useEditorStore } from '@/store/editorStore';
import { useDataStore } from '@/store/dataStore';
import { useSettingsStore } from '@/store/settingsStore';

interface Props {
  /**
   * JSON schema page to render in runtime.
   */
  schema: MetaPage;
}

const props = defineProps<Props>();

const editorStore = useEditorStore();
const dataStore = useDataStore();
const settingsStore = useSettingsStore();
const { schema: editorSchema } = storeToRefs(editorStore);
const { sources } = storeToRefs(dataStore);
const { theme } = storeToRefs(settingsStore);

dataStore.setSources(props.schema.dataSources);

const themeStyles = computed(() => ({
  '--runtime-primary': theme.value.tokens.primary,
  '--runtime-surface': theme.value.tokens.surface,
  '--runtime-text': theme.value.tokens.text,
}));

const boundComponents = computed(() => {
  const context = {
    variables: editorSchema.value.globals.variables,
    dataSources: Object.fromEntries(sources.value.map((source) => [source.id, source])),
  };
  return props.schema.components.map((component) => applyBindings(component, props.schema, context));
});
</script>

<style scoped>
.runtime-renderer {
  min-height: 50vh;
  background: var(--runtime-surface);
  color: var(--runtime-text);
  padding: 1.5rem;
  border-radius: 1rem;
}
</style>
