import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDataStore } from '@/store/dataStore';

const staticSource = {
  id: 'static',
  name: 'Static',
  type: 'static' as const,
  config: { staticData: { value: 42 } },
};

describe('dataStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('creates and executes static source', async () => {
    const store = useDataStore();
    store.setSources([staticSource]);
    const result = await store.execute('static');
    expect(result).toEqual({ value: 42 });
  });
});
