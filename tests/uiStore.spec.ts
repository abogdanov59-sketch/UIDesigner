import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUIStore } from '@/store/uiStore';

describe('uiStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('toggles panel state', () => {
    const store = useUIStore();
    expect(store.panelState.palette).toBe(true);
    store.togglePanel('palette');
    expect(store.panelState.palette).toBe(false);
  });

  it('bounds zoom level', () => {
    const store = useUIStore();
    store.setZoom(5);
    expect(store.zoomLevel).toBe(2);
    store.setZoom(0.1);
    expect(store.zoomLevel).toBe(0.3);
  });
});
