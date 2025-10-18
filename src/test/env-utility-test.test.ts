/**
 * Simple utility coverage test with environment imports.
 */

import { describe, expect, it } from "vitest";
import { getEnvironment, getNodeEnv } from "@shared/utils/environment";

describe("Environment Utility Coverage Test", () => {
    it("should test environment functions", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: env-utility-test", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: env-utility-test", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const env = getEnvironment();
        expect(typeof env).toBe("string");

        const nodeEnv = getNodeEnv();
        expect(typeof nodeEnv).toBe("string");
    });
});
