/**
 * Tests for {@link HistoryLimitCoordinator} ensuring correct event forwarding
 * behaviour.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryLimitCoordinator } from "../../coordinators/HistoryLimitCoordinator";
import type { OrchestratorEvents } from "../../UptimeOrchestrator.types";
import type { DatabaseManager } from "../../managers/DatabaseManager";
import { TypedEventBus } from "../../events/TypedEventBus";

const flushAsync = async (): Promise<void> =>
    new Promise((resolve) => {
        setImmediate(resolve);
    });

describe(HistoryLimitCoordinator, () => {
    let coordinator: HistoryLimitCoordinator;
    let databaseManager: DatabaseManager;
    let eventBus: TypedEventBus<OrchestratorEvents>;

    beforeEach(() => {
        eventBus = new TypedEventBus<OrchestratorEvents>(
            "history-limit-coordinator-test"
        );
        databaseManager = {
            getHistoryLimit: vi.fn(() => 1000),
        } as unknown as DatabaseManager;

        coordinator = new HistoryLimitCoordinator({
            databaseManager,
            eventBus,
        });
        coordinator.register();
    });

    afterEach(() => {
        coordinator.unregister();
        eventBus.removeAllListeners();
    });

    it("seeds the last known limit from the database manager", () => {
        expect(coordinator.getLastKnownLimit()).toBe(1000);
    });

    it("forwards history limit updates with previous limit telemetry", async () => {
        const handler = vi.fn();
        eventBus.on("settings:history-limit-updated", handler);

        const payload = {
            limit: 750,
            operation: "history-limit-updated" as const,
            timestamp: Date.now(),
        } satisfies OrchestratorEvents["internal:database:history-limit-updated"];

        await eventBus.emitTyped(
            "internal:database:history-limit-updated",
            payload
        );

        await flushAsync();

        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({
                ...payload,
                previousLimit: 1000,
            })
        );
        expect(coordinator.getLastKnownLimit()).toBe(750);
    });

    it("ignores negative history limits", async () => {
        const handler = vi.fn();
        eventBus.on("settings:history-limit-updated", handler);

        await eventBus.emitTyped("internal:database:history-limit-updated", {
            limit: -5,
            operation: "history-limit-updated",
            timestamp: Date.now(),
        });

        await flushAsync();

        expect(handler).not.toHaveBeenCalled();
        expect(coordinator.getLastKnownLimit()).toBe(1000);
    });

    it("stops forwarding after disposal", async () => {
        const handler = vi.fn();
        eventBus.on("settings:history-limit-updated", handler);

        coordinator.unregister();

        await eventBus.emitTyped("internal:database:history-limit-updated", {
            limit: 500,
            operation: "history-limit-updated",
            timestamp: Date.now(),
        });

        await flushAsync();

        expect(handler).not.toHaveBeenCalled();
    });
});
