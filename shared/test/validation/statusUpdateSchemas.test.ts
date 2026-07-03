/**
 * Targeted tests for the StatusUpdate Zod schema.
 *
 * @remarks
 * This suite focuses on cross-field consistency guarantees that cannot be
 * expressed via static typing alone (e.g., ensuring redundant identifier fields
 * match their embedded objects).
 */

import { describe, expect, it } from "vitest";

import type { StatusUpdate } from "../../types";

import {
    safeParseIsoTimestamp,
    statusUpdateSchema,
} from "../../validation/statusUpdateSchemas";
import { createValidHttpMonitor } from "./testHelpers";

const createValidStatusUpdate = (): StatusUpdate => {
    const monitor = createValidHttpMonitor({ id: "monitor-1" });
    const site = {
        identifier: "site-1",
        monitoring: true,
        monitors: [monitor],
        name: "Test Site",
    };

    return {
        monitor,
        monitorId: monitor.id,
        site,
        siteIdentifier: site.identifier,
        status: monitor.status,
        timestamp: new Date().toISOString(),
    };
};

describe("statusUpdateSchema", () => {
    it("accepts consistent payloads", () => {
        const payload = createValidStatusUpdate();
        const result = statusUpdateSchema.safeParse(payload);

        expect(result.success).toBeTruthy();
    });

    it("accepts ISO timestamps with surrounding whitespace", () => {
        const payload = createValidStatusUpdate();
        payload.timestamp = "  2026-07-03T00:00:00.000Z  ";

        const result = statusUpdateSchema.safeParse(payload);

        expect(result.success).toBeTruthy();
        if (result.success) {
            expect(result.data.timestamp).toBe("2026-07-03T00:00:00.000Z");
        }
    });

    it("rejects loose or impossible timestamp strings", () => {
        for (const timestamp of [
            "2026-07-03",
            "July 3, 2026",
            "2026-02-30T00:00:00.000Z",
            "2026-07-03T00:00:00.000",
        ]) {
            const payload = createValidStatusUpdate();
            payload.timestamp = timestamp;

            const result = statusUpdateSchema.safeParse(payload);

            expect(result.success).toBeFalsy();
        }
    });

    it("rejects payloads where monitorId mismatches monitor.id", () => {
        const payload = createValidStatusUpdate();
        payload.monitorId = "different-monitor";

        const result = statusUpdateSchema.safeParse(payload);

        expect(result.success).toBeFalsy();
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "monitorId must match monitor.id"
            );
        }
    });

    it("rejects payloads where siteIdentifier mismatches site.identifier", () => {
        const payload = createValidStatusUpdate();
        payload.siteIdentifier = "different-site";

        const result = statusUpdateSchema.safeParse(payload);

        expect(result.success).toBeFalsy();
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "siteIdentifier must match site.identifier"
            );
        }
    });

    it("rejects payloads where monitorId does not exist in site.monitors", () => {
        const payload = createValidStatusUpdate();
        payload.site.monitors = [];

        const result = statusUpdateSchema.safeParse(payload);

        expect(result.success).toBeFalsy();
        if (!result.success) {
            expect(result.error.issues.map((issue) => issue.message)).toContain(
                "monitorId must reference a monitor in site.monitors"
            );
        }
    });
});

describe(safeParseIsoTimestamp, () => {
    it("trims and accepts valid ISO timestamp strings", () => {
        const result = safeParseIsoTimestamp(
            "  2026-07-03T00:00:00.000Z  "
        );

        expect(result.success).toBeTruthy();
        if (result.success) {
            expect(result.data).toBe("2026-07-03T00:00:00.000Z");
        }
    });

    it("rejects loose or impossible timestamp strings", () => {
        for (const timestamp of [
            "2026-07-03",
            "July 3, 2026",
            "2026-02-30T00:00:00.000Z",
            "2026-07-03T00:00:00.000",
        ]) {
            expect(safeParseIsoTimestamp(timestamp).success).toBeFalsy();
        }
    });
});
