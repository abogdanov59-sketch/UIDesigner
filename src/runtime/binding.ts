import type { MetaBinding, MetaComponent, MetaDataSource, MetaPage } from '@/types/meta';

interface BindingContext {
  variables: Record<string, unknown>;
  dataSources: Record<string, MetaDataSource>;
}

export function applyBindings(
  component: MetaComponent,
  page: MetaPage,
  context: BindingContext,
): MetaComponent {
  const next = structuredClone(component);

  if (component.bindings) {
    for (const binding of component.bindings) {
      const value = evaluateExpression(binding.expression, page, context);
      if (binding.target.startsWith('props.')) {
        const key = binding.target.replace('props.', '');
        next.props[key] = value;
      } else if (binding.target.startsWith('styles.inline.')) {
        const key = binding.target.replace('styles.inline.', '');
        if (!next.styles) next.styles = {};
        if (!next.styles.inline) next.styles.inline = {};
        next.styles.inline[key] = String(value ?? '');
      }
    }
  }

  next.children = next.children?.map((child) => applyBindings(child, page, context));
  return next;
}

function evaluateExpression(
  expression: string,
  page: MetaPage,
  context: BindingContext,
): unknown {
  if (expression.startsWith('@data.')) {
    const [sourceName, ...path] = expression.replace('@data.', '').split('.');
    const source = Object.values(context.dataSources).find((item) => item.name === sourceName);
    return path.reduce<unknown>((acc, key) => (acc as any)?.[key], source?.lastResult);
  }
  if (expression.startsWith('@var.')) {
    const key = expression.replace('@var.', '');
    return context.variables[key];
  }
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function('vars', 'page', `return ${expression};`);
    return fn(context.variables, page);
  } catch (error) {
    console.warn('Failed to evaluate expression', expression, error);
    return undefined;
  }
}
