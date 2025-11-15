import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import axios from 'axios';
import type { MetaDataSource } from '@/types/meta';
import { nanoid } from '@/utils/nanoid';

/**
 * Store encapsulating data source CRUD and execution.
 */
export const useDataStore = defineStore('data', () => {
  const sources = ref<MetaDataSource[]>([]);
  const loadingSourceId = ref<string | null>(null);
  const error = ref<string | null>(null);

  const sourceMap = computed(() =>
    Object.fromEntries(sources.value.map((source) => [source.id, source])),
  );

  function setSources(payload: MetaDataSource[]): void {
    sources.value = structuredClone(payload).map((source) => {
      if (source.type === 'static') {
        source.lastResult = source.config.staticData;
      }
      return source;
    });
  }

  function createSource(payload: Omit<MetaDataSource, 'id'>): MetaDataSource {
    const source: MetaDataSource = { ...payload, id: nanoid() };
    sources.value.push(source);
    return source;
  }

  function updateSource(id: string, patch: Partial<MetaDataSource>): void {
    const source = sources.value.find((item) => item.id === id);
    if (!source) return;
    Object.assign(source, patch);
  }

  function removeSource(id: string): void {
    sources.value = sources.value.filter((source) => source.id !== id);
  }

  async function execute(id: string): Promise<unknown> {
    const source = sources.value.find((item) => item.id === id);
    if (!source) throw new Error('Data source not found');
    loadingSourceId.value = id;
    error.value = null;

    try {
      if (source.type === 'static') {
        source.lastResult = source.config.staticData;
      } else if (source.type === 'rest') {
        const response = await axios.request({
          url: source.config.url,
          method: source.config.method ?? 'GET',
          headers: source.config.headers,
          params: source.config.params,
          data: source.config.body,
        });
        source.lastResult = response.data;
      }
      return source.lastResult;
    } catch (err) {
      error.value = err instanceof Error ? err.message : String(err);
      throw err;
    } finally {
      loadingSourceId.value = null;
    }
  }

  return {
    sources,
    loadingSourceId,
    error,
    sourceMap,
    setSources,
    createSource,
    updateSource,
    removeSource,
    execute,
  };
});
