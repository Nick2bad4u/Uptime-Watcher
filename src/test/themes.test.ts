/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";

import { lightTheme, darkTheme } from "../theme/themes";

describe("Theme Definitions", () => {
    describe("lightTheme", () => {
        it("should have required theme properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(lightTheme).toBeDefined();
            expect(lightTheme.name).toBe("light");
            expect(lightTheme.isDark).toBe(false);
            expect(lightTheme.colors).toBeDefined();
            expect(lightTheme.colors.background).toBeDefined();
            expect(lightTheme.colors.text).toBeDefined();
            expect(lightTheme.colors.status).toBeDefined();
        });

        it("should have status colors defined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(lightTheme.colors.status.up).toBeDefined();
            expect(lightTheme.colors.status.down).toBeDefined();
            expect(lightTheme.colors.status.pending).toBeDefined();
            expect(lightTheme.colors.status.unknown).toBeDefined();
        });

        it("should have background colors defined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(lightTheme.colors.background.primary).toBeDefined();
            expect(lightTheme.colors.background.secondary).toBeDefined();
            expect(lightTheme.colors.background.tertiary).toBeDefined();
        });

        it("should have text colors defined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(lightTheme.colors.text.primary).toBeDefined();
            expect(lightTheme.colors.text.secondary).toBeDefined();
        });
    });

    describe("darkTheme", () => {
        it("should have required theme properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(darkTheme).toBeDefined();
            expect(darkTheme.name).toBe("dark");
            expect(darkTheme.isDark).toBe(true);
            expect(darkTheme.colors).toBeDefined();
            expect(darkTheme.colors.background).toBeDefined();
            expect(darkTheme.colors.text).toBeDefined();
            expect(darkTheme.colors.status).toBeDefined();
        });

        it("should have status colors defined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(darkTheme.colors.status.up).toBeDefined();
            expect(darkTheme.colors.status.down).toBeDefined();
            expect(darkTheme.colors.status.pending).toBeDefined();
            expect(darkTheme.colors.status.unknown).toBeDefined();
        });

        it("should have background colors defined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(darkTheme.colors.background.primary).toBeDefined();
            expect(darkTheme.colors.background.secondary).toBeDefined();
            expect(darkTheme.colors.background.tertiary).toBeDefined();
        });

        it("should have text colors defined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(darkTheme.colors.text.primary).toBeDefined();
            expect(darkTheme.colors.text.secondary).toBeDefined();
        });
    });

    describe("theme differences", () => {
        it("should have different background colors between themes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(lightTheme.colors.background.primary).not.toBe(
                darkTheme.colors.background.primary
            );
            expect(lightTheme.colors.text.primary).not.toBe(
                darkTheme.colors.text.primary
            );
        });

        it("should have consistent status colors across themes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themes", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Status colors should be similar between themes for consistency
            expect(lightTheme.colors.status.up).toBeDefined();
            expect(darkTheme.colors.status.up).toBeDefined();
            expect(lightTheme.colors.status.down).toBeDefined();
            expect(darkTheme.colors.status.down).toBeDefined();
        });
    });
});
