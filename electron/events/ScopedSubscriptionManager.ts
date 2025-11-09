import type { EventMetadata } from "@shared/types/events";
import type { UnknownRecord } from "type-fest";

import type { TypedEventBus } from "./TypedEventBus";

/**
 * Configuration for scoped subscription disposal behaviour.
 */
interface DisposeOptions {
    /**
     * Optional callback executed when an individual disposer throws.
     */
    readonly onError?: (error: unknown) => void;

    /**
     * When enabled, suppresses aggregate error throwing after cleanup.
     */
    readonly suppressErrors?: boolean;
}

/**
 * Utility for managing event subscriptions within a scoped lifecycle.
 *
 * @remarks
 * Tracks disposers for typed event bus subscriptions (and arbitrary cleanup
 * functions) so they can be disposed together. Prevents leaked listeners when
 * services register numerous handlers across the application lifecycle.
 *
 * @public
 */
export class ScopedSubscriptionManager {
    private readonly disposers = new Set<() => void>();

    /**
     * Returns the number of currently tracked disposers.
     */
    public get activeCount(): number {
        return this.disposers.size;
    }

    /**
     * Tracks a disposer function and returns a wrapped variant that removes
     * itself from the tracked set upon invocation.
     *
     * @param disposer - Function responsible for removing a subscription or
     *   performing cleanup.
     *
     * @returns Wrapped disposer that can be invoked manually; repeat
     *   invocations are ignored to maintain idempotency.
     */
    public track(disposer: () => void): () => void {
        let active = true;
        const executeDisposer = (): void => {
            if (!active) {
                return;
            }

            active = false;
            this.disposers.delete(executeDisposer);
            disposer();
        };

        this.disposers.add(executeDisposer);
        return executeDisposer;
    }

    /**
     * Registers a typed event listener and tracks the corresponding disposer.
     *
     * @typeParam EventMap - Event map maintained by the typed event bus.
     * @typeParam K - Specific event key being subscribed to.
     *
     * @param bus - Typed event bus to subscribe to.
     * @param event - Event name to listen for.
     * @param listener - Listener invoked when the event is emitted.
     *
     * @returns Disposer that removes the listener when invoked.
     */
    public onTyped<
        EventMap extends UnknownRecord,
        K extends keyof EventMap = keyof EventMap,
    >(
        bus: TypedEventBus<EventMap>,
        event: K,
        listener: (data: EventMap[K] & { _meta: EventMetadata }) => void
    ): () => void {
        bus.onTyped(event, listener);
        return this.track(() => {
            bus.offTyped(event, listener);
        });
    }

    /**
     * Disposes all tracked listeners and cleanup functions.
     *
     * @param options - Disposal behaviour configuration. Use this to attach an
     *   error callback or suppress aggregate errors.
     */
    public clearAll(options: DisposeOptions = {}): void {
        const errors: unknown[] = [];

        const trackedDisposers = Array.from(this.disposers);
        for (let index = trackedDisposers.length - 1; index >= 0; index -= 1) {
            const disposer = trackedDisposers[index];
            if (disposer) {
                try {
                    disposer();
                } catch (error) {
                    errors.push(error);
                    options.onError?.(error);
                }
            }
        }

        this.disposers.clear();

        if (!options.suppressErrors && errors.length > 0) {
            throw new AggregateError(
                errors,
                "ScopedSubscriptionManager failed to dispose subscriptions"
            );
        }
    }
}
