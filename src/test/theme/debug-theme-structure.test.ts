import { renderHook } from "@testing-library/react";
import { lightTheme, darkTheme } from "../../theme/themes";
import { useTheme } from "../../theme/useTheme";
import { describe, expect, it } from "vitest";

describe("Debug Theme Structure", () => {
    it("should log actual light theme structure", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: debug-theme-structure", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        expect(lightTheme).toBeDefined();
        expect(lightTheme.typography).toBeDefined();
    });

    it("should log actual dark theme structure", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: debug-theme-structure", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        expect(darkTheme).toBeDefined();
        expect(darkTheme.colors.status).toBeDefined();
    });

    it("should log useTheme hook currentTheme structure", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: debug-theme-structure", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const { result } = renderHook(() => useTheme());
        expect(result.current.currentTheme).toBeDefined();
        expect(result.current.currentTheme.typography).toBeDefined();
    });
});
