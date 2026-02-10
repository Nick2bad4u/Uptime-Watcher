/**
 * Utility types for strict type-level invariants.
 *
 * @remarks
 * This mirrors the behavior of {@link type-fest#RequireAllOrNone} from type-fest
 * without introducing redundant intersection constituents that trip our lint rules.
 */
export type RequireAllOrNoneFields<T extends object> =
    | { [K in keyof T]-?: NonNullable<T[K]> }
    | { [K in keyof T]?: undefined };
