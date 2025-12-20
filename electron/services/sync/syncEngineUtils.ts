/**
 * Shared SyncEngine utilities.
 *
 * @remarks
 * This module intentionally holds low-level helpers (validation + bounded
 * concurrency) used by {@link SyncEngine}.
 */

/** Maximum byte budget accepted for persisted sync device IDs. */
const MAX_DEVICE_ID_BYTES = 256;

/**
 * Returns true when the string contains ASCII control characters.
 */
export function hasAsciiControlCharacters(value: string): boolean {
    for (const char of value) {
        const codePoint = char.codePointAt(0);
        if (
            codePoint !== undefined &&
            (codePoint < 0x20 || codePoint === 0x7f)
        ) {
            return true;
        }
    }

    return false;
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
    if (candidate.trim().length === 0) {
        return false;
    }

    if (candidate.trim() !== candidate) {
        return false;
    }

    if (Buffer.byteLength(candidate, "utf8") > MAX_DEVICE_ID_BYTES) {
        return false;
    }

    if (hasAsciiControlCharacters(candidate)) {
        return false;
    }

    if (
        candidate.includes("/") ||
        candidate.includes("\\") ||
        candidate.includes(":")
    ) {
        return false;
    }

    return candidate !== "." && candidate !== "..";
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
