/**
 * Hook that detects horizontal overflow and enables marquee-style animations.
 *
 * @remarks
 * Returns a ref for the scroll container and a boolean indicating whether the
 * content overflows horizontally. Consumers can use the boolean to
 * conditionally apply CSS animations (for example, marquee scrolling for long
 * titles). The hook automatically re-evaluates on window resize events and
 * whenever the provided dependency list changes. ResizeObserver is used when
 * available but the hook gracefully degrades in environments where it is
 * unsupported.
 *
 * @public
 */

import type { RefObject } from "react";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";

/**
 * Listener invoked whenever the associated resize observer detects changes that
 * may affect horizontal overflow.
 */
type OverflowSubscriber = () => void;

/**
 * Tracks the shared {@link ResizeObserver} instance and its subscribers for a
 * specific element.
 */
interface ElementObserverRecord {
    hasDisconnectedOnce: boolean;
    readonly observer: ResizeObserver;
    pendingCleanup: null | symbol;
    readonly subscribers: Set<OverflowSubscriber>;
}

/**
 * Minimal writable ref shape used internally to share stateful callbacks.
 */
interface WritableRef<ValueType> {
    current: ValueType;
}

/**
 * Registry mapping elements to the active observer metadata used for overflow
 * detection.
 */
const observerRegistry = new WeakMap<HTMLElement, ElementObserverRecord>();

/**
 * Schedules callbacks to execute after the current call stack, ensuring cleanup
 * runs after potential Strict Mode remount cycles.
 */
const scheduleDeferredCleanup = (callback: () => void): void => {
    if (typeof queueMicrotask === "function") {
        queueMicrotask(callback);
        return;
    }

    globalThis.setTimeout(callback, 0);
};

/**
 * Retrieves an existing observer record for a given element or creates a new
 * one if none exists yet.
 */
const ensureObserverRecord = (element: HTMLElement): ElementObserverRecord => {
    const existing = observerRegistry.get(element);

    if (existing) {
        return existing;
    }

    const subscribers = new Set<OverflowSubscriber>();
    const record: ElementObserverRecord = {
        hasDisconnectedOnce: false,
        observer: new ResizeObserver(() => {
            for (const subscriber of subscribers) {
                subscriber();
            }
        }),
        pendingCleanup: null,
        subscribers,
    };

    observerRegistry.set(element, record);
    return record;
};

/**
 * Cancels any pending cleanup for a record to keep its observer alive.
 */
const cancelRecordCleanup = (record: ElementObserverRecord): void => {
    record.pendingCleanup = null;
};

/**
 * Schedules deferred cleanup to allow Strict Mode double-invocation to reuse
 * the same observer instance without creating duplicates.
 */
const scheduleRecordCleanup = (
    element: HTMLElement,
    record: ElementObserverRecord
): void => {
    const cleanupToken = Symbol("observer-cleanup");
    record.pendingCleanup = cleanupToken;

    scheduleDeferredCleanup(() => {
        if (record.pendingCleanup !== cleanupToken) {
            return;
        }

        observerRegistry.delete(element);
        record.pendingCleanup = null;
    });
};

/**
 * Registers a subscriber for overflow notifications on the provided element.
 */
const registerOverflowObserver = (
    element: HTMLElement,
    subscriber: OverflowSubscriber
): void => {
    const record = ensureObserverRecord(element);

    if (record.pendingCleanup !== null) {
        cancelRecordCleanup(record);
    }

    const isNewSubscriber = !record.subscribers.has(subscriber);
    if (isNewSubscriber) {
        record.subscribers.add(subscriber);
    }

    if (isNewSubscriber || record.subscribers.size === 1) {
        record.observer.observe(element);
    }
};

/**
 * Removes a subscriber from the observer associated with the provided element.
 * Cleanup is deferred to allow Strict Mode remount cycles to reuse the same
 * observer instance without incurring additional allocations.
 */
const unregisterOverflowObserver = (
    element: HTMLElement,
    subscriber: OverflowSubscriber
): void => {
    const record = observerRegistry.get(element);

    if (!record) {
        return;
    }

    if (!record.subscribers.delete(subscriber)) {
        return;
    }

    if (record.subscribers.size > 0) {
        return;
    }

    if (record.hasDisconnectedOnce) {
        try {
            record.observer.unobserve(element);
        } catch {
            record.observer.disconnect();
        }
    } else {
        record.observer.disconnect();
        record.hasDisconnectedOnce = true;
    }
    scheduleRecordCleanup(element, record);
};

/**
 * Ensures a stable subscriber instance for the active resize observer that will
 * always invoke the latest overflow evaluation callback.
 */
const ensureObserverSubscriber = (
    subscriberRef: WritableRef<OverflowSubscriber | undefined>,
    evaluationRef: WritableRef<() => void>
): OverflowSubscriber => {
    subscriberRef.current ??= (): void => {
        evaluationRef.current();
    };

    return subscriberRef.current;
};

/**
 * Return type for {@link useOverflowMarquee}.
 *
 * @public
 */
export interface OverflowMarqueeReturn<ElementType extends HTMLElement> {
    /**
     * Ref that should be attached to the element containing the scrollable
     * inline content (typically an overflow-hidden wrapper).
     */
    readonly containerRef: RefObject<ElementType | null>;
    /**
     * Indicates whether the element currently overflows horizontally. Useful
     * for conditionally enabling marquee animations.
     */
    readonly isOverflowing: boolean;
}

/**
 * Configuration options for {@link useOverflowMarquee}.
 *
 * @public
 */
export interface OverflowMarqueeOptions<ElementType extends HTMLElement> {
    /**
     * Optional dependency list that should trigger overflow re-evaluation.
     */
    readonly dependencies?: readonly unknown[];
    /**
     * Optional external ref to reuse instead of creating an internal one.
     */
    readonly ref?: RefObject<ElementType | null>;
}

/**
 * Reducer used by {@link useOverflowMarquee} to avoid unnecessary state updates
 * when the overflow state has not changed.
 */
const overflowReducer = (state: boolean, next: boolean): boolean =>
    state === next ? state : next;

/**
 * Detects horizontal overflow to support marquee-style animations and
 * truncation indicators.
 *
 * @typeParam ElementType - Element type whose overflow should be tracked.
 *
 * @param options - Configuration including an optional external ref and
 *   dependency list used to trigger re-measurement.
 *
 * @returns {@link OverflowMarqueeReturn} With the container ref and current
 *   overflow state.
 */
export function useOverflowMarquee<
    ElementType extends HTMLElement = HTMLElement,
>(
    options: OverflowMarqueeOptions<ElementType> = {}
): OverflowMarqueeReturn<ElementType> {
    const { dependencies = [], ref } = options;
    const internalRef = useRef<ElementType | null>(null);
    const containerRef: RefObject<ElementType | null> = ref ?? internalRef;

    const [isOverflowing, dispatchOverflow] = useReducer(
        overflowReducer,
        false
    );

    const measureOverflow = useCallback(
        (element: ElementType | null): boolean => {
            if (!element) {
                return false;
            }

            return element.scrollWidth - element.clientWidth > 1;
        },
        []
    );

    const latestContainerRef =
        useRef<RefObject<ElementType | null>>(containerRef);
    const observedElementRef = useRef<ElementType | null>(null);
    const observerSubscriberRef = useRef<OverflowSubscriber | undefined>(
        undefined
    );
    const runOverflowEvaluationRef = useRef<() => void>(() => {
        /* Placeholder reassigned in effect */
    });

    const runOverflowEvaluation = useCallback(() => {
        const element = latestContainerRef.current.current;
        const next = measureOverflow(element);
        dispatchOverflow(next);
    }, [measureOverflow]);

    const dependencyFingerprint = useMemo(
        () => JSON.stringify(dependencies),
        [dependencies]
    );

    useEffect(
        function syncLatestContainerRef() {
            latestContainerRef.current = containerRef;
        },
        [containerRef]
    );

    useEffect(
        function updateOverflowEvaluator() {
            runOverflowEvaluationRef.current = runOverflowEvaluation;
        },
        [runOverflowEvaluation]
    );

    useEffect(function manageOverflowObservation() {
        runOverflowEvaluation();

        const element = latestContainerRef.current.current;
        const hasWindow = typeof window !== "undefined";
        const shouldAttachWindowListener = hasWindow && element !== null;

        const handleResize = (): void => {
            runOverflowEvaluationRef.current();
        };

        if (shouldAttachWindowListener) {
            window.addEventListener("resize", handleResize);
        }

        const supportsResizeObserver = typeof ResizeObserver !== "undefined";
        const subscriber = supportsResizeObserver
            ? ensureObserverSubscriber(
                  observerSubscriberRef,
                  runOverflowEvaluationRef
              )
            : undefined;

        if (supportsResizeObserver && subscriber) {
            const previouslyObserved = observedElementRef.current;

            if (previouslyObserved && previouslyObserved !== element) {
                unregisterOverflowObserver(previouslyObserved, subscriber);
                observedElementRef.current = null;
            }

            if (element) {
                registerOverflowObserver(element, subscriber);
                observedElementRef.current = element;
            }
        }

        if (!supportsResizeObserver && observedElementRef.current) {
            const fallbackSubscriber = observerSubscriberRef.current;
            const previouslyObserved = observedElementRef.current;

            if (typeof fallbackSubscriber === "function") {
                unregisterOverflowObserver(
                    previouslyObserved,
                    fallbackSubscriber
                );
            }

            observedElementRef.current = null;
        }

        return function cleanupOverflowObservation(): void {
            if (shouldAttachWindowListener) {
                window.removeEventListener("resize", handleResize);
            }

            if (!supportsResizeObserver || !subscriber) {
                return;
            }

            const observedElement = observedElementRef.current;

            if (observedElement) {
                unregisterOverflowObserver(observedElement, subscriber);
                observedElementRef.current = null;
            }
        };
    });

    useEffect(
        function reevaluateOnDependencyChange() {
            // eslint-disable-next-line sonarjs/void-use -- Access fingerprint to note dependency usage without additional logic.
            void dependencyFingerprint;
            runOverflowEvaluation();
        },
        [dependencyFingerprint, runOverflowEvaluation]
    );

    return {
        containerRef,
        isOverflowing,
    };
}
