/**
 * @file Targeted coverage tests for fallbacks.ts uncovered lines
 *
 *   This file specifically targets:
 *
 *   - Line 121: ping monitor generator function in MONITOR_IDENTIFIER_GENERATORS
 *   - Line 142: monitor.url return in getGenericIdentifier function
 *
 *   Generated based on coverage analysis showing 95% coverage with gaps at lines
 *   121,142
 */

import type { Monitor } from "@shared/types";

import { describe, expect, it } from "vitest";

import { getMonitorDisplayIdentifier } from "../../utils/fallbacks";

describe("fallbacks.ts - Targeted Coverage for Lines 121,142", (): void => {
    describe("line 121: Ping Monitor Generator Coverage", (): void => {
        it("should execute ping monitor generator function with host value", (): void => {
            // This test specifically targets line 121: ping monitor generator
            // ["ping", (monitor): string | undefined => monitor.host ?? undefined],
            const pingMonitor: Monitor = {
                checkInterval: 60_000,
                history: [],
                host: "example.com",
                id: "ping-test",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "ping",
            };

            const result = getMonitorDisplayIdentifier(
                pingMonitor,
                "Fallback Site"
            );

            // Verify the ping generator was executed and returned monitor.host
            expect(result).toBe("example.com");
        });

        it("should execute ping monitor generator function without host value", (): void => {
            // This test ensures we test the `?? undefined` part of line 121
            const pingMonitorNoHost: Monitor = {
                checkInterval: 60_000,
                history: [],
                id: "ping-no-host",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "ping",
                // No host property - will exercise the undefined fallback
            };

            const result = getMonitorDisplayIdentifier(
                pingMonitorNoHost,
                "Ping Fallback"
            );

            // Should fall back to site name since ping generator returns undefined
            expect(result).toBe("Ping Fallback");
        });

        it("should execute ping monitor generator with null host", (): void => {
            // Test null host scenario for complete line 121 coverage
            const pingMonitorNullHost: Monitor = {
                checkInterval: 60_000,
                history: [],
                host: null as any, // Explicit null to test ?? undefined
                id: "ping-null-host",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "ping",
            };

            const result = getMonitorDisplayIdentifier(
                pingMonitorNullHost,
                "Null Host Fallback"
            );

            // Should fall back since null ?? undefined = undefined
            expect(result).toBe("Null Host Fallback");
        });
    });

    describe("line 142: getGenericIdentifier monitor.url Return Coverage", (): void => {
        it("should execute line 142 - return monitor.url in getGenericIdentifier", (): void => {
            // This test specifically targets line 142: return monitor.url;
            // We need a monitor type that's NOT in MONITOR_IDENTIFIER_GENERATORS
            // so it falls back to getGenericIdentifier function
            const unknownMonitorWithUrl = {
                checkInterval: 60_000,
                history: [],
                id: "unknown-with-url",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "unknown-type", // Type not in MONITOR_IDENTIFIER_GENERATORS
                url: "https://test-url.example.com",
            } as unknown as Monitor;

            const result = getMonitorDisplayIdentifier(
                unknownMonitorWithUrl,
                "URL Fallback"
            );

            // Should return the URL from line 142: return monitor.url;
            expect(result).toBe("https://test-url.example.com");
        });

        it("should prioritize monitor.url over host in getGenericIdentifier", (): void => {
            // Additional test to ensure line 142 is chosen over host logic
            const unknownMonitorWithBoth = {
                checkInterval: 60_000,
                history: [],
                host: "secondary-host.com",
                id: "unknown-both",
                monitoring: true,
                port: 8080,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "custom-type", // Type not in generators
                url: "https://priority-url.com",
            } as unknown as Monitor;

            const result = getMonitorDisplayIdentifier(
                unknownMonitorWithBoth,
                "Both Fallback"
            );

            // Line 142 should execute first, returning URL, not host
            expect(result).toBe("https://priority-url.com");
        });

        it("should handle empty string URL in getGenericIdentifier", (): void => {
            // Edge case: empty string URL should trigger fallback to host logic
            // since empty string is falsy in this context
            const unknownMonitorEmptyUrl = {
                checkInterval: 60_000,
                history: [],
                host: "backup-host.com",
                id: "unknown-empty-url",
                monitoring: true,
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
                type: "test-type",
                url: "", // Empty string - should fallback to host
            } as unknown as Monitor;

            const result = getMonitorDisplayIdentifier(
                unknownMonitorEmptyUrl,
                "Empty URL Fallback"
            );

            // Should fallback to host since empty string is falsy
            expect(result).toBe("backup-host.com");
        });
    });

    describe("combined Coverage Verification", (): void => {
        it("should verify both targeted lines work in comprehensive scenario", (): void => {
            // Test both lines in sequence to ensure comprehensive coverage

            // First: Test line 121 (ping generator)
            const pingResult = getMonitorDisplayIdentifier(
                {
                    checkInterval: 60_000,
                    history: [],
                    host: "ping-test.com",
                    id: "ping",
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                    type: "ping",
                },
                "Ping Fallback"
            );

            expect(pingResult).toBe("ping-test.com");

            // Second: Test line 142 (getGenericIdentifier URL return)
            const urlResult = getMonitorDisplayIdentifier(
                {
                    checkInterval: 60_000,
                    history: [],
                    id: "custom",
                    monitoring: true,
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                    type: "custom",
                    url: "https://generic-test.com",
                } as unknown as Monitor,
                "URL Fallback"
            );

            expect(urlResult).toBe("https://generic-test.com");
        });
    });
});
