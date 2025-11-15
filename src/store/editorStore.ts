import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { nanoid } from '../utils/nanoid';
import { defaultSchema } from '@/modules/schema/defaultSchema';
import { serializeSchema, parseSchema } from '@/modules/schema/serializer';
import type { HistoryEntry, MetaComponent, MetaPage, MetaUISchema } from '@/types/meta';

const LOCAL_STORAGE_KEY = 'uidesigner-schema';
const HISTORY_LIMIT = 50;

/**
 * Pinia store containing the editable UI schema and editor history.
 */
export const useEditorStore = defineStore('editor', () => {
  const schema = ref<MetaUISchema>(structuredClone(defaultSchema));
  const activePageId = ref(schema.value.pages[0]?.id ?? '');
  const selectedComponentId = ref<string | null>(null);
  const history = ref<HistoryEntry[]>([]);
  const historyIndex = ref(-1);

  const activePage = computed<MetaPage | null>(() =>
    schema.value.pages.find((page) => page.id === activePageId.value) ?? null,
  );

  const activePageSchema = computed<MetaPage>(() => {
    if (!activePage.value) {
      throw new Error('Active page not found');
    }

    return activePage.value;
  });

  const selectedComponent = computed<MetaComponent | null>(() => {
    if (!activePage.value) return null;
    return findComponent(activePage.value.components, selectedComponentId.value);
  });

  function initialize(): void {
    const stored = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as MetaUISchema;
        loadSchema(parsed, { skipHistory: true });
        return;
      } catch (error) {
        console.error('Failed to parse stored schema', error);
      }
    }
    pushHistory('Initialize');
  }

  function setActivePage(pageId: string): void {
    if (schema.value.pages.some((p) => p.id === pageId)) {
      activePageId.value = pageId;
    }
  }

  function selectComponent(componentId: string | null): void {
    selectedComponentId.value = componentId;
  }

  function addComponent(component: MetaComponent, parentId?: string | null): void {
    const page = activePage.value;
    if (!page) return;
    const targetCollection = parentId
      ? findComponent(page.components, parentId)?.children ?? []
      : page.components;

    if (parentId && !findComponent(page.components, parentId)) {
      throw new Error(`Parent component ${parentId} not found`);
    }

    if (parentId) {
      const parent = findComponent(page.components, parentId);
      if (!parent) return;
      if (!parent.children) parent.children = [];
      parent.children.push(component);
    } else {
      targetCollection.push(component);
    }
    selectComponent(component.id);
    pushHistory(`Add ${component.type}`);
  }

  function updateComponent(
    componentId: string,
    patch: Partial<MetaComponent>,
    options: { skipHistory?: boolean; description?: string } = {},
  ): void {
    const page = activePage.value;
    if (!page) return;
    const target = findComponent(page.components, componentId);
    if (!target) return;
    Object.assign(target, patch);
    if (!options.skipHistory) {
      pushHistory(options.description ?? `Update ${componentId}`);
    }
  }

  function removeComponent(componentId: string): void {
    const page = activePage.value;
    if (!page) return;
    if (deleteComponent(page.components, componentId)) {
      if (selectedComponentId.value === componentId) {
        selectComponent(null);
      }
      pushHistory(`Remove ${componentId}`);
    }
  }

  function moveComponent(
    componentId: string,
    layout: MetaComponent['layout'],
    options: { skipHistory?: boolean; description?: string } = {},
  ): void {
    updateComponent(componentId, { layout }, { ...options, description: options.description ?? 'Move component' });
  }

  function pushHistory(description: string): void {
    const entry: HistoryEntry = {
      id: nanoid(),
      timestamp: Date.now(),
      schema: structuredClone(schema.value),
      description,
    };

    history.value = history.value.slice(0, historyIndex.value + 1);
    history.value.push(entry);
    if (history.value.length > HISTORY_LIMIT) {
      history.value.shift();
    }
    historyIndex.value = history.value.length - 1;
    persistSchema();
  }

  function undo(): void {
    if (historyIndex.value <= 0) return;
    historyIndex.value -= 1;
    schema.value = structuredClone(history.value[historyIndex.value].schema);
  }

  function redo(): void {
    if (historyIndex.value >= history.value.length - 1) return;
    historyIndex.value += 1;
    schema.value = structuredClone(history.value[historyIndex.value].schema);
  }

  function loadSchema(newSchema: MetaUISchema, options: { skipHistory?: boolean } = {}): void {
    schema.value = structuredClone(newSchema);
    activePageId.value = newSchema.pages[0]?.id ?? '';
    selectedComponentId.value = null;
    if (!options.skipHistory) {
      pushHistory('Load schema');
    }
    persistSchema();
  }

  function exportSchema(): string {
    return serializeSchema(schema.value);
  }

  function importSchema(json: string): void {
    const parsed = parseSchema(json);
    loadSchema(parsed);
  }

  function persistSchema(): void {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, exportSchema());
  }

  return {
    schema,
    activePageId,
    activePage,
    activePageSchema,
    selectedComponentId,
    selectedComponent,
    history,
    historyIndex,
    initialize,
    setActivePage,
    selectComponent,
    addComponent,
    updateComponent,
    removeComponent,
    moveComponent,
    pushHistory,
    undo,
    redo,
    loadSchema,
    exportSchema,
    importSchema,
  };
});

function findComponent(
  components: MetaComponent[] | undefined,
  id: string | null,
): MetaComponent | null {
  if (!components || !id) return null;
  for (const component of components) {
    if (component.id === id) return component;
    const nested = findComponent(component.children, id);
    if (nested) return nested;
  }
  return null;
}

function deleteComponent(components: MetaComponent[], id: string): boolean {
  const index = components.findIndex((component) => component.id === id);
  if (index >= 0) {
    components.splice(index, 1);
    return true;
  }
  for (const component of components) {
    if (component.children && deleteComponent(component.children, id)) {
      return true;
    }
  }
  return false;
}
