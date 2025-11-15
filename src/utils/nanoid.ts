/**
 * Simple nanoid alternative for offline environment.
 */
export function nanoid(size = 10): string {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  const array = crypto.getRandomValues(new Uint32Array(size));
  for (let i = 0; i < size; i += 1) {
    id += chars[array[i] % chars.length];
  }
  return id;
}
