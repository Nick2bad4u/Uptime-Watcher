/**
 * Regression coverage for descriptor-safe logger initialization.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ACCESSOR_METHOD_NAMES = [
    "error",
    "info",
    "silly",
    "verbose",
    "warn",
] as const;

describe("logger accessor safety", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    afterEach(() => {
        vi.doUnmock("electron-log/renderer");
    });

    it("does not invoke accessor-backed log methods while resolving wrappers", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: logger.accessors", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Regression", "type");

        const debug = vi.fn();
        const accessedMethods: string[] = [];
        const electronLog = {
            debug,
            transports: {
                console: {
                    format: "[{h}:{i}:{s}.{ms}] [{level}] {text}",
                    level: "debug",
                },
                file: {
                    level: "info",
                },
            },
        };

        for (const name of ACCESSOR_METHOD_NAMES) {
            Object.defineProperty(electronLog, name, {
                configurable: true,
                enumerable: true,
                get: () => {
                    accessedMethods.push(name);
                    throw new Error(`Unexpected ${name} getter access`);
                },
            });
        }

        vi.doMock("electron-log/renderer", () => ({
            default: electronLog,
        }));

        const { logger } = await import("../../services/logger");

        expect(accessedMethods).toEqual([]);

        logger.info("Accessor-backed info method");

        expect(accessedMethods).toEqual([]);
        expect(debug).toHaveBeenCalledWith(
            "[UPTIME-WATCHER] Accessor-backed info method"
        );
    });

    it("does not invoke an accessor-backed transports property during setup", async ({
        annotate,
        task,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: logger.accessors", "component");
        await annotate("Category: Service", "category");
        await annotate("Type: Regression", "type");

        const debug = vi.fn();
        let transportAccesses = 0;
        const electronLog = { debug };

        Object.defineProperty(electronLog, "transports", {
            configurable: true,
            enumerable: true,
            get: () => {
                transportAccesses += 1;
                throw new Error("Unexpected transports getter access");
            },
        });

        vi.doMock("electron-log/renderer", () => ({
            default: electronLog,
        }));

        const { logger } = await import("../../services/logger");

        expect(transportAccesses).toBe(0);

        logger.debug("Accessor-backed transports");

        expect(transportAccesses).toBe(0);
        expect(debug).toHaveBeenCalledWith(
            "[UPTIME-WATCHER] Accessor-backed transports"
        );
    });
});
