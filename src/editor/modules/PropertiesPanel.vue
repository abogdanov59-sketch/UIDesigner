<template>
  <div class="properties" v-if="selectedComponent">
    <h2 class="properties__title">{{ selectedComponent.name ?? selectedComponent.type }}</h2>
    <div class="properties__section">
      <h3 class="properties__section-title">General</h3>
      <div class="properties__fields">
        <div v-for="property in metaModel.properties" :key="property.name" class="properties__field">
          <label class="properties__label">{{ property.label }}</label>
          <component :is="fieldComponent(property.type)" v-bind="fieldBindings(property)" />
        </div>
      </div>
    </div>

    <div class="properties__section">
      <h3 class="properties__section-title">Layout</h3>
      <div class="properties__layout-grid">
        <FloatLabel v-for="key in layoutKeys" :key="key">
          <InputNumber
            :input-id="`layout-${key}`"
            v-model.number="workingLayout[key]"
            :min="0"
            @update:model-value="commitLayout"
          />
          <label :for="`layout-${key}`" class="properties__label">{{ key.toUpperCase() }}</label>
        </FloatLabel>
      </div>
    </div>

    <div class="properties__section">
      <TabView>
        <TabPanel header="Tailwind classes">
          <Textarea v-model="workingStyles.classes" autoResize rows="3" @change="commitStyles" />
        </TabPanel>
        <TabPanel header="Inline styles">
          <div class="space-y-2">
            <div
              v-for="(value, key) in workingStyles.inline"
              :key="key"
              class="flex items-center gap-2"
            >
              <InputText v-model="workingStyles.inline[key]" :placeholder="key" @change="commitStyles" />
              <Button icon="pi pi-times" severity="danger" text @click="removeInline(key)" />
            </div>
            <Button label="Add style" icon="pi pi-plus" text @click="addInline" />
          </div>
        </TabPanel>
      </TabView>
    </div>
  </div>
  <div v-else class="properties__empty">Select a component to edit its properties.</div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import Button from 'primevue/button';
import FloatLabel from 'primevue/floatlabel';
import InputNumber from 'primevue/inputnumber';
import InputSwitch from 'primevue/inputswitch';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import { storeToRefs } from 'pinia';
import type { MetaLayout, MetaStyles } from '@/types/meta';
import { useEditorStore } from '@/store/editorStore';
import { resolveMetaModel } from '@/modules/metadata/componentMeta';

/**
 * PropertiesPanel renders dynamic controls based on component meta model.
 * @prop selectedComponent
 */
const editorStore = useEditorStore();
const { selectedComponent } = storeToRefs(editorStore);

const layoutKeys: Array<keyof MetaLayout> = ['x', 'y', 'w', 'h'];
const workingProps = reactive<Record<string, unknown>>({});
const workingLayout = reactive<MetaLayout>({ x: 0, y: 0, w: 0, h: 0 });
const workingStyles = reactive<MetaStyles>({ classes: '', inline: {} });

const metaModel = computed(() =>
  selectedComponent.value ? resolveMetaModel(selectedComponent.value.type) : resolveMetaModel('Container'),
);

watch(
  selectedComponent,
  (component) => {
    if (!component) return;
    Object.keys(workingProps).forEach((key) => delete workingProps[key]);
    Object.assign(workingProps, component.props);
    Object.assign(workingLayout, component.layout);
    workingStyles.classes = component.styles?.classes ?? '';
    workingStyles.inline = { ...(component.styles?.inline ?? {}) };
  },
  { immediate: true },
);

function fieldComponent(type: string) {
  switch (type) {
    case 'boolean':
      return InputSwitch;
    case 'number':
      return InputNumber;
    case 'enum':
      return Dropdown;
    default:
      return InputText;
  }
}

function fieldBindings(property: { name: string; type: string; options?: any[] }) {
  const bindings: Record<string, unknown> = {
    modelValue: workingProps[property.name] ?? '',
    'onUpdate:modelValue': (value: unknown) => updateProperty(property.name, value),
  };
  if (property.type === 'enum') {
    bindings.options = property.options;
    bindings.optionLabel = 'label';
    bindings.optionValue = 'value';
  }
  if (property.type === 'boolean') {
    bindings.modelValue = Boolean(workingProps[property.name]);
  }
  if (property.type === 'number') {
    bindings.modelValue = Number(workingProps[property.name] ?? 0);
  }
  return bindings;
}

function updateProperty(name: string, value: unknown): void {
  workingProps[name] = value;
  commitProps();
}

function commitProps(): void {
  if (!selectedComponent.value) return;
  editorStore.updateComponent(selectedComponent.value.id, {
    props: { ...selectedComponent.value.props, ...workingProps },
  });
}

function commitLayout(): void {
  if (!selectedComponent.value) return;
  editorStore.moveComponent(selectedComponent.value.id, { ...workingLayout });
}

function commitStyles(): void {
  if (!selectedComponent.value) return;
  editorStore.updateComponent(selectedComponent.value.id, {
    styles: {
      classes: workingStyles.classes,
      inline: { ...(workingStyles.inline ?? {}) },
    },
  });
}

function addInline(): void {
  workingStyles.inline = { ...(workingStyles.inline ?? {}), 'new-prop': '' };
  commitStyles();
}

function removeInline(key: string): void {
  if (!workingStyles.inline) return;
  const copy = { ...workingStyles.inline };
  delete copy[key];
  workingStyles.inline = copy;
  commitStyles();
}
</script>

<style scoped>
.properties {
  @apply flex h-full flex-col gap-6 p-4;
}

.properties__title {
  @apply text-lg font-semibold;
}

.properties__section {
  @apply space-y-3 rounded-lg bg-white p-4 shadow-sm;
}

.properties__section-title {
  @apply text-sm font-medium uppercase tracking-wide text-slate-500;
}

.properties__fields {
  @apply grid gap-3;
}

.properties__field {
  @apply space-y-1;
}

.properties__label {
  @apply text-xs font-semibold uppercase text-slate-500;
}

.properties__layout-grid {
  @apply grid grid-cols-2 gap-3;
}

.properties__empty {
  @apply grid h-full place-items-center text-sm text-slate-500;
}
</style>
