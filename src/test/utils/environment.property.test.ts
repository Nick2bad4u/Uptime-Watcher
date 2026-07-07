/**
 * Fast-check powered property tests for environment utilities.
 */

import type { UnknownRecord } from "type-fest";

import { fc, test as fcTest } from "@fast-check/vitest";
import { safeCastTo } from "ts-extras";
import { describe, expect } from "vitest";

import { isPlaywrightAutomation } from "../../utils/environment";

interface ProcessStub {
    env?: Record<string, string | undefined>;
}

const globalTarget = safeCastTo<
    UnknownRecord & {
        navigator?: Navigator;
        playwrightAutomation?: boolean;
        process?: ProcessStub | undefined;
    }
>(globalThis);

const markerSentinel = Symbol("playwright-marker-sentinel");

const restoreGlobalState = (snapshot: {
    readonly marker: boolean | typeof markerSentinel;
    readonly navigator: Navigator | undefined;
    readonly process: unknown;
}): void => {
    if (snapshot.process === undefined) {
        delete globalTarget.process;
    } else {
        globalTarget.process = snapshot.process as typeof globalTarget.process;
    }
    if (snapshot.navigator === undefined) {
        delete globalTarget.navigator;
    } else {
        globalTarget.navigator = snapshot.navigator;
    }

    if (snapshot.marker === markerSentinel) {
        delete globalTarget.playwrightAutomation;
    } else {
        globalTarget.playwrightAutomation = snapshot.marker;
    }
};

const withSandbox = <Value>(action: () => Value): Value => {
    const snapshot = {
        marker:
            "playwrightAutomation" in globalTarget
                ? (globalTarget.playwrightAutomation ?? false)
                : markerSentinel,
        navigator: globalTarget.navigator,
        process: globalTarget.process,
    } as const;

    try {
        return action();
    } finally {
        restoreGlobalState(snapshot);
    }
};

const trueStringArbitrary = fc
    .tuple(fc.boolean(), fc.boolean(), fc.boolean(), fc.boolean())
    .map(
        ([
            t,
            r,
            u,
            e,
        ]) => `${t ? "t" : "T"}${r ? "r" : "R"}${u ? "u" : "U"}${e ? "e" : "E"}`
    );

const falseishValueArbitrary = fc
    .string({ maxLength: 16, minLength: 1 })
    .filter((value) => value.toLowerCase() !== "true");

const nonPlaywrightUAArbitrary = fc
    .string({ maxLength: 80 })
    .filter((ua) => !/playwright|pw-test|pwtest/i.test(ua));

const playwrightUAArbitrary = fc
    .tuple(
        fc.string({ maxLength: 40 }),
        fc.constantFrom("playwright", "pw-test", "pwtest"),
        fc.string({ maxLength: 40 })
    )
    .map(
        ([
            prefix,
            marker,
            suffix,
        ]) => `${prefix}${marker}${suffix}`
    );

describe("environment utilities", () => {
    fcTest.prop<[string]>([trueStringArbitrary])(
        "isPlaywrightAutomation detects true env flags",
        async (truthyValue) => {
            await withSandbox(() => {
                globalTarget.process = {
                    env: { PLAYWRIGHT_TEST: truthyValue },
                };
                delete globalTarget.navigator;
                delete globalTarget.playwrightAutomation;

                expect(isPlaywrightAutomation()).toBe(true);
            });
        }
    );

    fcTest.prop<[string]>([falseishValueArbitrary])(
        "isPlaywrightAutomation ignores non-true env flags",
        async (value) => {
            await withSandbox(() => {
                globalTarget.process = {
                    env: { PLAYWRIGHT_TEST: value },
                };
                delete globalTarget.navigator;
                delete globalTarget.playwrightAutomation;

                expect(isPlaywrightAutomation()).toBe(false);
            });
        }
    );

    fcTest.prop<[string]>([playwrightUAArbitrary])(
        "isPlaywrightAutomation detects matching user-agent patterns",
        async (userAgent) => {
            await withSandbox(() => {
                globalTarget.process = { env: {} };
                globalTarget.navigator = { userAgent } as Navigator;
                delete globalTarget.playwrightAutomation;

                expect(isPlaywrightAutomation()).toBe(true);
            });
        }
    );

    fcTest.prop<[string]>([nonPlaywrightUAArbitrary])(
        "isPlaywrightAutomation returns false for non-matching user agents",
        async (userAgent) => {
            await withSandbox(() => {
                globalTarget.process = { env: {} };
                globalTarget.navigator = { userAgent } as Navigator;
                delete globalTarget.playwrightAutomation;

                expect(isPlaywrightAutomation()).toBe(false);
            });
        }
    );

    fcTest.prop([fc.constant(true)])(
        "isPlaywrightAutomation respects global markers",
        async () => {
            await withSandbox(() => {
                globalTarget.process = { env: {} };
                delete globalTarget.navigator;
                Reflect.set(globalThis, "playwrightAutomation", true);

                expect(isPlaywrightAutomation()).toBe(true);
            });
        }
    );

    fcTest.prop([fc.constant(true)])(
        "isPlaywrightAutomation returns false without any markers",
        async () => {
            await withSandbox(() => {
                globalTarget.process = { env: {} };
                delete globalTarget.navigator;
                delete globalTarget.playwrightAutomation;

                expect(isPlaywrightAutomation()).toBe(false);
            });
        }
    );
});
