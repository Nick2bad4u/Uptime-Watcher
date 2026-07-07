import type { Site } from "@shared/types";

import { describe, expect, it } from "vitest";

import type { UptimeEvents } from "../../../events/eventTypes";
import type { TypedEventBus } from "../../../events/TypedEventBus";
import type { ConfigurationManager } from "../../../managers/ConfigurationManager";
import type { DatabaseCommandContext } from "../../../services/commands/databaseCommandContext";
import type { DatabaseServiceFactory } from "../../../services/factories/DatabaseServiceFactory";
import type { StandardizedCache } from "../../../utils/cache/StandardizedCache";

import {
    isImportContext,
    isRestoreContext,
    resolveDatabaseCommandContext,
} from "../../../services/commands/databaseCommandContext";

function createDatabaseCommandContext(): DatabaseCommandContext {
    return {
        cache: {} as StandardizedCache<Site>,
        configurationManager: {} as ConfigurationManager,
        eventEmitter: {} as TypedEventBus<UptimeEvents>,
        serviceFactory: {} as DatabaseServiceFactory,
        updateHistoryLimit: () => Promise.resolve(),
    };
}

describe("databaseCommandContext", () => {
    it("accepts context objects with own data properties", () => {
        const context = createDatabaseCommandContext();

        expect(resolveDatabaseCommandContext(context)).toStrictEqual(context);
    });

    it("does not invoke accessors while checking import contexts", () => {
        const context = createDatabaseCommandContext();
        let accessCount = 0;

        Object.defineProperty(context, "data", {
            enumerable: true,
            get() {
                accessCount += 1;
                return "payload";
            },
        });

        expect(isImportContext(context)).toBeFalsy();
        expect(accessCount).toBe(0);
    });

    it("does not invoke accessors while checking restore payloads", () => {
        const context = createDatabaseCommandContext();
        const payload = {};
        let accessCount = 0;

        Object.defineProperty(payload, "buffer", {
            enumerable: true,
            get() {
                accessCount += 1;
                return Buffer.from("backup");
            },
        });
        Object.defineProperty(context, "payload", {
            enumerable: true,
            value: payload,
        });

        expect(isRestoreContext(context)).toBeFalsy();
        expect(accessCount).toBe(0);
    });

    it("rejects accessor-backed dependency contexts without invoking them", () => {
        const context = {};
        let accessCount = 0;

        for (const key of [
            "cache",
            "eventEmitter",
            "serviceFactory",
        ]) {
            Object.defineProperty(context, key, {
                enumerable: true,
                get() {
                    accessCount += 1;
                    return {};
                },
            });
        }

        expect(() =>
            resolveDatabaseCommandContext(context as DatabaseCommandContext)
        ).toThrow(TypeError);
        expect(accessCount).toBe(0);
    });
});
