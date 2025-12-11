/**
 * Focused coverage tests for migrateMonitorType in MonitorTypeRegistry.
 */
import type { MonitorType } from "../../../../../shared/types.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

type WithErrorHandling =
    (typeof import("../../../../../shared/utils/errorHandling"))["withErrorHandling"];

const migratorMock = {
    migrateMonitorData: vi.fn(),
};

const createMigrationOrchestratorMock = vi.fn(() => migratorMock);

const migrationRegistryMock = {
    registerMigration: vi.fn(),
};

const versionManagerMock = {
    getVersion: vi.fn(() => "1.0.0"),
    setVersion: vi.fn(),
};

const exampleMigrationsMock = {
    httpV1_0_to_1_1: vi.fn(),
    portV1_0_to_1_1: vi.fn(),
};

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

let loggerMock: LoggerMock | undefined;

const getLoggerMock = (): LoggerMock => {
    if (!loggerMock) {
        throw new Error("loggerMock has not been initialized");
    }

    return loggerMock;
};

function loggerModuleMockFactory(): typeof import("../../../../../electron/utils/logger") {
    loggerMock = createLoggerMock();

    return {
        dbLogger: createLoggerMock() as unknown as Logger,
        diagnosticsLogger: createLoggerMock() as unknown as Logger,
        logger: loggerMock as unknown as Logger,
        monitorLogger: createLoggerMock() as unknown as Logger,
    } satisfies typeof import("../../../../../electron/utils/logger");
}

const passthroughWithErrorHandling: WithErrorHandling = async <T>(
    operation: () => Promise<T>,
    _storeOrContext: Parameters<WithErrorHandling>[1]
): Promise<T> => operation();

const withErrorHandlingMock = vi.fn<WithErrorHandling>(
    passthroughWithErrorHandling
);

vi.mock("../../../../../electron/utils/logger", loggerModuleMockFactory);

vi.mock("../../../../../electron/services/monitoring/MigrationSystem", () => ({
    createMigrationOrchestrator: createMigrationOrchestratorMock,
    exampleMigrations: exampleMigrationsMock,
    migrationRegistry: migrationRegistryMock,
    versionManager: versionManagerMock,
}));

vi.mock("../../../../../shared/utils/errorHandling", () => ({
    withErrorHandling:
        withErrorHandlingMock as (typeof import("../../../../../shared/utils/errorHandling"))["withErrorHandling"],
}));

describe("migrateMonitorType", () => {
    beforeEach(() => {
        migratorMock.migrateMonitorData.mockReset();
        createMigrationOrchestratorMock.mockClear();
        migrationRegistryMock.registerMigration.mockClear();
        versionManagerMock.setVersion.mockClear();
        exampleMigrationsMock.httpV1_0_to_1_1.mockClear();
        exampleMigrationsMock.portV1_0_to_1_1.mockClear();
        if (loggerMock) {
            for (const fn of Object.values(loggerMock)) {
                fn.mockClear();
            }
        }
        withErrorHandlingMock.mockReset();
        withErrorHandlingMock.mockImplementation(passthroughWithErrorHandling);
    });

    it("returns validation error when monitor type is not registered", async () => {
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        const result = await migrateMonitorType(
            "non-existent" as unknown as MonitorType,
            "1.0.0",
            "1.1.0"
        );

        expect(result).toStrictEqual({
            appliedMigrations: [],
            errors: [expect.stringContaining("Invalid monitor type")],
            success: false,
        });
        expect(createMigrationOrchestratorMock).not.toHaveBeenCalled();
    });

    it("short-circuits when versions match while preserving data", async () => {
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        const data = { url: "https://example.com" };
        const result = await migrateMonitorType("http", "1.0.0", "1.0.0", data);

        expect(result).toStrictEqual({
            appliedMigrations: [],
            data,
            errors: [],
            success: true,
        });
        const logger = getLoggerMock();

        expect(logger.info).toHaveBeenCalledWith(
            "Migrating monitor type http from 1.0.0 to 1.0.0"
        );
        expect(createMigrationOrchestratorMock).not.toHaveBeenCalled();
    });

    it("records placeholder migration when bumping version without data", async () => {
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        const result = await migrateMonitorType("http", "1.0.0", "1.1.0");

        expect(result).toStrictEqual({
            appliedMigrations: ["http_1.0.0_to_1.1.0"],
            errors: [],
            success: true,
        });
        expect(createMigrationOrchestratorMock).not.toHaveBeenCalled();
    });

    it("delegates to orchestrator when data is provided", async () => {
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        const orchestratorResult = {
            appliedMigrations: ["http_1.0.0_to_1.2.0"],
            data: { url: "https://updated.example.com" },
            errors: [],
            success: true,
        };
        migratorMock.migrateMonitorData.mockResolvedValueOnce(
            orchestratorResult
        );

        const result = await migrateMonitorType("http", "1.0.0", "1.2.0", {
            url: "https://example.com",
        });

        expect(createMigrationOrchestratorMock).toHaveBeenCalledTimes(1);
        expect(migratorMock.migrateMonitorData).toHaveBeenCalledWith(
            "http",
            { url: "https://example.com" },
            "1.0.0",
            "1.2.0"
        );
        expect(result).toStrictEqual(orchestratorResult);
    });

    it("returns catch-block failure details when migration pipeline throws", async () => {
        withErrorHandlingMock.mockRejectedValueOnce(new Error("boom"));
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        const result = await migrateMonitorType("http", "1.0.0", "2.0.0");

        expect(result).toStrictEqual({
            appliedMigrations: [],
            errors: ["Migration failed: boom"],
            success: false,
        });
    });

    it("propagates orchestrator errors when migration fails", async () => {
        const { migrateMonitorType } =
            await import("../../../../../electron/services/monitoring/MonitorTypeRegistry");

        migratorMock.migrateMonitorData.mockResolvedValueOnce({
            appliedMigrations: ["http_1.0.0_to_1.2.0"],
            errors: ["could not transform"],
            success: false,
        });

        const result = await migrateMonitorType("http", "1.0.0", "1.2.0", {
            url: "https://example.com",
        });

        expect(result).toStrictEqual({
            appliedMigrations: ["http_1.0.0_to_1.2.0"],
            errors: ["could not transform"],
            success: false,
        });
    });
});
