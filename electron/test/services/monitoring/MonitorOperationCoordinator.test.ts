import type { Monitor } from "@shared/types";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { MonitorRepository } from "../../../services/database/MonitorRepository";
import type { MonitorOperationRegistry } from "../../../services/monitoring/MonitorOperationRegistry";
import type { OperationTimeoutManager } from "../../../services/monitoring/OperationTimeoutManager";

import { MonitorOperationCoordinator } from "../../../services/monitoring/coordinators/MonitorOperationCoordinator";

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
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
    ...overrides,
});

const createAbortSignal = (): AbortSignal => new AbortController().signal;

describe(MonitorOperationCoordinator, () => {
    let monitorRepositoryUpdate: ReturnType<typeof vi.fn>;
    let monitorRepositoryClearActiveOperations: ReturnType<typeof vi.fn>;
    let monitorRepository: MonitorRepository;
    let operationRegistryInitiateCheck: ReturnType<typeof vi.fn>;
    let operationRegistryCompleteOperation: ReturnType<typeof vi.fn>;
    let operationRegistryHasOutstanding: ReturnType<typeof vi.fn>;
    let operationRegistryGetOutstandingIds: ReturnType<typeof vi.fn>;
    let operationRegistry: MonitorOperationRegistry;
    let timeoutManagerSchedule: ReturnType<typeof vi.fn>;
    let timeoutManagerClear: ReturnType<typeof vi.fn>;
    let timeoutManager: OperationTimeoutManager;
    let coordinator: MonitorOperationCoordinator;

    beforeEach(() => {
        monitorRepositoryUpdate = vi.fn().mockResolvedValue(undefined);
        monitorRepositoryClearActiveOperations = vi
            .fn()
            .mockResolvedValue(undefined);
        monitorRepository = {
            clearActiveOperations: monitorRepositoryClearActiveOperations,
            update: monitorRepositoryUpdate,
        } as unknown as MonitorRepository;

        operationRegistryCompleteOperation = vi.fn();
        operationRegistryInitiateCheck = vi.fn().mockReturnValue({
            operationId: "operation-123",
            signal: createAbortSignal(),
        });
        operationRegistryHasOutstanding = vi.fn().mockReturnValue(false);
        operationRegistryGetOutstandingIds = vi.fn().mockReturnValue([]);
        operationRegistry = {
            completeOperation: operationRegistryCompleteOperation,
            getOutstandingOperationIds: operationRegistryGetOutstandingIds,
            hasOutstandingOperation: operationRegistryHasOutstanding,
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

    it("uses the monitor timeout plus cleanup buffer when scheduling operations", async () => {
        const monitor = createMonitor({ timeout: 45_000 });

        const handle = await coordinator.initiateOperation(monitor);

        expect(handle?.timeoutMs).toBe(50_000);
        expect(timeoutManagerSchedule).toHaveBeenCalledWith(
            "operation-123",
            50_000
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

    it("clears persisted state before cleaning up a failed operation", async () => {
        await coordinator.cleanupFailedOperation("monitor-1", "operation-xyz");

        expect(monitorRepositoryClearActiveOperations).toHaveBeenCalledWith(
            "monitor-1"
        );
        expect(operationRegistryCompleteOperation).toHaveBeenCalledWith(
            "operation-xyz"
        );
        expect(timeoutManagerClear).toHaveBeenCalledWith("operation-xyz");
    });

    it("cleans up local state when persisted cleanup fails", async () => {
        monitorRepositoryClearActiveOperations.mockRejectedValueOnce(
            new Error("db failure")
        );

        await expect(
            coordinator.cleanupFailedOperation("monitor-1", "operation-xyz")
        ).resolves.toBeUndefined();

        expect(operationRegistryCompleteOperation).toHaveBeenCalledWith(
            "operation-xyz"
        );
        expect(timeoutManagerClear).toHaveBeenCalledWith("operation-xyz");
    });

    it("skips initiation when an outstanding operation exists", async () => {
        const monitor = createMonitor();
        operationRegistryHasOutstanding.mockReturnValue(true);
        operationRegistryGetOutstandingIds.mockReturnValue(["op-existing"]);

        const handle = await coordinator.initiateOperation(monitor);

        expect(handle).toBeUndefined();
        expect(operationRegistryInitiateCheck).not.toHaveBeenCalled();
        expect(timeoutManagerSchedule).not.toHaveBeenCalled();
        expect(monitorRepositoryUpdate).not.toHaveBeenCalled();
    });
});
