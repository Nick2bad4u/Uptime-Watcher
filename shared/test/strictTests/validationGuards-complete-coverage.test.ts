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
        expect(result.errors).toHaveLength(0);
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
        expect(result.data).toStrictEqual([validSnapshot]);
        expect(result.errors).toHaveLength(2);
        expect(result.errors[0]).toMatchObject({
            index: 1,
            value: invalidSnapshots[0],
        });
        expect(result.errors[1]).toMatchObject({
            index: 2,
            value: invalidSnapshots[1],
        });
        const [firstError] = result.errors;

        if (!firstError) {
            throw new Error(
                "Expected diagnostics for the first invalid snapshot"
            );
        }

        const [firstIssue] = firstError.error.issues;

        if (!firstIssue) {
            throw new Error(
                "Expected validation issues for the first invalid snapshot"
            );
        }

        expect(firstIssue.path).toContain("monitors");
    });

    it("gracefully handles empty collections", () => {
        const result = validateSiteSnapshots([]);

        expect(result.success).toBeTruthy();
        expect(result.data).toHaveLength(0);
        expect(result.errors).toHaveLength(0);
    });
});
