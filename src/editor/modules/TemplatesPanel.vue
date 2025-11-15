<template>
  <div class="templates-panel">
    <h3 class="templates-panel__heading">Page templates</h3>
    <div class="templates-panel__list">
      <Card v-for="template in pageTemplates" :key="template.id" class="templates-panel__item">
        <template #title>{{ template.name }}</template>
        <template #content>
          <p class="text-sm text-slate-600">{{ template.description }}</p>
        </template>
        <template #footer>
          <Button label="Apply" size="small" @click="applyTemplate(template)" />
        </template>
      </Card>
    </div>

    <h3 class="templates-panel__heading">Design components</h3>
    <div class="templates-panel__list">
      <Card v-for="component in designComponents" :key="component.id" class="templates-panel__item">
        <template #title>{{ component.name }}</template>
        <template #content>
          <p class="text-sm text-slate-600">{{ component.description }}</p>
        </template>
        <template #footer>
          <Button label="Insert" size="small" @click="insertDesignComponent(component)" />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Card from 'primevue/card';
import { useEditorStore } from '@/store/editorStore';
import { nanoid } from '@/utils/nanoid';
import type { MetaComponent } from '@/types/meta';

interface PageTemplate {
  id: string;
  name: string;
  description: string;
  components: MetaComponent[];
}

interface DesignComponent {
  id: string;
  name: string;
  description: string;
  component: MetaComponent;
}

/**
 * TemplatesPanel exposes reusable page and component templates.
 */
const editorStore = useEditorStore();

const pageTemplates: PageTemplate[] = [
  {
    id: 'tpl_dashboard',
    name: 'Dashboard',
    description: 'Hero section with statistics and quick actions.',
    components: [
      {
        id: 'tpl_card',
        type: 'Card',
        props: { header: 'Dashboard' },
        styles: { classes: 'bg-white shadow-lg rounded-lg p-6 space-y-4' },
        layout: { x: 32, y: 32, w: 640, h: 240 },
        children: [
          {
            id: 'tpl_stats',
            type: 'Text',
            props: { text: 'Today\'s highlights' },
            layout: { x: 0, y: 0, w: 320, h: 32 },
            styles: { classes: 'text-2xl font-semibold' },
          },
        ],
      },
    ],
  },
];

const designComponents: DesignComponent[] = [
  {
    id: 'dc_primary_button',
    name: 'Primary CTA',
    description: 'Primary call-to-action button with consistent styling.',
    component: {
      id: 'dc_btn',
      type: 'Button',
      props: { label: 'Call to Action', severity: 'primary' },
      styles: { classes: 'px-6 py-3 text-base font-semibold' },
      layout: { x: 0, y: 0, w: 160, h: 48 },
    },
  },
];

function applyTemplate(template: PageTemplate): void {
  const page = editorStore.activePage;
  if (!page) return;
  for (const component of template.components) {
    editorStore.addComponent(cloneComponent(component));
  }
}

function insertDesignComponent(design: DesignComponent): void {
  editorStore.addComponent(cloneComponent(design.component));
}

function cloneComponent(component: MetaComponent): MetaComponent {
  const id = nanoid();
  return {
    ...structuredClone(component),
    id,
    children: component.children?.map((child) => cloneComponent(child)) ?? [],
  };
}
</script>

<style scoped>
.templates-panel {
  @apply space-y-6 p-4;
}

.templates-panel__heading {
  @apply text-sm font-semibold uppercase text-slate-500;
}

.templates-panel__list {
  @apply space-y-3;
}

.templates-panel__item {
  @apply border border-slate-200 shadow-sm;
}
</style>
