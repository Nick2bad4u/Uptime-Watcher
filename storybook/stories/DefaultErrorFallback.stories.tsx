import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX, ReactNode } from "react";

import { useRef } from "react";
import { action } from "storybook/actions";

import { DefaultErrorFallback } from "../../src/components/error/DefaultErrorFallback";
import { useMount } from "../../src/hooks/useMount";

const meta: Meta<typeof DefaultErrorFallback> = {
    args: {
        error: new Error("Failed to connect to the monitoring service."),
        onRetry: action("retry"),
    },
    component: DefaultErrorFallback,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
} satisfies Meta<typeof DefaultErrorFallback>;

export default meta;

type Story = StoryObj<typeof meta>;

const StubReload = ({
    children,
}: {
    readonly children: ReactNode;
}): JSX.Element => {
    const cleanupRef = useRef<(() => void) | null>(null);
    const reloadAction = action("window.reload");
    const reloadStub = (): void => {
        reloadAction();
    };

    useMount(
        () => {
            const vitest = (
                globalThis as {
                    readonly vi?: {
                        readonly spyOn?: (
                            object: Location,
                            method: "reload"
                        ) => {
                            readonly mockImplementation: (
                                implementation: () => void
                            ) => void;
                            readonly mockRestore: () => void;
                        };
                    };
                }
            ).vi;

            if (vitest?.spyOn) {
                try {
                    const spy = vitest.spyOn(window.location, "reload");
                    spy.mockImplementation(reloadStub);
                    cleanupRef.current = (): void => {
                        spy.mockRestore();
                    };
                    return;
                } catch {
                    cleanupRef.current = null;
                }
            }

            try {
                const originalLocation = window.location;
                const proxyLocation: Location = new Proxy(originalLocation, {
                    get(target, property, receiver): unknown {
                        if (property === "reload") {
                            return reloadStub;
                        }

                        const value: unknown = Reflect.get(
                            target,
                            property,
                            receiver
                        );
                        if (typeof value === "function") {
                            return (
                                value as (
                                    ...parameters: readonly unknown[]
                                ) => unknown
                            ).bind(target);
                        }

                        return value;
                    },
                });

                Object.defineProperty(window, "location", {
                    configurable: true,
                    value: proxyLocation,
                });

                cleanupRef.current = (): void => {
                    Object.defineProperty(window, "location", {
                        configurable: true,
                        value: originalLocation,
                    });
                };
            } catch {
                cleanupRef.current = null;
            }
        },
        () => {
            cleanupRef.current?.();
            cleanupRef.current = null;
        }
    );

    return <>{children}</>;
};

export const WithError: Story = {
    render: (args): JSX.Element => (
        <StubReload>
            <DefaultErrorFallback {...args} />
        </StubReload>
    ),
};

export const WithoutError: Story = {
    render: (args): JSX.Element => {
        const fallbackArgs = { ...args };
        Reflect.deleteProperty(fallbackArgs, "error");

        return (
            <StubReload>
                <DefaultErrorFallback {...(fallbackArgs as typeof args)} />
            </StubReload>
        );
    },
};
