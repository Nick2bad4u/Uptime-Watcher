/**
 * @file Strict edge-case coverage for monitor title formatter utilities.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Monitor } from "@shared/types";

const createMonitor = (overrides: Partial<Monitor> = {}): Monitor =>
    ({
        id: "monitor-id",
        type: "http",
        monitoring: true,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        responseTime: 0,
        status: "pending",
        history: [],
        ...overrides,
    }) as Monitor;

describe("monitorTitleFormatters strict coverage", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    afterEach(() => {
        vi.resetModules();
    });

    it("includes DNS record type in the suffix when available", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const monitor = createMonitor({
            type: "dns",
            host: "uptime.example.com",
            recordType: "TXT",
        });

        expect(formatTitleSuffix(monitor)).toBe(" (TXT uptime.example.com)");
    });

    it("prefers primary replication status URLs with replica fallback", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const monitorWithPrimary = createMonitor({
            type: "replication",
            primaryStatusUrl: "https://primary.example.com/status",
            replicaStatusUrl: "https://replica.example.com/status",
        });

        expect(formatTitleSuffix(monitorWithPrimary)).toBe(
            " (https://primary.example.com/status)"
        );

        const monitorWithReplicaOnly = createMonitor({
            type: "replication",
            replicaStatusUrl: "https://replica-only.example.com/status",
        });

        expect(formatTitleSuffix(monitorWithReplicaOnly)).toBe(
            " (https://replica-only.example.com/status)"
        );
    });

    it("formats SSL monitors with optional port information", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const hostOnly = createMonitor({ type: "ssl", host: "example.com" });
        expect(formatTitleSuffix(hostOnly)).toBe(" (example.com)");

        const hostWithPort = createMonitor({
            type: "ssl",
            host: "example.com",
            port: 443,
        });
        expect(formatTitleSuffix(hostWithPort)).toBe(" (example.com:443)");
    });

    it("formats URL-driven monitor types consistently", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const urlTypes = [
            "http",
            "http-header",
            "http-json",
            "http-keyword",
            "http-latency",
            "http-status",
            "server-heartbeat",
            "websocket-keepalive",
        ] as const;

        for (const type of urlTypes) {
            const monitor = createMonitor({
                type,
                url: `https://traits.example.com/${type}`,
            });

            expect(formatTitleSuffix(monitor)).toBe(
                ` (https://traits.example.com/${type})`
            );
        }
    });

    it("renders host-based monitor identifiers", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const pingMonitor = createMonitor({
            type: "ping",
            host: "infrastructure.example.com",
        });
        expect(formatTitleSuffix(pingMonitor)).toBe(
            " (infrastructure.example.com)"
        );

        const portMonitor = createMonitor({
            type: "port",
            host: "db.internal",
            port: 5432,
        });
        expect(formatTitleSuffix(portMonitor)).toBe(" (db.internal:5432)");

        const cdnMonitor = createMonitor({
            type: "cdn-edge-consistency",
            baselineUrl: "https://edge-baseline.example.com",
        });
        expect(formatTitleSuffix(cdnMonitor)).toBe(
            " (https://edge-baseline.example.com)"
        );
    });

    it("allows runtime overrides through registerTitleSuffixFormatter", async () => {
        const {
            formatTitleSuffix,
            getTitleSuffixFormatter,
            registerTitleSuffixFormatter,
        } = await import("@app/utils/monitorTitleFormatters");

        const monitor = createMonitor({
            type: "http",
            url: "https://original.example.com",
        });
        expect(formatTitleSuffix(monitor)).toBe(
            " (https://original.example.com)"
        );

        registerTitleSuffixFormatter("http", () => " (overridden)");

        const overriddenFormatter = getTitleSuffixFormatter("http");
        expect(overriddenFormatter).toBeTypeOf("function");
        expect(formatTitleSuffix(monitor)).toBe(" (overridden)");
    });

    it("returns empty suffix when no formatter or source data is available", async () => {
        const { formatTitleSuffix } =
            await import("@app/utils/monitorTitleFormatters");

        const unknownMonitor = {
            ...createMonitor(),
            host: undefined,
            type: "custom-type",
            url: undefined,
        } as unknown as Monitor;
        expect(formatTitleSuffix(unknownMonitor)).toBe("");

        const httpWithoutUrl = createMonitor({ type: "http" });
        expect(formatTitleSuffix(httpWithoutUrl)).toBe("");
    });
});
