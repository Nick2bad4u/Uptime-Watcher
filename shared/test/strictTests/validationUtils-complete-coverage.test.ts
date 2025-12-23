/**
 * Canonical validation coverage.
 *
 * @remarks
 * This suite intentionally covers the canonical Zod validators under
 * `shared/validation/*` and the lightweight `validateMonitorType` helper.
 *
 * The previous validation utilities have been deleted.
 */

import { describe, expect, it } from "vitest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import {
    getMonitorValidationErrors,
    validateMonitorData,
} from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";
import { validateMonitorType } from "@shared/utils/validation";

describe("Canonical validation coverage", () => {
    it("validateMonitorType behaves as a strict type guard", () => {
        expect(validateMonitorType("http")).toBeTruthy();
        expect(validateMonitorType("not-a-type")).toBeFalsy();
        expect(validateMonitorType(123)).toBeFalsy();
    });

    it("getMonitorValidationErrors requires type for unknown candidates", () => {
        expect(getMonitorValidationErrors({})).toEqual(["Monitor type is required"]);
    });

    it("validateMonitorData validates http monitors", () => {
        const result = validateMonitorData("http", {
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
        });

        expect(result.success).toBeTruthy();
        if (!result.success) {
            expect(result.errors).toHaveLength(0);
        }
    });

    it("validateMonitorData surfaces useful errors for invalid monitors", () => {
        const result = validateMonitorData("http", {
            id: "",
            type: "http",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            url: "",
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS - 1,
            timeout: 0,
            retryAttempts: 999,
        });

        expect(result.success).toBeFalsy();
        if (!result.success) {
            expect(result.errors.length).toBeGreaterThan(0);
            expect(
                result.errors.some((error) => error.includes("Monitor ID is required"))
            ).toBeTruthy();
        }
    });

    it("validateSiteData validates canonical site payloads", () => {
        const ok = validateSiteData({
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
        expect(ok.success).toBeTruthy();

        const bad = validateSiteData({
            identifier: "",
            name: "",
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
        expect(bad.success).toBeFalsy();
    });
});
