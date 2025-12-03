import type { Monitor } from "@shared/types";
import { describe, it, expect, beforeEach, vi } from "vitest";

import type { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { MonitorOperationRegistry } from "../../../services/monitoring/MonitorOperationRegistry";
import type { OperationTimeoutManager } from "../../../services/monitoring/OperationTimeoutManager";
import { MonitorOperationCoordinator } from "../../../services/monitoring/coordinators/MonitorOperationCoordinator";

const createMonitor = (): Monitor => ({
    activeOperations: [],
    checkInterval: 30_000,
    history: [],
    id: "monitor-1",
    lastChecked: new Date(),
    monitoring: true,
    retryAttempts: 0,
    responseTime: 0,
    status: "up",
    timeout: 5000,
    type: "http",
    url: "https://example.com",
});

const createAbortSignal = (): AbortSignal => new AbortController().signal;

describe(MonitorOperationCoordinator, () => {
    let monitorRepositoryUpdate: ReturnType<typeof vi.fn>;
    let monitorRepository: MonitorRepository;
    let operationRegistryInitiateCheck: ReturnType<typeof vi.fn>;
    let operationRegistryCompleteOperation: ReturnType<typeof vi.fn>;
    let operationRegistry: MonitorOperationRegistry;
    let timeoutManagerSchedule: ReturnType<typeof vi.fn>;
    let timeoutManagerClear: ReturnType<typeof vi.fn>;
    let timeoutManager: OperationTimeoutManager;
    let coordinator: MonitorOperationCoordinator;

    beforeEach(() => {
        monitorRepositoryUpdate = vi.fn().mockResolvedValue(undefined);
        monitorRepository = {
            update: monitorRepositoryUpdate,
        } as unknown as MonitorRepository;

        operationRegistryCompleteOperation = vi.fn();
        operationRegistryInitiateCheck = vi.fn().mockReturnValue({
            operationId: "operation-123",
            signal: createAbortSignal(),
        });
        operationRegistry = {
            completeOperation: operationRegistryCompleteOperation,
            initiateCheck: operationRegistryInitiateCheck,
        } as unknown as MonitorOperationRegistry;

        timeoutManagerClear = vi.fn();
        timeoutManagerSchedule = vi.fn();
        timeoutManager = {
            clearTimeout: timeoutManagerClear,
            scheduleTimeout: timeoutManagerSchedule,
        } as unknown as OperationTimeoutManager;

        coordinator = new MonitorOperationCoordinator({
            monitorRepository,
            operationRegistry,
            timeoutManager,
        });
    });

    it("registers and schedules operations", async () => {
        const monitor = createMonitor();

        const handle = await coordinator.initiateOperation(monitor);

        expect(handle).toBeDefined();
        expect(handle?.operationId).toBe("operation-123");
        expect(timeoutManagerSchedule).toHaveBeenCalledWith(
            "operation-123",
            expect.any(Number)
        );
        expect(monitorRepositoryUpdate).toHaveBeenCalledWith(
            monitor.id,
            expect.objectContaining({
                activeOperations: ["operation-123"],
            })
        );
    });

    it("cleans up when monitor update fails", async () => {
        const monitor = createMonitor();
        monitorRepositoryUpdate.mockRejectedValueOnce(new Error("db failure"));

        const handle = await coordinator.initiateOperation(monitor);

        expect(handle).toBeUndefined();
        expect(operationRegistryCompleteOperation).toHaveBeenCalledWith(
            "operation-123"
        );
        expect(timeoutManagerClear).toHaveBeenCalledWith("operation-123");
    });

    it("cleans up registered operations", () => {
        coordinator.cleanupOperation("operation-xyz");

        expect(operationRegistryCompleteOperation).toHaveBeenCalledWith(
            "operation-xyz"
        );
        expect(timeoutManagerClear).toHaveBeenCalledWith("operation-xyz");
    });
});
