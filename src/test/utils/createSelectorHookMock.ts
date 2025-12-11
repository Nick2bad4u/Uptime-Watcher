import { vi } from "vitest";

type Selector<State, Result> = (state: State) => Result;
type EqualityChecker<Result> = (a: Result, b: Result) => boolean;

export type SelectorHookMock<State extends object> = ReturnType<
    typeof vi.fn
> & {
    <Result = State>(
        selector?: Selector<State, Result>,
        equality?: EqualityChecker<Result>
    ): Result | State;
    getState: () => State;
    setState: (
        partial: Partial<State> | ((state: State) => Partial<State>)
    ) => void;
};

/**
 * Creates a Vitest mock for Zustand selector hooks that honors selector and
 * equality arguments.
 *
 * @param state - Mutable reference representing the underlying store snapshot
 *   for tests.
 *
 * @returns A mock function mirroring Zustand's selector signature while
 *   exposing get/set helpers.
 */
export function createSelectorHookMock<State extends object>(
    state: State
): SelectorHookMock<State> {
    const mock = vi.fn(<Result = State>(
        selector?: Selector<State, Result>,
        _equality?: EqualityChecker<Result>
    ) =>
        typeof selector === "function"
            ? selector(state)
            : state) as unknown as SelectorHookMock<State>;

    mock.getState = vi.fn(() => state);
    mock.setState = vi.fn((partial) => {
        const next = typeof partial === "function" ? partial(state) : partial;
        Object.assign(state, next);
    });

    return mock;
}
