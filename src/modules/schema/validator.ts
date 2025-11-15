import type { MetaUISchema } from '@/types/meta';

/**
 * Lightweight validator ensuring minimum schema fields exist.
 */
export function validateSchema(schema: MetaUISchema): boolean {
  if (!schema.version || !schema.appName) return false;
  if (!Array.isArray(schema.pages)) return false;
  for (const page of schema.pages) {
    if (!page.id || !page.name) return false;
    if (!Array.isArray(page.components)) return false;
  }
  return true;
}
