import type { CloudSettingsAdapter } from "@electron/services/cloud/CloudService.types";

/**
 * Creates an in-memory implementation of the CloudSettingsAdapter contract for
 * internal cloud service tests.
 */
export function createInMemoryCloudSettingsAdapter(
    seed?: Record<string, string>
): CloudSettingsAdapter {
    const data = new Map<string, string>(Object.entries(seed ?? {}));

    return {
        get: async (key) => data.get(key),
        set: async (key, value) => {
            data.set(key, value);
        },
    };
}
