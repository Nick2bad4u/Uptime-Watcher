/**
 * Tests for application services index exports. Validates that all services are
 * properly exported.
 */

import { describe, expect, it } from "vitest";

import { ApplicationService } from "../../../services/application/ApplicationService";

describe("Application Services Index", () => {
    it("should export ApplicationService", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: index", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Export Operation", "type");

        expect(ApplicationService).toBeDefined();
        expect(typeof ApplicationService).toBe("function");
    });

    it("should allow creating ApplicationService instance", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: index", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Business Logic", "type");

        expect(() => new ApplicationService()).not.toThrowError();
    });
});
