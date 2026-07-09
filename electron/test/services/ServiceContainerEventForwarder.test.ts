import { describe, expect, it, vi } from "vitest";

import { ORIGINAL_METADATA_SYMBOL } from "../../events/TypedEventBus";
import { ServiceContainerEventForwarder } from "../../services/ServiceContainerEventForwarder";
import {
    FORWARDED_METADATA_PROPERTY_KEY,
    ORIGINAL_METADATA_PROPERTY_KEY,
} from "../../utils/eventMetadataForwarding";

const createForwarder = () =>
    new ServiceContainerEventForwarder({
        enableDebugLogging: false,
        getMainOrchestrator: () => null,
    });

describe(ServiceContainerEventForwarder, () => {
    it("does not invoke accessor-backed event registration methods", () => {
        const forwarder = createForwarder();
        let accessCount = 0;
        const managerEventBus = {};

        for (const methodName of ["onTyped", "on"] as const) {
            Object.defineProperty(managerEventBus, methodName, {
                configurable: true,
                enumerable: true,
                get() {
                    accessCount += 1;
                    return vi.fn();
                },
            });
        }

        expect(() => {
            forwarder.setupEventForwarding(
                managerEventBus as never,
                "AccessorManager"
            );
        }).not.toThrow();
        expect(accessCount).toBe(0);
    });

    it("preserves valid forwarding metadata as non-enumerable properties", () => {
        const forwarder = createForwarder();
        const forwardedMetadata = {
            busId: "manager-bus",
            correlationId: "corr-object",
            eventName: "internal:site:added",
            timestamp: Date.now(),
        };
        const originalMetadata = {
            busId: "orchestrator-bus",
            correlationId: "orig-object",
            eventName: "site:added",
            timestamp: Date.now() - 10,
        };
        const payload = {
            identifier: "site-object",
            site: {
                identifier: "site-object",
                monitoring: true,
                monitors: [],
                name: "Object Site",
            },
            [FORWARDED_METADATA_PROPERTY_KEY]: forwardedMetadata,
            [ORIGINAL_METADATA_PROPERTY_KEY]: originalMetadata,
        };

        const stripped = forwarder.stripEventMetadataForForwarding(
            "site:added",
            payload as never
        ) as Record<PropertyKey, unknown>;

        expect(stripped).not.toBe(payload);
        expect(stripped["identifier"]).toBe("site-object");
        expect(Object.keys(stripped)).toEqual(["identifier", "site"]);

        for (const key of [
            FORWARDED_METADATA_PROPERTY_KEY,
            ORIGINAL_METADATA_PROPERTY_KEY,
            ORIGINAL_METADATA_SYMBOL,
        ] as const) {
            const descriptor = Object.getOwnPropertyDescriptor(stripped, key);

            expect(descriptor?.enumerable).toBe(false);
        }

        expect(Reflect.get(stripped, FORWARDED_METADATA_PROPERTY_KEY)).toEqual(
            forwardedMetadata
        );
        expect(Reflect.get(stripped, ORIGINAL_METADATA_PROPERTY_KEY)).toEqual(
            originalMetadata
        );
        expect(Reflect.get(stripped, ORIGINAL_METADATA_SYMBOL)).toEqual(
            originalMetadata
        );
    });

    it("drops malformed forwarding metadata while stripping payloads", () => {
        const forwarder = createForwarder();
        const payload = {
            identifier: "site-object",
            site: {
                identifier: "site-object",
                monitoring: true,
                monitors: [],
                name: "Object Site",
            },
            [FORWARDED_METADATA_PROPERTY_KEY]: {
                busId: "manager-bus",
                correlationId: "corr-object",
                eventName: "internal:site:added",
                timestamp: Number.MAX_SAFE_INTEGER,
            },
        };

        const stripped = forwarder.stripEventMetadataForForwarding(
            "site:added",
            payload as never
        ) as Record<PropertyKey, unknown>;

        expect(stripped["identifier"]).toBe("site-object");
        expect(
            Object.getOwnPropertyDescriptor(
                stripped,
                FORWARDED_METADATA_PROPERTY_KEY
            )
        ).toBeUndefined();
        expect(
            Object.getOwnPropertyDescriptor(
                stripped,
                ORIGINAL_METADATA_PROPERTY_KEY
            )
        ).toBeUndefined();
        expect(
            Object.getOwnPropertyDescriptor(stripped, ORIGINAL_METADATA_SYMBOL)
        ).toBeUndefined();
    });
});
