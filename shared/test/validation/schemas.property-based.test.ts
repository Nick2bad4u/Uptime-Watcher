import { test } from "@fast-check/vitest";
import * as fc from "fast-check";
import { describe, expect } from "vitest";

import type { MonitorStatus, StatusHistoryStatus } from "../../types";

import { MONITOR_STATUS_VALUES, STATUS_HISTORY_VALUES } from "../../types";
import { httpMonitorSchema } from "../../validation/monitorSchemas";
import { createBaseMonitorSchema } from "../../validation/monitorSchemas.common";
import { MONITOR_ID_MAX_LENGTH } from "../../validation/monitorFieldConstants";
import { MAX_VALID_DATE_EPOCH_MS } from "../../validation/timestampSchemas";

const baseMonitorSchema = createBaseMonitorSchema();

/**
 * Custom fast-check arbitraries for Zod schemas Replacing zod-fast-check due to
 * incompatibility with complex ZodObject refinements
 */

// Valid identifier generator (alphanumeric + optional hyphens/underscores)
const validIdentifierArbitrary = fc
    .stringMatching(/^[\dA-Za-z]+(?:[-_]*[\dA-Za-z]+)*$/u)
    .filter((identifier) => identifier.length <= MONITOR_ID_MAX_LENGTH);

const monitorStatusArbitrary = fc.constantFrom<MonitorStatus>(
    ...MONITOR_STATUS_VALUES
);

const statusHistoryArbitrary = fc.array(
    fc.record({
        details: fc.option(fc.string(), { nil: undefined }),
        responseTime: fc.integer({ min: 0, max: 99_999 }),
        status: fc.constantFrom<StatusHistoryStatus>(...STATUS_HISTORY_VALUES),
        timestamp: fc.integer({ min: 0, max: MAX_VALID_DATE_EPOCH_MS }),
    })
);

// Base monitor arbitrary
const baseMonitorArbitrary = fc.record({
    activeOperations: fc.option(fc.array(fc.string()), { nil: undefined }),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    history: statusHistoryArbitrary,
    id: validIdentifierArbitrary,
    lastChecked: fc.option(
        fc
            .integer({
                min: new Date("2020-01-01").getTime(),
                max: new Date("2030-01-01").getTime(),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    monitoring: fc.boolean(),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    status: monitorStatusArbitrary,
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    type: fc.constantFrom("http", "port", "ping", "dns"),
});

// HTTP monitor arbitrary
const httpMonitorArbitrary = fc.record({
    activeOperations: fc.option(fc.array(fc.string()), { nil: undefined }),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    history: statusHistoryArbitrary,
    id: validIdentifierArbitrary,
    lastChecked: fc.option(
        fc
            .integer({
                min: new Date("2020-01-01").getTime(),
                max: new Date("2030-01-01").getTime(),
            })
            .map((timestamp) => new Date(timestamp)),
        { nil: undefined }
    ),
    monitoring: fc.boolean(),
    responseTime: fc.integer({ min: -1, max: 999_999 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    status: monitorStatusArbitrary,
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    type: fc.constant("http" as const),
    url: fc.webUrl({ validSchemes: ["http", "https"] }),
});

describe("Schema Property-Based Tests", () => {
    describe("baseMonitorSchema", () => {
        test.prop([baseMonitorArbitrary])(
            "should validate generated base monitor data",
            (monitorData) => {
                const result = baseMonitorSchema.safeParse(monitorData);

                if (!result.success) {
                    throw new Error(
                        `Generated base monitor data failed validation: ${JSON.stringify(
                            {
                                issues: result.error.issues,
                                monitorData,
                            },
                            null,
                            2
                        )}`
                    );
                }

                expect(result.success).toBeTruthy();
            }
        );
    });

    describe("httpMonitorSchema", () => {
        test.prop([httpMonitorArbitrary])(
            "should validate generated HTTP monitor data",
            (monitorData) => {
                const result = httpMonitorSchema.safeParse(monitorData);

                if (!result.success) {
                    throw new Error(
                        `Generated HTTP monitor data failed validation: ${JSON.stringify(
                            {
                                issues: result.error.issues,
                                monitorData,
                            },
                            null,
                            2
                        )}`
                    );
                }

                expect(result.success).toBeTruthy();
            }
        );
    });
});
