import { h, resolveComponent } from 'vue';
import type { MetaComponent } from '@/types/meta';

const builtin = new Map<string, string>([
  ['Container', 'div'],
  ['Text', 'span'],
  ['Button', 'Button'],
  ['Input', 'InputText'],
  ['DataTable', 'DataTable'],
  ['Card', 'Card'],
]);

export function resolveComponentType(type: MetaComponent['type']): any {
  const tag = builtin.get(type) ?? type;
  if (typeof tag === 'string' && tag === tag.toLowerCase()) {
    return tag;
  }
  return resolveComponent(tag);
}

export function renderMetaComponent(component: MetaComponent) {
  const resolved = resolveComponentType(component.type);
  const props = {
    ...component.props,
    class: component.styles?.classes,
    style: component.styles?.inline,
  };

  const children = component.children?.map((child) => renderMetaComponent(child));

  if (!resolved) {
    return h('div', { class: 'p-4 border border-dashed border-red-400 text-red-500' }, [
      `Unknown component: ${component.type}`,
    ]);
  }

  return h(resolved as any, props, { default: () => children });
}
