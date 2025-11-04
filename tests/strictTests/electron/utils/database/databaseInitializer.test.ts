/**
 * Unit tests for the database initialization helper.
 */

import { beforeEach, describe, expect, it, vi, expectTypeOf } from "vitest";

import type { Logger } from "@shared/utils/logger/interfaces";

type LoggerMock = Record<keyof Logger, ReturnType<typeof vi.fn>>;

function createLoggerMock(): LoggerMock {
    return {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };
}

vi.mock("../../../../../electron/utils/logger", () => {
    const monitorLoggerInstance = createLoggerMock();

    return {
        dbLogger: createLoggerMock() as unknown as Logger,
        diagnosticsLogger: createLoggerMock() as unknown as Logger,
        logger: createLoggerMock() as unknown as Logger,
        monitorLogger: monitorLoggerInstance as unknown as Logger,
    } satisfies typeof import("../../../../../electron/utils/logger");
});

vi.mock("../../../../../electron/utils/operationalHooks", () => ({
    withDatabaseOperation: vi.fn(),
}));

import { initDatabase } from "../../../../../electron/utils/database/databaseInitializer";
import { monitorLogger } from "../../../../../electron/utils/logger";
import { withDatabaseOperation } from "../../../../../electron/utils/operationalHooks";
import type { TypedEventBus } from "../../../../../electron/events/TypedEventBus";
import type { UptimeEvents } from "../../../../../electron/events/eventTypes";
import type { DatabaseService } from "../../../../../electron/services/database/DatabaseService";

type DatabaseErrorPayload = UptimeEvents["database:error"];

/**
 * Creates a mock database service instance with an instrumented initialize
 * method.
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

        vi.spyOn(service, "initialize").mockImplementation(() => {
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

        const firstCall = emitTyped.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        const [channel, payload] = firstCall as [
            keyof UptimeEvents,
            DatabaseErrorPayload,
        ];

        expect(channel).toBe("database:error");
        expect(payload).toMatchObject({
            details: "Failed to initialize database",
            error: initError,
            operation: "initialize-database",
        });

        expectTypeOf(payload.timestamp).toBeNumber();
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

        const firstCall = emitTyped.mock.calls.at(0);
        expect(firstCall).toBeDefined();

        const [, payload] = firstCall as [
            keyof UptimeEvents,
            DatabaseErrorPayload,
        ];

        expect(payload.error).toBeInstanceOf(Error);
        expect(payload.error).toHaveProperty("message", "load failure");
    });
});
