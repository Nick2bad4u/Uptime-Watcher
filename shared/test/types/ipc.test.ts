import {
    createIpcCorrelationEnvelope,
    isIpcCorrelationEnvelope,
    isIpcHandlerVerificationResult,
} from "@shared/types/ipc";
import { generateCorrelationId } from "@shared/utils/correlation";
import { describe, expect, it } from "vitest";

describe("IPC type guards", () => {
    describe(isIpcCorrelationEnvelope, () => {
        it("accepts locally created correlation envelopes", () => {
            expect(
                isIpcCorrelationEnvelope(
                    createIpcCorrelationEnvelope(generateCorrelationId())
                )
            ).toBeTruthy();
        });

        it("rejects correlation envelopes inherited from the prototype", () => {
            const inheritedEnvelope = Object.create(
                createIpcCorrelationEnvelope(generateCorrelationId())
            ) as unknown;

            expect(isIpcCorrelationEnvelope(inheritedEnvelope)).toBeFalsy();
        });

        it("rejects accessors without invoking them", () => {
            const accessorEnvelope = {};
            Object.defineProperty(accessorEnvelope, "correlationId", {
                enumerable: true,
                get: () => {
                    throw new Error("correlationId getter should not run");
                },
            });
            Object.defineProperty(
                accessorEnvelope,
                "__uptimeWatcherIpcContext",
                {
                    enumerable: true,
                    get: () => {
                        throw new Error("context getter should not run");
                    },
                }
            );

            expect(isIpcCorrelationEnvelope(accessorEnvelope)).toBeFalsy();
        });
    });

    describe(isIpcHandlerVerificationResult, () => {
        it("accepts valid handler verification results", () => {
            expect(
                isIpcHandlerVerificationResult({
                    availableChannels: ["get-sites"],
                    channel: "get-sites",
                    registered: true,
                })
            ).toBeTruthy();
        });

        it("rejects handler verification fields inherited from the prototype", () => {
            const inheritedResult = Object.create({
                availableChannels: ["get-sites"],
                channel: "get-sites",
                registered: true,
            }) as unknown;

            expect(isIpcHandlerVerificationResult(inheritedResult)).toBeFalsy();
        });

        it("rejects handler verification accessors without invoking them", () => {
            const accessorResult = {};
            Object.defineProperty(accessorResult, "availableChannels", {
                enumerable: true,
                get: () => {
                    throw new Error("availableChannels getter should not run");
                },
            });
            Object.defineProperty(accessorResult, "channel", {
                enumerable: true,
                value: "get-sites",
            });
            Object.defineProperty(accessorResult, "registered", {
                enumerable: true,
                value: true,
            });

            expect(isIpcHandlerVerificationResult(accessorResult)).toBeFalsy();
        });
    });
});
