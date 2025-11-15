import type { MetaUISchema } from '@/types/meta';
import { validateSchema } from './validator';

/**
 * Serializes schema into JSON string.
 */
export function serializeSchema(schema: MetaUISchema): string {
  if (!validateSchema(schema)) {
    throw new Error('Schema validation failed.');
  }
  return JSON.stringify(schema, null, 2);
}

/**
 * Parses schema from JSON.
 */
export function parseSchema(json: string): MetaUISchema {
  const parsed = JSON.parse(json) as MetaUISchema;
  if (!validateSchema(parsed)) {
    throw new Error('Invalid schema format.');
  }
  return parsed;
}
