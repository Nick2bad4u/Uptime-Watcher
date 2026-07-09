import type { Monitor } from "@shared/types";
import type { Logger } from "@shared/utils/logger/interfaces";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StatusUpdateMonitorCheckResult } from "../../../../services/monitoring/MonitorStatusUpdateService";

import { saveMonitorHistoryEntry } from "../../../../services/monitoring/enhancedMonitorChecker/saveHistoryEntry";

type SaveHistoryDependencies = Parameters<
    typeof saveMonitorHistoryEntry
>[0]["dependencies"];

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor => ({
    checkInterval: 300_000,
    history: [],
    id: "monitor-1",
    monitoring: true,
    responseTime: 150,
    retryAttempts: 3,
    status: "up",
    timeout: 30_000,
    type: "http",
    url: "https://example.com",
    ...overrides,
});

const createCheckResult = (
    overrides: Partial<StatusUpdateMonitorCheckResult> = {}
): StatusUpdateMonitorCheckResult => ({
    monitorId: "monitor-1",
    operationId: "operation-1",
    responseTime: 100,
    status: "up",
    timestamp: new Date("2026-01-02T03:04:05.000Z"),
    ...overrides,
});

const createLogger = (): Logger => ({
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
});

const createDependencies = (
    historyLimit = 50
): {
    dependencies: SaveHistoryDependencies;
    getHistoryLimit: ReturnType<typeof vi.fn>;
    historyRepository: {
        addEntry: ReturnType<typeof vi.fn>;
        getHistoryCount: ReturnType<typeof vi.fn>;
        pruneHistory: ReturnType<typeof vi.fn>;
    };
} => {
    const historyRepository = {
        addEntry: vi.fn().mockResolvedValue(undefined),
        getHistoryCount: vi.fn().mockResolvedValue(0),
        pruneHistory: vi.fn().mockResolvedValue(undefined),
    };
    const getHistoryLimit = vi.fn(() => historyLimit);

    return {
        dependencies: {
            getHistoryLimit,
            historyRepository:
                historyRepository as unknown as SaveHistoryDependencies["historyRepository"],
        },
        getHistoryLimit,
        historyRepository,
    };
};

describe(saveMonitorHistoryEntry, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("skips persistence when the monitor id is missing", async () => {
        const logger = createLogger();
        const { dependencies, historyRepository } = createDependencies();

        await saveMonitorHistoryEntry({
            checkResult: createCheckResult(),
            dependencies,
            historyPruneState: new Map(),
            logger,
            monitor: createMonitor({ id: "" }),
        });

        expect(historyRepository.addEntry).not.toHaveBeenCalled();
        expect(logger.warn).toHaveBeenCalledWith(
            "Cannot save history entry: monitor missing ID"
        );
    });

    it("persists status history and prunes when the buffered limit is exceeded", async () => {
        const logger = createLogger();
        const { dependencies, historyRepository } = createDependencies(50);
        historyRepository.getHistoryCount.mockResolvedValue(65);
        const checkResult = createCheckResult({ details: "HTTP 200" });

        await saveMonitorHistoryEntry({
            checkResult,
            dependencies,
            historyPruneState: new Map(),
            logger,
            monitor: createMonitor(),
        });

        expect(historyRepository.addEntry).toHaveBeenCalledWith(
            "monitor-1",
            {
                responseTime: 100,
                status: "up",
                timestamp: checkResult.timestamp.getTime(),
            },
            "HTTP 200"
        );
        expect(historyRepository.getHistoryCount).toHaveBeenCalledWith(
            "monitor-1"
        );
        expect(historyRepository.pruneHistory).toHaveBeenCalledWith(
            "monitor-1",
            50
        );
    });

    it("throttles count checks between prune windows", async () => {
        const logger = createLogger();
        const { dependencies, historyRepository } = createDependencies(50);
        const historyPruneState = new Map();
        const monitor = createMonitor();

        await saveMonitorHistoryEntry({
            checkResult: createCheckResult(),
            dependencies,
            historyPruneState,
            logger,
            monitor,
        });
        await saveMonitorHistoryEntry({
            checkResult: createCheckResult(),
            dependencies,
            historyPruneState,
            logger,
            monitor,
        });

        expect(historyRepository.addEntry).toHaveBeenCalledTimes(2);
        expect(historyRepository.getHistoryCount).toHaveBeenCalledTimes(1);
        expect(historyRepository.pruneHistory).not.toHaveBeenCalled();
    });

    it("clears cached prune state when history retention is disabled", async () => {
        const logger = createLogger();
        const { dependencies, historyRepository } = createDependencies(0);
        const historyPruneState = new Map([
            [
                "monitor-1",
                {
                    hasPerformedCountCheck: true,
                    lastHistoryLimit: 50,
                    pendingWritesSinceCountCheck: 1,
                },
            ],
        ]);

        await saveMonitorHistoryEntry({
            checkResult: createCheckResult(),
            dependencies,
            historyPruneState,
            logger,
            monitor: createMonitor(),
        });

        expect(historyRepository.getHistoryCount).not.toHaveBeenCalled();
        expect(historyRepository.pruneHistory).not.toHaveBeenCalled();
        expect(historyPruneState.has("monitor-1")).toBeFalsy();
    });

    it("logs sanitized failures without interrupting monitor checks", async () => {
        const logger = createLogger();
        const { dependencies, historyRepository } = createDependencies();
        historyRepository.addEntry.mockRejectedValue(new Error("DB error"));
        const rawMonitorId =
            "https://monitor.example/check?token=monitor-token#private-monitor";

        await expect(
            saveMonitorHistoryEntry({
                checkResult: createCheckResult(),
                dependencies,
                historyPruneState: new Map(),
                logger,
                monitor: createMonitor({ id: rawMonitorId }),
            })
        ).resolves.toBeUndefined();

        expect(historyRepository.addEntry).toHaveBeenCalledWith(
            rawMonitorId,
            expect.any(Object),
            undefined
        );
        expect(logger.error).toHaveBeenCalledWith(
            "Failed to save history entry for monitor https://monitor.example/check",
            expect.objectContaining({ message: "DB error" })
        );
    });
});
