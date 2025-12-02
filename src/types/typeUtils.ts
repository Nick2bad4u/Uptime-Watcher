/**
 * Utility type helpers for monitor type definitions.
 */

/**
 * Models a group of fields that must either be provided together or omitted.
 *
 * @remarks
 * The "all" branch requires every property to be present with a non-nullish
 * value, while the "none" branch narrows the same properties to `undefined`.
 * This mirrors the behavior of {@link RequireAllOrNone} from type-fest without
 * introducing redundant intersection constituents that trip our lint rules.
 */
export type RequireAllOrNoneFields<T extends object> =
    | { [K in keyof T]-?: NonNullable<T[K]> }
    | { [K in keyof T]?: undefined };
