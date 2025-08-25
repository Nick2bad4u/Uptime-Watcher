/**
 * @file Tests for chart setup module to ensure Chart.js is properly configured.
 */

import { describe, it, expect } from "vitest";
import { Chart } from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
// Import the setup module to ensure registration happens
import "../../services/chartSetup";

describe("Chart Setup", () => {
    describe("Chart.js Registration", () => {
        it("should export ChartJS", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Export Operation", "type");

            expect(Chart).toBeDefined();
            expect(Chart).toBe(Chart);
        });

        it("should have registered components", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Check that Chart.js has been configured
            expect(Chart.registry).toBeDefined();
            expect(Chart.registry.controllers).toBeDefined();
            expect(Chart.registry.elements).toBeDefined();
            expect(Chart.registry.plugins).toBeDefined();
            expect(Chart.registry.scales).toBeDefined();
        });

        it("should export react-chartjs-2 components", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Export Operation", "type");

            expect(Bar).toBeDefined();
            expect(Doughnut).toBeDefined();
            expect(Line).toBeDefined();
        });

        it("should have Chart.js components available", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            // Verify essential components are registered
            expect(Chart.registry.controllers.get("line")).toBeDefined();
            expect(Chart.registry.controllers.get("bar")).toBeDefined();
            expect(Chart.registry.controllers.get("doughnut")).toBeDefined();
        });

        it("should have essential scales registered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(Chart.registry.scales.get("category")).toBeDefined();
            expect(Chart.registry.scales.get("linear")).toBeDefined();
            expect(Chart.registry.scales.get("time")).toBeDefined();
        });

        it("should have essential elements registered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(Chart.registry.elements.get("point")).toBeDefined();
            expect(Chart.registry.elements.get("line")).toBeDefined();
            expect(Chart.registry.elements.get("bar")).toBeDefined();
            expect(Chart.registry.elements.get("arc")).toBeDefined();
        });

        it("should have essential plugins registered", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartSetup", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            expect(Chart.registry.plugins.get("title")).toBeDefined();
            expect(Chart.registry.plugins.get("tooltip")).toBeDefined();
            expect(Chart.registry.plugins.get("legend")).toBeDefined();
            expect(Chart.registry.plugins.get("filler")).toBeDefined();
        });
    });
});
