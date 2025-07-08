import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { SiteDetailsHeader } from "../components";
import { Site } from "../types";

// Global browser API mocks
Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockImplementation((query) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: false,
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
    })),
    writable: true,
});

// Clean setup and teardown
beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
});

// Mock theme
vi.mock("../theme/useTheme", () => ({
    useAvailabilityColors: vi.fn(() => ({
        getAvailabilityColor: vi.fn(() => "#00ff00"),
        getAvailabilityVariant: vi.fn((percentage: number) => {
            if (percentage >= 99) return "success";
            if (percentage >= 95) return "warning";
            return "danger";
        }),
    })),
    useTheme: vi.fn(() => ({
        currentTheme: {
            colors: {
                background: "#ffffff",
                primary: "#0066cc",
                secondary: "#6c757d",
                text: "#333333",
            },
        },
        setTheme: vi.fn(),
    })),
}));

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        user: {
            action: vi.fn(),
        },
        warn: vi.fn(),
    },
}));

// Mock theme components with safe props filtering
vi.mock("../theme/components", () => ({
    StatusIndicator: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
        const {
            hoverable: _hoverable,
            iconColor: _iconColor,
            loading: _loading,
            showLabel: _showLabel,
            showText: _showText,
            size: _size,
            variant: _variant,
            ...props
        } = safeProps;
        return <span {...props}>{children}</span>;
    },
    ThemedBadge: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
        const {
            hoverable: _hoverable,
            iconColor: _iconColor,
            loading: _loading,
            showLabel: _showLabel,
            showText: _showText,
            size: _size,
            variant: _variant,
            ...props
        } = safeProps;
        return <span {...props}>{children}</span>;
    },
    ThemedBox: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
        const {
            hoverable: _hoverable,
            iconColor: _iconColor,
            loading: _loading,
            showLabel: _showLabel,
            showText: _showText,
            size: _size,
            variant: _variant,
            ...props
        } = safeProps;
        return <div {...props}>{children}</div>;
    },
    ThemedText: ({ children, ...safeProps }: React.PropsWithChildren<Record<string, unknown>>) => {
        const {
            hoverable: _hoverable,
            iconColor: _iconColor,
            loading: _loading,
            showLabel: _showLabel,
            showText: _showText,
            size: _size,
            variant: _variant,
            ...props
        } = safeProps;
        return <span {...props}>{children}</span>;
    },
}));

const mockSite: Site = {
    identifier: "test-site-1",
    monitors: [
        {
            checkInterval: 300,
            history: [
                {
                    responseTime: 250,
                    status: "up",
                    timestamp: Date.now(),
                },
            ],
            id: "monitor-1",
            lastChecked: new Date("2024-01-01T00:00:00Z"),
            monitoring: true,
            port: 443,
            responseTime: 250,
            retryAttempts: 3,
            status: "up",
            timeout: 5000,
            type: "http",
            url: "https://example.com",
        },
    ],
    name: "Test Site",
};

describe("SiteDetails Simple Tests", () => {
    describe("SiteDetailsHeader", () => {
        it("should render with valid site", { timeout: 1000 }, () => {
            render(<SiteDetailsHeader site={mockSite} />);
            expect(screen.getByText("Test Site")).toBeInTheDocument();
        });
    });
});
