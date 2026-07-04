import { describe, expect, it } from "vitest";

import { ORIGINAL_METADATA_SYMBOL } from "../../events/TypedEventBus";
import {
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
});
