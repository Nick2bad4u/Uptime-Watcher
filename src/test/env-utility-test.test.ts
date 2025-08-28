/**
 * Simple utility coverage test with environment imports.
 */

import { describe, expect, it } from "vitest";
import { getEnvironment, getNodeEnv } from "../../shared/utils/environment";

describe("Environment Utility Coverage Test", () => {
    it("should test environment functions", () => {
        const env = getEnvironment();
        expect(typeof env).toBe("string");

        const nodeEnv = getNodeEnv();
        expect(typeof nodeEnv).toBe("string");
    });
});
