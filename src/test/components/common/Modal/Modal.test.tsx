import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { ReactElement } from "react";

import { useState } from "react";

import { Modal } from "../../../../components/common/Modal/Modal";

function renderInAppRoot(element: ReactElement) {
    const root = document.createElement("div");
    root.id = "root";
    document.body.append(root);

    const utils = render(element, {
        container: root,
    });

    return {
        root,
        ...utils,
    };
}

afterEach(() => {
    document.querySelector("#root")?.remove();
});

describe(Modal, () => {
    it("sets #root to inert/aria-hidden while open and restores on close", async () => {
        const Harness = () => {
            const [open, setOpen] = useState(false);

            return (
                <>
                    <button onClick={() => setOpen(true)} type="button">
                        Open
                    </button>
                    <Modal
                        isOpen={open}
                        onRequestClose={() => setOpen(false)}
                        title="Test modal"
                    >
                        <div>content</div>
                    </Modal>
                </>
            );
        };

        const { root, unmount } = renderInAppRoot(<Harness />);

        expect(root).not.toHaveAttribute("inert");
        expect(root).not.toHaveAttribute("aria-hidden");

        fireEvent.click(screen.getByRole("button", { name: "Open" }));

        await waitFor(() => expect(root).toHaveAttribute("inert"));
        expect(root).toHaveAttribute("aria-hidden", "true");

        fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

        await waitFor(() => expect(root).not.toHaveAttribute("inert"));
        expect(root).not.toHaveAttribute("aria-hidden");

        unmount();
    });

    it("restores focus to previously focused element on close", async () => {
        const Harness = () => {
            const [open, setOpen] = useState(false);

            return (
                <>
                    <button onClick={() => setOpen(true)} type="button">
                        Open
                    </button>
                    <Modal
                        isOpen={open}
                        onRequestClose={() => setOpen(false)}
                        title="Focus modal"
                    >
                        <div>content</div>
                    </Modal>
                </>
            );
        };

        const { unmount } = renderInAppRoot(<Harness />);

        const openButton = screen.getByRole("button", { name: "Open" });
        openButton.focus();

        fireEvent.click(openButton);

        // Close button should be focused initially.
        await waitFor(() => {
            expect(
                screen.getByRole("button", { name: "Close dialog" })
            ).toHaveFocus();
        });

        fireEvent.click(screen.getByRole("button", { name: "Close dialog" }));

        await waitFor(() => {
            expect(openButton).toHaveFocus();
        });

        unmount();
    });

    it("traps Tab and Shift+Tab within the modal", async () => {
        const Harness = () => {
            const [open, setOpen] = useState(true);

            return (
                <Modal
                    isOpen={open}
                    onRequestClose={() => setOpen(false)}
                    title="Trap"
                >
                    <button type="button">First</button>
                    <button type="button">Last</button>
                </Modal>
            );
        };

        const { unmount } = renderInAppRoot(<Harness />);

        const closeButton = await screen.findByRole("button", {
            name: "Close dialog",
        });
        const first = screen.getByRole("button", { name: "First" });
        const last = screen.getByRole("button", { name: "Last" });

        last.focus();
        expect(last).toHaveFocus();

        fireEvent.keyDown(document, { key: "Tab" });
        expect(closeButton).toHaveFocus();

        fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
        expect(last).toHaveFocus();

        // If focus escapes (e.g., active element not inside modal), tab should
        // snap back into the modal.
        first.blur();
        expect(document.activeElement).not.toBe(first);

        fireEvent.keyDown(document, { key: "Tab" });
        expect(closeButton).toHaveFocus();

        unmount();
    });

    it("Escape closes only the top-most modal", async () => {
        const Harness = () => {
            const [openA, setOpenA] = useState(false);
            const [openB, setOpenB] = useState(false);

            return (
                <>
                    <button onClick={() => setOpenA(true)} type="button">
                        Open A
                    </button>
                    <button onClick={() => setOpenB(true)} type="button">
                        Open B
                    </button>

                    <Modal
                        escapePriority={100}
                        isOpen={openA}
                        onRequestClose={() => setOpenA(false)}
                        title="A"
                    >
                        <button onClick={() => setOpenB(true)} type="button">
                            Open B
                        </button>
                        <div>A content</div>
                    </Modal>

                    <Modal
                        escapePriority={200}
                        isOpen={openB}
                        onRequestClose={() => setOpenB(false)}
                        title="B"
                    >
                        <div>B content</div>
                    </Modal>
                </>
            );
        };

        const { unmount } = renderInAppRoot(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "Open A" }));
        await screen.findByText("A content");

        fireEvent.click(screen.getByRole("button", { name: "Open B" }));
        await screen.findByText("B content");

        fireEvent.keyDown(document, { key: "Escape" });

        await waitFor(() =>
            expect(screen.queryByText("B content")).not.toBeInTheDocument());
        expect(screen.getByText("A content")).toBeInTheDocument();

        fireEvent.keyDown(document, { key: "Escape" });

        await waitFor(() => {
            expect(screen.queryByText("A content")).not.toBeInTheDocument();
        });

        unmount();
    });
});
