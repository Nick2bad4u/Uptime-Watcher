import type { Jsonifiable, JsonValue } from "type-fest";

/**
 * Test-only helper that forcefully treats arbitrary input as
 * {@link Jsonifiable}.
 *
 * @remarks
 * Use this only in negative tests where we intentionally feed invalid JSON
 * structures to verify runtime error paths.
 */
export const unsafeJsonifiable = (value: unknown): Jsonifiable =>
    value as Jsonifiable;

/**
 * Test-only helper predicate that claims any value satisfies the JsonValue
 * constraint. Useful for exercising parsing failure paths where the actual
 * value intentionally violates the contract.
 */
export const acceptAnyJsonValue = (_value: unknown): _value is JsonValue =>
    true;
