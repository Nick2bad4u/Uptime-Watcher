import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { ErrorAlertVariant } from "../../components/common/ErrorAlert/ErrorAlert";

import { ErrorAlert } from "../../components/common/ErrorAlert/ErrorAlert";

describe("ErrorAlert", () => {
    it("renders an accessible alert with the default error styling", () => {
        render(<ErrorAlert message="Failed to load site status" />);

        const alert = screen.getByRole("alert");

        expect(alert).toHaveAttribute("aria-live", "polite");
        expect(alert).toHaveClass("border-error-default", "bg-error-muted");
        expect(
            screen.getByText("Failed to load site status")
        ).toBeInTheDocument();
        expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Dismiss error" })
        ).not.toBeInTheDocument();
    });

    it.each<
        [
            variant: ErrorAlertVariant,
            iconTestId: string,
            expectedClass: string,
        ]
    >([
        [
            "error",
            "alert-circle-icon",
            "border-error-default",
        ],
        [
            "info",
            "info-icon",
            "border-info-default",
        ],
        [
            "warning",
            "alert-triangle-icon",
            "border-warning-default",
        ],
    ])(
        "renders the %s variant icon and styling",
        (variant, iconTestId, expectedClass) => {
            render(
                <ErrorAlert message={`${variant} message`} variant={variant} />
            );

            expect(screen.getByRole("alert")).toHaveClass(expectedClass);
            expect(screen.getByTestId(iconTestId)).toBeInTheDocument();
        }
    );

    it("falls back to the error variant for an unknown runtime variant", () => {
        render(
            <ErrorAlert
                message="Unexpected variant"
                variant={"critical" as ErrorAlertVariant}
            />
        );

        expect(screen.getByRole("alert")).toHaveClass("border-error-default");
        expect(screen.getByTestId("alert-circle-icon")).toBeInTheDocument();
    });

    it("combines custom classes without dropping base alert structure", () => {
        render(
            <ErrorAlert className="custom-alert" message="Custom class test" />
        );

        expect(screen.getByRole("alert")).toHaveClass(
            "flex",
            "items-start",
            "custom-alert"
        );
    });

    it("renders HTML-like message content as text", () => {
        render(
            <ErrorAlert message={'<script>alert("unsafe")</script> & retry'} />
        );

        expect(
            screen.getByText('<script>alert("unsafe")</script> & retry')
        ).toBeInTheDocument();
        expect(document.querySelector("script")).not.toBeInTheDocument();
    });

    it("calls onDismiss from the dismiss button", async () => {
        const user = userEvent.setup();
        const onDismiss = vi.fn();

        render(
            <ErrorAlert message="Dismissible error" onDismiss={onDismiss} />
        );

        await user.click(screen.getByRole("button", { name: "Dismiss error" }));

        expect(onDismiss).toHaveBeenCalledTimes(1);
    });
});
