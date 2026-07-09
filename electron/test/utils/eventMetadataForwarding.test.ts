import { describe, expect, it } from "vitest";

import { ORIGINAL_METADATA_SYMBOL } from "../../events/TypedEventBus";
import {
    attachForwardedMetadata,
    FORWARDED_METADATA_PROPERTY_KEY,
    ORIGINAL_METADATA_PROPERTY_KEY,
    stripForwardedEventMetadata,
} from "../../utils/eventMetadataForwarding";

describe(stripForwardedEventMetadata, () => {
    it("strips metadata while preserving protected object keys as data", () => {
        const payload = {
            stable: "value",
            [FORWARDED_METADATA_PROPERTY_KEY]: {
                busId: "source-bus",
                correlationId: "source-correlation",
                eventName: "source-event",
                timestamp: Date.now(),
            },
            [ORIGINAL_METADATA_PROPERTY_KEY]: {
                busId: "original-bus",
                correlationId: "original-correlation",
                eventName: "original-event",
                timestamp: Date.now(),
            },
            [ORIGINAL_METADATA_SYMBOL]: {
                busId: "symbol-bus",
                correlationId: "symbol-correlation",
                eventName: "symbol-event",
                timestamp: Date.now(),
            },
        };
        Object.defineProperty(payload, "__proto__", {
            configurable: true,
            enumerable: true,
            value: { polluted: true },
            writable: true,
        });

        const stripped = stripForwardedEventMetadata(payload);
        const protectedProperty = Object.getOwnPropertyDescriptor(
            stripped,
            "__proto__"
        );

        expect(Object.getPrototypeOf(stripped)).toBeNull();
        expect(stripped["stable"]).toBe("value");
        expect(protectedProperty?.value).toEqual({ polluted: true });
        expect(
            Object.hasOwn(stripped, FORWARDED_METADATA_PROPERTY_KEY)
        ).toBeFalsy();
        expect(
            Object.hasOwn(stripped, ORIGINAL_METADATA_PROPERTY_KEY)
        ).toBeFalsy();
        expect(Object.hasOwn(stripped, ORIGINAL_METADATA_SYMBOL)).toBeFalsy();
    });

    it("does not invoke accessors while stripping object metadata", () => {
        let getterCalls = 0;
        const payload = {
            stable: "value",
        };
        Object.defineProperty(payload, "computed", {
            enumerable: true,
            get() {
                getterCalls += 1;
                return "should-not-run";
            },
        });

        const stripped = stripForwardedEventMetadata(payload);

        expect(Object.getPrototypeOf(stripped)).toBeNull();
        expect(stripped["stable"]).toBe("value");
        expect(Object.hasOwn(stripped, "computed")).toBeFalsy();
        expect(getterCalls).toBe(0);
    });

    it("strips array metadata while preserving data descriptors and length", () => {
        let getterCalls = 0;
        const payload = ["placeholder", "safe-value"] as Record<
            string,
            unknown
        > &
            unknown[];

        payload[FORWARDED_METADATA_PROPERTY_KEY] = {
            busId: "source-bus",
            correlationId: "source-correlation",
            eventName: "source-event",
            timestamp: Date.now(),
        };
        Object.defineProperty(payload, "0", {
            configurable: true,
            enumerable: true,
            get() {
                getterCalls += 1;
                return "should-not-run";
            },
        });

        const stripped = stripForwardedEventMetadata(payload);
        const firstDescriptor = Object.getOwnPropertyDescriptor(stripped, "0");
        const secondDescriptor = Object.getOwnPropertyDescriptor(stripped, "1");

        expect(getterCalls).toBe(0);

        expect(stripped).not.toBe(payload);
        expect(Object.getOwnPropertyDescriptor(stripped, "length")?.value).toBe(
            2
        );
        expect(Object.hasOwn(stripped, FORWARDED_METADATA_PROPERTY_KEY)).toBe(
            false
        );
        expect(firstDescriptor && "value" in firstDescriptor).toBe(true);
        expect(firstDescriptor?.value).toBe(undefined);
        expect(secondDescriptor && "value" in secondDescriptor).toBe(true);
        expect(secondDescriptor?.value).toBe("safe-value");
    });

    it("ignores inherited metadata while stripping object payloads", () => {
        const prototype = {
            [FORWARDED_METADATA_PROPERTY_KEY]: {
                busId: "source-bus",
                correlationId: "source-correlation",
                eventName: "source-event",
                timestamp: Date.now(),
            },
        };
        const payload = Object.assign(Object.create(prototype), {
            stable: "value",
        }) as Record<string, unknown>;

        const stripped = stripForwardedEventMetadata(payload);

        expect(stripped["stable"]).toBe("value");
        expect(Object.hasOwn(stripped, FORWARDED_METADATA_PROPERTY_KEY)).toBe(
            false
        );
    });
});

describe(attachForwardedMetadata, () => {
    it("attaches own source metadata as non-enumerable forwarded metadata", () => {
        const originalMetadata = {
            busId: "source-bus",
            correlationId: "source-correlation",
            eventName: "internal:site:added",
            timestamp: Date.now(),
        };
        const source = {
            [FORWARDED_METADATA_PROPERTY_KEY]: originalMetadata,
        };
        const payload = {
            identifier: "site-object",
        };

        const result = attachForwardedMetadata({
            busId: "target-bus",
            forwardedEvent: "site:added",
            payload,
            source,
        });

        expect(result).toBe(payload);
        const forwardedDescriptor = Object.getOwnPropertyDescriptor(
            result,
            FORWARDED_METADATA_PROPERTY_KEY
        );
        const originalDescriptor = Object.getOwnPropertyDescriptor(
            result,
            ORIGINAL_METADATA_PROPERTY_KEY
        );
        const symbolDescriptor = Object.getOwnPropertyDescriptor(
            result,
            ORIGINAL_METADATA_SYMBOL
        );

        expect(forwardedDescriptor?.enumerable).toBe(false);
        expect(forwardedDescriptor?.value).toMatchObject({
            busId: "target-bus",
            correlationId: "source-correlation",
            eventName: "site:added",
        });
        expect(originalDescriptor?.enumerable).toBe(false);
        expect(originalDescriptor?.value).toEqual(originalMetadata);
        expect(symbolDescriptor?.enumerable).toBe(false);
        expect(symbolDescriptor?.value).toEqual(originalMetadata);
    });

    it("does not read inherited metadata when attaching forwarded metadata", () => {
        const source = Object.create({
            [FORWARDED_METADATA_PROPERTY_KEY]: {
                busId: "source-bus",
                correlationId: "source-correlation",
                eventName: "internal:site:added",
                timestamp: Date.now(),
            },
        });
        const payload = {
            identifier: "site-object",
        };

        const result = attachForwardedMetadata({
            busId: "target-bus",
            forwardedEvent: "site:added",
            payload,
            source,
        });

        expect(result).toBe(payload);
        expect(
            Object.getOwnPropertyDescriptor(
                result,
                FORWARDED_METADATA_PROPERTY_KEY
            )
        ).toBeUndefined();
    });
});
