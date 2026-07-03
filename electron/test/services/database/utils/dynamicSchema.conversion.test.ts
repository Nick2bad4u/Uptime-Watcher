/**
 * Tests for dynamic monitor schema value conversion.
 */

import type { MonitorFieldDefinition } from "@shared/types";

import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
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

    it.each([
        ["invalid Date", new Date("invalid")],
        ["NaN number", Number.NaN],
        ["infinite number", Infinity],
        ["fractional timestamp", 123.45],
        ["negative timestamp", -1],
        ["unsafe timestamp", Number.MAX_SAFE_INTEGER + 1],
        ["timestamp outside Date range", MAX_VALID_DATE_EPOCH_MS + 1],
    ])(
        "discards invalid lastChecked values from %s when writing rows",
        async (_caseName, lastChecked) => {
            const { mapMonitorToRow } = await import(
                "../../../../services/database/utils/schema/dynamicSchema"
            );

            const row = mapMonitorToRow({
                lastChecked: lastChecked as Date,
                type: "port",
            });

            expect(row.last_checked).toBeNull();
        }
    );

    it("preserves finite lastChecked timestamps when writing rows", async ({
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

        expect(
            mapMonitorToRow({
                lastChecked: new Date(0),
                type: "port",
            }).last_checked
        ).toBe(0);
        expect(
            mapMonitorToRow({
                lastChecked: 1_680_000_000_000 as unknown as Date,
                type: "port",
            }).last_checked
        ).toBe(1_680_000_000_000);
    });

    it.each([
        ["fractional timestamp", 1.5],
        ["missing timestamp", undefined],
        ["NaN timestamp", Number.NaN],
        ["negative timestamp", -1],
        ["unsafe timestamp", Number.MAX_SAFE_INTEGER + 1],
        ["infinite timestamp", Infinity],
        ["invalid date range", MAX_VALID_DATE_EPOCH_MS + 1],
    ])(
        "omits lastChecked for %s when reading rows",
        async (_caseName, lastChecked) => {
            const { mapRowToMonitor } = await import(
                "../../../../services/database/utils/schema/dynamicSchema"
            );

            const monitor = mapRowToMonitor({
                id: "monitor-1",
                ...(lastChecked !== undefined && {
                    last_checked: lastChecked,
                }),
                site_identifier: "site-1",
                type: "port",
            });

            expect(monitor).not.toHaveProperty("lastChecked");
        }
    );

    it("preserves finite lastChecked dates when reading rows", async ({
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

        const epochMonitor = mapRowToMonitor({
            id: "monitor-1",
            last_checked: 0,
            site_identifier: "site-1",
            type: "port",
        });
        const laterMonitor = mapRowToMonitor({
            id: "monitor-2",
            last_checked: 1_680_000_000_000,
            site_identifier: "site-1",
            type: "port",
        });

        expect(epochMonitor.lastChecked).toEqual(new Date(0));
        expect(laterMonitor.lastChecked).toEqual(new Date(1_680_000_000_000));
    });

    it.each([
        ["NaN timestamp", "createdAt", "created_at", Number.NaN],
        ["fractional timestamp", "createdAt", "created_at", 1.5],
        ["negative timestamp", "updatedAt", "updated_at", -1],
        [
            "unsafe timestamp",
            "createdAt",
            "created_at",
            Number.MAX_SAFE_INTEGER + 1,
        ],
        [
            "timestamp outside Date range",
            "updatedAt",
            "updated_at",
            MAX_VALID_DATE_EPOCH_MS + 1,
        ],
    ] as const)(
        "defaults invalid required timestamp field %s from %s when writing rows",
        async (_caseName, sourceField, rowField, timestamp) => {
            const { mapMonitorToRow } = await import(
                "../../../../services/database/utils/schema/dynamicSchema"
            );

            const before = Date.now();
            const row = mapMonitorToRow({
                [sourceField]: timestamp,
                type: "port",
            });
            const after = Date.now();

            expect(row[rowField]).toBeGreaterThanOrEqual(before);
            expect(row[rowField]).toBeLessThanOrEqual(after);
        }
    );

    it("preserves finite required timestamp fields when writing rows", async ({
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
            createdAt: 1_680_000_000_000,
            type: "port",
            updatedAt: new Date(1_680_000_001_000) as unknown as number,
        });

        expect(row.created_at).toBe(1_680_000_000_000);
        expect(row.updated_at).toBe(1_680_000_001_000);
    });
});
