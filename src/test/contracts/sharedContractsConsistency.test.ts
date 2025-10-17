import { describe, expect, it, expectTypeOf } from "vitest";

import type { MonitorTypeOption as ConstantsMonitorTypeOption } from "../../constants";
import type { MonitorTypeOption as SharedMonitorTypeOption } from "@shared/types/monitorTypes";
import { getMonitorTypeOptions } from "../../utils/monitorTypeHelper";

/**
 * Ensures renderer imports stay aligned with shared DTO definitions.
 */
describe("Shared contract consistency", () => {
    it("re-exports canonical MonitorTypeOption from renderer constants", () => {
        expectTypeOf<ConstantsMonitorTypeOption>().toEqualTypeOf<SharedMonitorTypeOption>();
        expect(true).toBeTruthy();
    });

    it("returns canonical MonitorTypeOption entries from helper", () => {
        type HelperReturn = Awaited<ReturnType<typeof getMonitorTypeOptions>>;
        expectTypeOf<HelperReturn>().toEqualTypeOf<SharedMonitorTypeOption[]>();
        expect(true).toBeTruthy();
    });
});
