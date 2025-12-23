/**
 * Object inspection helpers used by safe JSON utilities and logging.
 *
 * @remarks
 * These helpers intentionally use `Reflect.ownKeys` + `Reflect.get` wrapped in
 * try/catch so they can safely inspect objects with throwing accessors.
 *
 * Keeping this logic centralized avoids duplicated implementations across the
 * Electron and shared layers.
 *
 * @public
 */
export function collectOwnPropertyValuesSafely(
    value: object
): readonly unknown[] {
    if (Array.isArray(value)) {
        return value;
    }

    const values: unknown[] = [];
    for (const key of Reflect.ownKeys(value)) {
        try {
            values.push(Reflect.get(value, key));
        } catch {
            values.push(undefined);
        }
    }

    return values;
}
