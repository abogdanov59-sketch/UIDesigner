<template>
  <div class="tree">
    <Tree
      :value="nodes"
      selection-mode="single"
      :selection-keys="selectionKeys"
      dragdrop-scope="component"
      @node-select="handleSelect"
      @node-drop="handleDrop"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Tree from 'primevue/tree';
import type { TreeDragDropOptions, TreeNode } from 'primevue/tree';
import type { MetaComponent } from '@/types/meta';
import { useEditorStore } from '@/store/editorStore';

/**
 * ComponentTreePanel displays the hierarchical structure of the page and syncs selection with the canvas.
 */
const editorStore = useEditorStore();
const { activePageSchema, selectedComponentId } = storeToRefs(editorStore);

const nodes = computed<TreeNode[]>(() => buildTree(activePageSchema.value.components));
const selectionKeys = computed(() =>
  selectedComponentId.value ? { [selectedComponentId.value]: true } : {},
);

function handleSelect(event: { node: TreeNode }): void {
  if (event.node?.key) {
    editorStore.selectComponent(String(event.node.key));
  }
}

function handleDrop(event: TreeDragDropOptions): void {
  if (!event.dragNode?.key || !event.dropNode?.key) return;
  editorStore.removeComponent(String(event.dragNode.key));
  const dropParentId = event.dropNode.parent?.key ?? null;
  const component = structuredClone(event.dragNode.data as MetaComponent);
  editorStore.addComponent(component, dropParentId ?? undefined);
  editorStore.selectComponent(component.id);
}

watch(activePageSchema, () => {
  if (selectedComponentId.value && !findComponent(activePageSchema.value.components, selectedComponentId.value)) {
    editorStore.selectComponent(null);
  }
});

function buildTree(components: MetaComponent[]): TreeNode[] {
  return components.map((component) => ({
    key: component.id,
    label: component.name ?? component.type,
    data: component,
    droppable: true,
    draggable: true,
    children: component.children ? buildTree(component.children) : [],
    icon: 'pi pi-box',
  }));
}

function findComponent(components: MetaComponent[], id: string): MetaComponent | null {
  for (const component of components) {
    if (component.id === id) return component;
    if (component.children) {
      const found = findComponent(component.children, id);
      if (found) return found;
    }
  }
  return null;
}
</script>

<style scoped>
.tree {
  @apply h-full overflow-y-auto p-2;
}
</style>
