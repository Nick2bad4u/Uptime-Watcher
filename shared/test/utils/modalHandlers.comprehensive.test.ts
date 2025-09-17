/**
 * @vitest-environment jsdom
 */

/**
 * Comprehensive test suite for modal handler utilities. Provides 100% coverage
 * for shared modal management functions.
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
    type EscapeKeyModalConfig,
    type StateSetter,
    useEscapeKeyModalHandler,
    useModalCloseHandler,
    useModalHandlersWithCallbacks,
    useModalOpenHandler,
    useModalState,
    useModalToggleHandler,
} from "../../utils/modalHandlers";

describe("Modal Handler Utilities - Comprehensive Coverage", () => {
    describe(useModalCloseHandler, () => {
        it("should return a memoized close handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;

            const { result, rerender } = renderHook(() =>
                useModalCloseHandler(setShowModal)
            );

            const firstHandler = result.current;

            // Handler should call setShowModal with false
            act(() => {
                firstHandler();
            });

            expect(setShowModal).toHaveBeenCalledWith(false);

            // Rerender with same setter should return same handler (memoized)
            rerender();
            expect(result.current).toBe(firstHandler);
        });

        it("should return different handler when setter changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal1 = vi.fn() as StateSetter<boolean>;
            const setShowModal2 = vi.fn() as StateSetter<boolean>;

            const { result, rerender } = renderHook(
                ({ setter }) => useModalCloseHandler(setter),
                {
                    initialProps: { setter: setShowModal1 },
                }
            );

            const firstHandler = result.current;

            rerender({ setter: setShowModal2 });
            expect(result.current).not.toBe(firstHandler);
        });
    });

    describe(useEscapeKeyModalHandler, () => {
        let originalAddEventListener: typeof document.addEventListener =
            document.addEventListener;
        let originalRemoveEventListener: typeof document.removeEventListener =
            document.removeEventListener;

        beforeEach(() => {
            originalAddEventListener = document.addEventListener;
            originalRemoveEventListener = document.removeEventListener;
            document.addEventListener = vi.fn();
            document.removeEventListener = vi.fn();
        });

        afterEach(() => {
            document.addEventListener = originalAddEventListener;
            document.removeEventListener = originalRemoveEventListener;
        });

        it("should add keydown event listener on mount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: true,
                    onClose: vi.fn(),
                },
            ];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            expect(document.addEventListener).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function)
            );
        });

        it("should remove keydown event listener on unmount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: true,
                    onClose: vi.fn(),
                },
            ];

            const { unmount } = renderHook(() =>
                useEscapeKeyModalHandler(modalConfigs)
            );

            unmount();

            expect(document.removeEventListener).toHaveBeenCalledWith(
                "keydown",
                expect.any(Function)
            );
        });

        it("should close the highest priority open modal on escape", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const onClose1 = vi.fn();
            const onClose2 = vi.fn();
            const onClose3 = vi.fn();

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: true,
                    onClose: onClose1,
                    priority: 1,
                },
                {
                    isOpen: true,
                    onClose: onClose2,
                    priority: 3,
                },
                {
                    isOpen: false,
                    onClose: onClose3,
                    priority: 5,
                },
            ];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            // Get the keydown handler that was registered
            // eslint-disable-next-line prefer-destructuring
            const keydownHandler = (document.addEventListener as any).mock
                .calls[0][1];

            // Simulate escape key press
            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
            });
            escapeEvent.preventDefault = vi.fn();

            keydownHandler(escapeEvent);

            // Should close highest priority open modal (priority 3)
            expect(onClose2).toHaveBeenCalled();
            expect(onClose1).not.toHaveBeenCalled();
            expect(onClose3).not.toHaveBeenCalled();
            expect(escapeEvent.preventDefault).toHaveBeenCalled();
        });

        it("should handle modals with no priority", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const onClose1 = vi.fn();
            const onClose2 = vi.fn();

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: true,
                    onClose: onClose1,
                    // No priority (defaults to 0)
                },
                {
                    isOpen: false,
                    onClose: onClose2,
                    priority: 1,
                },
            ];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            // eslint-disable-next-line prefer-destructuring
            const keydownHandler = (document.addEventListener as any).mock
                .calls[0][1];

            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
            });
            escapeEvent.preventDefault = vi.fn();

            keydownHandler(escapeEvent);

            // Should close the only open modal
            expect(onClose1).toHaveBeenCalled();
            expect(onClose2).not.toHaveBeenCalled();
        });

        it("should do nothing when no modals are open", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const onClose1 = vi.fn();
            const onClose2 = vi.fn();

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: false,
                    onClose: onClose1,
                },
                {
                    isOpen: false,
                    onClose: onClose2,
                },
            ];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            // eslint-disable-next-line prefer-destructuring
            const keydownHandler = (document.addEventListener as any).mock
                .calls[0][1];

            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
            });
            escapeEvent.preventDefault = vi.fn();

            keydownHandler(escapeEvent);

            expect(onClose1).not.toHaveBeenCalled();
            expect(onClose2).not.toHaveBeenCalled();
            expect(escapeEvent.preventDefault).not.toHaveBeenCalled();
        });

        it("should ignore non-escape key presses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const onClose = vi.fn();

            const modalConfigs: EscapeKeyModalConfig[] = [
                {
                    isOpen: true,
                    onClose,
                },
            ];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            // eslint-disable-next-line prefer-destructuring
            const keydownHandler = (document.addEventListener as any).mock
                .calls[0][1];

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
            });

            keydownHandler(enterEvent);

            expect(onClose).not.toHaveBeenCalled();
        });

        it("should handle empty modal configs array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const modalConfigs: EscapeKeyModalConfig[] = [];

            renderHook(() => useEscapeKeyModalHandler(modalConfigs));

            // eslint-disable-next-line prefer-destructuring
            const keydownHandler = (document.addEventListener as any).mock
                .calls[0][1];

            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
            });
            escapeEvent.preventDefault = vi.fn();

            keydownHandler(escapeEvent);

            expect(escapeEvent.preventDefault).not.toHaveBeenCalled();
        });
    });

    describe(useModalToggleHandler, () => {
        it("should return a memoized toggle handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn();

            const { result, rerender } = renderHook(() =>
                useModalToggleHandler(setShowModal as StateSetter<boolean>)
            );

            const firstHandler = result.current;

            // Handler should call setShowModal with a function
            act(() => {
                firstHandler();
            });

            expect(setShowModal).toHaveBeenCalledWith(expect.any(Function));

            // Test the function that was passed to setShowModal
            const [toggleFunction] = setShowModal.mock.calls[0] as [
                (prev: boolean) => boolean,
            ];
            expect(toggleFunction(true)).toBeFalsy();
            expect(toggleFunction(false)).toBeTruthy();

            // Rerender with same setter should return same handler (memoized)
            rerender();
            expect(result.current).toBe(firstHandler);
        });

        it("should return different handler when setter changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal1 = vi.fn() as StateSetter<boolean>;
            const setShowModal2 = vi.fn() as StateSetter<boolean>;

            const { result, rerender } = renderHook(
                ({ setter }) => useModalToggleHandler(setter),
                {
                    initialProps: { setter: setShowModal1 },
                }
            );

            const firstHandler = result.current;

            rerender({ setter: setShowModal2 });
            expect(result.current).not.toBe(firstHandler);
        });
    });

    describe(useModalOpenHandler, () => {
        it("should return a memoized open handler", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;

            const { result, rerender } = renderHook(() =>
                useModalOpenHandler(setShowModal)
            );

            const firstHandler = result.current;

            // Handler should call setShowModal with true
            act(() => {
                firstHandler();
            });

            expect(setShowModal).toHaveBeenCalledWith(true);

            // Rerender with same setter should return same handler (memoized)
            rerender();
            expect(result.current).toBe(firstHandler);
        });

        it("should return different handler when setter changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal1 = vi.fn() as StateSetter<boolean>;
            const setShowModal2 = vi.fn() as StateSetter<boolean>;

            const { result, rerender } = renderHook(
                ({ setter }) => useModalOpenHandler(setter),
                {
                    initialProps: { setter: setShowModal1 },
                }
            );

            const firstHandler = result.current;

            rerender({ setter: setShowModal2 });
            expect(result.current).not.toBe(firstHandler);
        });
    });

    describe(useModalState, () => {
        it("should initialize with default state (false)", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState());

            expect(result.current.isOpen).toBeFalsy();
            expect(typeof result.current.open).toBe("function");
            expect(typeof result.current.close).toBe("function");
            expect(typeof result.current.toggle).toBe("function");
            expect(typeof result.current.setIsOpen).toBe("function");
        });

        it("should initialize with custom initial state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState(true));

            expect(result.current.isOpen).toBeTruthy();
        });

        it("should open modal when open handler is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState(false));

            expect(result.current.isOpen).toBeFalsy();

            act(() => {
                result.current.open();
            });

            expect(result.current.isOpen).toBeTruthy();
        });

        it("should close modal when close handler is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState(true));

            expect(result.current.isOpen).toBeTruthy();

            act(() => {
                result.current.close();
            });

            expect(result.current.isOpen).toBeFalsy();
        });

        it("should toggle modal state when toggle handler is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState(false));

            expect(result.current.isOpen).toBeFalsy();

            act(() => {
                result.current.toggle();
            });

            expect(result.current.isOpen).toBeTruthy();

            act(() => {
                result.current.toggle();
            });

            expect(result.current.isOpen).toBeFalsy();
        });

        it("should allow direct state setting", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const { result } = renderHook(() => useModalState(false));

            expect(result.current.isOpen).toBeFalsy();

            act(() => {
                result.current.setIsOpen(true);
            });

            expect(result.current.isOpen).toBeTruthy();
        });
    });

    describe(useModalHandlersWithCallbacks, () => {
        it("should create open and close handlers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;

            const { result } = renderHook(() =>
                useModalHandlersWithCallbacks(setShowModal)
            );

            expect(typeof result.current.open).toBe("function");
            expect(typeof result.current.close).toBe("function");
        });

        it("should call setShowModal and onOpen when open is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;
            const onOpen = vi.fn();

            const { result } = renderHook(() =>
                useModalHandlersWithCallbacks(setShowModal, onOpen)
            );

            act(() => {
                result.current.open();
            });

            expect(setShowModal).toHaveBeenCalledWith(true);
            expect(onOpen).toHaveBeenCalled();
        });

        it("should call setShowModal and onClose when close is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;
            const onClose = vi.fn();

            const { result } = renderHook(() =>
                useModalHandlersWithCallbacks(setShowModal, undefined, onClose)
            );

            act(() => {
                result.current.close();
            });

            expect(setShowModal).toHaveBeenCalledWith(false);
            expect(onClose).toHaveBeenCalled();
        });

        it("should work without callbacks", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;

            const { result } = renderHook(() =>
                useModalHandlersWithCallbacks(setShowModal)
            );

            act(() => {
                result.current.open();
            });

            expect(setShowModal).toHaveBeenCalledWith(true);

            act(() => {
                result.current.close();
            });

            expect(setShowModal).toHaveBeenCalledWith(false);
        });

        it("should return memoized handlers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;
            const onOpen = vi.fn();
            const onClose = vi.fn();

            const { result, rerender } = renderHook(() =>
                useModalHandlersWithCallbacks(setShowModal, onOpen, onClose)
            );

            const firstOpen = result.current.open;
            const firstClose = result.current.close;

            rerender();

            expect(result.current.open).toBe(firstOpen);
            expect(result.current.close).toBe(firstClose);
        });

        it("should update handlers when dependencies change", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: modalHandlers", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Hook", "type");

            const setShowModal = vi.fn() as StateSetter<boolean>;
            const onOpen1 = vi.fn();
            const onOpen2 = vi.fn();

            const { result, rerender } = renderHook(
                ({ onOpen }) =>
                    useModalHandlersWithCallbacks(setShowModal, onOpen),
                {
                    initialProps: { onOpen: onOpen1 },
                }
            );

            const firstOpen = result.current.open;

            rerender({ onOpen: onOpen2 });

            expect(result.current.open).not.toBe(firstOpen);
        });
    });
});
