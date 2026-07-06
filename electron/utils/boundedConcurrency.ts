/**
 * Small async concurrency helpers for backend services.
 *
 * @remarks
 * This utility is intentionally dependency-free so Electron subsystems can
 * share bounded worker-pool behavior without importing unrelated service
 * modules.
 *
 * @packageDocumentation
 */

interface MapWithConcurrencyResultSlot<R> {
    readonly value: R;
}

function assertAllResultsCompleted<R>(
    results: (MapWithConcurrencyResultSlot<R> | undefined)[],
    message: string
): asserts results is MapWithConcurrencyResultSlot<R>[] {
    if (results.includes(undefined)) {
        throw new Error(message);
    }
}

function normalizeConcurrency(concurrency: number): number {
    if (!Number.isFinite(concurrency) || concurrency < 1) {
        return 1;
    }

    return Math.floor(concurrency);
}

/**
 * Maps items with bounded concurrency while preserving input order.
 *
 * @remarks
 * Rejections are intentionally propagated to match `Promise.all()` semantics.
 */
export async function mapWithConcurrency<T, R>(args: {
    readonly concurrency: number;
    readonly items: readonly T[];
    readonly task: (item: T) => Promise<R>;
}): Promise<R[]> {
    const { concurrency, items, task } = args;
    if (items.length === 0) {
        return [];
    }

    const workerCount = Math.min(
        normalizeConcurrency(concurrency),
        items.length
    );
    const entries = items.map((item) => ({ item }));

    const results = Array.from(
        { length: entries.length },
        (): MapWithConcurrencyResultSlot<R> | undefined => undefined
    );
    let index = 0;

    const workers = Array.from({ length: workerCount }, async () => {
        while (true) {
            const currentIndex = index;
            index += 1;

            const entry = entries[currentIndex];
            if (entry === undefined) {
                break;
            }

            // eslint-disable-next-line no-await-in-loop -- Worker loop performs bounded sequential IO.
            const value = await task(entry.item);
            results[currentIndex] = { value };
        }
    });

    await Promise.all(workers);

    assertAllResultsCompleted(
        results,
        "mapWithConcurrency: internal error (missing result)"
    );
    return results.map((result) => result.value);
}
