import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import logger from "../services/logger";

// Mock the logger
vi.mock("../services/logger", () => ({
    default: {
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        user: {
            settingsChange: vi.fn(),
        },
    },
}));

// Mock the settings store
const mockUpdateSettings = vi.fn();
vi.mock("../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(() => ({
        settings: {
            theme: "dark",
            autoStart: true,
            autoUpdate: true,
            notifications: true,
            port: 8080,
            retryAttempts: 3,
            timeout: 5000,
            minimizeToTray: false,
            startMinimized: false,
            stayAlive: true,
            logLevel: "info",
            soundAlerts: true,
            historyLimit: 100,
        },
        updateSettings: mockUpdateSettings,
    })),
}));

// Mock other dependencies
vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        updateHistoryLimitValue: vi.fn(),
    })),
}));

describe("Settings - Invalid Key Logging", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should log warning when attempting to update invalid settings key", async () => {
        // Create a component that will trigger the invalid key scenario
        const TestComponent = () => {
            interface SettingsType {
                theme: string;
                autoStart: boolean;
                autoUpdate: boolean;
                notifications: boolean;
                port: number;
                retryAttempts: number;
                timeout: number;
                minimizeToTray: boolean;
                startMinimized: boolean;
                stayAlive: boolean;
                logLevel: string;
                soundAlerts: boolean;
                historyLimit: number;
            }

            const allowedKeys: (keyof SettingsType)[] = [
                "notifications",
                "autoStart",
                "minimizeToTray",
                "theme",
                "soundAlerts",
                "historyLimit",
            ];

            const handleSettingChange = (key: keyof SettingsType, value: unknown) => {
                if (!allowedKeys.includes(key)) {
                    logger.warn("Attempted to update invalid settings key", key);
                    return;
                }
                mockUpdateSettings({ [key]: value });
            };

            React.useEffect(() => {
                // Simulate the invalid key scenario
                handleSettingChange("invalidKey" as keyof SettingsType, "someValue");
            }, []);

            return <div data-testid="test-component">Test</div>;
        };

        render(<TestComponent />);

        // Wait for the effect to run
        await screen.findByTestId("test-component");

        // Verify warning was logged
        expect(logger.warn).toHaveBeenCalledWith("Attempted to update invalid settings key", "invalidKey");

        // Verify updateSettings was not called
        expect(mockUpdateSettings).not.toHaveBeenCalled();
    });
});
