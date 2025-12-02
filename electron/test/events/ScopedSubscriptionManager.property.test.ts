import { fc } from "@fast-check/vitest";
import { describe, expect, it, vi } from "vitest";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
import {
    TypedEventBus,
    type EventPayloadValue,
} from "../../events/TypedEventBus";

interface ScopedEvents extends Record<string, EventPayloadValue> {
    "scope:event": { payload: number };
}

describe("ScopedSubscriptionManager property behaviour", () => {
    it("does not leak listeners after arbitrary operations", async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.array(fc.constantFrom("subscribe", "unsubscribe", "clear")),
                async (operations) => {
                    const bus = new TypedEventBus<ScopedEvents>(
                        "scoped-manager-property-test"
                    );
                    const manager = new ScopedSubscriptionManager();
                    const records: {
                        active: boolean;
                        dispose: () => void;
                        listener: ReturnType<typeof vi.fn>;
                    }[] = [];

                    for (const operation of operations) {
                        if (operation === "subscribe") {
                            const listener = vi.fn();
                            const dispose = manager.onTyped(
                                bus,
                                "scope:event",
                                listener
                            );

                            records.push({
                                active: true,
                                dispose,
                                listener,
                            });
                        }

                        if (operation === "unsubscribe") {
                            const candidate = records
                                .toReversed()
                                .find((record) => record.active);

                            if (candidate) {
                                candidate.dispose();
                                candidate.active = false;
                            }
                        }

                        if (operation === "clear") {
                            manager.clearAll();
                            for (const record of records) {
                                record.active = false;
                            }
                        }
                    }

                    manager.clearAll();
                    for (const record of records) {
                        record.active = false;
                        record.listener.mockClear();
                    }

                    await bus.emitTyped("scope:event", { payload: 1 });

                    for (const record of records) {
                        expect(record.listener).not.toHaveBeenCalled();
                    }
                    expect(manager.activeCount).toBe(0);
                }
            ),
            { numRuns: 100 }
        );
    });
});
