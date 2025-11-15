<template>
  <div class="data-panel">
    <div class="data-panel__header">
      <Button icon="pi pi-plus" label="Add source" size="small" @click="createSource" />
    </div>
    <div class="space-y-4">
      <Accordion :multiple="true">
        <AccordionTab v-for="source in sources" :key="source.id" :header="source.name">
          <div class="space-y-3">
            <FloatLabel>
              <InputText v-model="source.name" @change="commitSources" />
              <label>Name</label>
            </FloatLabel>
            <Dropdown
              v-model="source.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              @change="commitSources"
            />
            <div v-if="source.type === 'rest'" class="space-y-2">
              <Dropdown
                v-model="source.config.method"
                :options="methodOptions"
                option-label="label"
                option-value="value"
                @change="commitSources"
              />
              <InputText v-model="source.config.url" placeholder="https://api.example.com" @change="commitSources" />
              <Textarea v-model="restBody[source.id]" placeholder="JSON body" autoResize rows="4" />
            </div>
            <div v-else>
              <Textarea v-model="staticData[source.id]" placeholder="JSON data" autoResize rows="4" />
            </div>
            <div class="flex justify-between">
              <Button label="Test" icon="pi pi-play" size="small" @click="() => testSource(source.id)" />
              <Button label="Delete" icon="pi pi-trash" severity="danger" text size="small" @click="() => remove(source.id)" />
            </div>
            <div v-if="source.lastResult" class="data-panel__result">
              <pre>{{ formatJSON(source.lastResult) }}</pre>
            </div>
          </div>
        </AccordionTab>
      </Accordion>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import FloatLabel from 'primevue/floatlabel';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import type { MetaDataSource } from '@/types/meta';
import { useDataStore } from '@/store/dataStore';
import { useEditorStore } from '@/store/editorStore';

/**
 * DataSourcesPanel manages CRUD operations for page data sources and integrates with the runtime store.
 */
const editorStore = useEditorStore();
const dataStore = useDataStore();
const { activePageSchema } = storeToRefs(editorStore);
const { sources } = storeToRefs(dataStore);

const typeOptions = [
  { label: 'Static JSON', value: 'static' },
  { label: 'REST API', value: 'rest' },
];

const methodOptions = ['GET', 'POST', 'PUT', 'DELETE'].map((value) => ({ label: value, value }));

const restBody = reactive<Record<string, string>>({});
const staticData = reactive<Record<string, string>>({});

watch(
  activePageSchema,
  (page) => {
    dataStore.setSources(page.dataSources);
    for (const source of page.dataSources) {
      restBody[source.id] = JSON.stringify(source.config.body ?? {}, null, 2);
      staticData[source.id] = JSON.stringify(source.config.staticData ?? {}, null, 2);
    }
  },
  { immediate: true },
);

function createSource(): void {
  const source = dataStore.createSource({
    name: 'New source',
    type: 'static',
    config: { staticData: {} },
  });
  restBody[source.id] = JSON.stringify(source.config.body ?? {}, null, 2);
  staticData[source.id] = JSON.stringify(source.config.staticData ?? {}, null, 2);
  commitSources();
  editorStore.pushHistory(`Create data source ${source.name}`);
}

function commitSources(): void {
  if (!activePageSchema.value) return;
  const page = activePageSchema.value;
  page.dataSources = sources.value.map((source) => normalizeSource(source));
  dataStore.setSources(page.dataSources);
  editorStore.pushHistory('Update data sources');
}

function normalizeSource(source: MetaDataSource): MetaDataSource {
  const copy: MetaDataSource = structuredClone(source);
  try {
    copy.config.body = JSON.parse(restBody[source.id] ?? 'null');
  } catch {
    copy.config.body = source.config.body;
  }
  try {
    copy.config.staticData = JSON.parse(staticData[source.id] ?? 'null');
  } catch {
    copy.config.staticData = source.config.staticData;
  }
  return copy;
}

async function testSource(id: string): Promise<void> {
  try {
    await dataStore.execute(id);
  } catch (error) {
    console.error('Failed to execute data source', error);
  }
}

function remove(id: string): void {
  dataStore.removeSource(id);
  commitSources();
}

function formatJSON(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
</script>

<style scoped>
.data-panel {
  @apply space-y-4 p-4;
}

.data-panel__header {
  @apply flex justify-end;
}

.data-panel__result {
  @apply rounded bg-slate-900 p-3 text-xs text-emerald-200;
}
</style>
