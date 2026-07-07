/**
 * Tests for mapping database history rows to StatusHistory objects.
 */

import type { HistoryRow as DatabaseHistoryRow } from "@shared/types/database";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rowToHistoryEntry } from "../../../../services/database/utils/mappers/historyMapper";
import { logger } from "../../../../utils/logger";

vi.mock("../../../../utils/logger", () => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
    },
}));

const TEST_TIMESTAMP = 1_680_000_000_000;

describe(rowToHistoryEntry, () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("maps valid database rows to status history entries", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const row: DatabaseHistoryRow = {
            monitorId: "monitor-123",
            responseTime: 150,
            status: "up",
            timestamp: TEST_TIMESTAMP,
        };

        expect(rowToHistoryEntry(row)).toEqual({
            responseTime: 150,
            status: "up",
            timestamp: TEST_TIMESTAMP,
        });
    });

    it("preserves details strings", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const row: DatabaseHistoryRow = {
            details: "Connection timeout",
            monitorId: "monitor-123",
            responseTime: 0,
            status: "down",
            timestamp: TEST_TIMESTAMP,
        };

        expect(rowToHistoryEntry(row)).toEqual({
            details: "Connection timeout",
            responseTime: 0,
            status: "down",
            timestamp: TEST_TIMESTAMP,
        });
    });

    it("stringifies non-string details", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const row = {
            details: { code: "ECONNRESET" },
            monitorId: "monitor-123",
            responseTime: 0,
            status: "down",
            timestamp: TEST_TIMESTAMP,
        } as unknown as DatabaseHistoryRow;

        expect(rowToHistoryEntry(row).details).toBe(
            JSON.stringify({ code: "ECONNRESET" })
        );
    });

    it("falls back for invalid numeric fields", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const row = {
            monitorId: "monitor-123",
            responseTime: "invalid",
            status: "up",
            timestamp: "invalid",
        } as unknown as DatabaseHistoryRow;

        const mapped = rowToHistoryEntry(row);

        expect(mapped.responseTime).toBe(0);
        expect(mapped.status).toBe("up");
        expect(mapped.timestamp).toEqual(expect.any(Number));
    });

    it("falls back to down for invalid status values", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const row = {
            monitorId: "monitor-123",
            responseTime: 100,
            status: "unknown",
            timestamp: TEST_TIMESTAMP,
        } as unknown as DatabaseHistoryRow;

        expect(rowToHistoryEntry(row)).toEqual({
            responseTime: 100,
            status: "down",
            timestamp: TEST_TIMESTAMP,
        });
        expect(logger.warn).toHaveBeenCalledWith(expect.any(String), {
            status: "unknown",
        });
    });

    it("logs and rethrows serialization failures", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: historyMapper", "component");

        const circular: Record<string, unknown> = {};
        circular["self"] = circular;
        const row = {
            details: circular,
            monitorId: "monitor-123",
            responseTime: 100,
            status: "up",
            timestamp: TEST_TIMESTAMP,
        } as unknown as DatabaseHistoryRow;

        expect(() => rowToHistoryEntry(row)).toThrow(TypeError);
        expect(logger.error).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(TypeError),
            expect.objectContaining({
                row,
            })
        );
    });
});
