import { ref } from 'vue';
import { defineStore } from 'pinia';

type PanelId =
  | 'palette'
  | 'tree'
  | 'data'
  | 'events'
  | 'theme'
  | 'properties'
  | 'navigation';

type PanelState = Record<PanelId, boolean>;

const defaultState: PanelState = {
  palette: true,
  tree: true,
  data: true,
  events: true,
  theme: false,
  properties: true,
  navigation: true,
};

/**
 * UI store manages visibility and collapsed state of editor panels.
 */
export const useUIStore = defineStore('ui', () => {
  const panelState = ref<PanelState>({ ...defaultState });
  const zoomLevel = ref(1);

  function togglePanel(panel: PanelId): void {
    panelState.value[panel] = !panelState.value[panel];
  }

  function setZoom(level: number): void {
    zoomLevel.value = Math.min(2, Math.max(0.3, level));
  }

  function reset(): void {
    panelState.value = { ...defaultState };
    zoomLevel.value = 1;
  }

  return { panelState, zoomLevel, togglePanel, setZoom, reset };
});
