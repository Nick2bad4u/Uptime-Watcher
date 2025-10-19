import { describe, expect, it } from "vitest";

import {
    isMonitorFieldDefinition,
    isMonitorTypeConfig,
} from "@shared/types/monitorTypes";

describe("monitor type runtime guards", () => {
    it("accepts valid field definitions", () => {
        const field = {
            label: "URL",
            name: "url",
            required: true,
            type: "url" as const,
        };

        expect(isMonitorFieldDefinition(field)).toBe(true);
    });

    it("rejects invalid field definitions", () => {
        expect(isMonitorFieldDefinition({})).toBe(false);
        expect(
            isMonitorFieldDefinition({
                label: "URL",
                name: "url",
                required: "yes",
                type: "url",
            })
        ).toBe(false);
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

        expect(isMonitorTypeConfig(config)).toBe(true);
    });

    it("rejects monitor type configs missing required data", () => {
        expect(isMonitorTypeConfig({})).toBe(false);
        expect(
            isMonitorTypeConfig({
                description: "missing fields",
                displayName: "Broken",
                fields: [],
                type: "broken",
                version: "1.0.0",
            })
        ).toBe(false);
        expect(
            isMonitorTypeConfig({
                description: "invalid field",
                displayName: "Broken",
                fields: [{}],
                type: "broken",
                version: "1.0.0",
            })
        ).toBe(false);
    });
});
