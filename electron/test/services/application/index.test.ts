/**
 * Tests for application services index exports.
 * Validates that all services are properly exported.
 */

import { describe, expect, it } from "vitest";

import { ApplicationService } from "../../../services/application/index";

describe("Application Services Index", () => {
    it("should export ApplicationService", () => {
        expect(ApplicationService).toBeDefined();
        expect(typeof ApplicationService).toBe("function");
    });

    it("should allow creating ApplicationService instance", () => {
        expect(() => new ApplicationService()).not.toThrow();
    });
});
