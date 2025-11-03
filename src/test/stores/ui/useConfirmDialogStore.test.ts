/**
 * Comprehensive tests for the confirmation dialog store utilities.
 */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import {
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
});
