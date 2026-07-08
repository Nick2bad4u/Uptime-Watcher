/**
 * Low-level object creation helpers.
 *
 * @remarks
 * Keep this module dependency-light so foundational utilities such as logging
 * normalization can create hardened records without importing broader object
 * safety helpers.
 */

import { objectKeys } from "ts-extras";

import { castUnchecked } from "./typeHelpers";

/**
 * Creates a null-prototype object with a specific compile-time shape.
 *
 * @remarks
 * This centralizes the only unsafe assertion needed for prototype-pollution
 * hardening so callers do not need their own eslint-disable comments.
 *
 * @public
 */
export function createNullPrototypeObject<T extends object>(shape?: T): T {
    if (shape) {
        // Touch the phantom parameter in a side-effect-free way so lints do not
        // treat it as unused.
        objectKeys(shape);
    }

    return castUnchecked<T>(Object.create(null));
}
