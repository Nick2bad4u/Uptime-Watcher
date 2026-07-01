import { describe, expect, it } from "vitest";

import * as chartConfig from "../../types/chartConfig";
import * as database from "../../types/database";
import * as themeConfig from "../../types/themeConfig";
import * as validation from "../../types/validation";

describe("Types Complete Function Coverage", () => {
    describe("chartConfig module", () => {
        it("should call hasPlugins function", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const isResult1 = chartConfig.hasPlugins({ plugins: {} });
            const isResult2 = chartConfig.hasPlugins(null);
            const isResult3 = chartConfig.hasPlugins({ notPlugins: true });

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });

        it("should call hasScales function", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const isResult1 = chartConfig.hasScales({ scales: {} });
            const isResult2 = chartConfig.hasScales(null);
            const isResult3 = chartConfig.hasScales({ notScales: true });

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });
    });

    describe("themeConfig module", () => {
        it("should call isColorPalette function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validPalette = {
                primary: "#000",
                secondary: "#fff",
                error: "#f00",
                info: "#00f",
                success: "#0f0",
                warning: "#ff0",
            };
            const isResult1 = themeConfig.isColorPalette(validPalette);
            const isResult2 = themeConfig.isColorPalette({});
            const isResult3 = themeConfig.isColorPalette(null);

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });

        it("should call isThemeConfig function", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validTheme = {
                colors: {},
                spacing: {},
                animation: {},
                borderRadius: {},
                components: {},
                shadows: {},
                typography: {},
            };
            const isResult1 = themeConfig.isThemeConfig(validTheme);
            const isResult2 = themeConfig.isThemeConfig({});
            const isResult3 = themeConfig.isThemeConfig(null);

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });
    });

    describe("database module", () => {
        it("should call isValidHistoryRow function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validRow = {
                monitorId: "monitor1",
                status: "up",
                timestamp: 123_456,
            };
            const isResult1 = database.isValidHistoryRow(validRow);
            const isResult2 = database.isValidHistoryRow({});
            const isResult3 = database.isValidHistoryRow(null);

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });

        it("should call isValidMonitorRow function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Monitoring", "type");

            const validRow = { id: 1, site_identifier: "site1", type: "http" };
            const isResult1 = database.isValidMonitorRow(validRow);
            const isResult2 = database.isValidMonitorRow({});

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
        });

        it("should call isValidSettingsRow function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validRow = { key: "setting1", value: "value1" };
            const isResult1 = database.isValidSettingsRow(validRow);
            const isResult2 = database.isValidSettingsRow({});

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
        });

        it("should call isValidSiteRow function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validRow = { identifier: "site1", name: "Test Site" };
            const isResult1 = database.isValidSiteRow(validRow);
            const isResult2 = database.isValidSiteRow({});

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
        });

        it("should call safeGetRowProperty function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Data Retrieval", "type");

            const row = { name: "test", id: 123 };
            const result1 = database.safeGetRowProperty(row, "name", "default");
            const result2 = database.safeGetRowProperty(
                row,
                "missing",
                "default"
            );

            expect(result1).toBe("test");
            expect(result2).toBe("default");
        });
    });

    describe("validation module", () => {
        it("should call createFailureResult function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = validation.createFailureResult([
                "Error 1",
                "Error 2",
            ]);
            expect(result.success).toBeFalsy();
            expect(result.errors).toEqual(["Error 1", "Error 2"]);
        });

        it("should call createSuccessResult function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const result = validation.createSuccessResult();
            expect(result.success).toBeTruthy();
            expect(result.errors).toEqual([]);
        });

        it("should call isValidationResult function", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: complete-function-coverage",
                "component"
            );
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validResult = { success: true, errors: [] };
            const isResult1 = validation.isValidationResult(validResult);
            const isResult2 = validation.isValidationResult({});
            const isResult3 = validation.isValidationResult(null);

            expect(isResult1).toBeTruthy();
            expect(isResult2).toBeFalsy();
            expect(isResult3).toBeFalsy();
        });
    });
});
