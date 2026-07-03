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
    it.each([
        ["non-finite number", Infinity],
        ["fractional number", 123.45],
        ["numeric string", "123"],
        ["boolean", true],
        ["empty string", ""],
    ])(
        "defaults invalid INTEGER dynamic fields from %s instead of persisting them",
        async (_caseName, port) => {
            const { mapMonitorToRow } = await import(
                "../../../../services/database/utils/schema/dynamicSchema"
            );

            const row = mapMonitorToRow({
                port: port as number,
                type: "port",
            });

            expect(row.port).toBe(0);
        }
    );

    it("preserves safe integer dynamic fields", async ({ annotate, task }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DynamicSchema", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        const { mapMonitorToRow, mapRowToMonitor } = await import(
            "../../../../services/database/utils/schema/dynamicSchema"
        );

        const row = mapMonitorToRow({
            port: 443,
            type: "port",
        });
        const monitor = mapRowToMonitor({
            id: "monitor-1",
            port: 443,
            site_identifier: "site-1",
            type: "port",
        });

        expect(row.port).toBe(443);
        expect(monitor.port).toBe(443);
    });

    it("defaults invalid INTEGER dynamic fields read from rows", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: DynamicSchema", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        const { mapRowToMonitor } = await import(
            "../../../../services/database/utils/schema/dynamicSchema"
        );

        const monitor = mapRowToMonitor({
            id: "monitor-1",
            port: 123.45,
            site_identifier: "site-1",
            type: "port",
        });

        expect(monitor.port).toBe(0);
    });
});
