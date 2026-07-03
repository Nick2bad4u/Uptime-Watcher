import { describe, expect, it } from "vitest";

import {
    resolveMonitorNumericOverride,
    resolveRequiredMonitorStringField,
    resolveRequiredMonitorUrlField,
} from "../../../../services/monitoring/shared/monitorConfigValueResolvers";

describe("monitorConfigValueResolvers", () => {
    describe(resolveRequiredMonitorStringField, () => {
        it("returns a trimmed value for valid strings", () => {
            const result = resolveRequiredMonitorStringField(
                { field: "  value  " },
                "field",
                "field is required"
            );

            expect(result).toStrictEqual({
                ok: true,
                value: "value",
            });
        });

        it("returns error for non-string or blank values", () => {
            expect(
                resolveRequiredMonitorStringField(
                    { field: 1 },
                    "field",
                    "field is required"
                )
            ).toStrictEqual({
                message: "field is required",
                ok: false,
            });

            expect(
                resolveRequiredMonitorStringField(
                    { field: " ".repeat(3) },
                    "field",
                    "field is required"
                )
            ).toStrictEqual({
                message: "field is required",
                ok: false,
            });
        });

        it("does not invoke accessors while resolving required strings", () => {
            const monitor = {};
            let accessCount = 0;

            Object.defineProperty(monitor, "field", {
                enumerable: true,
                get() {
                    accessCount += 1;
                    return "value";
                },
            });

            expect(
                resolveRequiredMonitorStringField(
                    monitor,
                    "field",
                    "field is required"
                )
            ).toStrictEqual({
                message: "field is required",
                ok: false,
            });
            expect(accessCount).toBe(0);
        });
    });

    describe(resolveRequiredMonitorUrlField, () => {
        it("returns valid normalized urls", () => {
            const result = resolveRequiredMonitorUrlField(
                { url: "  wss://example.com/socket  " },
                "url",
                "url is required",
                ["ws", "wss"]
            );

            expect(result).toStrictEqual({
                ok: true,
                value: "wss://example.com/socket",
            });
        });

        it("returns error for invalid url candidates", () => {
            const result = resolveRequiredMonitorUrlField(
                { url: "https://example.com" },
                "url",
                "url is required",
                ["ws", "wss"]
            );

            expect(result).toStrictEqual({
                message: "url is required",
                ok: false,
            });
        });
    });

    describe(resolveMonitorNumericOverride, () => {
        it("prefers monitor value then service config then fallback", () => {
            expect(
                resolveMonitorNumericOverride({
                    fallbackValue: 10,
                    minimumValue: 0,
                    monitor: { maxLag: 30 },
                    monitorFieldName: "maxLag",
                    serviceConfig: { maxLag: 20 },
                })
            ).toBe(30);

            expect(
                resolveMonitorNumericOverride({
                    fallbackValue: 10,
                    minimumValue: 0,
                    monitor: { maxLag: -1 },
                    monitorFieldName: "maxLag",
                    serviceConfig: { maxLag: 20 },
                })
            ).toBe(20);

            expect(
                resolveMonitorNumericOverride({
                    fallbackValue: 10,
                    minimumValue: 0,
                    monitor: { maxLag: -1 },
                    monitorFieldName: "maxLag",
                    serviceConfig: { maxLag: -5 },
                })
            ).toBe(10);
        });

        it("supports strict minimum when allowEqualMinimum is false", () => {
            const result = resolveMonitorNumericOverride({
                allowEqualMinimum: false,
                fallbackValue: 1500,
                minimumValue: 0,
                monitor: { maxPongDelayMs: 0 },
                monitorFieldName: "maxPongDelayMs",
                serviceConfig: { maxPongDelayMs: 0 },
            });

            expect(result).toBe(1500);
        });

        it("does not invoke accessors while resolving numeric overrides", () => {
            const monitor = {};
            const serviceConfig = {};
            let accessCount = 0;

            Object.defineProperty(monitor, "maxLag", {
                enumerable: true,
                get() {
                    accessCount += 1;
                    return 30;
                },
            });
            Object.defineProperty(serviceConfig, "maxLag", {
                enumerable: true,
                get() {
                    accessCount += 1;
                    return 20;
                },
            });

            const result = resolveMonitorNumericOverride({
                fallbackValue: 10,
                minimumValue: 0,
                monitor,
                monitorFieldName: "maxLag",
                serviceConfig,
            });

            expect(result).toBe(10);
            expect(accessCount).toBe(0);
        });
    });
});
