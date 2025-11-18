/**
 * Targeted coverage for {@link applyStatusUpdateSnapshot}.
 *
 * @remarks
 * These tests follow the guidance from `docs/Testing/README.md` and the
 * workflow rules in `docs/Guides/TOOLS_AND_COMMANDS_GUIDE.md` by combining
 * deterministic scenarios with fast-check property coverage. The goal is to
 * exercise the fallback logging path, history merge semantics, and general
 * snapshot application guarantees that were previously uncovered in
 * `src/stores/sites/utils/statusUpdateHandler.ts`.
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { test } from "@fast-check/vitest";
import * as fc from "fast-check";

import type { Monitor, MonitorStatus, Site } from "@shared/types";

import {
    applyStatusUpdateSnapshot,
    type StatusUpdateSnapshotPayload,
} from "../../../../stores/sites/utils/statusUpdateHandler";

import { logger } from "../../../../services/logger";
import { isDevelopment } from "@shared/utils/environment";

vi.mock("@shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => false),
}));

vi.mock("../../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    },
}));

const mockedIsDevelopment = vi.mocked(isDevelopment);
const mockedLogger = vi.mocked(logger);

type MonitorHistoryEntry = Required<Monitor>["history"][number];

const createHistoryEntry = (
    status: MonitorStatus,
    seed: number
): MonitorHistoryEntry => ({
    responseTime: 100 + seed,
    status,
    timestamp: new Date(Date.UTC(2024, 0, seed + 1)).toISOString(),
});

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor =>
    ({
        checkInterval: overrides.checkInterval ?? 60_000,
        history: overrides.history ?? [],
        id: overrides.id ?? "monitor-default",
        monitoring: overrides.monitoring ?? true,
        name: overrides.name ?? "Primary Monitor",
        responseTime: overrides.responseTime ?? 150,
        retryAttempts: overrides.retryAttempts ?? 3,
        status: overrides.status ?? "up",
        timeout: overrides.timeout ?? 30_000,
        type: overrides.type ?? "http",
        url: overrides.url ?? "https://status.example.com/health",
        lastChecked:
            overrides.lastChecked ?? new Date("2024-01-01T00:00:00.000Z"),
        ...overrides,
    }) as Monitor;

const createSite = (
    identifier: string,
    monitors: readonly Monitor[],
    overrides: Partial<Site> = {}
): Site =>
    ({
        history: overrides.history ?? [],
        id: overrides.id ?? identifier,
        identifier,
        monitoring: overrides.monitoring ?? true,
        monitors: monitors as Site["monitors"],
        name: overrides.name ?? `Site ${identifier}`,
        status: overrides.status ?? "up",
        ...overrides,
    }) as Site;

describe("applyStatusUpdateSnapshot", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockedIsDevelopment.mockReturnValue(false);
    });

    it("returns the original sites array when snapshot lacks contextual site data", () => {
        mockedIsDevelopment.mockReturnValue(true);

        const sites = [
            createSite("site-a", [createMonitor({ id: "monitor-a" })]),
        ];

        const payload: StatusUpdateSnapshotPayload = {
            monitorId: "monitor-a",
            siteIdentifier: "site-a",
            status: "down",
            timestamp: "2024-01-01T00:00:00.000Z",
        };

        const result = applyStatusUpdateSnapshot(sites, payload);

        expect(result).toBe(sites);
        expect(mockedLogger.debug).toHaveBeenCalledWith(
            expect.stringContaining(
                "status update without site or monitor context"
            ),
            expect.objectContaining({
                monitorId: payload.monitorId,
                siteIdentifier: payload.siteIdentifier,
            })
        );
    });

    it("falls back to the existing monitor history when the snapshot omits history records", () => {
        const existingHistory = [
            createHistoryEntry("up", 0),
            createHistoryEntry("down", 1),
        ];

        const monitor = createMonitor({
            history: existingHistory,
            id: "monitor-keep-history",
        });

        const sites = [createSite("site-history", [monitor])];

        const payload: StatusUpdateSnapshotPayload = {
            monitor: createMonitor({ id: monitor.id, history: [] }),
            monitorId: monitor.id,
            site: createSite("site-history", [monitor]),
            siteIdentifier: "site-history",
            status: "down",
            timestamp: "invalid-timestamp",
        };

        const [updatedSite] = applyStatusUpdateSnapshot(sites, payload);
        const updatedMonitor = updatedSite.monitors.find(
            ({ id }) => id === monitor.id
        );

        expect(updatedMonitor?.history).toEqual(existingHistory);
    });

    it("uses snapshot history when provided", () => {
        const monitor = createMonitor({ id: "monitor-new-history" });
        const sites = [createSite("site-new-history", [monitor])];

        const snapshotHistory = [
            createHistoryEntry("down", 2),
            createHistoryEntry("up", 3),
        ];

        const payload: StatusUpdateSnapshotPayload = {
            monitor: createMonitor({
                history: snapshotHistory,
                id: monitor.id,
                status: "down",
            }),
            monitorId: monitor.id,
            site: createSite("site-new-history", [monitor]),
            siteIdentifier: "site-new-history",
            status: "down",
            timestamp: "2024-02-02T00:00:00.000Z",
        };

        const [updatedSite] = applyStatusUpdateSnapshot(sites, payload);
        const updatedMonitor = updatedSite.monitors.find(
            ({ id }) => id === monitor.id
        );

        expect(updatedMonitor?.history).toEqual(snapshotHistory);
        expect(updatedMonitor?.status).toBe("down");
    });

    const historyStatuses = fc.array(
        fc.constantFrom<MonitorStatus>("up", "down", "pending", "unknown"),
        { maxLength: 5 }
    );

    test.prop([
        fc
            .string({ minLength: 3, maxLength: 24 })
            .filter((value) => /\S/.test(value))
            .map((value) => value.trim()),
        fc
            .string({ minLength: 3, maxLength: 24 })
            .filter((value) => /\S/.test(value))
            .map((value) => value.trim()),
        historyStatuses.map((statuses) =>
            statuses.map((status, index) => createHistoryEntry(status, index))
        ),
        historyStatuses.map((statuses) =>
            statuses.map((status, index) =>
                createHistoryEntry(status, index + 10)
            )
        ),
        fc.constantFrom<MonitorStatus>("up", "down", "pending", "unknown"),
    ])(
        "applies snapshot data without disturbing unaffected monitors",
        (
            siteIdentifier,
            monitorId,
            existingHistory,
            snapshotHistory,
            nextStatus
        ) => {
            const targetMonitor = createMonitor({
                history: existingHistory,
                id: monitorId,
                status: "up",
            });
            const siblingMonitor = createMonitor({
                id: `${monitorId}-sibling`,
                status: "up",
            });

            const site = createSite(siteIdentifier, [
                targetMonitor,
                siblingMonitor,
            ]);
            const payload: StatusUpdateSnapshotPayload = {
                monitor: createMonitor({
                    history: snapshotHistory,
                    id: monitorId,
                    status: nextStatus,
                }),
                monitorId,
                site: createSite(siteIdentifier, [
                    targetMonitor,
                    siblingMonitor,
                ]),
                siteIdentifier,
                status: nextStatus,
                timestamp: new Date("2024-05-05T12:00:00.000Z").toISOString(),
            };

            const [updatedSite] = applyStatusUpdateSnapshot([site], payload);
            const updatedMonitor = updatedSite.monitors.find(
                ({ id }) => id === monitorId
            );
            const untouchedMonitor = updatedSite.monitors.find(
                ({ id }) => id === siblingMonitor.id
            );

            expect(updatedMonitor?.status).toBe(nextStatus);

            const expectedHistory =
                snapshotHistory.length === 0 && existingHistory.length > 0
                    ? existingHistory
                    : snapshotHistory;
            expect(updatedMonitor?.history).toEqual(expectedHistory);
            expect(untouchedMonitor).toBe(siblingMonitor);
        }
    );
});
