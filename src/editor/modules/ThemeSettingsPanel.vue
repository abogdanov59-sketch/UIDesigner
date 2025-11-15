<template>
  <div class="theme-panel">
    <div class="theme-panel__header">
      <h3 class="text-lg font-semibold">Theme</h3>
      <Dropdown v-model="theme.primePreset" :options="primePresets" />
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div v-for="(value, key) in theme.tokens" :key="key" class="theme-panel__token">
        <label class="theme-panel__label">{{ key }}</label>
        <ColorPicker v-model="theme.tokens[key]" format="hex" @change="commit" />
      </div>
    </div>
    <div>
      <h4 class="theme-panel__label">Tailwind presets</h4>
      <Chips v-model="tailwindPresets" @change="commit" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Dropdown from 'primevue/dropdown';
import ColorPicker from 'primevue/colorpicker';
import Chips from 'primevue/chips';
import { useSettingsStore } from '@/store/settingsStore';
import { useEditorStore } from '@/store/editorStore';

/**
 * ThemeSettingsPanel allows adjusting global PrimeVue and Tailwind presets.
 */
const settingsStore = useSettingsStore();
const editorStore = useEditorStore();
const { theme } = storeToRefs(settingsStore);

const primePresets = ['aura', 'lara-light-indigo', 'md-light-indigo'].map((value) => ({
  label: value,
  value,
}));

const tailwindPresets = ref<string[]>([...theme.value.tailwindPresets]);

watch(theme, (value) => {
  tailwindPresets.value = [...value.tailwindPresets];
});

function commit(): void {
  settingsStore.updateTheme({
    tokens: { ...theme.value.tokens },
    tailwindPresets: [...tailwindPresets.value],
  });
  editorStore.pushHistory('Update theme');
}
</script>

<style scoped>
.theme-panel {
  @apply space-y-4 p-4;
}

.theme-panel__header {
  @apply flex items-center justify-between;
}

.theme-panel__token {
  @apply flex items-center gap-2;
}

.theme-panel__label {
  @apply text-xs font-semibold uppercase text-slate-500;
}
</style>
