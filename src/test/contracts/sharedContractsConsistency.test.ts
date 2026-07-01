import type { MonitorTypeOption as SharedMonitorTypeOption } from "@shared/types/monitorTypes";
import type { AsyncReturnType } from "type-fest";

import { describe, expect, expectTypeOf, it } from "vitest";

import type { MonitorTypeOption as ConstantsMonitorTypeOption } from "../../constants";
import type { getMonitorTypeOptions } from "../../utils/monitorTypeHelper";

/**
 * Ensures renderer imports stay aligned with shared DTO definitions.
 */
describe("Shared contract consistency", () => {
    it("re-exports canonical MonitorTypeOption from renderer constants", () => {
        expectTypeOf<ConstantsMonitorTypeOption>().toEqualTypeOf<SharedMonitorTypeOption>();
        expect(true).toBeTruthy();
    });

    it("returns canonical MonitorTypeOption entries from helper", () => {
        type HelperReturn = AsyncReturnType<typeof getMonitorTypeOptions>;
        expectTypeOf<HelperReturn>().toEqualTypeOf<SharedMonitorTypeOption[]>();
        expect(true).toBeTruthy();
    });
});
