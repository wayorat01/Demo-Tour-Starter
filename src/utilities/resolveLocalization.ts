export function resolveLocalization(obj: any, locale: string): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => resolveLocalization(item, locale));
  }

  // Exclude non-POJOs like Date, Buffer, etc. (though JSON.parse already converts them, just in case)
  if (obj.constructor !== Object && Object.getPrototypeOf(obj) !== Object.prototype) {
    if (obj instanceof Date) return obj;
    // Buffer check safety
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(obj)) return obj;
  }

  const keys = Object.keys(obj);

  // Payload localized field heuristic: object keys are ONLY locales
  if (keys.length > 0 && keys.every(k => ['th', 'en'].includes(k))) {
    const activeVal = obj[locale]
    if (activeVal !== undefined && activeVal !== null) return resolveLocalization(activeVal, locale)
    
    const fallback = obj['th'] || obj['en'] || ''
    return resolveLocalization(fallback, locale)
  }

  const result: any = {};
  for (const key of keys) {
    result[key] = resolveLocalization(obj[key], locale);
  }

  return result;
}
