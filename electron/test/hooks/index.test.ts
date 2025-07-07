/**
 * Tests for hooks module exports.
 */

import { describe, it, expect } from "vitest";

import {
    generateCorrelationId,
    ValidationError,
    useRetry,
    useTransaction,
    useValidation,
} from "../../hooks";

describe("hooks module exports", () => {
    it("should export all hook functions", () => {
        expect(typeof generateCorrelationId).toBe("function");
        expect(typeof useRetry).toBe("function");
        expect(typeof useTransaction).toBe("function");
        expect(typeof useValidation).toBe("function");
    });

    it("should export ValidationError class", () => {
        expect(ValidationError).toBeDefined();
        expect(ValidationError.prototype).toBeInstanceOf(Error.prototype.constructor);
    });

    it("should have consistent hook patterns", () => {
        // All hooks should return functions or objects
        const retry = useRetry();
        const transaction = useTransaction();
        const validation = useValidation();

        expect(typeof retry).toBe("function");
        expect(typeof transaction).toBe("function");
        expect(typeof validation).toBe("object");
        expect(typeof validation.validateSite).toBe("function");
        expect(typeof validation.validateMonitor).toBe("function");
        expect(typeof validation.withValidation).toBe("function");
    });
});
