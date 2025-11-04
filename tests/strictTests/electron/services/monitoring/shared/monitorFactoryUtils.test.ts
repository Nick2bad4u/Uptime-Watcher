import { beforeEach, describe, expect, it, vi } from "vitest";

const utilsPath = "../../../../../../shared/utils/errorHandling";
const modulePath = "../../../../../../electron/services/monitoring/shared/monitorFactoryUtils";

describe("monitorFactoryUtils.buildMonitorFactory", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it("returns the factory result when no error is thrown", async () => {
        const errorModule = await import(utilsPath);
        const ensureErrorSpy = vi.spyOn(errorModule, "ensureError");
        const { buildMonitorFactory } = await import(modulePath);
        const factory = vi.fn(() => ({ sentinel: true }));

        const result = buildMonitorFactory(factory, "HTTP Monitor");

        expect(result).toStrictEqual({ sentinel: true });
        expect(factory).toHaveBeenCalledTimes(1);
        expect(ensureErrorSpy).not.toHaveBeenCalled();
    });

    it("augments thrown errors with the provided scope", async () => {
        const { buildMonitorFactory } = await import(modulePath);
        const thrownError = new Error("socket timeout");

        try {
            buildMonitorFactory(() => {
                throw thrownError;
            }, "Ping Monitor");

            expect.fail("Expected factory invocation to throw");
        } catch (error) {
            const normalized = error as Error;

            expect(normalized).toBe(thrownError);
            expect(normalized.message).toBe(
                "Failed to initialise Ping Monitor: socket timeout"
            );
        }
    });

    it("normalises non-error throwables via ensureError", async () => {
        const errorModule = await import(utilsPath);
        const ensureErrorSpy = vi.spyOn(errorModule, "ensureError");
        const normalizedError = new Error("string failure");
        ensureErrorSpy.mockImplementation((input) => {
            expect(input).toBe("boom");

            return normalizedError;
        });

        const { buildMonitorFactory } = await import(modulePath);

        expect(() =>
            buildMonitorFactory(() => {
                throw "boom";
            }, "SSL Monitor")
        ).toThrow(normalizedError);

        expect(ensureErrorSpy).toHaveBeenCalledTimes(1);
        expect(normalizedError.message).toBe(
            "Failed to initialise SSL Monitor: string failure"
        );
    });
});
