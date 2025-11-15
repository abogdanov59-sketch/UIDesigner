<template>
  <div class="palette">
    <div class="palette__controls">
      <IconField>
        <InputIcon>
          <i class="pi pi-search" />
        </InputIcon>
        <InputText v-model="searchTerm" placeholder="Search components" />
      </IconField>
    </div>

    <Accordion multiple>
      <AccordionTab v-for="group in filteredGroups" :key="group.id" :header="group.label">
        <div class="palette__items">
          <Button
            v-for="component in group.items"
            :key="component.type"
            class="palette__item"
            size="small"
            :label="component.label"
            :icon="component.icon"
            draggable="true"
            @dragstart="(event) => handleDragStart(event, component)"
          />
        </div>
      </AccordionTab>
    </Accordion>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import Button from 'primevue/button';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import InputText from 'primevue/inputtext';
import type { MetaComponent } from '@/types/meta';

interface PaletteItem {
  type: MetaComponent['type'];
  label: string;
  icon: string;
  template: Partial<MetaComponent>;
}

interface PaletteGroup {
  id: string;
  label: string;
  items: PaletteItem[];
}

/**
 * ComponentPalette lists available meta components and supports drag and drop to the canvas.
 */
const groups = ref<PaletteGroup[]>([
  {
    id: 'layout',
    label: 'Layout',
    items: [
      {
        type: 'Container',
        label: 'Container',
        icon: 'pi pi-clone',
        template: {
          layout: { w: 320, h: 240, x: 0, y: 0 },
          styles: { classes: 'bg-white rounded-lg shadow-inner p-4' },
        },
      },
      {
        type: 'Card',
        label: 'Card',
        icon: 'pi pi-id-card',
        template: {
          layout: { w: 360, h: 220, x: 0, y: 0 },
          props: { header: 'Card header' },
        },
      },
    ],
  },
  {
    id: 'form',
    label: 'Form controls',
    items: [
      {
        type: 'Input',
        label: 'Input field',
        icon: 'pi pi-pencil',
        template: {
          layout: { w: 280, h: 60, x: 0, y: 0 },
          props: { placeholder: 'Enter value' },
        },
      },
      {
        type: 'Button',
        label: 'Button',
        icon: 'pi pi-check',
        template: {
          layout: { w: 140, h: 48, x: 0, y: 0 },
          props: { label: 'Submit', severity: 'primary' },
        },
      },
    ],
  },
  {
    id: 'data',
    label: 'Data display',
    items: [
      {
        type: 'DataTable',
        label: 'Table',
        icon: 'pi pi-table',
        template: {
          layout: { w: 560, h: 320, x: 0, y: 0 },
          props: {
            columns: [
              { field: 'name', header: 'Name' },
              { field: 'email', header: 'Email' },
            ],
          },
        },
      },
      {
        type: 'Text',
        label: 'Text',
        icon: 'pi pi-align-left',
        template: {
          layout: { w: 240, h: 60, x: 0, y: 0 },
          props: { text: 'Static text' },
        },
      },
    ],
  },
]);

const searchTerm = ref('');

const filteredGroups = computed(() => {
  if (!searchTerm.value) return groups.value;
  const term = searchTerm.value.toLowerCase();
  return groups.value
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.label.toLowerCase().includes(term)),
    }))
    .filter((group) => group.items.length > 0);
});

function handleDragStart(event: DragEvent, component: PaletteItem): void {
  event.dataTransfer?.setData(
    'application/x-meta-component',
    JSON.stringify({ type: component.type, ...component.template }),
  );
  event.dataTransfer?.setData('text/plain', component.type);
  event.dataTransfer?.setDragImage(createDragImage(component.label), 0, 0);
}

function createDragImage(label: string): HTMLElement {
  const el = document.createElement('div');
  el.textContent = label;
  el.style.padding = '8px 12px';
  el.style.background = '#3b82f6';
  el.style.color = 'white';
  el.style.borderRadius = '12px';
  document.body.appendChild(el);
  setTimeout(() => document.body.removeChild(el), 0);
  return el;
}
</script>

<style scoped>
.palette {
  @apply h-full space-y-4 p-4;
}

.palette__controls {
  @apply flex items-center gap-2;
}

.palette__items {
  @apply grid grid-cols-1 gap-2 py-2;
}

.palette__item {
  @apply w-full justify-start gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200;
}
</style>
