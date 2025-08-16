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

import { describe, it, expect } from "vitest";
import { getMonitorDisplayIdentifier } from "../../utils/fallbacks";
import type { Monitor } from "../../../shared/types";

describe("fallbacks.ts - Targeted Coverage for Lines 121,142", (): void => {
    describe("Line 121: Ping Monitor Generator Coverage", (): void => {
        it("should execute ping monitor generator function with host value", (): void => {
            // This test specifically targets line 121: ping monitor generator
            // ["ping", (monitor): string | undefined => monitor.host ?? undefined],
            const pingMonitor: Monitor = {
                id: "ping-test",
                type: "ping",
                host: "example.com",
                monitoring: true,
                checkInterval: 60000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
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
                id: "ping-no-host",
                type: "ping",
                monitoring: true,
                checkInterval: 60000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
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
                id: "ping-null-host",
                type: "ping",
                host: null as any, // Explicit null to test ?? undefined
                monitoring: true,
                checkInterval: 60000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            };

            const result = getMonitorDisplayIdentifier(
                pingMonitorNullHost,
                "Null Host Fallback"
            );

            // Should fall back since null ?? undefined = undefined
            expect(result).toBe("Null Host Fallback");
        });
    });

    describe("Line 142: getGenericIdentifier monitor.url Return Coverage", (): void => {
        it("should execute line 142 - return monitor.url in getGenericIdentifier", (): void => {
            // This test specifically targets line 142: return monitor.url;
            // We need a monitor type that's NOT in MONITOR_IDENTIFIER_GENERATORS
            // so it falls back to getGenericIdentifier function
            const unknownMonitorWithUrl = {
                id: "unknown-with-url",
                type: "unknown-type", // Type not in MONITOR_IDENTIFIER_GENERATORS
                url: "https://test-url.example.com",
                monitoring: true,
                checkInterval: 60_000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
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
                id: "unknown-both",
                type: "custom-type", // Type not in generators
                url: "https://priority-url.com",
                host: "secondary-host.com",
                port: 8080,
                monitoring: true,
                checkInterval: 60_000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
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
                id: "unknown-empty-url",
                type: "test-type",
                url: "", // Empty string - should fallback to host
                host: "backup-host.com",
                monitoring: true,
                checkInterval: 60_000,
                history: [],
                responseTime: 0,
                retryAttempts: 3,
                status: "pending",
                timeout: 5000,
            } as unknown as Monitor;

            const result = getMonitorDisplayIdentifier(
                unknownMonitorEmptyUrl,
                "Empty URL Fallback"
            );

            // Should fallback to host since empty string is falsy
            expect(result).toBe("backup-host.com");
        });
    });

    describe("Combined Coverage Verification", (): void => {
        it("should verify both targeted lines work in comprehensive scenario", (): void => {
            // Test both lines in sequence to ensure comprehensive coverage

            // First: Test line 121 (ping generator)
            const pingResult = getMonitorDisplayIdentifier(
                {
                    id: "ping",
                    type: "ping",
                    host: "ping-test.com",
                    monitoring: true,
                    checkInterval: 60_000,
                    history: [],
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                } as Monitor,
                "Ping Fallback"
            );
            expect(pingResult).toBe("ping-test.com");

            // Second: Test line 142 (getGenericIdentifier URL return)
            const urlResult = getMonitorDisplayIdentifier(
                {
                    id: "custom",
                    type: "custom",
                    url: "https://generic-test.com",
                    monitoring: true,
                    checkInterval: 60_000,
                    history: [],
                    responseTime: 0,
                    retryAttempts: 3,
                    status: "pending",
                    timeout: 5000,
                } as unknown as Monitor,
                "URL Fallback"
            );
            expect(urlResult).toBe("https://generic-test.com");
        });
    });
});
