import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useEditorStore } from '@/store/editorStore';
import type { MetaComponent } from '@/types/meta';

const sampleComponent: MetaComponent = {
  id: 'cmp-test',
  type: 'Button',
  props: { label: 'Test' },
  layout: { x: 0, y: 0, w: 100, h: 40 },
  events: [],
  bindings: [],
  children: [],
};

describe('editorStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('adds and selects component', () => {
    const store = useEditorStore();
    store.addComponent(structuredClone(sampleComponent));
    expect(store.activePage?.components).toHaveLength(3);
    expect(store.selectedComponent?.id).toBe('cmp-test');
  });

  it('supports undo and redo', () => {
    const store = useEditorStore();
    store.addComponent(structuredClone(sampleComponent));
    store.undo();
    expect(store.activePage?.components.some((c) => c.id === 'cmp-test')).toBe(false);
    store.redo();
    expect(store.activePage?.components.some((c) => c.id === 'cmp-test')).toBe(true);
  });
});
