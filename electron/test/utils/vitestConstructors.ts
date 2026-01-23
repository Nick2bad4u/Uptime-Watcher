/**
 * Vitest constructor mocking helpers.
 *
 * @remarks
 * Some Node/Electron APIs export classes that must be instantiated with `new`.
 * While `vi.fn()` is callable, certain mocking styles (notably
 * `mockReturnValue`) can produce mocks that are not constructable. For these
 * cases, Vitest tests should prefer a classic function implementation.
 */

import { vi } from "vitest";
import type { Mock } from "vitest";

/**
 * A Vitest mock function that is also constructable via `new`.
 */
export type ConstructableMock<
    TArgs extends readonly unknown[],
    TInstance,
> = Mock<(...args: TArgs) => TInstance> & (new (...args: TArgs) => TInstance);

/**
 * Creates a constructable Vitest mock constructor.
 *
 * @remarks
 * Use this when mocking modules that export classes (e.g. `node:net`'s
 * `Socket`) and the code under test calls `new Socket()`.
 *
 * @example
 *
 * ```ts
 * const socketInstance = { destroy: vi.fn() };
 * const Socket = createMockConstructor(() => socketInstance);
 *
 * vi.mock("node:net", () => ({ __esModule: true, Socket }));
 * ```
 */
export function createMockConstructor<
    TArgs extends readonly unknown[],
    TInstance,
>(
    createInstance: (...args: TArgs) => TInstance
): ConstructableMock<TArgs, TInstance> {
    return vi.fn(function mockCtor(...args: TArgs): TInstance {
        return createInstance(...args);
    }) as unknown as ConstructableMock<TArgs, TInstance>;
}
