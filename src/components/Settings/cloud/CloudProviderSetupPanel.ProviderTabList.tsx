import type { JSX } from "react/jsx-runtime";

import {
    type KeyboardEvent as ReactKeyboardEvent,
    type MouseEvent as ReactMouseEvent,
    useCallback,
    useRef,
} from "react";

import {
    CLOUD_PROVIDER_SETUP_PANEL_TABS,
    type CloudProviderSetupPanelTabKey,
} from "./CloudProviderSetupPanel.model";

/**
 * Props for {@link CloudProviderSetupPanelProviderTabList}.
 */
export interface CloudProviderSetupPanelProviderTabListProperties {
    readonly ariaLabel: string;
    readonly lockedKey: CloudProviderSetupPanelTabKey | null;
    readonly onAttemptLockedSelect: (
        key: CloudProviderSetupPanelTabKey
    ) => void;
    readonly onSelect: (key: CloudProviderSetupPanelTabKey) => void;
    readonly selectedKey: CloudProviderSetupPanelTabKey;
}

function resolveProviderTabStateClass(args: {
    isAvailable: boolean;
    isLocked: boolean;
}): string {
    if (!args.isAvailable) {
        return "opacity-70";
    }

    return args.isLocked ? "opacity-70 cursor-not-allowed" : "hover:opacity-95";
}

function resolveProviderTabTitle(args: {
    isAvailable: boolean;
    isLocked: boolean;
}): string | undefined {
    if (!args.isAvailable) {
        return "Coming soon";
    }

    if (args.isLocked) {
        return "Disconnect the current provider before switching";
    }

    return undefined;
}

/**
 * Accessible tab list for selecting the provider setup panel.
 */
export const CloudProviderSetupPanelProviderTabList = ({
    ariaLabel,
    lockedKey,
    onAttemptLockedSelect,
    onSelect,
    selectedKey,
}: CloudProviderSetupPanelProviderTabListProperties): JSX.Element => {
    const buttonByKeyRef = useRef(
        new Map<CloudProviderSetupPanelTabKey, HTMLButtonElement>()
    );

    const handleTabClick = useCallback(
        (event: ReactMouseEvent<HTMLButtonElement>): void => {
            const rawKey = event.currentTarget.dataset["providerKey"];
            if (!rawKey) {
                return;
            }

            const match = CLOUD_PROVIDER_SETUP_PANEL_TABS.find(
                (tab) => tab.key === rawKey
            );
            if (!match) {
                return;
            }

            if (lockedKey && match.key !== lockedKey) {
                onAttemptLockedSelect(match.key);
                queueMicrotask(() => {
                    buttonByKeyRef.current.get(lockedKey)?.focus();
                });
                return;
            }

            onSelect(match.key);
        },
        [
            lockedKey,
            onAttemptLockedSelect,
            onSelect,
        ]
    );

    const handleKeyDown = useCallback(
        (event: ReactKeyboardEvent<HTMLButtonElement>): void => {
            const keys = CLOUD_PROVIDER_SETUP_PANEL_TABS.map((tab) => tab.key);
            const currentIndex = keys.indexOf(selectedKey);
            if (currentIndex === -1) {
                return;
            }

            let nextKey: CloudProviderSetupPanelTabKey = selectedKey;
            switch (event.key) {
                case "ArrowLeft": {
                    const nextIndex =
                        (currentIndex - 1 + keys.length) % keys.length;
                    nextKey = keys[nextIndex] ?? selectedKey;
                    break;
                }
                case "ArrowRight": {
                    const nextIndex = (currentIndex + 1) % keys.length;
                    nextKey = keys[nextIndex] ?? selectedKey;
                    break;
                }
                case "End": {
                    nextKey = keys.at(-1) ?? selectedKey;
                    break;
                }
                case "Home": {
                    nextKey = keys[0] ?? selectedKey;
                    break;
                }
                default: {
                    return;
                }
            }

            if (lockedKey && nextKey !== lockedKey) {
                event.preventDefault();
                onAttemptLockedSelect(nextKey);
                return;
            }

            event.preventDefault();
            onSelect(nextKey);

            // Ensure focus follows selection for roving-tabindex behavior.
            queueMicrotask(() => {
                buttonByKeyRef.current.get(nextKey)?.focus();
            });
        },
        [
            lockedKey,
            onAttemptLockedSelect,
            onSelect,
            selectedKey,
        ]
    );

    const handleButtonRef = useCallback((element: HTMLButtonElement | null) => {
        if (!element) {
            return;
        }

        const rawKey = element.dataset["providerKey"];
        if (!rawKey) {
            return;
        }

        const match = CLOUD_PROVIDER_SETUP_PANEL_TABS.find(
            (tab) => tab.key === rawKey
        );
        if (!match) {
            return;
        }

        buttonByKeyRef.current.set(match.key, element);
    }, []);

    return (
        <div
            aria-label={ariaLabel}
            aria-orientation="horizontal"
            className="flex flex-wrap gap-2"
            role="tablist"
        >
            {CLOUD_PROVIDER_SETUP_PANEL_TABS.map((tab) => {
                const isSelected = tab.key === selectedKey;
                const isLocked = lockedKey !== null && tab.key !== lockedKey;

                const variantClass = isSelected
                    ? "themed-button--primary"
                    : "themed-button--secondary";

                const stateClass = resolveProviderTabStateClass({
                    isAvailable: tab.isAvailable,
                    isLocked,
                });

                const title = resolveProviderTabTitle({
                    isAvailable: tab.isAvailable,
                    isLocked,
                });

                return (
                    <button
                        aria-controls={`cloud-provider-panel-${tab.key}`}
                        aria-disabled={isLocked || !tab.isAvailable}
                        aria-selected={isSelected}
                        className={[
                            "themed-button themed-button--size-sm",
                            variantClass,
                            stateClass,
                        ].join(" ")}
                        data-provider-key={tab.key}
                        id={`cloud-provider-tab-${tab.key}`}
                        key={tab.key}
                        onClick={handleTabClick}
                        onKeyDown={handleKeyDown}
                        ref={handleButtonRef}
                        role="tab"
                        tabIndex={isSelected ? 0 : -1}
                        title={title}
                        type="button"
                    >
                        <tab.icon aria-hidden="true" size={16} />
                        {tab.label}
                        {tab.isAvailable ? null : " (soon)"}
                    </button>
                );
            })}
        </div>
    );
};
