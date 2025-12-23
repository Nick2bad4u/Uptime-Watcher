/**
 * Canonical validation helper tests.
 *
 * @remarks
 * The project now uses the canonical Zod schemas under `shared/validation/*`.
 * Any previous bespoke validation helpers have been removed.
 */

import { describe, expect, it } from "vitest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { getMonitorValidationErrors } from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";
import { validateMonitorType } from "@shared/utils/validation";

describe(validateMonitorType, () => {
    it("accepts known monitor types", () => {
        expect(validateMonitorType("http")).toBeTruthy();
        expect(validateMonitorType("port")).toBeTruthy();
        expect(validateMonitorType("ping")).toBeTruthy();
        expect(validateMonitorType("dns")).toBeTruthy();
    });

    it("rejects non-strings", () => {
        expect(validateMonitorType(null)).toBeFalsy();
        expect(validateMonitorType(undefined)).toBeFalsy();
        expect(validateMonitorType(123)).toBeFalsy();
        expect(validateMonitorType({})).toBeFalsy();
    });

    it("rejects unknown strings", () => {
        expect(validateMonitorType("not-a-type")).toBeFalsy();
    });
});

describe("getMonitorValidationErrors (canonical Zod)", () => {
    it("rejects non-object monitor payloads", () => {
        expect(getMonitorValidationErrors(null)).toEqual([
            "Monitor data must be an object",
        ]);
        expect(getMonitorValidationErrors("oops")).toEqual([
            "Monitor data must be an object",
        ]);
    });

    it("requires a non-empty monitor type", () => {
        expect(getMonitorValidationErrors({})).toEqual([
            "Monitor type is required",
        ]);
        expect(getMonitorValidationErrors({ type: "   " })).toEqual([
            "Monitor type is required",
        ]);
    });

    it("surfaces required monitor ID errors", () => {
        const errors = getMonitorValidationErrors({ type: "http", id: "" });
        expect(
            errors.some((error) => error.includes("Monitor ID is required"))
        ).toBeTruthy();
    });

    it("validates check interval minimum using shared constant", () => {
        const errors = getMonitorValidationErrors({
            id: "m1",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            url: "https://example.com",
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS - 1,
            timeout: 1000,
            retryAttempts: 0,
        });

        expect(
            errors.some((error) =>
                error.includes(
                    `Check interval must be at least ${MIN_MONITOR_CHECK_INTERVAL_MS}ms`
                )
            )
        ).toBeTruthy();
    });

    it("validates port monitor host/port fields", () => {
        const errors = getMonitorValidationErrors({
            id: "m2",
            type: "port",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            host: "example.com",
            port: 70_000,
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
            timeout: 1000,
            retryAttempts: 0,
        });

        expect(
            errors.some((error) => error.toLowerCase().includes("port"))
        ).toBeTruthy();
    });
});

describe("validateSiteData (canonical Zod)", () => {
    it("accepts a minimal valid site", () => {
        const result = validateSiteData({
            identifier: "site-1",
            name: "Site 1",
            monitoring: true,
            monitors: [
                {
                    id: "m1",
                    type: "http",
                    status: "up",
                    monitoring: true,
                    responseTime: -1,
                    history: [],
                    url: "https://example.com",
                    checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
                    timeout: 1000,
                    retryAttempts: 0,
                },
            ],
        });

        expect(result.success).toBeTruthy();
    });

    it("rejects missing/invalid site fields", () => {
        const result = validateSiteData({
            identifier: "",
            name: "   ",
            monitoring: true,
            monitors: [],
        });

        expect(result.success).toBeFalsy();
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
