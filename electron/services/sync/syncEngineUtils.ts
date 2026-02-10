/**
 * Shared SyncEngine utilities.
 *
 * @remarks
 * This module intentionally holds low-level helpers (validation + bounded
 * concurrency) used by {@link electron/services/sync/SyncEngine#SyncEngine}.
 */

import { hasAsciiControlCharacters as sharedHasAsciiControlCharacters } from "@shared/utils/stringSafety";
import {
    getPersistedDeviceIdValidationError as sharedGetPersistedDeviceIdValidationError,
    isValidPersistedDeviceId as sharedIsValidPersistedDeviceId,
} from "@shared/validation/persistedDeviceIdValidation";

/**
 * Returns true when the string contains only ASCII digits.
 *
 * @remarks
 * Cloud sync object keys encode numeric fields (timestamps and op ids) as
 * decimal strings. We intentionally disallow localized digits and other numeric
 * representations to keep provider keys canonical and comparable.
 */
export function isAsciiDigits(value: string): boolean {
    if (value.length === 0) {
        return false;
    }

    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (codePoint === undefined || codePoint < 48 || codePoint > 57) {
            return false;
        }
    }

    return true;
}

/**
 * Returns true when the string contains ASCII control characters.
 *
 * @remarks
 * Delegates to the shared implementation to prevent validation drift, while
 * keeping this module as the sync-layer public API surface.
 *
 * @param value - String to check.
 *
 * @returns `true` when the string contains ASCII control characters.
 */
export function hasAsciiControlCharacters(value: string): boolean {
    return sharedHasAsciiControlCharacters(value);
}

/**
 * Returns a stable validation error string for persisted device IDs.
 *
 * @remarks
 * The cloud sync subsystem stores device ids inside provider object keys
 * (`sync/devices/<deviceId>/...`). This helper is shared across multiple
 * modules so the accept/reject policy cannot drift.
 *
 * The returned messages are intentionally aligned with the historical error
 * strings thrown by ProviderCloudSyncTransport so existing tests and telemetry
 * remain stable.
 */
export function getPersistedDeviceIdValidationError(
    candidate: string
): null | string {
    const impl: (candidate: string) => null | string =
        sharedGetPersistedDeviceIdValidationError;
    return impl(candidate);
}

/**
 * Validates the persisted sync deviceId.
 *
 * @remarks
 * DeviceId is embedded into provider object keys
 * (`sync/devices/<deviceId>/...`) so it must be a single key segment and avoid
 * control characters.
 */
export function isValidPersistedDeviceId(candidate: string): boolean {
    const impl: (candidate: string) => boolean = sharedIsValidPersistedDeviceId;
    return impl(candidate);
}

function assertNoUndefined<T>(
    values: Array<T | undefined>,
    message: string
): asserts values is T[] {
    if (values.includes(undefined)) {
        throw new Error(message);
    }
}

/**
 * Maps items with bounded concurrency while preserving input order.
 */
export async function mapWithConcurrency<T, R>(args: {
    concurrency: number;
    items: readonly T[];
    task: (item: T) => Promise<R>;
}): Promise<R[]> {
    const { concurrency, items, task } = args;
    const workerCount = Math.max(1, Math.min(concurrency, items.length));

    const results: Array<R | undefined> = Array.from(
        { length: items.length },
        (): R | undefined => undefined
    );
    let index = 0;

    const workers = Array.from({ length: workerCount }, async () => {
        while (true) {
            const currentIndex = index;
            index += 1;

            const item = items[currentIndex];
            if (item === undefined) {
                break;
            }

            // eslint-disable-next-line no-await-in-loop -- Worker loop performs bounded sequential IO.
            results[currentIndex] = await task(item);
        }
    });

    await Promise.all(workers);

    assertNoUndefined(
        results,
        "mapWithConcurrency: internal error (missing result)"
    );
    return results;
}
