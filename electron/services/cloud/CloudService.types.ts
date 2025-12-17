/**
 * Types shared by CloudService-related modules.
 *
 * @remarks
 * Kept in a dedicated module to avoid circular dependencies between
 * `CloudService.ts` and internal helper modules (madge enforces no cycles).
 */

/**
 * Minimal adapter describing how cloud configuration is persisted.
 *
 * @remarks
 * Production uses `SettingsRepository`. Tests may supply a fake.
 */
export interface CloudSettingsAdapter {
    get: (key: string) => Promise<string | undefined>;
    set: (key: string, value: string) => Promise<void>;
}
