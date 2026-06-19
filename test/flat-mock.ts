/**
 * @fileoverview Mock for flat to avoid ES Module errors in Jest.
 */

export function flatten(target: unknown, opts?: { safe?: boolean; delimiter?: string }): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  function step(object: unknown, prev?: string) {
    if (!object || typeof object !== 'object') {
      return;
    }
    const obj = object as Record<string, unknown>;
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      const isArray = opts?.safe && Array.isArray(value);
      const type = Object.prototype.toString.call(value);
      const isObject = type === '[object Object]' || type === '[object Array]';

      const newKey = prev ? `${prev}${opts?.delimiter || '.'}${key}` : key;

      if (!isArray && isObject && value && Object.keys(value).length) {
        return step(value, newKey);
      }

      result[newKey] = value;
    });
  }

  step(target);
  return result;
}

export function unflatten(target: unknown, _opts?: unknown): unknown {
  return target;
}
