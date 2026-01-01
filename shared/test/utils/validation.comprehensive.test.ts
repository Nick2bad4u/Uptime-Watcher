/**
 * Canonical (Zod-based) validation tests.
 *
 * @remarks
 * This suite exists to validate that the canonical Zod schemas accept valid
 * monitor/site payloads and surface meaningful errors for invalid data.
 */

import { describe, expect, it } from "vitest";

import { MIN_MONITOR_CHECK_INTERVAL_MS } from "@shared/constants/monitoring";
import { validateMonitorData } from "@shared/validation/monitorSchemas";
import { validateSiteData } from "@shared/validation/siteSchemas";

describe("Canonical validation (Zod)", () => {
    it("accepts valid http monitor payload", () => {
        const result = validateMonitorData("http", {
            id: "m-http",
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
    });

    it("accepts valid port monitor payload", () => {
        const result = validateMonitorData("port", {
            id: "m-port",
            type: "port",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            host: "example.com",
            port: 443,
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
            timeout: 1000,
            retryAttempts: 0,
        });

        expect(result.success).toBeTruthy();
    });

    it("accepts valid dns monitor payload", () => {
        const result = validateMonitorData("dns", {
            id: "m-dns",
            type: "dns",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            host: "example.com",
            recordType: "A",
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
            timeout: 1000,
            retryAttempts: 0,
        });

        expect(result.success).toBeTruthy();
    });

    it("accepts valid ssl monitor payload", () => {
        const result = validateMonitorData("ssl", {
            id: "m-ssl",
            type: "ssl",
            status: "up",
            monitoring: true,
            responseTime: -1,
            history: [],
            host: "example.com",
            port: 443,
            certificateWarningDays: 30,
            checkInterval: MIN_MONITOR_CHECK_INTERVAL_MS,
            timeout: 1000,
            retryAttempts: 0,
        });

        expect(result.success).toBeTruthy();
    });

    it("returns errors for invalid monitor payload", () => {
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
                result.errors.some((error) =>
                    error.includes("Monitor ID is required")
                )
            ).toBeTruthy();
        }
    });

    it("accepts a valid site", () => {
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

    it("rejects an invalid site", () => {
        const result = validateSiteData({
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

        expect(result.success).toBeFalsy();
        expect(result.errors.length).toBeGreaterThan(0);
    });
});
