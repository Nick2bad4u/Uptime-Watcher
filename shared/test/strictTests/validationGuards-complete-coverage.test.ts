/**
 * Comprehensive coverage for runtime validation guards.
 */

import { describe, expect, it } from "vitest";

import {
    validateSiteSnapshot,
    validateSiteSnapshots,
} from "@shared/validation/guards";

import {
    createMonitorSnapshot,
    createSiteSnapshot,
} from "../fixtures/siteFactories";

describe(validateSiteSnapshot, () => {
    it("accepts canonical site snapshots", () => {
        const snapshot = createSiteSnapshot();
        const result = validateSiteSnapshot(snapshot);

        expect(result.success).toBeTruthy();
        if (!result.success) {
            throw new Error("Expected validation to succeed");
        }

        expect(result.data).toStrictEqual(snapshot);
    });

    it("rejects malformed site payloads", () => {
        const malformedSnapshot = createSiteSnapshot({
            identifier: 42 as unknown as string,
        });
        const result = validateSiteSnapshot(malformedSnapshot);

        expect(result.success).toBeFalsy();
        if (result.success) {
            throw new Error("Expected validation to fail");
        }

        expect(result.error.issues[0]?.path).toStrictEqual(["identifier"]);
        expect(result.error.issues[0]?.message).toMatch(/string/i);
    });
});

describe(validateSiteSnapshots, () => {
    it("aggregates valid snapshots", () => {
        const snapshots = [
            createSiteSnapshot(),
            createSiteSnapshot({ identifier: "site-2" }),
        ];
        const result = validateSiteSnapshots(snapshots);

        expect(result.success).toBeTruthy();
        if (!result.success) {
            throw new Error("Expected validation to succeed");
        }

        expect(result.data).toStrictEqual(snapshots);
    });

    it("reports individual failures with context", () => {
        const validSnapshot = createSiteSnapshot();
        const invalidSnapshots = [
            {
                ...createSiteSnapshot(),
                identifier: "site-3",
                monitors: [],
            },
            {
                ...createSiteSnapshot({ identifier: "site-4" }),
                monitors: [createMonitorSnapshot({ checkInterval: 1000 })],
            },
        ];

        const result = validateSiteSnapshots([
            validSnapshot,
            invalidSnapshots[0],
            invalidSnapshots[1],
        ]);

        expect(result.success).toBeFalsy();
        if (result.success) {
            throw new Error("Expected validation to fail");
        }

        const {issues} = result.error;
        expect(issues.length).toBeGreaterThan(0);

        const hasIssueForIndex1 = issues.some(
            (issue) => issue.path[0] === 1
        );
        const hasIssueForIndex2 = issues.some(
            (issue) => issue.path[0] === 2
        );

        expect(hasIssueForIndex1).toBeTruthy();
        expect(hasIssueForIndex2).toBeTruthy();

        const mentionsMonitors = issues.some((issue) =>
            issue.path.includes("monitors")
        );
        expect(mentionsMonitors).toBeTruthy();
    });

    it("gracefully handles empty collections", () => {
        const result = validateSiteSnapshots([]);

        expect(result.success).toBeTruthy();
        if (!result.success) {
            throw new Error("Expected validation to succeed");
        }

        expect(result.data).toHaveLength(0);
    });
});
