/**
 * Tests for the generic app toast component.
 */

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppToastToast } from "../../../components/Alerts/AppToastToast";
import type { AppToast } from "../../../stores/alerts/useAlertStore";

const createToast = (overrides: Partial<AppToast> = {}): AppToast => {
    const base: AppToast = {
        createdAtEpochMs: overrides.createdAtEpochMs ?? Date.now(),
        id: overrides.id ?? "toast-1",
        title: overrides.title ?? "Hello",
        ttlMs: overrides.ttlMs ?? 5000,
        variant: overrides.variant ?? "info",
        ...(overrides.message === undefined
            ? {}
            : { message: overrides.message }),
    };

    return base;
};

describe(AppToastToast, () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("dismisses when clicking the toast body", () => {
        const onDismiss = vi.fn();
        const toast = createToast();

        render(<AppToastToast onDismiss={onDismiss} toast={toast} />);

        fireEvent.click(screen.getByTestId("app-toast-toast-1"));
        expect(onDismiss).toHaveBeenCalledWith("toast-1");
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it("dismisses when clicking the toast (no double-dismiss)", () => {
        const onDismiss = vi.fn();
        const toast = createToast();

        render(<AppToastToast onDismiss={onDismiss} toast={toast} />);

        fireEvent.click(screen.getByTestId("app-toast-toast-1"));

        expect(onDismiss).toHaveBeenCalledWith("toast-1");
        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
