<template>
  <div class="events-panel" v-if="targetComponent">
    <div class="events-panel__header">
      <Dropdown
        v-model="selectedEvent"
        :options="eventOptions"
        option-label="label"
        option-value="value"
        placeholder="Select event"
      />
      <Button icon="pi pi-plus" label="Add event" size="small" @click="createEvent" />
    </div>

    <div v-if="selectedEvent">
      <div class="flex items-center justify-between">
        <h3 class="events-panel__title">Actions</h3>
        <Button icon="pi pi-plus" text label="Add action" size="small" @click="addAction" />
      </div>
      <div class="space-y-2">
        <div v-for="action in currentActions" :key="action.id" class="events-panel__action">
          <Dropdown
            v-model="action.type"
            :options="actionTypes"
            option-label="label"
            option-value="value"
            @change="commitActions"
          />
          <Textarea
            v-model="actionParams[action.id]"
            rows="3"
            autoResize
            class="w-full"
            placeholder="{\n  \"message\": \"Hello\"\n}"
            @change="commitActions"
          />
          <Button icon="pi pi-trash" severity="danger" text @click="removeAction(action.id)" />
        </div>
      </div>
    </div>
  </div>
  <div v-else class="events-panel__empty">Select a component or page to configure events.</div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Textarea from 'primevue/textarea';
import type { MetaAction, MetaComponent, MetaEvent } from '@/types/meta';
import { useEditorStore } from '@/store/editorStore';
import { nanoid } from '@/utils/nanoid';

/**
 * EventsActionsPanel manages event-action pipelines for the selected component.
 */
const editorStore = useEditorStore();
const { selectedComponent } = storeToRefs(editorStore);

const eventOptions = computed(() => [
  { label: 'onClick', value: 'onClick' },
  { label: 'onChange', value: 'onChange' },
  { label: 'onMount', value: 'onMount' },
]);

const actionTypes = [
  { label: 'API call', value: 'apiCall' },
  { label: 'Set variable', value: 'setVariable' },
  { label: 'Navigate', value: 'navigate' },
  { label: 'Dialog', value: 'dialog' },
  { label: 'Notification', value: 'notification' },
  { label: 'Condition', value: 'condition' },
  { label: 'Sequence', value: 'sequence' },
];

const activeEvent = ref<string | null>(null);
const selectedEvent = computed({
  get: () => activeEvent.value,
  set: (value: string | null) => {
    activeEvent.value = value;
  },
});

const actionParams = reactive<Record<string, string>>({});

const targetComponent = computed<MetaComponent | null>(() => selectedComponent.value ?? null);

const currentEvent = computed(() => {
  if (!targetComponent.value) return null;
  return (targetComponent.value.events ?? []).find((item) => item.event === activeEvent.value) ?? null;
});

const currentActions = computed(() => currentEvent.value?.actions ?? []);

watch(selectedComponent, (component) => {
  if (!component) return;
  Object.keys(actionParams).forEach((key) => delete actionParams[key]);
  activeEvent.value = component.events?.[0]?.event ?? null;
  syncActionParams(component.events ?? []);
});

function createEvent(): void {
  if (!targetComponent.value || !selectedEvent.value) return;
  const events = [...(targetComponent.value.events ?? [])];
  if (!events.some((event) => event.event === selectedEvent.value)) {
    events.push({ event: selectedEvent.value, actions: [] });
    updateEvents(events);
    activeEvent.value = selectedEvent.value;
  }
}

function addAction(): void {
  if (!targetComponent.value || !currentEvent.value) return;
  const actions = [...currentEvent.value.actions, { id: nanoid(), type: 'notification', params: {} }];
  updateActions(actions);
}

function removeAction(id: string): void {
  if (!targetComponent.value || !currentEvent.value) return;
  const actions = currentEvent.value.actions.filter((action) => action.id !== id);
  updateActions(actions);
}

function commitActions(): void {
  if (!targetComponent.value || !currentEvent.value) return;
  const actions = currentEvent.value.actions.map((action) => ({
    ...action,
    params: parseParams(actionParams[action.id]),
  }));
  updateActions(actions);
}

function updateActions(actions: MetaAction[]): void {
  if (!targetComponent.value) return;
  const events = (targetComponent.value.events ?? []).map((event) =>
    event.event === currentEvent.value?.event ? { ...event, actions } : event,
  );
  updateEvents(events);
}

function updateEvents(events: MetaEvent[]): void {
  if (!targetComponent.value) return;
  editorStore.updateComponent(targetComponent.value.id, { events });
  syncActionParams(events);
}

function parseParams(value: string | undefined): Record<string, unknown> {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn('Failed to parse action params', error);
    return {};
  }
}

function syncActionParams(events: MetaEvent[]): void {
  for (const event of events) {
    for (const action of event.actions) {
      actionParams[action.id] = JSON.stringify(action.params ?? {}, null, 2);
    }
  }
}
</script>

<style scoped>
.events-panel {
  @apply space-y-4 p-4;
}

.events-panel__header {
  @apply flex items-center gap-2;
}

.events-panel__title {
  @apply text-sm font-semibold uppercase text-slate-500;
}

.events-panel__action {
  @apply space-y-2 rounded-lg bg-white p-3 shadow-sm;
}

.events-panel__empty {
  @apply grid h-full place-items-center text-sm text-slate-500;
}
</style>
