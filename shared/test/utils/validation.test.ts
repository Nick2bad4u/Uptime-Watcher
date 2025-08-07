/**
 * Comprehensive tests for shared validation utilities.
 */

import { describe, it, expect } from "vitest";

import type { Monitor, Site } from "../../types";
import {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite,
} from "../../utils/validation";

describe("Shared Validation Utilities", () => {
    describe("getMonitorValidationErrors", () => {
        it("should return no errors for valid HTTP monitor", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return no errors for valid port monitor", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "port",
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return errors for missing required fields", () => {
            const monitor: Partial<Monitor> = {};

            const errors = getMonitorValidationErrors(monitor);
            expect(errors.length).toBeGreaterThan(0);
            expect(errors.some((error) => error.includes("id"))).toBe(true);
            expect(errors.some((error) => error.includes("type"))).toBe(true);
        });

        it("should return errors for invalid monitor type", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "invalid" as any,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors.some((error) => error.includes("type"))).toBe(true);
        });

        it("should return errors for HTTP monitor without URL", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                checkInterval: 60_000,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(
                errors.some(
                    (error) => error.includes("url") || error.includes("URL")
                )
            ).toBe(true);
        });

        it.skip("should return errors for port monitor without host or port", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "port",
                status: "pending",
                checkInterval: 60_000,
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors.some((error) => error.includes("host"))).toBe(true);
            expect(errors.some((error) => error.includes("port"))).toBe(true);
        });

        it("should return errors for invalid check interval", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                url: "https://example.com",
                checkInterval: 500, // Too low
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(
                errors.some(
                    (error) =>
                        error.includes("interval") ||
                        error.includes("checkInterval")
                )
            ).toBe(true);
        });

        it.skip("should return errors for invalid timeout", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                url: "https://example.com",
                status: "pending",
                checkInterval: 60_000,
                timeout: -1, // Invalid
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(errors.some((error) => error.includes("timeout"))).toBe(
                true
            );
        });

        it("should return errors for invalid retry attempts", () => {
            const monitor: Partial<Monitor> = {
                id: "test-id",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: -1, // Invalid
            };

            const errors = getMonitorValidationErrors(monitor);
            expect(
                errors.some(
                    (error) =>
                        error.includes("retry") || error.includes("attempts")
                )
            ).toBe(true);
        });
    });

    describe("validateMonitorType", () => {
        it("should validate http monitor type", () => {
            expect(validateMonitorType("http")).toBe(true);
        });

        it("should validate port monitor type", () => {
            expect(validateMonitorType("port")).toBe(true);
        });

        it("should reject invalid monitor types", () => {
            expect(validateMonitorType("invalid")).toBe(false);
            expect(validateMonitorType("https")).toBe(false);
            expect(validateMonitorType("tcp")).toBe(false);
            expect(validateMonitorType(null)).toBe(false);
            expect(validateMonitorType(undefined)).toBe(false);
            expect(validateMonitorType(123)).toBe(false);
            expect(validateMonitorType({})).toBe(false);
        });

        it("should handle case sensitivity", () => {
            expect(validateMonitorType("HTTP")).toBe(false);
            expect(validateMonitorType("Port")).toBe(false);
            expect(validateMonitorType("Http")).toBe(false);
        });
    });

    describe("validateSite", () => {
        it.skip("should validate complete site", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: 0,
                        history: [],
                    },
                ],
            };

            expect(validateSite(site)).toBe(true);
        });

        it("should reject site with missing required fields", () => {
            const incompleteSite = {
                name: "Test Site",
                // Missing identifier and monitors
            };

            expect(validateSite(incompleteSite)).toBe(false);
        });

        it("should reject site with invalid monitors", () => {
            const siteWithInvalidMonitor: Partial<Site> = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "invalid" as any,
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: 0,
                        history: [],
                    } as any,
                ],
            };

            expect(validateSite(siteWithInvalidMonitor)).toBe(false);
        });

        it("should handle site with empty monitors array", () => {
            const siteWithNoMonitors = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: false,
                monitors: [],
            };

            expect(validateSite(siteWithNoMonitors)).toBe(true);
        });

        it("should reject site with null or undefined", () => {
            expect(validateSite(null as any)).toBe(false);
            expect(validateSite(undefined as any)).toBe(false);
        });

        it("should reject site with invalid identifier", () => {
            const siteWithInvalidId: Partial<Site> = {
                identifier: "", // Empty identifier
                name: "Test Site",
                monitoring: false,
                monitors: [],
            };

            expect(validateSite(siteWithInvalidId)).toBe(false);
        });

        it("should reject site with invalid name", () => {
            const siteWithInvalidName: Partial<Site> = {
                identifier: "test-site",
                name: "", // Empty name
                monitoring: false,
                monitors: [],
            };

            expect(validateSite(siteWithInvalidName)).toBe(false);
        });

        it.skip("should handle site with multiple valid monitors", () => {
            const siteWithMultipleMonitors: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitoring: true,
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        url: "https://example.com",
                        checkInterval: 60_000,
                        timeout: 5000,
                        retryAttempts: 3,
                        monitoring: true,
                        status: "pending",
                        responseTime: 0,
                        history: [],
                    },
                    {
                        id: "monitor-2",
                        type: "port",
                        host: "example.com",
                        port: 80,
                        checkInterval: 30_000,
                        timeout: 3000,
                        retryAttempts: 2,
                        monitoring: true,
                        status: "up",
                        responseTime: 100,
                        history: [],
                    },
                ],
            };

            expect(validateSite(siteWithMultipleMonitors)).toBe(true);
        });
    });
});
