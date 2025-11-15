<template>
  <div class="min-h-screen bg-slate-100 p-6">
    <div class="mb-4 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Preview</h1>
      <RouterLink to="/" class="text-primary-500 hover:underline">Back to editor</RouterLink>
    </div>
    <RuntimeRenderer :schema="schema" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import RuntimeRenderer from '@/runtime/RuntimeRenderer.vue';
import { useEditorStore } from '@/store/editorStore';

const editorStore = useEditorStore();
const { activePageSchema } = storeToRefs(editorStore);

const schema = computed(() => activePageSchema.value);
</script>
