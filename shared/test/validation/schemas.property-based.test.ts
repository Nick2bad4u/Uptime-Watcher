import { describe, expect } from "vitest";
import * as fc from "fast-check";
import { test } from "@fast-check/vitest";
import {
    baseMonitorSchema,
    httpMonitorSchema,
} from "../../validation/monitorSchemas";

/**
 * Custom fast-check arbitraries for Zod schemas Replacing zod-fast-check due to
 * incompatibility with complex ZodObject refinements
 */

// Valid identifier generator (alphanumeric + optional hyphens/underscores)
const validIdentifierArbitrary = fc.stringMatching(
    /^[\dA-Za-z]+(?:[_-]*[\dA-Za-z]+)*$/
);

// Base monitor arbitrary
const baseMonitorArbitrary = fc.record({
    activeOperations: fc.option(fc.array(fc.string()), { nil: undefined }),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    history: fc.array(
        fc.record({
            details: fc.option(fc.string(), { nil: undefined }),
            responseTime: fc.float({
                min: 0,
                max: 99_999,
                noNaN: true,
                noDefaultInfinity: true,
            }),
            status: fc.constantFrom("up", "down"),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
        })
    ),
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
    status: fc.constantFrom("up", "down", "pending", "paused"),
    timeout: fc.integer({ min: 1000, max: 300_000 }),
    type: fc.constantFrom("http", "port", "ping", "dns"),
});

// HTTP monitor arbitrary
const httpMonitorArbitrary = fc.record({
    activeOperations: fc.option(fc.array(fc.string()), { nil: undefined }),
    checkInterval: fc.integer({ min: 5000, max: 2_592_000_000 }),
    history: fc.array(
        fc.record({
            details: fc.option(fc.string(), { nil: undefined }),
            responseTime: fc.float({
                min: 0,
                max: 99_999,
                noNaN: true,
                noDefaultInfinity: true,
            }),
            status: fc.constantFrom("up", "down"),
            timestamp: fc.integer({ min: 0, max: Date.now() + 86_400_000 }),
        })
    ),
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
    status: fc.constantFrom("up", "down", "pending", "paused"),
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
                    console.log(
                        "Validation failed for:",
                        JSON.stringify(monitorData, null, 2)
                    );
                    console.log("Validation issues:", result.error.issues);
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
                    console.log(
                        "HTTP validation failed for:",
                        JSON.stringify(monitorData, null, 2)
                    );
                    console.log("HTTP validation issues:", result.error.issues);
                }

                expect(result.success).toBeTruthy();
            }
        );
    });
});
