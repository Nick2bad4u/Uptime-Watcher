import {
    isMonitorFieldDefinition,
    isMonitorTypeConfig,
} from "@shared/types/monitorTypes";
import { describe, expect, it } from "vitest";

describe("monitor type runtime guards", () => {
    it("accepts valid field definitions", () => {
        const field = {
            label: "URL",
            name: "url",
            required: true,
            type: "url" as const,
        };

        expect(isMonitorFieldDefinition(field)).toBeTruthy();
    });

    it("rejects invalid field definitions", () => {
        expect(isMonitorFieldDefinition({})).toBeFalsy();
        expect(
            isMonitorFieldDefinition({
                label: "URL",
                name: "url",
                required: "yes",
                type: "url",
            })
        ).toBeFalsy();
    });

    it("rejects non-finite numeric field bounds", () => {
        const baseField = {
            label: "Port",
            name: "port",
            required: true,
            type: "number" as const,
        };

        expect(
            isMonitorFieldDefinition({ ...baseField, max: Infinity })
        ).toBeFalsy();
        expect(
            isMonitorFieldDefinition({ ...baseField, min: -Infinity })
        ).toBeFalsy();
        expect(isMonitorFieldDefinition({ ...baseField, min: NaN })).toBeFalsy();
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
