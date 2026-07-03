/**
 * Tests for dynamic monitor schema value conversion.
 */

import type { MonitorFieldDefinition } from "@shared/types";

import { describe, expect, it, vi } from "vitest";
import * as z from "zod";

const mockMonitorConfigs = [
    {
        description: "Test port monitor with numeric dynamic fields",
        displayName: "Port Monitor",
        fields: [
            {
                label: "Port",
                name: "port",
                required: false,
                type: "number",
            },
        ] as MonitorFieldDefinition[],
        serviceFactory: vi.fn(),
        type: "port",
        validationSchema: z.object({}),
        version: "1.0.0",
    },
];

vi.mock("../../../../services/monitoring/MonitorTypeRegistry", () => ({
    getAllMonitorTypeConfigs: () => mockMonitorConfigs,
}));

describe("dynamic schema conversion", () => {
    it("defaults non-finite INTEGER dynamic fields instead of persisting them", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DynamicSchema", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        const { mapMonitorToRow } = await import(
            "../../../../services/database/utils/schema/dynamicSchema"
        );

        const row = mapMonitorToRow({
            port: Infinity,
            type: "port",
        });

        expect(row.port).toBe(0);
    });
});
