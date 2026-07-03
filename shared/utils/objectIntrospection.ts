/**
 * Object inspection helpers used by safe JSON utilities and logging.
 *
 * @remarks
 * These helpers intentionally use `Reflect.ownKeys` and own property
 * descriptors so they can inspect object data without invoking accessors.
 *
 * Keeping this logic centralized avoids duplicated implementations across the
 * Electron and shared layers.
 *
 * @public
 */
import type { UnknownArray } from "type-fest";

export function collectOwnPropertyValuesSafely(
    value: object
): Readonly<UnknownArray> {
    const values: unknown[] = [];
    for (const key of Reflect.ownKeys(value)) {
        if (Array.isArray(value) && key === "length") {
            continue;
        }

        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        if (descriptor && "value" in descriptor) {
            values.push(descriptor.value);
        }
    }

    return values;
}
