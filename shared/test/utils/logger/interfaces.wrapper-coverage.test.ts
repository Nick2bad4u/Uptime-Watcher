/**
 * Coverage test for the shared logger interfaces module.
 */

import { describe, expect, it } from "vitest";

import { LOGGER_INTERFACES_MODULE_MARKER } from "@shared/utils/logger/interfaces";

describe("logger interfaces module", () => {
    it("exports a runtime marker", () => {
        expect(LOGGER_INTERFACES_MODULE_MARKER).toBe(
            "shared-logger-interfaces"
        );
    });
});
