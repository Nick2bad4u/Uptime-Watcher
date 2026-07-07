/**
 * Comprehensive tests for the confirmation dialog store utilities.
 */

import { fc, test as fcTest } from "@fast-check/vitest";
import { act, renderHook } from "@testing-library/react";
import { arrayAt } from "ts-extras";
import { beforeEach, describe, expect, it } from "vitest";

import {
    type ConfirmDialogOptions,
    type ConfirmDialogStoreState,
    type ConfirmDialogTone,
    requestConfirmation,
    useConfirmDialogControls,
    useConfirmDialogVisibility,
} from "../../../stores/ui/useConfirmDialogStore";

interface ConfirmDialogAutomationBridge {
    cancel: () => void;
    confirm: () => void;
    getState: () => ConfirmDialogStoreState;
    subscribe: (
        listener: (state: ConfirmDialogStoreState) => void
    ) => () => void;
}

function getConfirmDialogBridge(): ConfirmDialogAutomationBridge {
    const bridge = (
        globalThis as typeof globalThis & {
            playwrightConfirmDialog?: ConfirmDialogAutomationBridge;
        }
    ).playwrightConfirmDialog;

    if (!bridge) {
        throw new Error("Confirm dialog automation bridge is unavailable");
    }

    return bridge;
}

describe("confirm dialog store", () => {
    beforeEach(() => {
        getConfirmDialogBridge().cancel();
    });

    it("normalizes default confirmation options and resolves true on confirm", async () => {
        const confirmation = requestConfirmation({
            message: "Perform sync?",
            title: "Synchronize data",
        });
        const bridge = getConfirmDialogBridge();
        const state = bridge.getState();

        expect(state.request).toStrictEqual({
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Perform sync?",
            title: "Synchronize data",
            tone: "default",
        });

        bridge.confirm();

        await expect(confirmation).resolves.toBeTruthy();
        expect(bridge.getState().request).toBeNull();
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
        const bridge = getConfirmDialogBridge();
        const state = bridge.getState();

        expect(state.request).toStrictEqual({
            cancelLabel: "Back",
            confirmLabel: "Delete",
            details: "This action cannot be undone.",
            message: "Remove monitor?",
            title: "Confirm removal",
            tone: "danger",
        });

        bridge.cancel();

        await expect(confirmation).resolves.toBeFalsy();
        expect(bridge.getState().request).toBeNull();
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

        const bridge = getConfirmDialogBridge();
        const state = bridge.getState();
        expect(state.request).toStrictEqual({
            cancelLabel: "Cancel",
            confirmLabel: "Confirm",
            message: "Second",
            title: "Second",
            tone: "default",
        });

        bridge.confirm();

        await expect(secondConfirmation).resolves.toBeTruthy();
    });

    it("provides memoized confirm dialog controls", async () => {
        const { result, rerender } = renderHook(() =>
            useConfirmDialogControls()
        );
        const initialControls = result.current;

        expect(initialControls.request).toBeNull();

        let confirmation!: Promise<boolean>;
        act(() => {
            confirmation = requestConfirmation({
                message: "Queued",
                title: "Queued",
            });
        });

        rerender();
        const activeControls = result.current;

        expect(activeControls.request?.message).toBe("Queued");
        expect(activeControls.cancel).toBe(initialControls.cancel);
        expect(activeControls.confirm).toBe(initialControls.confirm);

        act(() => {
            activeControls.cancel();
        });
        await expect(confirmation).resolves.toBeFalsy();

        rerender();
        const clearedControls = result.current;

        expect(clearedControls.request).toBeNull();
        expect(clearedControls.cancel).toBe(initialControls.cancel);
        expect(clearedControls.confirm).toBe(initialControls.confirm);
    });

    it("exposes visibility helpers that track store state", async () => {
        const { result, rerender } = renderHook(() =>
            useConfirmDialogVisibility()
        );

        expect(result.current.isOpen).toBeFalsy();

        let confirmation!: Promise<boolean>;
        act(() => {
            confirmation = requestConfirmation({
                message: "Visible",
                title: "Visible",
            });
        });

        rerender();
        expect(result.current.isOpen).toBeTruthy();

        act(() => {
            result.current.cancel();
        });
        await expect(confirmation).resolves.toBeFalsy();

        rerender();
        expect(result.current.isOpen).toBeFalsy();
    });

    interface ArbitraryConfirmDialogOptions {
        cancelLabel?: string;
        confirmLabel?: string;
        details?: string;
        message: string;
        title: string;
        tone?: ConfirmDialogTone;
    }

    const confirmDialogOptionsArb = fc.record<ArbitraryConfirmDialogOptions>({
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

    const buildConfirmDialogOptions = (
        options: ArbitraryConfirmDialogOptions
    ): ConfirmDialogOptions => ({
        message: options.message,
        title: options.title,
        ...(options.cancelLabel !== undefined && {
            cancelLabel: options.cancelLabel,
        }),
        ...(options.confirmLabel !== undefined && {
            confirmLabel: options.confirmLabel,
        }),
        ...(options.details !== undefined && { details: options.details }),
        ...(options.tone !== undefined && { tone: options.tone }),
    });

    fcTest.prop([confirmDialogOptionsArb, fc.boolean()])(
        "resolves to the caller's decision for arbitrary dialog options",
        async (options, shouldConfirm) => {
            const bridge = getConfirmDialogBridge();
            bridge.cancel();

            const confirmation = requestConfirmation(
                buildConfirmDialogOptions(options)
            );

            const state = bridge.getState();
            const expectedRequest = {
                cancelLabel: options.cancelLabel ?? "Cancel",
                confirmLabel: options.confirmLabel ?? "Confirm",
                message: options.message,
                title: options.title,
                tone: options.tone ?? "default",
                ...(options.details && { details: options.details }),
            } as const;

            expect(state.request).toStrictEqual(expectedRequest);

            if (shouldConfirm) {
                bridge.confirm();
            } else {
                bridge.cancel();
            }

            await expect(confirmation).resolves.toBe(shouldConfirm);
            expect(bridge.getState().request).toBeNull();
        }
    );

    fcTest.prop([
        fc.array(confirmDialogOptionsArb, { minLength: 2, maxLength: 5 }),
    ])(
        "cancels previous confirmations when a new dialog is requested",
        async (requests) => {
            const bridge = getConfirmDialogBridge();
            bridge.cancel();

            const confirmations = requests.map((request) =>
                requestConfirmation(buildConfirmDialogOptions(request))
            );

            for (let index = 0; index < confirmations.length - 1; index += 1) {
                await expect(confirmations[index]).resolves.toBeFalsy();
            }

            bridge.confirm();

            await expect(arrayAt(confirmations, -1)).resolves.toBeTruthy();
            expect(bridge.getState().request).toBeNull();
        }
    );

    it("exposes Playwright automation helpers on the global scope", async () => {
        const bridge = getConfirmDialogBridge();

        const confirmation = requestConfirmation({
            message: "Automated confirmation",
            title: "Automation",
        });

        const snapshots: ConfirmDialogStoreState[] = [];
        const unsubscribe = bridge.subscribe((state) => {
            snapshots.push(state);
        });

        expect(bridge.getState().request?.message).toBe(
            "Automated confirmation"
        );

        bridge.confirm();

        await expect(confirmation).resolves.toBeTruthy();
        expect(bridge.getState().request).toBeNull();
        unsubscribe();
        expect(snapshots.length).toBeGreaterThanOrEqual(1);
    });
});
