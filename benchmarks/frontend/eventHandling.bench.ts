/**
 * Performance benchmarks for React event handling operations.
 *
 * @packageDocumentation
 *
 * Simulates synthetic events, delegation, and propagation patterns to stress
 * the renderer's event system utilities.
 */

import { bench, describe } from "vitest";

/**
 * Describes the shape of the synthetic events used within the benchmarks.
 */
interface SyntheticEvent {
    type: string;
    target: EventTarget | null;
    currentTarget: EventTarget | null;
    bubbles: boolean;
    cancelable: boolean;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    timeStamp: number;
    nativeEvent: Event | null;
    stopPropagation(): void;
    preventDefault(): void;
}

/**
 * Captures metadata about registered event handlers.
 */
interface EventHandler {
    id: string;
    eventType: string;
    handler: (event: SyntheticEvent) => void;
    element: string;
    options?: {
        passive?: boolean;
        once?: boolean;
        capture?: boolean;
    };
    callCount: number;
    totalExecutionTime: number;
    lastExecuted: number;
}

/**
 * Describes delegated listener registrations tracking selector matches.
 */
interface EventDelegator {
    id: string;
    containerElement: string;
    eventType: string;
    selector: string;
    handler: (event: SyntheticEvent, target: Element) => void;
    matchedElements: Set<string>;
    totalMatches: number;
    totalExecutionTime: number;
}

/**
 * Metrics emitted after dispatching a synthetic event.
 */
interface EventMetrics {
    eventType: string;
    handlersTriggered: number;
    propagationTime: number;
    handlerExecutionTime: number;
    totalProcessingTime: number;
    memoryUsage: number;
    preventedDefault: boolean;
    stoppedPropagation: boolean;
}

/**
 * Represents custom events generated during delegation benchmarks.
 */
interface CustomEvent {
    id: string;
    type: string;
    detail: any;
    bubbles: boolean;
    cancelable: boolean;
    composed: boolean;
    timestamp: number;
    source: string;
}

/**
 * Simulated event system closely mirroring React's synthetic event behaviour.
 */
class MockEventSystem {
    private handlers = new Map<string, EventHandler[]>();
    private delegators = new Map<string, EventDelegator[]>();
    private eventQueue: SyntheticEvent[] = [];
    private eventHistory: { event: SyntheticEvent; metrics: EventMetrics }[] =
        [];

    /**
     * Registers an event handler for the specified element and event type.
     *
     * @param element - Element identifier receiving the handler.
     * @param eventType - Event type to listen for.
     * @param handler - Callback invoked when the event is dispatched.
     * @param options - Optional handler options.
     *
     * @returns Metadata for the registered handler.
     */
    addEventListener(
        element: string,
        eventType: string,
        handler: (event: SyntheticEvent) => void,
        options?: { passive?: boolean; once?: boolean; capture?: boolean }
    ): EventHandler {
        const eventHandler: EventHandler = {
            id: `handler-${Date.now()}-${Math.random()}`,
            eventType,
            handler,
            element,
            options,
            callCount: 0,
            totalExecutionTime: 0,
            lastExecuted: 0,
        };

        const key = `${element}-${eventType}`;
        if (!this.handlers.has(key)) {
            this.handlers.set(key, []);
        }
        this.handlers.get(key)!.push(eventHandler);

        return eventHandler;
    }

    /**
     * Removes a previously registered event handler by identifier.
     *
     * @param handlerId - Identifier of the handler to remove.
     *
     * @returns `true` when a handler was located and removed.
     */
    removeEventListener(handlerId: string): boolean {
        for (const [key, handlers] of this.handlers.entries()) {
            const index = handlers.findIndex((h) => h.id === handlerId);
            if (index !== -1) {
                handlers.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Registers a delegated handler on the provided container.
     *
     * @param containerElement - Container element receiving the delegation.
     * @param eventType - Event type to observe.
     * @param selector - Selector used to match descendant elements.
     * @param handler - Callback invoked when a descendant matches the selector.
     *
     * @returns Metadata describing the registered delegator.
     */
    addEventDelegator(
        containerElement: string,
        eventType: string,
        selector: string,
        handler: (event: SyntheticEvent, target: Element) => void
    ): EventDelegator {
        const delegator: EventDelegator = {
            id: `delegator-${Date.now()}-${Math.random()}`,
            containerElement,
            eventType,
            selector,
            handler,
            matchedElements: new Set(),
            totalMatches: 0,
            totalExecutionTime: 0,
        };

        const key = `${containerElement}-${eventType}`;
        if (!this.delegators.has(key)) {
            this.delegators.set(key, []);
        }
        this.delegators.get(key)!.push(delegator);

        return delegator;
    }

    /**
     * Dispatches an event and captures resulting metrics.
     *
     * @param element - Element identifier dispatching the event.
     * @param eventType - Event type being dispatched.
     * @param eventData - Optional additional event data.
     * @param options - Optional bubbling/cancelation overrides.
     *
     * @returns Performance metrics collected during dispatch.
     */
    dispatchEvent(
        element: string,
        eventType: string,
        eventData?: any,
        options?: { bubbles?: boolean; cancelable?: boolean }
    ): EventMetrics {
        const startTime = performance.now();

        const syntheticEvent = this.createSyntheticEvent(
            eventType,
            element,
            eventData,
            options
        );

        const metrics: EventMetrics = {
            eventType,
            handlersTriggered: 0,
            propagationTime: 0,
            handlerExecutionTime: 0,
            totalProcessingTime: 0,
            memoryUsage: 0,
            preventedDefault: false,
            stoppedPropagation: false,
        };

        // Process event through handlers
        this.processEventHandlers(element, syntheticEvent, metrics);

        // Process event delegation
        this.processEventDelegation(element, syntheticEvent, metrics);

        const endTime = performance.now();
        metrics.totalProcessingTime = endTime - startTime;
        metrics.memoryUsage = Math.random() * 100; // Simulated

        this.eventHistory.push({ event: syntheticEvent, metrics });
        return metrics;
    }

    /**
     * Creates a synthetic event mirroring React's event wrapper.
     *
     * @param eventType - Event type to emulate.
     * @param element - Element identifier used as the target.
     * @param eventData - Optional payload merged into the synthetic event.
     * @param options - Optional bubbling/cancelation overrides.
     *
     * @returns Mock synthetic event instance.
     */
    private createSyntheticEvent(
        eventType: string,
        element: string,
        eventData?: any,
        options?: { bubbles?: boolean; cancelable?: boolean }
    ): SyntheticEvent {
        let defaultPrevented = false;
        let propagationStopped = false;

        // Mock EventTarget implementation
        const mockEventTarget = {
            id: element,
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => true,
        } as unknown as EventTarget;

        return {
            type: eventType,
            target: mockEventTarget,
            currentTarget: mockEventTarget,
            bubbles: options?.bubbles ?? true,
            cancelable: options?.cancelable ?? true,
            defaultPrevented,
            eventPhase: 2, // AT_TARGET
            isTrusted: false,
            timeStamp: Date.now(),
            nativeEvent: null,
            stopPropagation: () => {
                propagationStopped = true;
            },
            preventDefault: () => {
                if (options?.cancelable !== false) {
                    defaultPrevented = true;
                }
            },
            ...eventData,
        };
    }

    /**
     * Runs registered handlers and updates performance metrics.
     *
     * @param element - Element identifier associated with the handlers.
     * @param event - Synthetic event instance being dispatched.
     * @param metrics - Mutable metrics object tracking execution data.
     */
    private processEventHandlers(
        element: string,
        event: SyntheticEvent,
        metrics: EventMetrics
    ): void {
        const key = `${element}-${event.type}`;
        const handlers = this.handlers.get(key) || [];

        for (const handler of handlers) {
            const handlerStartTime = performance.now();

            try {
                handler.handler(event);
                handler.callCount++;
                handler.lastExecuted = Date.now();
                metrics.handlersTriggered++;
            } catch (error) {
                console.error("Event handler error:", error);
            }

            const handlerEndTime = performance.now();
            const executionTime = handlerEndTime - handlerStartTime;
            handler.totalExecutionTime += executionTime;
            metrics.handlerExecutionTime += executionTime;

            // Handle 'once' option
            if (handler.options?.once) {
                this.removeEventListener(handler.id);
            }

            // Check if propagation was stopped
            if (event.defaultPrevented) {
                metrics.preventedDefault = true;
                break;
            }
        }
    }

    /**
     * Processes delegated handlers matching the event target.
     *
     * @param element - Element identifier originally receiving the event.
     * @param event - Synthetic event instance being dispatched.
     * @param metrics - Mutable metrics object tracking execution data.
     */
    private processEventDelegation(
        element: string,
        event: SyntheticEvent,
        metrics: EventMetrics
    ): void {
        // Find parent containers that might have delegators
        const possibleContainers = this.findParentContainers(element);

        for (const container of possibleContainers) {
            const key = `${container}-${event.type}`;
            const delegators = this.delegators.get(key) || [];

            for (const delegator of delegators) {
                if (this.matchesSelector(element, delegator.selector)) {
                    const delegatorStartTime = performance.now();

                    try {
                        delegator.handler(event, { id: element } as Element);
                        delegator.totalMatches++;
                        delegator.matchedElements.add(element);
                        metrics.handlersTriggered++;
                    } catch (error) {
                        console.error("Event delegator error:", error);
                    }

                    const delegatorEndTime = performance.now();
                    const executionTime = delegatorEndTime - delegatorStartTime;
                    delegator.totalExecutionTime += executionTime;
                    metrics.handlerExecutionTime += executionTime;
                }
            }
        }
    }

    /**
     * Produces a list of potential container identifiers for delegation.
     *
     * @param element - Element identifier whose ancestor containers should be
     *   inspected.
     *
     * @returns Candidate container identifiers.
     */
    private findParentContainers(element: string): string[] {
        // Simulate DOM tree traversal to find parent containers
        const containers: string[] = [];
        let currentElement = element;

        // Simple simulation: assume element IDs follow a pattern
        while (currentElement.includes("-")) {
            const parentElement = currentElement.slice(
                0,
                Math.max(0, currentElement.lastIndexOf("-"))
            );
            containers.push(parentElement);
            currentElement = parentElement;
        }

        containers.push("document"); // Root container
        return containers;
    }

    /**
     * Approximates selector matching for synthetic benchmark elements.
     *
     * @param element - Element identifier to evaluate.
     * @param selector - Selector string being tested.
     *
     * @returns `true` when the selector is considered a match.
     */
    private matchesSelector(element: string, selector: string): boolean {
        // Simplified selector matching
        if (selector.startsWith(".")) {
            return element.includes(selector.slice(1));
        }
        if (selector.startsWith("#")) {
            return element === selector.slice(1);
        }
        if (selector.includes("[")) {
            // Attribute selector simulation
            return Math.random() > 0.5;
        }
        return element.includes(selector);
    }

    /**
     * Dispatches a batch of events and returns their associated metrics.
     *
     * @param events - Batch of event specifications to dispatch.
     *
     * @returns Metrics for each dispatched event.
     */
    batchProcessEvents(
        events: { element: string; type: string; data?: any }[]
    ): EventMetrics[] {
        const results: EventMetrics[] = [];

        for (const eventSpec of events) {
            const metrics = this.dispatchEvent(
                eventSpec.element,
                eventSpec.type,
                eventSpec.data
            );
            results.push(metrics);
        }

        return results;
    }

    /**
     * Aggregates statistics about registered handlers and processed events.
     *
     * @returns Summary statistics describing system state.
     */
    getStatistics(): {
        totalHandlers: number;
        totalDelegators: number;
        totalEventsProcessed: number;
        avgProcessingTime: number;
        handlersByType: Record<string, number>;
    } {
        let totalHandlers = 0;
        const handlersByType: Record<string, number> = {};

        for (const handlers of this.handlers.values()) {
            totalHandlers += handlers.length;
            handlers.forEach((handler) => {
                handlersByType[handler.eventType] =
                    (handlersByType[handler.eventType] || 0) + 1;
            });
        }

        let totalDelegators = 0;
        for (const delegators of this.delegators.values()) {
            totalDelegators += delegators.length;
        }

        const totalProcessingTime = this.eventHistory.reduce(
            (sum, entry) => sum + entry.metrics.totalProcessingTime,
            0
        );

        return {
            totalHandlers,
            totalDelegators,
            totalEventsProcessed: this.eventHistory.length,
            avgProcessingTime:
                totalProcessingTime / this.eventHistory.length || 0,
            handlersByType,
        };
    }
}

describe("React Event Handling Performance", () => {
    // Generate test data
    const generateEventSpecs = (count: number) => {
        const eventTypes = [
            "click",
            "mouseover",
            "mouseout",
            "keydown",
            "keyup",
            "focus",
            "blur",
            "input",
            "change",
        ];
        const elementTypes = [
            "button",
            "input",
            "div",
            "span",
            "li",
            "a",
        ];

        return Array.from({ length: count }, (_, i) => ({
            element: `${elementTypes[Math.floor(Math.random() * elementTypes.length)]}-${i}`,
            type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
            data: {
                detail: Math.random() * 100,
                clientX: Math.random() * 1920,
                clientY: Math.random() * 1080,
                key: Math.random() > 0.5 ? "Enter" : "Escape",
                value: `input-value-${i}`,
            },
        }));
    };

    const eventSpecs = generateEventSpecs(1000);

    // Event handler registration benchmarks
    bench("event handler registration - many handlers", () => {
        const eventSystem = new MockEventSystem();
        const handlers: EventHandler[] = [];

        for (let i = 0; i < 500; i++) {
            const element = `element-${i}`;
            const eventType = [
                "click",
                "mouseover",
                "keydown",
            ][Math.floor(Math.random() * 3)];

            const handler = eventSystem.addEventListener(
                element,
                eventType,
                (event) => {
                    // Simulate handler processing
                    const processing = Math.random() * 5;
                },
                {
                    passive: Math.random() > 0.5,
                    once: Math.random() > 0.8,
                    capture: Math.random() > 0.7,
                }
            );

            handlers.push(handler);
        }
    });

    bench("event delegation - complex selectors", () => {
        const eventSystem = new MockEventSystem();
        const delegators: EventDelegator[] = [];

        const containers = [
            "main-container",
            "sidebar-container",
            "modal-container",
        ];
        const selectors = [
            ".button",
            ".input-field",
            "[data-action]",
            ".menu-item",
            ".card",
        ];

        for (const container of containers) {
            for (const selector of selectors) {
                for (const eventType of [
                    "click",
                    "mouseover",
                    "focus",
                ]) {
                    const delegator = eventSystem.addEventDelegator(
                        container,
                        eventType,
                        selector,
                        (event, target) => {
                            // Simulate delegated event processing
                            const processing = Math.random() * 3;
                        }
                    );
                    delegators.push(delegator);
                }
            }
        }
    });

    // Event dispatching benchmarks
    bench("event dispatching - high frequency", () => {
        const eventSystem = new MockEventSystem();

        // Register some handlers first
        for (let i = 0; i < 100; i++) {
            eventSystem.addEventListener(`button-${i}`, "click", (event) => {
                const result = Math.random() * event.timeStamp;
            });
        }

        const dispatchResults: EventMetrics[] = [];

        // Dispatch many events rapidly
        for (const spec of eventSpecs.slice(0, 300)) {
            const metrics = eventSystem.dispatchEvent(
                spec.element,
                spec.type,
                spec.data
            );
            dispatchResults.push(metrics);
        }
    });

    bench("event bubbling simulation", () => {
        const eventSystem = new MockEventSystem();

        // Create nested element structure
        const elements = [
            "document",
            "document-body",
            "document-body-main",
            "document-body-main-container",
            "document-body-main-container-section",
            "document-body-main-container-section-div",
            "document-body-main-container-section-div-button",
        ];

        // Add handlers at different levels
        elements.forEach((element, index) => {
            eventSystem.addEventListener(element, "click", (event) => {
                // Simulate bubbling processing at each level
                const level = index;
                const processing = Math.random() * (level + 1);
            });
        });

        // Dispatch events that will bubble through the hierarchy
        for (let i = 0; i < 100; i++) {
            const deepestElement = elements.at(-1);
            eventSystem.dispatchEvent(deepestElement, "click", {
                bubbles: true,
                cancelable: true,
            });
        }
    });

    // Synthetic event creation benchmarks
    bench("synthetic event creation - complex events", () => {
        const eventSystem = new MockEventSystem();
        const syntheticEvents: SyntheticEvent[] = [];

        for (let i = 0; i < 1000; i++) {
            const eventType = [
                "click",
                "mousemove",
                "wheel",
                "touchstart",
                "keypress",
            ][Math.floor(Math.random() * 5)];

            const complexEventData = {
                detail: Math.random() * 100,
                screenX: Math.random() * 1920,
                screenY: Math.random() * 1080,
                clientX: Math.random() * 1920,
                clientY: Math.random() * 1080,
                ctrlKey: Math.random() > 0.8,
                shiftKey: Math.random() > 0.8,
                altKey: Math.random() > 0.9,
                metaKey: Math.random() > 0.95,
                button: Math.floor(Math.random() * 3),
                buttons: Math.floor(Math.random() * 8),
                relatedTarget: `element-${Math.floor(Math.random() * 100)}`,
                deltaX: Math.random() * 100 - 50,
                deltaY: Math.random() * 100 - 50,
                touches: Array.from(
                    { length: Math.floor(Math.random() * 5) },
                    (_, j) => ({
                        identifier: j,
                        clientX: Math.random() * 1920,
                        clientY: Math.random() * 1080,
                    })
                ),
            };

            const metrics = eventSystem.dispatchEvent(
                `element-${i}`,
                eventType,
                complexEventData
            );
        }
    });

    // Custom event system benchmarks
    bench("custom events - event bus", () => {
        const customEvents: CustomEvent[] = [];
        const eventListeners = new Map<
            string,
            ((event: CustomEvent) => void)[]
        >();

        // Custom event dispatcher
        const dispatchCustomEvent = (event: CustomEvent) => {
            const listeners = eventListeners.get(event.type) || [];
            listeners.forEach((listener) => {
                try {
                    listener(event);
                } catch (error) {
                    console.error("Custom event listener error:", error);
                }
            });
        };

        // Register custom event listeners
        const customEventTypes = [
            "user-action",
            "data-update",
            "ui-change",
            "system-event",
        ];

        customEventTypes.forEach((eventType) => {
            const listeners = Array.from(
                { length: 20 },
                (_, i) => (event: CustomEvent) => {
                    const processing = Math.random() * event.detail.complexity;
                }
            );
            eventListeners.set(eventType, listeners);
        });

        // Create and dispatch custom events
        for (let i = 0; i < 200; i++) {
            const customEvent: CustomEvent = {
                id: `custom-${i}`,
                type: customEventTypes[
                    Math.floor(Math.random() * customEventTypes.length)
                ],
                detail: {
                    userId: `user-${Math.floor(Math.random() * 100)}`,
                    action: `action-${i}`,
                    complexity: Math.random() * 10,
                    metadata: {
                        timestamp: Date.now(),
                        source: "benchmark",
                        priority: Math.floor(Math.random() * 5),
                    },
                },
                bubbles: Math.random() > 0.5,
                cancelable: Math.random() > 0.3,
                composed: Math.random() > 0.7,
                timestamp: Date.now(),
                source: "custom-event-system",
            };

            customEvents.push(customEvent);
            dispatchCustomEvent(customEvent);
        }
    });

    // Event performance optimization benchmarks
    bench("event throttling and debouncing", () => {
        let throttledCallCount = 0;
        let debouncedCallCount = 0;
        let lastThrottleTime = 0;
        let debounceTimeout: NodeJS.Timeout | null = null;

        const throttle =
            (fn: Function, limit: number) =>
            (...args: any[]) => {
                const now = Date.now();
                if (now - lastThrottleTime >= limit) {
                    fn(...args);
                    lastThrottleTime = now;
                }
            };

        const debounce =
            (fn: Function, delay: number) =>
            (...args: any[]) => {
                if (debounceTimeout) {
                    clearTimeout(debounceTimeout);
                }
                debounceTimeout = setTimeout(() => fn(...args), delay);
            };

        const throttledHandler = throttle(() => {
            throttledCallCount++;
        }, 16); // ~60fps

        const debouncedHandler = debounce(() => {
            debouncedCallCount++;
        }, 300);

        // Simulate rapid events (like mousemove or scroll)
        for (let i = 0; i < 1000; i++) {
            throttledHandler();
            debouncedHandler();

            // Simulate small time delays
            if (i % 10 === 0) {
                lastThrottleTime += 1; // Simulate time passing
            }
        }
    });

    // Event memory management benchmarks
    bench("event cleanup - memory leaks prevention", () => {
        const eventSystem = new MockEventSystem();
        const handlerIds: string[] = [];

        // Create many event handlers
        for (let i = 0; i < 300; i++) {
            const handler = eventSystem.addEventListener(
                `temp-element-${i}`,
                "click",
                (event) => {
                    const result = Math.random() * event.timeStamp;
                }
            );
            handlerIds.push(handler.id);
        }

        // Simulate component unmounting - cleanup handlers
        handlerIds.forEach((handlerId) => {
            eventSystem.removeEventListener(handlerId);
        });

        // Verify cleanup
        const stats = eventSystem.getStatistics();
    });

    // Event system stress testing
    bench("event system stress test", () => {
        const eventSystem = new MockEventSystem();

        // Register many handlers and delegators
        for (let i = 0; i < 200; i++) {
            eventSystem.addEventListener(
                `stress-element-${i}`,
                "click",
                (event) => {
                    const computation = Array.from({ length: 10 }, () =>
                        Math.random()
                    ).reduce((a, b) => a + b, 0);
                }
            );

            if (i % 10 === 0) {
                eventSystem.addEventDelegator(
                    `container-${Math.floor(i / 10)}`,
                    "click",
                    ".stress-element",
                    (event, target) => {
                        const computation = Math.random() * 100;
                    }
                );
            }
        }

        // Batch process many events
        const stressEvents = eventSpecs.slice(0, 500).map((spec) => ({
            element: `stress-element-${Math.floor(Math.random() * 200)}`,
            type: spec.type,
            data: spec.data,
        }));

        const batchResults = eventSystem.batchProcessEvents(stressEvents);
        const finalStats = eventSystem.getStatistics();
    });

    // Touch and gesture event simulation
    bench("touch events - gesture handling", () => {
        const eventSystem = new MockEventSystem();
        const gestureState = {
            touches: new Map<
                number,
                { x: number; y: number; startTime: number }
            >(),
            gestures: [] as {
                type: string;
                duration: number;
                distance: number;
            }[],
        };

        // Touch event handlers
        eventSystem.addEventListener("touch-area", "touchstart", (event) => {
            const touches = (event as any).touches || [];
            touches.forEach((touch: any, index: number) => {
                gestureState.touches.set(touch.identifier || index, {
                    x: touch.clientX,
                    y: touch.clientY,
                    startTime: Date.now(),
                });
            });
        });

        eventSystem.addEventListener("touch-area", "touchmove", (event) => {
            const touches = (event as any).touches || [];
            touches.forEach((touch: any, index: number) => {
                const startTouch = gestureState.touches.get(
                    touch.identifier || index
                );
                if (startTouch) {
                    const distance = Math.hypot(
                        touch.clientX - startTouch.x,
                        touch.clientY - startTouch.y
                    );
                }
            });
        });

        eventSystem.addEventListener("touch-area", "touchend", (event) => {
            const touches = (event as any).changedTouches || [];
            touches.forEach((touch: any, index: number) => {
                const startTouch = gestureState.touches.get(
                    touch.identifier || index
                );
                if (startTouch) {
                    const duration = Date.now() - startTouch.startTime;
                    const distance = Math.hypot(
                        touch.clientX - startTouch.x,
                        touch.clientY - startTouch.y
                    );

                    gestureState.gestures.push({
                        type: distance > 50 ? "swipe" : "tap",
                        duration,
                        distance,
                    });

                    gestureState.touches.delete(touch.identifier || index);
                }
            });
        });

        // Simulate touch gesture sequences
        for (let i = 0; i < 100; i++) {
            const touchCount = Math.floor(Math.random() * 3) + 1;

            // Start touch
            eventSystem.dispatchEvent("touch-area", "touchstart", {
                touches: Array.from({ length: touchCount }, (_, j) => ({
                    identifier: j,
                    clientX: Math.random() * 400,
                    clientY: Math.random() * 600,
                })),
            });

            // Move touch (simulate gesture)
            for (let move = 0; move < 5; move++) {
                eventSystem.dispatchEvent("touch-area", "touchmove", {
                    touches: Array.from({ length: touchCount }, (_, j) => ({
                        identifier: j,
                        clientX: Math.random() * 400,
                        clientY: Math.random() * 600,
                    })),
                });
            }

            // End touch
            eventSystem.dispatchEvent("touch-area", "touchend", {
                changedTouches: Array.from({ length: touchCount }, (_, j) => ({
                    identifier: j,
                    clientX: Math.random() * 400,
                    clientY: Math.random() * 600,
                })),
            });
        }
    });
});
