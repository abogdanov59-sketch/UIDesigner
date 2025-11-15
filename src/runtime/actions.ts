import { useRouter } from 'vue-router';
import { useEditorStore } from '@/store/editorStore';
import { useDataStore } from '@/store/dataStore';
import type { MetaAction } from '@/types/meta';

export interface ActionContext {
  eventSourceId: string;
  payload?: unknown;
}

/**
 * Executes meta actions sequentially.
 */
export async function runActions(actions: MetaAction[], context: ActionContext): Promise<void> {
  const router = useRouter();
  const editorStore = useEditorStore();
  const dataStore = useDataStore();

  for (const action of actions) {
    switch (action.type) {
      case 'apiCall': {
        if (typeof action.params?.sourceId === 'string') {
          await dataStore.execute(action.params.sourceId as string);
        }
        break;
      }
      case 'setVariable': {
        if (typeof action.params?.name === 'string') {
          editorStore.schema.globals.variables[action.params.name as string] = action.params.value;
        }
        break;
      }
      case 'navigate': {
        if (typeof action.params?.route === 'string') {
          router.push(String(action.params.route));
        }
        break;
      }
      case 'notification': {
        if (typeof action.params?.message === 'string') {
          // eslint-disable-next-line no-alert
          alert(String(action.params.message));
        }
        break;
      }
      case 'condition': {
        if (typeof action.params?.expression === 'string') {
          // eslint-disable-next-line no-new-func
          const fn = new Function('context', `return (${action.params.expression});`);
          const result = !!fn(context);
          const branch = result ? action.children?.[0] : action.children?.[1];
          if (branch) {
            await runActions([branch], context);
          }
        }
        break;
      }
      case 'sequence': {
        if (Array.isArray(action.children)) {
          await runActions(action.children, context);
        }
        break;
      }
      default:
        console.warn('Unsupported action type', action.type);
    }
  }
}
