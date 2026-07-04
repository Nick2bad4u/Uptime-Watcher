import { describe, expect, it } from "vitest";

import { detectPlaywrightAutomation } from "../../../preload/utils/preloadSecurity";

describe("preloadSecurity", () => {
    describe(detectPlaywrightAutomation, () => {
        it("detects an own data PLAYWRIGHT_TEST flag", () => {
            expect(
                detectPlaywrightAutomation({
                    env: {
                        PLAYWRIGHT_TEST: "true",
                    },
                })
            ).toBeTruthy();
        });

        it("does not invoke accessor-backed env properties", () => {
            let envAccesses = 0;
            const processCandidate = {};
            Object.defineProperty(processCandidate, "env", {
                configurable: true,
                enumerable: true,
                get: () => {
                    envAccesses += 1;
                    throw new Error("Unexpected env getter access");
                },
            });

            expect(detectPlaywrightAutomation(processCandidate)).toBeFalsy();
            expect(envAccesses).toBe(0);
        });

        it("does not invoke accessor-backed environment entries", () => {
            let flagAccesses = 0;
            const env = {};
            Object.defineProperty(env, "PLAYWRIGHT_TEST", {
                configurable: true,
                enumerable: true,
                get: () => {
                    flagAccesses += 1;
                    throw new Error("Unexpected PLAYWRIGHT_TEST getter access");
                },
            });

            expect(detectPlaywrightAutomation({ env })).toBeFalsy();
            expect(flagAccesses).toBe(0);
        });
    });
});
