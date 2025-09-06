/**
 * Additional tests for validatorUtils.ts to achieve complete coverage Targeting
 * specific uncovered lines: 203, 250-253
 */

import { describe, it, expect } from "vitest";
import { isValidHost, isValidPort } from "../../validation/validatorUtils";

describe("ValidatorUtils - Complete Coverage", () => {
    describe("isValidHost - Complete Edge Cases", () => {
        it("should reject non-string values (line 203)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test non-string types to hit the return false on line 203
            expect(isValidHost(123)).toBeFalsy();
            expect(isValidHost(null)).toBeFalsy();
            expect(isValidHost(undefined)).toBeFalsy();
            expect(isValidHost({})).toBeFalsy();
            expect(isValidHost([])).toBeFalsy();
            expect(isValidHost(true)).toBeFalsy();
            expect(isValidHost(Symbol("test"))).toBeFalsy();
            expect(isValidHost(() => {})).toBeFalsy();
        });

        it("should validate valid hosts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Valid IP addresses
            expect(isValidHost("127.0.0.1")).toBeTruthy();
            expect(isValidHost("192.168.1.1")).toBeTruthy();
            expect(isValidHost("::1")).toBeTruthy();

            // Valid FQDNs
            expect(isValidHost("example.com")).toBeTruthy();
            expect(isValidHost("sub.domain.com")).toBeTruthy();

            // Localhost special case
            expect(isValidHost("localhost")).toBeTruthy();
        });

        it("should reject invalid string hosts", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Invalid hostnames that are strings but not valid hosts
            expect(isValidHost("")).toBeFalsy();
            expect(isValidHost("invalid..host")).toBeFalsy();
            expect(isValidHost("too-many..dots")).toBeFalsy();
            expect(isValidHost("_underscore")).toBeFalsy();
        });
    });

    describe("isValidPort - Complete Edge Cases", () => {
        it("should reject non-number, non-string values (lines 250-253)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test various non-number, non-string types to hit line 253 (return false)
            expect(isValidPort(null)).toBeFalsy();
            expect(isValidPort(undefined)).toBeFalsy();
            expect(isValidPort({})).toBeFalsy();
            expect(isValidPort([])).toBeFalsy();
            expect(isValidPort(true)).toBeFalsy();
            expect(isValidPort(false)).toBeFalsy();
            expect(isValidPort(Symbol("test"))).toBeFalsy();
            expect(isValidPort(() => {})).toBeFalsy();
            expect(isValidPort(/regex/)).toBeFalsy();
            expect(isValidPort(new Date())).toBeFalsy();
        });

        it("should validate number ports", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Valid number ports (line 249)
            expect(isValidPort(80)).toBeTruthy();
            expect(isValidPort(443)).toBeTruthy();
            expect(isValidPort(3000)).toBeTruthy();
            expect(isValidPort(65_535)).toBeTruthy();

            // Invalid number ports
            expect(isValidPort(0)).toBeFalsy();
            expect(isValidPort(-1)).toBeFalsy();
            expect(isValidPort(70_000)).toBeFalsy();
        });

        it("should validate string ports", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Validation", "type");

            // Valid string ports (line 251)
            expect(isValidPort("80")).toBeTruthy();
            expect(isValidPort("443")).toBeTruthy();
            expect(isValidPort("3000")).toBeTruthy();
            expect(isValidPort("65535")).toBeTruthy();

            // Invalid string ports
            expect(isValidPort("0")).toBeFalsy();
            expect(isValidPort("-1")).toBeFalsy();
            expect(isValidPort("70000")).toBeFalsy();
            expect(isValidPort("invalid")).toBeFalsy();
            expect(isValidPort("")).toBeFalsy();
        });

        it("should handle edge case port values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Test edge cases that might behave differently
            expect(isValidPort(1)).toBeTruthy();
            expect(isValidPort("1")).toBeTruthy();
            expect(isValidPort(Number.NaN)).toBeFalsy();
            expect(isValidPort(Infinity)).toBeFalsy();
            expect(isValidPort(-Infinity)).toBeFalsy();
        });
    });

    describe("Type coercion edge cases", () => {
        it("should handle objects that might coerce to strings/numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Objects with custom toString/valueOf
            const customStringObj = {
                toString() {
                    return "80";
                },
                valueOf() {
                    return 80;
                },
            };

            const customNumberObj = {
                toString() {
                    return "invalid";
                },
                valueOf() {
                    return 80;
                },
            };

            // These should still return false because they're objects, not strings/numbers
            expect(isValidPort(customStringObj)).toBeFalsy();
            expect(isValidPort(customNumberObj)).toBeFalsy();
            expect(isValidHost(customStringObj)).toBeFalsy();
            expect(isValidHost(customNumberObj)).toBeFalsy();
        });

        it("should handle primitive wrapper objects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validatorUtils", "component");
            await annotate("Category: Validation", "category");
            await annotate("Type: Business Logic", "type");

            // Primitive wrappers are objects, not primitives
            expect(isValidPort(Number(80))).toBeTruthy();
            expect(isValidPort(String("80"))).toBeTruthy();
            expect(isValidHost(String("localhost"))).toBeTruthy();
        });
    });
});
