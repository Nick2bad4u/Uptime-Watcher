import { describe, expect, it, vi } from "vitest";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
import {
    TypedEventBus,
    type EventPayloadValue,
} from "../../events/TypedEventBus";

interface TestEvents extends Record<string, EventPayloadValue> {
    "monitor:ping": { latency: number };
}

describe(ScopedSubscriptionManager, () => {
    it("removes typed listeners when cleared", async () => {
        const bus = new TypedEventBus<TestEvents>("scoped-manager-test");
        const manager = new ScopedSubscriptionManager();
        const listener = vi.fn();

        manager.onTyped(bus, "monitor:ping", listener);

        await bus.emitTyped("monitor:ping", { latency: 42 });
        expect(listener).toHaveBeenCalledTimes(1);

        manager.clearAll();

        await bus.emitTyped("monitor:ping", { latency: 10 });
        expect(listener).toHaveBeenCalledTimes(1);
        expect(manager.activeCount).toBe(0);
    });

    it("supports tracking arbitrary disposers", () => {
        const manager = new ScopedSubscriptionManager();
        const disposer = vi.fn();

        const tracked = manager.track(disposer);
        expect(manager.activeCount).toBe(1);

        tracked();
        expect(disposer).toHaveBeenCalledTimes(1);
        expect(manager.activeCount).toBe(0);
    });

    it("aggregates errors when clearing without suppression", () => {
        const manager = new ScopedSubscriptionManager();
        const firstError = new Error("first");
        const secondError = new Error("second");

        manager.track(() => {
            throw firstError;
        });
        manager.track(() => {
            throw secondError;
        });

        expect(() => manager.clearAll()).toThrowError(AggregateError);
    });

    it("invokes error callback when suppression is enabled", () => {
        const manager = new ScopedSubscriptionManager();
        const onError = vi.fn();

        manager.track(() => {
            throw new Error("boom");
        });

        manager.clearAll({ suppressErrors: true, onError });
        expect(onError).toHaveBeenCalledTimes(1);
        expect(manager.activeCount).toBe(0);
    });
});
