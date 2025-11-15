import type { ComponentType, MetaComponent } from '@/types/meta';

type PropertyType = 'string' | 'number' | 'boolean' | 'enum' | 'color' | 'object';

export interface ComponentPropertyMeta {
  name: string;
  label: string;
  type: PropertyType;
  options?: { label: string; value: unknown }[];
  default?: unknown;
}

export interface ComponentMetaModel {
  type: ComponentType;
  properties: ComponentPropertyMeta[];
}

const registry: Record<ComponentType, ComponentMetaModel> = {
  Container: {
    type: 'Container',
    properties: [
      { name: 'padding', label: 'Padding', type: 'string', default: '1rem' },
      { name: 'gap', label: 'Gap', type: 'string', default: '1rem' },
    ],
  },
  Text: {
    type: 'Text',
    properties: [
      { name: 'text', label: 'Text', type: 'string', default: 'Sample text' },
      { name: 'size', label: 'Font size', type: 'enum', options: sizes(), default: 'md' },
    ],
  },
  Button: {
    type: 'Button',
    properties: [
      { name: 'label', label: 'Label', type: 'string', default: 'Button' },
      {
        name: 'severity',
        label: 'Severity',
        type: 'enum',
        options: ['primary', 'secondary', 'success', 'danger', 'info', 'contrast'].map((value) => ({
          label: value,
          value,
        })),
        default: 'primary',
      },
      { name: 'disabled', label: 'Disabled', type: 'boolean', default: false },
    ],
  },
  Input: {
    type: 'Input',
    properties: [
      { name: 'modelValue', label: 'Value', type: 'string', default: '' },
      { name: 'placeholder', label: 'Placeholder', type: 'string', default: 'Enter value' },
    ],
  },
  DataTable: {
    type: 'DataTable',
    properties: [
      { name: 'value', label: 'Data expression', type: 'string', default: '@data.Contacts.contacts' },
      { name: 'rows', label: 'Rows per page', type: 'number', default: 10 },
    ],
  },
  Card: {
    type: 'Card',
    properties: [
      { name: 'header', label: 'Header', type: 'string', default: 'Card header' },
      { name: 'subheader', label: 'Sub header', type: 'string', default: '' },
    ],
  },
};

function sizes() {
  return [
    { label: 'Small', value: 'sm' },
    { label: 'Medium', value: 'md' },
    { label: 'Large', value: 'lg' },
  ];
}

export function resolveMetaModel(type: ComponentType): ComponentMetaModel {
  return registry[type];
}

export function applyDefaults(component: MetaComponent): MetaComponent {
  const meta = resolveMetaModel(component.type);
  const props = { ...component.props };
  for (const property of meta.properties) {
    if (props[property.name] === undefined && property.default !== undefined) {
      props[property.name] = property.default;
    }
  }
  return { ...component, props };
}
