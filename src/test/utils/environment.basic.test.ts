/**
 * Basic behavior tests for renderer environment utility imports.
 */

import { getEnvironment, getNodeEnv } from "@shared/utils/environment";
import { describe, expect, it } from "vitest";

describe("environment utility basics", () => {
    it("should return string environment values", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: environment.basic", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: environment.basic", "component");
        annotate("Category: Core", "category");
        annotate("Type: Business Logic", "type");

        const env = getEnvironment();
        expect(typeof env).toBe("string");

        const nodeEnv = getNodeEnv();
        expect(typeof nodeEnv).toBe("string");
    });
});
