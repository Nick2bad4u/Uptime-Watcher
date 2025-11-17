/**
 * Comprehensive tests for the confirmation dialog store utilities.
 */

import { act, renderHook } from "@testing-library/react";
import { fc, test as fcTest } from "@fast-check/vitest";
import { beforeEach, describe, expect, it } from "vitest";

import {
    type ConfirmDialogStoreState,
    type ConfirmDialogTone,
    requestConfirmation,
    resetConfirmDialogState,
    useConfirmDialogControls,
    useConfirmDialogStore,
    useConfirmDialogVisibility,
} from "../../../stores/ui/useConfirmDialogStore";

describe(useConfirmDialogStore, () => {
    beforeEach(() => {
        resetConfirmDialogState();
    });

    it("normalizes default confirmation options and resolves true on confirm", async () => {
        const confirmation = requestConfirmation({
            message: "Perform sync?",
            title: "Synchronize data",
        });
        const state = useConfirmDialogStore.getState();

        expect(state.request).toStrictEqual({
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Perform sync?",
            title: "Synchronize data",
            tone: "default",
        });

        state.confirm();

        await expect(confirmation).resolves.toBeTruthy();
        expect(useConfirmDialogStore.getState().request).toBeNull();
    });

    it("applies custom labels, tone, and details while resolving false on cancel", async () => {
        const confirmation = requestConfirmation({
            cancelLabel: "Back",
            confirmLabel: "Delete",
            details: "This action cannot be undone.",
            message: "Remove monitor?",
            title: "Confirm removal",
            tone: "danger",
        });
        const state = useConfirmDialogStore.getState();

        expect(state.request).toStrictEqual({
            cancelLabel: "Back",
            confirmLabel: "Delete",
            details: "This action cannot be undone.",
            message: "Remove monitor?",
            title: "Confirm removal",
            tone: "danger",
        });

        state.cancel();

        await expect(confirmation).resolves.toBeFalsy();
        expect(useConfirmDialogStore.getState().request).toBeNull();
    });

    it("cancels an active dialog when opening a new confirmation request", async () => {
        const firstConfirmation = requestConfirmation({
            message: "First",
            title: "First",
        });

        const secondConfirmation = requestConfirmation({
            message: "Second",
            title: "Second",
        });

        await expect(firstConfirmation).resolves.toBeFalsy();

        const state = useConfirmDialogStore.getState();
        expect(state.request).toStrictEqual({
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Second",
            title: "Second",
            tone: "default",
        });

        state.confirm();

        await expect(secondConfirmation).resolves.toBeTruthy();
    });

    it("provides memoized confirm dialog controls", () => {
        const { result, rerender } = renderHook(() =>
            useConfirmDialogControls()
        );
        const initialControls = result.current;

        expect(initialControls.request).toBeNull();

        act(() => {
            const { open } = useConfirmDialogStore.getState();
            open(
                {
                    cancelLabel: "Cancel",
                    confirmLabel: "Confirm",
                    message: "Queued",
                    title: "Queued",
                    tone: "default",
                },
                () => {}
            );
        });

        rerender();
        const activeControls = result.current;

        expect(activeControls.request?.message).toBe("Queued");
        expect(activeControls.cancel).toBe(initialControls.cancel);
        expect(activeControls.confirm).toBe(initialControls.confirm);

        act(() => {
            activeControls.cancel();
        });

        rerender();
        const clearedControls = result.current;

        expect(clearedControls.request).toBeNull();
        expect(clearedControls.cancel).toBe(initialControls.cancel);
        expect(clearedControls.confirm).toBe(initialControls.confirm);
    });

    it("exposes visibility helpers that track store state", () => {
        const { result, rerender } = renderHook(() =>
            useConfirmDialogVisibility()
        );

        expect(result.current.isOpen).toBeFalsy();

        act(() => {
            const { open } = useConfirmDialogStore.getState();
            open(
                {
                    cancelLabel: "Cancel",
                    confirmLabel: "Confirm",
                    message: "Visible",
                    title: "Visible",
                    tone: "default",
                },
                () => {}
            );
        });

        rerender();
        expect(result.current.isOpen).toBeTruthy();

        act(() => {
            result.current.cancel();
        });

        rerender();
        expect(result.current.isOpen).toBeFalsy();
    });

    const confirmDialogOptionsArb = fc.record({
        cancelLabel: fc.option(fc.string({ minLength: 1, maxLength: 24 }), {
            nil: undefined,
        }),
        confirmLabel: fc.option(fc.string({ minLength: 1, maxLength: 24 }), {
            nil: undefined,
        }),
        details: fc.option(fc.string({ minLength: 1, maxLength: 80 }), {
            nil: undefined,
        }),
        message: fc.string({ minLength: 1, maxLength: 120 }),
        title: fc.string({ minLength: 1, maxLength: 80 }),
        tone: fc.option(
            fc.constantFrom<ConfirmDialogTone>("default", "danger"),
            {
                nil: undefined,
            }
        ),
    });

    fcTest.prop([confirmDialogOptionsArb, fc.boolean()])(
        "resolves to the caller's decision for arbitrary dialog options",
        async (options, shouldConfirm) => {
            resetConfirmDialogState();

            const confirmation = requestConfirmation(options);

            const state = useConfirmDialogStore.getState();
            const expectedRequest = {
                cancelLabel: options.cancelLabel ?? "Cancel",
                confirmLabel: options.confirmLabel ?? "Confirm",
                message: options.message,
                title: options.title,
                tone: options.tone ?? "default",
                ...(options.details ? { details: options.details } : {}),
            } as const;

            expect(state.request).toStrictEqual(expectedRequest);

            if (shouldConfirm) {
                state.confirm();
            } else {
                state.cancel();
            }

            await expect(confirmation).resolves.toBe(shouldConfirm);
            expect(useConfirmDialogStore.getState().request).toBeNull();
        }
    );

    fcTest.prop([
        fc.array(confirmDialogOptionsArb, { minLength: 2, maxLength: 5 }),
    ])(
        "cancels previous confirmations when a new dialog is requested",
        async (requests) => {
            resetConfirmDialogState();

            const confirmations = requests.map((request) =>
                requestConfirmation(request)
            );

            for (let index = 0; index < confirmations.length - 1; index += 1) {
                await expect(confirmations[index]).resolves.toBeFalsy();
            }

            useConfirmDialogStore.getState().confirm();

            await expect(
                confirmations[confirmations.length - 1]
            ).resolves.toBeTruthy();
            expect(useConfirmDialogStore.getState().request).toBeNull();
        }
    );

    it("exposes Playwright automation helpers on the global scope", async () => {
        const automationTarget = globalThis as typeof globalThis & {
            playwrightConfirmDialog?: {
                cancel: () => void;
                confirm: () => void;
                getState: () => ConfirmDialogStoreState;
                subscribe: (
                    listener: (state: ConfirmDialogStoreState) => void
                ) => () => void;
            };
        };

        const bridge = automationTarget.playwrightConfirmDialog;
        expect(bridge).toBeDefined();

        const confirmation = requestConfirmation({
            message: "Automated confirmation",
            title: "Automation",
        });

        const snapshots: Array<ConfirmDialogStoreState> = [];
        const unsubscribe = bridge?.subscribe((state) => {
            snapshots.push(state);
        });

        expect(bridge?.getState().request?.message).toBe(
            "Automated confirmation"
        );

        bridge?.confirm();

        await expect(confirmation).resolves.toBeTruthy();
        expect(bridge?.getState().request).toBeNull();
        unsubscribe?.();
        expect(snapshots.length).toBeGreaterThanOrEqual(1);
    });
});
