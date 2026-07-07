import type {
    MonitorTypeConfig,
    MonitorTypeOption as SharedMonitorTypeOption,
} from "@shared/types/monitorTypes";
import type { AsyncReturnType } from "type-fest";

import { BASE_MONITOR_TYPES } from "@shared/types";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";

import type { MonitorTypeOption as ConstantsMonitorTypeOption } from "../../constants";

import { FALLBACK_MONITOR_TYPE_OPTIONS } from "../../constants";
import { useMonitorTypesStore } from "../../stores/monitor/useMonitorTypesStore";
import {
    clearMonitorTypeCache,
    getMonitorTypeOptions,
} from "../../utils/monitorTypeHelper";

/**
 * Ensures renderer imports stay aligned with shared DTO definitions.
 */
describe("Shared contract consistency", () => {
    afterEach(() => {
        clearMonitorTypeCache();
        useMonitorTypesStore.setState(useMonitorTypesStore.getInitialState());
    });

    it("re-exports canonical MonitorTypeOption from renderer constants", () => {
        expectTypeOf<ConstantsMonitorTypeOption>().toEqualTypeOf<SharedMonitorTypeOption>();

        expect(FALLBACK_MONITOR_TYPE_OPTIONS).toHaveLength(
            BASE_MONITOR_TYPES.length
        );
        expect(FALLBACK_MONITOR_TYPE_OPTIONS.map(({ value }) => value)).toEqual(
            BASE_MONITOR_TYPES
        );
    });

    it("returns canonical MonitorTypeOption entries from helper", async () => {
        type HelperReturn = AsyncReturnType<typeof getMonitorTypeOptions>;
        expectTypeOf<HelperReturn>().toEqualTypeOf<SharedMonitorTypeOption[]>();

        const monitorTypes = [
            {
                description: "Checks HTTP reachability",
                displayName: "HTTP (Website/API)",
                fields: [],
                type: "http",
                version: "1.0.0",
            },
            {
                description: "Checks TCP port reachability",
                displayName: "Port (Host/Port)",
                fields: [],
                type: "port",
                version: "1.0.0",
            },
        ] satisfies MonitorTypeConfig[];

        useMonitorTypesStore.setState({
            ...useMonitorTypesStore.getInitialState(),
            isLoaded: true,
            monitorTypes,
        });

        await expect(getMonitorTypeOptions()).resolves.toEqual([
            { label: "HTTP (Website/API)", value: "http" },
            { label: "Port (Host/Port)", value: "port" },
        ]);
    });
});
