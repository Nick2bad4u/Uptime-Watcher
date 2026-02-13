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
                    { field: "   " },
                    "field",
                    "field is required"
                )
            ).toStrictEqual({
                message: "field is required",
                ok: false,
            });
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
    });
});
