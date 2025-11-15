/**
 * Meta UI schema definitions describe the serializable representation of the UI.
 */
export type ComponentType =
  | 'Container'
  | 'Text'
  | 'Button'
  | 'Input'
  | 'DataTable'
  | 'Card';

export interface MetaAction {
  id: string;
  type: 'apiCall' | 'setVariable' | 'navigate' | 'dialog' | 'notification' | 'condition' | 'sequence';
  params: Record<string, unknown>;
  children?: MetaAction[];
}

export interface MetaEvent {
  event: string;
  actions: MetaAction[];
}

export interface MetaBinding {
  target: string;
  expression: string;
}

export interface MetaLayoutBreakpoint {
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  props?: Record<string, unknown>;
  styles?: MetaStyles;
}

export interface MetaStyles {
  classes?: string;
  inline?: Record<string, string>;
}

export interface MetaLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  breakpoints?: MetaLayoutBreakpoint[];
}

export interface MetaComponent {
  id: string;
  type: ComponentType;
  name?: string;
  props: Record<string, unknown>;
  styles?: MetaStyles;
  layout: MetaLayout;
  events?: MetaEvent[];
  bindings?: MetaBinding[];
  children?: MetaComponent[];
}

export interface MetaDataSource {
  id: string;
  name: string;
  type: 'static' | 'rest';
  config: {
    url?: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    params?: Record<string, string>;
    body?: unknown;
    staticData?: unknown;
  };
  lastResult?: unknown;
}

export interface MetaPage {
  id: string;
  name: string;
  route: string;
  components: MetaComponent[];
  layout?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  dataSources: MetaDataSource[];
  events: MetaEvent[];
}

export interface MetaThemeSettings {
  id: string;
  name: string;
  primePreset: string;
  tailwindPresets: string[];
  tokens: Record<string, string>;
}

export interface MetaUISchema {
  version: string;
  appName: string;
  pages: MetaPage[];
  globals: {
    variables: Record<string, unknown>;
    theme: MetaThemeSettings;
  };
}

export type HistoryEntry = {
  id: string;
  timestamp: number;
  schema: MetaUISchema;
  description: string;
};
