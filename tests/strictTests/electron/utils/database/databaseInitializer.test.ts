/**
 * Unit tests for the database initialization helper.
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../../electron/utils/logger", () => ({
    monitorLogger: {
        error: vi.fn(),
    },
}));

vi.mock("../../../../../electron/utils/operationalHooks", () => ({
    withDatabaseOperation: vi.fn(),
}));

import { initDatabase } from "../../../../../electron/utils/database/databaseInitializer";
import { monitorLogger } from "../../../../../electron/utils/logger";
import { withDatabaseOperation } from "../../../../../electron/utils/operationalHooks";
import type { TypedEventBus } from "../../../../../electron/events/TypedEventBus";
import type { UptimeEvents } from "../../../../../electron/events/eventTypes";
import type { DatabaseService } from "../../../../../electron/services/database/DatabaseService";

/**
 * Creates a mock database service instance with an instrumented initialize method.
 */
function createDatabaseServiceMock(): {
    initialize: ReturnType<typeof vi.fn>;
    service: DatabaseService;
} {
    const initialize = vi.fn();
    const service = {
        initialize,
    } as unknown as DatabaseService;

    return { initialize, service };
}

/**
 * Creates a mock typed event emitter for database events.
 */
function createEventEmitterMock(): {
    emitTyped: ReturnType<typeof vi.fn>;
    eventEmitter: TypedEventBus<UptimeEvents>;
} {
    const emitTyped = vi.fn(async () => undefined);
    const eventEmitter = {
        emitTyped,
    } as unknown as TypedEventBus<UptimeEvents>;

    return { emitTyped, eventEmitter };
}

describe("databaseInitializer", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("initializes the database and loads sites when no errors occur", async () => {
        const { initialize, service } = createDatabaseServiceMock();
        const { emitTyped, eventEmitter } = createEventEmitterMock();
        const loadSites = vi.fn().mockResolvedValue(undefined);

        const mockedWithDatabaseOperation = vi.mocked(withDatabaseOperation);
        mockedWithDatabaseOperation.mockResolvedValueOnce(undefined);

        await expect(
            initDatabase(service, loadSites, eventEmitter)
        ).resolves.toBeUndefined();

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(mockedWithDatabaseOperation).toHaveBeenCalledWith(
            loadSites,
            "loadSites",
            eventEmitter
        );
        expect(loadSites).not.toHaveBeenCalled();
        expect(emitTyped).not.toHaveBeenCalled();
        expect(monitorLogger.error).not.toHaveBeenCalled();
    });

    it("logs, emits, and rethrows when the database initializer throws", async () => {
        const { service } = createDatabaseServiceMock();
        const { emitTyped, eventEmitter } = createEventEmitterMock();
        const loadSites = vi.fn().mockResolvedValue(undefined);
        const initError = new Error("failed to initialize");

        service.initialize = vi.fn(() => {
            throw initError;
        });

        const mockedWithDatabaseOperation = vi.mocked(withDatabaseOperation);

        await expect(
            initDatabase(service, loadSites, eventEmitter)
        ).rejects.toBe(initError);

        expect(mockedWithDatabaseOperation).not.toHaveBeenCalled();
        expect(monitorLogger.error).toHaveBeenCalledWith(
            "Failed to initialize database",
            initError
        );
        expect(emitTyped).toHaveBeenCalledTimes(1);

        const [channel, payload] = emitTyped.mock.calls[0];
        expect(channel).toBe("database:error");
        expect(payload).toMatchObject({
            details: "Failed to initialize database",
            error: initError,
            operation: "initialize-database",
        });
        expect(typeof payload.timestamp).toBe("number");
    });

    it("wraps non-Error failures from the loadSites operation", async () => {
        const { initialize, service } = createDatabaseServiceMock();
        const { emitTyped, eventEmitter } = createEventEmitterMock();
        const loadSites = vi.fn().mockResolvedValue(undefined);
        const mockedWithDatabaseOperation = vi.mocked(withDatabaseOperation);

        mockedWithDatabaseOperation.mockRejectedValueOnce("load failure");

        await expect(
            initDatabase(service, loadSites, eventEmitter)
        ).rejects.toBe("load failure");

        expect(initialize).toHaveBeenCalledTimes(1);
        expect(mockedWithDatabaseOperation).toHaveBeenCalledWith(
            loadSites,
            "loadSites",
            eventEmitter
        );
        expect(monitorLogger.error).toHaveBeenCalledWith(
            "Failed to initialize database",
            "load failure"
        );
        expect(emitTyped).toHaveBeenCalledTimes(1);

        const payload = emitTyped.mock.calls[0][1];
        expect(payload.error).toBeInstanceOf(Error);
        expect(payload.error).toHaveProperty("message", "load failure");
    });
});
