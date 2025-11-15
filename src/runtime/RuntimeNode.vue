<template>
  <component :is="resolvedComponent" v-bind="runtimeProps">
    <template v-if="component.children" #default>
      <RuntimeNode
        v-for="child in component.children"
        :key="child.id"
        :component="child"
        :page="page"
      />
    </template>
    <template v-if="isText" #default>{{ component.props.text }}</template>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import type { MetaComponent, MetaPage } from '@/types/meta';
import { resolveComponentType } from './componentMap';
import { runActions } from './actions';

/**
 * RuntimeNode renders a single meta component and recursively handles its children.
 * @prop component
 * @prop page
 */
interface Props {
  component: MetaComponent;
  page: MetaPage;
}

defineOptions({ name: 'RuntimeNode' });
const props = defineProps<Props>();

const resolvedComponent = computed<Component | string>(() => {
  const resolved = resolveComponentType(props.component.type);
  if (!resolved) {
    return 'div';
  }
  return resolved as Component | string;
});

const runtimeProps = computed(() => {
  const events: Record<string, (payload: unknown) => void> = {};
  if (props.component.events) {
    for (const event of props.component.events) {
      events[event.event] = (payload: unknown) => runActions(event.actions, {
        eventSourceId: props.component.id,
        payload,
      });
    }
  }

  return {
    ...props.component.props,
    class: props.component.styles?.classes,
    style: props.component.styles?.inline,
    ...events,
  };
});

const isText = computed(() => props.component.type === 'Text');

if (!resolvedComponent.value) {
  console.warn('Component not resolved', props.component.type);
}
</script>
