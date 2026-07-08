import { isAsciiDigits as sharedIsAsciiDigits } from "@shared/utils/ascii";
import type { Promisable } from "type-fest";
/**
 * Shared SyncEngine utilities.
 *
 * @remarks
 * This module intentionally holds low-level helpers (validation + bounded
 * concurrency) used by {@link electron/services/sync/SyncEngine#SyncEngine}.
 */
import { isValidPersistedDeviceId as sharedIsValidPersistedDeviceId } from "@shared/validation/persistedDeviceIdValidation";

import { mapWithConcurrency as mapWithConcurrencyImpl } from "../../utils/boundedConcurrency";

/**
 * Returns true when the string contains only ASCII digits.
 *
 * @remarks
 * Cloud sync object keys encode numeric fields (timestamps and op ids) as
 * decimal strings. We intentionally disallow localized digits and other numeric
 * representations to keep provider keys canonical and comparable.
 */
export function isAsciiDigits(value: string): boolean {
    return sharedIsAsciiDigits(value);
}

/**
 * Validates the persisted sync deviceId.
 *
 * @remarks
 * DeviceId is embedded into provider object keys
 * (`sync/devices/<deviceId>/...`) so it must be a single key segment and avoid
 * control characters.
 */
export function isValidPersistedDeviceId(candidate: string): boolean {
    const impl: (candidate: string) => boolean = sharedIsValidPersistedDeviceId;
    return impl(candidate);
}

/**
 * Maps items with bounded concurrency while preserving input order.
 *
 * @remarks
 * Kept on this module's public surface for existing sync callers while the
 * implementation lives in the neutral Electron utility layer.
 */
export async function mapWithConcurrency<T, R>(args: {
    readonly concurrency: number;
    readonly items: readonly T[];
    readonly task: (item: T) => Promisable<R>;
}): Promise<R[]> {
    return mapWithConcurrencyImpl(args);
}
