/**
 * Vitest constructor mocking helpers.
 *
 * @remarks
 * Vitest implements `mockReturnValue*` via `mockImplementation(() => value)`.
 * Arrow functions are not constructible, which can crash when the mocked symbol
 * is used with `new`.
 *
 * These helpers provide a standardized, constructible alternative.
 */

import { vi, type Mock, type MockInstance } from "vitest";

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
 * @example
 *
 * ```ts
 * const socketInstance = { destroy: vi.fn() };
 * const Socket = createMockConstructor(() => socketInstance);
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

/**
 * Set a constructible return value for a mocked constructor.
 *
 * @remarks
 * Use this instead of `mockReturnValue`, which uses a non-constructible arrow
 * function under Vitest.
 */
export function mockConstructableReturnValue<
    TArgs extends readonly unknown[],
    TInstance,
>(mock: MockInstance<(...args: TArgs) => TInstance>, value: TInstance): void {
    mock.mockImplementation(function mockConstructableReturnValueImpl() {
        return value;
    });
}

/**
 * Set a one-time constructible return value for a mocked constructor.
 */
export function mockConstructableReturnValueOnce<
    TArgs extends readonly unknown[],
    TInstance,
>(mock: MockInstance<(...args: TArgs) => TInstance>, value: TInstance): void {
    mock.mockImplementationOnce(
        function mockConstructableReturnValueOnceImpl() {
            return value;
        }
    );
}
