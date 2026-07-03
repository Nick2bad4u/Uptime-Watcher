import { describe, expect, it } from "vitest";

import { buildMonitorFactory } from "../../../../services/monitoring/shared/monitorFactoryUtils";

describe(buildMonitorFactory, () => {
    it("wraps initialization failures without mutating the original error", () => {
        const originalError = new Error("Factory failure");

        let wrappedError: unknown;
        try {
            buildMonitorFactory(() => {
                throw originalError;
            }, "ExampleMonitor");
        } catch (error: unknown) {
            wrappedError = error;
        }

        expect(wrappedError).toBeInstanceOf(Error);
        expect(wrappedError).toMatchObject({
            cause: originalError,
            message: "Failed to initialise ExampleMonitor: Factory failure",
        });
        expect(originalError.message).toBe("Factory failure");
    });
});
