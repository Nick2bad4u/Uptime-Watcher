import type { MonitorRow } from "@shared/types/database";

import { describe, expect, it } from "vitest";

import { rowToMonitorOrUndefined } from "../../../../services/database/utils/mappers/monitorMapper";

const makeHttpStatusRow = (expectedStatusCode: number): MonitorRow => ({
    active_operations: "[]",
    check_interval: 300_000,
    enabled: 1,
    expected_status_code: expectedStatusCode,
    id: "monitor-1",
    response_time: -1,
    retry_attempts: 3,
    site_identifier: "site-1",
    status: "pending",
    timeout: 5000,
    type: "http-status",
    url: "https://example.com",
});

describe(rowToMonitorOrUndefined, () => {
    it("omits non-finite and fractional expected status codes from rows", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: monitorMapper", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        expect(
            rowToMonitorOrUndefined(makeHttpStatusRow(Infinity))
        ).not.toHaveProperty("expectedStatusCode");
        expect(
            rowToMonitorOrUndefined(makeHttpStatusRow(200.5))
        ).not.toHaveProperty("expectedStatusCode");
    });

    it("omits out-of-range expected status codes from rows", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: monitorMapper", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        expect(
            rowToMonitorOrUndefined(makeHttpStatusRow(99))
        ).not.toHaveProperty("expectedStatusCode");
        expect(
            rowToMonitorOrUndefined(makeHttpStatusRow(600))
        ).not.toHaveProperty("expectedStatusCode");
    });

    it("preserves valid expected status codes from rows", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: monitorMapper", "component");
        await annotate("Category: Database Utils", "category");
        await annotate("Type: Validation", "type");

        expect(rowToMonitorOrUndefined(makeHttpStatusRow(204))).toHaveProperty(
            "expectedStatusCode",
            204
        );
    });
});
