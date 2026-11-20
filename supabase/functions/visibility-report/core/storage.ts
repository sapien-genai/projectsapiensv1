/** PostgreSQL jsonb rejects NUL and unpaired UTF-16 surrogates from external text. */
export function storageSafeJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, item) => typeof item === 'string'
    ? item.replace(/\u0000/g, '\uFFFD').replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD')
    : item));
}

/** A resolved database request can still contain an error. Never treat it as saved. */
export async function persistReport(write: () => PromiseLike<{ error: { code?: string } | null }>): Promise<void> {
  const { error } = await write();
  if (error) throw new Error(`Could not save completed report (${error.code || 'database error'})`);
}
