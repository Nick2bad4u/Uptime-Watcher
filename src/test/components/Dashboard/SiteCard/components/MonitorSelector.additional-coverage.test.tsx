import type { MonitorStatus } from "../../../../../../shared/types/configTypes";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ThemeProvider from "../../../../../theme/components/ThemeProvider";
import { createValidMonitor } from "../../../../../../shared/test/testHelpers";

import {
    MonitorSelector,
    type MonitorSelectorProperties,
} from "../../../../../components/Dashboard/SiteCard/components/MonitorSelector";

/**
 * MonitorSelector Additional Coverage Tests
 *
 * Tests specifically designed to cover uncovered lines 90-93:
 *
 * - Default case in switch statement for unknown monitor types
 * - Fallback to port for unknown types
 * - Fallback to URL for unknown types
 * - Default empty return for unknown types with no port/url
 */
describe("MonitorSelector - Additional Coverage Tests", () => {
    const defaultProps: MonitorSelectorProperties = {
        monitors: [],
        selectedMonitorId: "monitor-1",
        onChange: vi.fn(),
    };

    const renderWithTheme = (props: MonitorSelectorProperties) =>
        render(
            <ThemeProvider>
                <MonitorSelector {...props} />
            </ThemeProvider>
        );

    describe("Coverage for Lines 90-93 (default case in switch statement)", () => {
        it("should use port for unknown monitor type with port property (line 90-91)", () => {
            // Create a valid monitor and then override its type to unknown
            const baseMonitor = createValidMonitor({
                id: "unknown-monitor",
                type: "port",
                port: 8080,
                host: "example.com",
            });
            const unknownMonitor = {
                ...baseMonitor,
                type: "custom-unknown-type" as any, // Type assertion for unknown type
            } as any;

            renderWithTheme({
                ...defaultProps,
                monitors: [unknownMonitor],
            });

            // Should display the unknown type with port
            expect(
                screen.getByDisplayValue("CUSTOM-UNKNOWN-TYPE: 8080")
            ).toBeInTheDocument();
        });

        it("should use url for unknown monitor type with url property (line 92-93)", () => {
            // Create a monitor manually with only URL, no port
            const unknownMonitorWithUrl = {
                activeOperations: [],
                checkInterval: 30_000,
                history: [],
                host: "example.com",
                id: "unknown-monitor-url",
                lastChecked: new Date(),
                monitoring: true,
                // Note: NO port property here - only URL
                responseTime: 100,
                retryAttempts: 3,
                status: "up" as MonitorStatus,
                timeout: 5000,
                type: "weird-type" as any, // Unknown type
                url: "https://example.com",
            } as any;

            renderWithTheme({
                ...defaultProps,
                monitors: [unknownMonitorWithUrl],
            });

            // Should display the unknown type with URL
            expect(
                screen.getByDisplayValue("WEIRD-TYPE: https://example.com")
            ).toBeInTheDocument();
        });

        it("should return empty string for unknown monitor type with no port or url (line 94)", () => {
            // Create a valid monitor and then override to unknown type without port/url
            const unknownMonitorEmpty = {
                ...createValidMonitor({
                    id: "unknown-monitor-empty",
                    type: "ping",
                }),
                type: "mystery-type" as any, // Type assertion for unknown type
                port: undefined,
                url: undefined,
                host: undefined,
            } as any;

            renderWithTheme({
                ...defaultProps,
                monitors: [unknownMonitorEmpty],
            });

            // Should display just the type name with no additional details
            expect(
                screen.getByDisplayValue("MYSTERY-TYPE")
            ).toBeInTheDocument();
        });

        it("should prioritize port over url for unknown monitor type with both properties", () => {
            // Create a valid monitor with both port and url
            const unknownMonitorBoth = {
                ...createValidMonitor({
                    id: "unknown-monitor-both",
                    type: "port",
                    port: 3000,
                }),
                type: "dual-type" as any, // Type assertion for unknown type
                url: "https://example.com",
            } as any;

            renderWithTheme({
                ...defaultProps,
                monitors: [unknownMonitorBoth],
            });

            // Should display the port, not the URL (port has priority)
            expect(
                screen.getByDisplayValue("DUAL-TYPE: 3000")
            ).toBeInTheDocument();
        });

        it("should handle multiple unknown monitor types in the same selector", () => {
            const monitors = [
                // Monitor with only port
                {
                    activeOperations: [],
                    checkInterval: 30_000,
                    history: [],
                    host: "example.com",
                    id: "unknown-1",
                    lastChecked: new Date(),
                    monitoring: true,
                    port: 1234,
                    // No URL property
                    responseTime: 100,
                    retryAttempts: 3,
                    status: "up" as MonitorStatus,
                    timeout: 5000,
                    type: "type-a" as any,
                } as any,
                // Monitor with only URL
                {
                    activeOperations: [],
                    checkInterval: 30_000,
                    history: [],
                    host: "test.com",
                    id: "unknown-2",
                    lastChecked: new Date(),
                    monitoring: true,
                    // No port property
                    responseTime: 100,
                    retryAttempts: 3,
                    status: "up" as MonitorStatus,
                    timeout: 5000,
                    type: "type-b" as any,
                    url: "https://test.com",
                } as any,
                // Monitor with neither port nor URL
                {
                    activeOperations: [],
                    checkInterval: 30_000,
                    history: [],
                    host: "ping-host.com",
                    id: "unknown-3",
                    lastChecked: new Date(),
                    monitoring: true,
                    // No port or URL properties
                    responseTime: 100,
                    retryAttempts: 3,
                    status: "up" as MonitorStatus,
                    timeout: 5000,
                    type: "type-c" as any,
                } as any,
            ];

            renderWithTheme({
                ...defaultProps,
                monitors,
                selectedMonitorId: "unknown-1",
            });

            // Check all options are present with correct formatting
            expect(
                screen.getByRole("option", { name: "TYPE-A: 1234" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("option", { name: "TYPE-B: https://test.com" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("option", { name: "TYPE-C" })
            ).toBeInTheDocument();
        });
    });
});
