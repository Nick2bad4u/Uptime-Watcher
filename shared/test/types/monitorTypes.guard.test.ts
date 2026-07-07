import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { describe, expect, it } from "vitest";

describe("monitor type runtime guards", () => {
    const buildConfig = (fields: unknown[]) => ({
        description: "HTTP endpoint monitoring",
        displayName: "HTTP Monitor",
        fields,
        type: "http",
        version: "1.0.0",
    });

    it("accepts valid field definitions through monitor type configs", () => {
        expect(
            isMonitorTypeConfig(
                buildConfig([
                    {
                        label: "URL",
                        name: "url",
                        required: true,
                        type: "url" as const,
                    },
                ])
            )
        ).toBeTruthy();
    });

    it("rejects invalid field definitions through monitor type configs", () => {
        expect(isMonitorTypeConfig(buildConfig([{}]))).toBeFalsy();
        expect(
            isMonitorTypeConfig(
                buildConfig([
                    {
                        label: "URL",
                        name: "url",
                        required: "yes",
                        type: "url",
                    },
                ])
            )
        ).toBeFalsy();
    });

    it("rejects non-finite numeric field bounds", () => {
        const baseField = {
            label: "URL",
            name: "port",
            required: true,
            type: "number" as const,
        };

        expect(
            isMonitorTypeConfig(buildConfig([{ ...baseField, max: Infinity }]))
        ).toBeFalsy();
        expect(
            isMonitorTypeConfig(buildConfig([{ ...baseField, min: -Infinity }]))
        ).toBeFalsy();
        expect(
            isMonitorTypeConfig(buildConfig([{ ...baseField, min: NaN }]))
        ).toBeFalsy();
    });

    it("accepts valid monitor type configurations", () => {
        const config = {
            description: "HTTP endpoint monitoring",
            displayName: "HTTP Monitor",
            fields: [
                {
                    label: "URL",
                    name: "url",
                    required: true,
                    type: "url" as const,
                },
            ],
            type: "http",
            uiConfig: {
                supportsAdvancedAnalytics: true,
                supportsResponseTime: true,
            },
            version: "1.0.0",
        };

        expect(isMonitorTypeConfig(config)).toBeTruthy();
    });

    it("rejects monitor type configs missing required data", () => {
        expect(isMonitorTypeConfig({})).toBeFalsy();
        expect(
            isMonitorTypeConfig({
                description: "missing fields",
                displayName: "Broken",
                fields: [],
                type: "broken",
                version: "1.0.0",
            })
        ).toBeFalsy();
        expect(
            isMonitorTypeConfig({
                description: "invalid field",
                displayName: "Broken",
                fields: [{}],
                type: "broken",
                version: "1.0.0",
            })
        ).toBeFalsy();
    });
});
