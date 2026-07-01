/**
 * Coverage test for the shared logger interfaces module.
 */

import { LOGGER_INTERFACES_MODULE_MARKER } from "@shared/utils/logger/interfaces";
import { describe, expect, it } from "vitest";

describe("logger interfaces module", () => {
    it("exports a runtime marker", () => {
        expect(LOGGER_INTERFACES_MODULE_MARKER).toBe(
            "shared-logger-interfaces"
        );
    });
});
