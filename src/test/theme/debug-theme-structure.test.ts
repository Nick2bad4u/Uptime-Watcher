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

        console.log(
            "Light Theme Typography:",
            JSON.stringify(lightTheme.typography, null, 2)
        );
        expect(lightTheme).toBeDefined();
    });

    it("should log actual dark theme structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: debug-theme-structure", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

        console.log(
            "Dark Theme Status Colors:",
            JSON.stringify(darkTheme.colors.status, null, 2)
        );
        expect(darkTheme).toBeDefined();
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
        console.log(
            "Hook currentTheme Typography:",
            JSON.stringify(result.current.currentTheme.typography, null, 2)
        );
        expect(result.current.currentTheme).toBeDefined();
    });
});
