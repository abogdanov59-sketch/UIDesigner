<template>
  <div
    ref="canvasRef"
    class="canvas"
    tabindex="0"
    @dragover.prevent
    @drop.prevent="handleDrop"
    @keydown.ctrl.z.prevent="editorStore.undo()"
    @keydown.ctrl.y.prevent="editorStore.redo()"
  >
    <div class="canvas__grid" :style="gridStyle">
      <div
        v-for="node in nodes"
        :key="node.component.id"
        class="canvas__component"
        :class="{ 'canvas__component--selected': node.component.id === selectedComponentId }"
        :style="nodeStyle(node.component)"
        draggable="false"
        @pointerdown="(event) => startDrag(event, node.component)"
      >
        <div class="canvas__component-content">
          <span class="canvas__label">{{ node.component.name ?? node.component.type }}</span>
        </div>

        <button
          v-if="node.component.id === selectedComponentId"
          class="canvas__remove"
          type="button"
          aria-label="Remove component"
          @click.stop="editorStore.removeComponent(node.component.id)"
        >
          <span class="pi pi-times" />
        </button>

        <div
          v-if="node.component.id === selectedComponentId"
          v-for="handle in resizeHandles"
          :key="handle"
          class="canvas__resize-handle"
          :class="`canvas__resize-handle--${handle}`"
          @pointerdown.stop="(event) => startResize(event, node.component, handle)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { MetaComponent } from '@/types/meta';
import { useEditorStore } from '@/store/editorStore';
import { useUIStore } from '@/store/uiStore';
import { nanoid } from '@/utils/nanoid';

/**
 * Canvas component renders the editable workspace and handles drag, drop, resize, and selection.
 * @event select
 * @event move
 * @event resize
 */
interface DragState {
  componentId: string | null;
  originPointer: { x: number; y: number } | null;
  originLayout: MetaComponent['layout'] | null;
}

interface ResizeState extends DragState {
  handle: ResizeHandle | null;
}

type ResizeHandle = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w';

interface CanvasNode {
  component: MetaComponent;
  depth: number;
}

const gridSize = 8;

const editorStore = useEditorStore();
const uiStore = useUIStore();
const { activePageSchema, selectedComponentId } = storeToRefs(editorStore);
const { zoomLevel } = storeToRefs(uiStore);

const canvasRef = ref<HTMLDivElement | null>(null);
const dragState = reactive<DragState>({ componentId: null, originPointer: null, originLayout: null });
const resizeState = reactive<ResizeState>({ componentId: null, originPointer: null, originLayout: null, handle: null });

const resizeHandles: ResizeHandle[] = ['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w'];

const nodes = computed<CanvasNode[]>(() => {
  return flattenComponents(activePageSchema.value.components);
});

const gridStyle = computed(() => ({
  transform: `scale(${zoomLevel.value})`,
  transformOrigin: '0 0',
}));

function nodeStyle(component: MetaComponent) {
  const { layout, styles } = component;
  return {
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.w}px`,
    height: `${layout.h}px`,
    ...(styles?.classes ? {} : { background: 'rgba(59,130,246,0.05)' }),
  };
}

function startDrag(event: PointerEvent, component: MetaComponent): void {
  editorStore.selectComponent(component.id);
  dragState.componentId = component.id;
  dragState.originPointer = toCanvasPoint(event);
  dragState.originLayout = structuredClone(component.layout);
  window.addEventListener('pointermove', handlePointerMove);
  window.addEventListener('pointerup', endPointerInteraction);
}

function startResize(event: PointerEvent, component: MetaComponent, handle: ResizeHandle): void {
  editorStore.selectComponent(component.id);
  resizeState.componentId = component.id;
  resizeState.handle = handle;
  resizeState.originPointer = toCanvasPoint(event);
  resizeState.originLayout = structuredClone(component.layout);
  window.addEventListener('pointermove', handleResizeMove);
  window.addEventListener('pointerup', endPointerInteraction);
}

function handlePointerMove(event: PointerEvent): void {
  if (!dragState.componentId || !dragState.originPointer || !dragState.originLayout) return;
  const current = toCanvasPoint(event);
  const deltaX = (current.x - dragState.originPointer.x) / zoomLevel.value;
  const deltaY = (current.y - dragState.originPointer.y) / zoomLevel.value;
  const nextLayout = {
    ...dragState.originLayout,
    x: snap(dragState.originLayout.x + deltaX),
    y: snap(dragState.originLayout.y + deltaY),
  };
  editorStore.moveComponent(dragState.componentId, nextLayout, { skipHistory: true });
}

function handleResizeMove(event: PointerEvent): void {
  if (!resizeState.componentId || !resizeState.originPointer || !resizeState.originLayout || !resizeState.handle)
    return;
  const current = toCanvasPoint(event);
  const dx = (current.x - resizeState.originPointer.x) / zoomLevel.value;
  const dy = (current.y - resizeState.originPointer.y) / zoomLevel.value;
  const layout = structuredClone(resizeState.originLayout);

  if (resizeState.handle.includes('e')) {
    layout.w = snap(Math.max(layout.minW ?? 32, layout.w + dx));
  }
  if (resizeState.handle.includes('s')) {
    layout.h = snap(Math.max(layout.minH ?? 32, layout.h + dy));
  }
  if (resizeState.handle.includes('w')) {
    const newWidth = snap(Math.max(layout.minW ?? 32, layout.w - dx));
    const delta = layout.w - newWidth;
    layout.x = snap(layout.x + delta);
    layout.w = newWidth;
  }
  if (resizeState.handle.includes('n')) {
    const newHeight = snap(Math.max(layout.minH ?? 32, layout.h - dy));
    const delta = layout.h - newHeight;
    layout.y = snap(layout.y + delta);
    layout.h = newHeight;
  }

  editorStore.moveComponent(resizeState.componentId, layout, { skipHistory: true });
}

function endPointerInteraction(): void {
  dragState.componentId = null;
  dragState.originPointer = null;
  const resizedComponent = resizeState.componentId;
  const draggedComponent = dragState.componentId;
  dragState.originLayout = null;
  resizeState.originPointer = null;
  resizeState.originLayout = null;
  dragState.componentId = null;
  resizeState.componentId = null;
  resizeState.handle = null;
  if (draggedComponent) {
    editorStore.pushHistory('Move component');
  } else if (resizedComponent) {
    editorStore.pushHistory('Resize component');
  }
  window.removeEventListener('pointermove', handlePointerMove);
  window.removeEventListener('pointermove', handleResizeMove);
  window.removeEventListener('pointerup', endPointerInteraction);
}

function handleDrop(event: DragEvent): void {
  const payload = event.dataTransfer?.getData('application/x-meta-component');
  if (!payload) return;
  try {
    const template = JSON.parse(payload) as Partial<MetaComponent> & { type: MetaComponent['type'] };
    const { x, y } = toCanvasPoint(event);
    const newComponent: MetaComponent = {
      id: nanoid(),
      type: template.type,
      name: template.name ?? template.type,
      props: template.props ?? {},
      styles: template.styles ?? {},
      layout: {
        x: snap((x - (template.layout?.w ?? 160) / 2) / zoomLevel.value),
        y: snap((y - (template.layout?.h ?? 80) / 2) / zoomLevel.value),
        w: template.layout?.w ?? 160,
        h: template.layout?.h ?? 80,
      },
      events: [],
      bindings: [],
      children: [],
    };
    editorStore.addComponent(newComponent, selectedComponentId.value ?? undefined);
  } catch (error) {
    console.error('Failed to drop component', error);
  }
}

function toCanvasPoint(event: PointerEvent | DragEvent): { x: number; y: number } {
  const rect = canvasRef.value?.getBoundingClientRect();
  return {
    x: event.clientX - (rect?.left ?? 0),
    y: event.clientY - (rect?.top ?? 0),
  };
}

function snap(value: number): number {
  return Math.round(value / gridSize) * gridSize;
}


function flattenComponents(components: MetaComponent[], depth = 0): CanvasNode[] {
  return components.flatMap((component) => [
    { component, depth },
    ...(component.children ? flattenComponents(component.children, depth + 1) : []),
  ]);
}

onBeforeUnmount(() => {
  endPointerInteraction();
});
</script>

<style scoped>
.canvas {
  @apply relative flex h-full w-full outline-none;
  background-image: linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px);
  background-size: 40px 40px;
  position: relative;
  overflow: auto;
}

.canvas__grid {
  position: relative;
  width: 2000px;
  height: 2000px;
  transform-origin: top left;
}

.canvas__component {
  position: absolute;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.2);
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas__component--selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.canvas__component-content {
  pointer-events: none;
  text-align: center;
  color: #1e293b;
  font-size: 0.875rem;
}

.canvas__label {
  background: rgba(15, 23, 42, 0.05);
  border-radius: 9999px;
  padding: 0.125rem 0.5rem;
}

.canvas__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(15, 23, 42, 0.8);
  color: white;
  border-radius: 9999px;
  border: none;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
}

.canvas__resize-handle {
  position: absolute;
  width: 10px;
  height: 10px;
  background: #3b82f6;
  border-radius: 9999px;
  border: 2px solid white;
}

.canvas__resize-handle--nw {
  top: -6px;
  left: -6px;
  cursor: nwse-resize;
}

.canvas__resize-handle--ne {
  top: -6px;
  right: -6px;
  cursor: nesw-resize;
}

.canvas__resize-handle--sw {
  bottom: -6px;
  left: -6px;
  cursor: nesw-resize;
}

.canvas__resize-handle--se {
  bottom: -6px;
  right: -6px;
  cursor: nwse-resize;
}

.canvas__resize-handle--n {
  top: -6px;
  left: calc(50% - 5px);
  cursor: ns-resize;
}

.canvas__resize-handle--s {
  bottom: -6px;
  left: calc(50% - 5px);
  cursor: ns-resize;
}

.canvas__resize-handle--e {
  top: calc(50% - 5px);
  right: -6px;
  cursor: ew-resize;
}

.canvas__resize-handle--w {
  top: calc(50% - 5px);
  left: -6px;
  cursor: ew-resize;
}
</style>
