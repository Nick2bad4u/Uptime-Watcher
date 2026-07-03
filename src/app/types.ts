/**
 * Shared app-layer structural types.
 */

/**
 * Structural ref type used by app orchestration helpers.
 *
 * @remarks
 * Avoids importing deprecated React ref object aliases while remaining
 * compatible with values returned by `useRef()`.
 */
export interface MutableRef<T> {
    current: T;
}
